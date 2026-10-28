import { useState } from 'react'
import { getMenu, type MenuId } from '../data/menus'
import type { Stock } from '../data/stock'
import type { Options } from '../data/types'
import { ingredientNames, menuText, strings, substitutionNotes } from '../i18n'
import { blockedCause, currentStepIndex, guideStage, pendingSuggestion, toggleDone } from '../logic/guide'
import { optionSummary } from '../logic/summary'
import { blockedReason } from '../logic/status'
import { formatAmount, guideSteps } from '../logic/steps'
import {
  applySubstitution,
  noDecisions,
  rejectSubstitution,
  resolveOrder,
  type Decisions,
  type ResolvedLine,
} from '../logic/substitution'
import './GuideScreen.css'

type Props = {
  menuId: MenuId
  options: Options
  stock: Stock
  onChangeOptions: () => void
  onFinish: () => void
}

const t = strings.guide

export default function GuideScreen({ menuId, options, stock, onChangeOptions, onFinish }: Props) {
  const menu = getMenu(menuId)
  // [대체 적용] / [취소] 결정과 체크한 단계는 이 화면이 열려 있는 동안만 기억한다
  const [decisions, setDecisions] = useState<Decisions>(noDecisions)
  const [done, setDone] = useState<ReadonlySet<number>>(new Set())

  const lines = resolveOrder(menu, options, stock, decisions)
  const stage = guideStage(lines)
  const pending = pendingSuggestion(lines)
  const steps = guideSteps(menuText[menuId], options, lines)
  const current = currentStepIndex(steps.length, done)
  const finished = stage === 'cooking' && steps.length > 0 && current === -1
  const summary = optionSummary(menu, options)

  return (
    <main className="guide">
      {/* 맨 위 옵션 요약: 크게 보여주고, 누르면 옵션 화면으로 돌아가 바꾼다 */}
      <button type="button" className="guide__bar" onClick={onChangeOptions}>
        <span className="guide__name">{menuText[menuId].name}</span>
        <span className="guide__summary">
          {/* 요약의 첫 항목은 온도: 색과 글자(ICE ❄️ / HOT 🔥)를 함께 쓴다 */}
          <span className={`temp temp--${options.temp}`}>{summary[0]}</span>
          {summary.slice(1).map((part) => (
            <span key={part}>{part}</span>
          ))}
        </span>
        <span className="guide__edit">{t.editOptions}</span>
      </button>

      {stage === 'suggest' && pending?.candidate && (
        <SuggestBanner
          line={pending}
          onApply={() => setDecisions(applySubstitution(decisions, pending.id, pending.candidate!.id))}
          onCancel={() => setDecisions(rejectSubstitution(decisions, pending.id, pending.candidate!.id))}
        />
      )}

      <div className="guide__body">
        <section className="guide__col guide__ingredients" aria-labelledby="guide-ingredients">
          <h2 className="guide__heading" id="guide-ingredients">
            {t.ingredients}
          </h2>
          <ul className="ingredients">
            {lines.map((line) => (
              <IngredientRow key={line.id} line={line} />
            ))}
          </ul>
        </section>

        <section className="guide__col guide__steps" aria-label={t.stepsLabel}>
          {stage === 'blocked' ? (
            <div className="guide__blocked" role="alert">
              <p className="guide__blocked-title">{t.blocked}</p>
              <p className="guide__blocked-reason">{blockedReason(lines)}</p>
              <p>{t.blockedHint[blockedCause(lines)]}</p>
              <div className="guide__blocked-actions">
                <button type="button" className="btn btn--primary" onClick={onChangeOptions}>
                  {t.editOptions}
                </button>
                <button type="button" className="btn" onClick={onFinish}>
                  {t.toMenu}
                </button>
              </div>
            </div>
          ) : (
            <>
              <ol className="steps">
                {steps.map((text, i) => {
                  const checked = done.has(i)
                  const isCurrent = stage === 'cooking' && i === current
                  const classes = ['step', isCurrent && 'step--current', checked && 'step--done'].filter(Boolean).join(' ')
                  return (
                    <li key={i}>
                      {/* 탭하면 체크, 다시 탭하면 해제. 대체 여부를 정하기 전에는 누를 수 없다 */}
                      <button
                        type="button"
                        className={classes}
                        aria-pressed={checked}
                        aria-current={isCurrent ? 'step' : undefined}
                        disabled={stage === 'suggest'}
                        onClick={() => setDone(toggleDone(done, i))}
                      >
                        <span className="step__mark" aria-hidden="true">
                          {checked ? '✓' : i + 1}
                        </span>
                        <span className="step__text">{text}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>

              {finished && (
                <div className="guide__done" role="status">
                  <p className="guide__done-title">{t.done}</p>
                  <button type="button" className="btn btn--primary guide__finish" onClick={onFinish}>
                    {t.toMenu}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

// 재료 한 줄: 이름과 양. 대체했으면 '대체' 배지(원래 재료와 안내 메모), 품절이면 '품절' 배지
function IngredientRow({ line }: { line: ResolvedLine }) {
  const soldOut = line.state === 'suggest' || line.state === 'blocked'
  const note = line.state === 'substituted' ? substitutionNotes[line.id]?.[line.use] : undefined
  return (
    <li className={`ingredient${soldOut ? ' ingredient--out' : ''}`}>
      <span className="ingredient__main">
        <span className="ingredient__name">{ingredientNames[line.use]}</span>
        <span className="ingredient__amount">{formatAmount(line.use, line.amount)}</span>
      </span>
      {line.state === 'substituted' && (
        <span className="badge badge--sub">
          <span className="badge__label">{t.substituted(ingredientNames[line.id])}</span>
          {note && <span className="badge__line">{note}</span>}
        </span>
      )}
      {soldOut && (
        <span className="badge badge--danger">
          <span className="badge__label">{t.soldOut}</span>
        </span>
      )}
    </li>
  )
}

// 대체 제안: "오트밀크 품절 → 우유로 대체할까요?" [대체 적용] [취소]
function SuggestBanner({ line, onApply, onCancel }: { line: ResolvedLine; onApply: () => void; onCancel: () => void }) {
  const candidate = line.candidate!.id
  const note = substitutionNotes[line.id]?.[candidate]
  return (
    <div className="guide__suggest badge badge--sub" role="alert">
      <div className="guide__suggest-text">
        <span className="badge__label">{t.suggest(ingredientNames[line.id], ingredientNames[candidate])}</span>
        {note && <span className="badge__line">{note}</span>}
      </div>
      <div className="guide__suggest-actions">
        <button type="button" className="btn btn--primary" onClick={onApply}>
          {t.apply}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          {t.cancel}
        </button>
      </div>
    </div>
  )
}

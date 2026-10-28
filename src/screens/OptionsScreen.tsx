import { useId, useState } from 'react'
import { getMenu, type MenuId } from '../data/menus'
import type { Stock } from '../data/stock'
import type { Options } from '../data/types'
import { menuText, strings } from '../i18n'
import { initialOptions, neededSubstitutes, optionChoices, switchedNotice, type Choice } from '../logic/status'
import './OptionsScreen.css'

type Props = {
  menuId: MenuId
  stock: Stock
  onBack: () => void
  onStart: (options: Options) => void
}

const t = strings.options

export default function OptionsScreen({ menuId, stock, onBack, onStart }: Props) {
  const menu = getMenu(menuId)
  // 기본값이 미리 선택된다. 재고 때문에 막혀 있으면 만들 수 있는 옵션으로 바꿔서 시작한다.
  const [options, setOptions] = useState<Options>(() => initialOptions(menu, stock))
  // 선택할 때마다 선택지를 다시 계산해서, 만들 수 없게 되는 선택지는 막고 사유를 보여준다
  const choices = optionChoices(menu, options, stock)
  // 안내는 화면을 열 때 한 번만 정한다(자동 전환했다는 사실). 대체 필요는 지금 선택 기준으로 다시 계산한다.
  const [notice] = useState(() => switchedNotice(menu, stock))
  const substitutes = neededSubstitutes(menu, options, stock)

  const set = <K extends keyof Options>(key: K) => (value: Options[K]) => setOptions({ ...options, [key]: value })

  return (
    <main className="options">
      <header className="options__header">
        <button type="button" className="btn" onClick={onBack}>
          {t.back}
        </button>
        <h1 className="options__title">{menuText[menuId].name}</h1>
      </header>

      {/* 자동 전환만 됐을 때는 안내(중립), 실제로 재료를 바꿔야 할 때만 대체 필요(노랑) */}
      {notice && (
        <p className="badge badge--info options__notice">
          <span className="badge__label">{t.notice}</span>
          <span className="badge__line">{notice}</span>
        </p>
      )}
      {substitutes.length > 0 && (
        <p className="badge badge--sub options__notice">
          <span className="badge__label">{strings.menu.substitute}</span>
          {substitutes.map((line) => (
            <span key={line} className="badge__line">
              {line}
            </span>
          ))}
        </p>
      )}

      <div className="options__rows">
        <ChoiceRow
          label={t.temp}
          choices={choices.temp}
          value={options.temp}
          text={(v) => strings.temp[v]}
          tone={(v) => `choice--${v}`}
          onSelect={set('temp')}
        />
        <ChoiceRow
          label={t.size}
          choices={choices.size}
          value={options.size}
          text={(v) => strings.size[v]}
          onSelect={set('size')}
        />
        {/* 샷 추가는 커피 메뉴에만, 당도는 당도 옵션이 있는 메뉴에만 선택지가 있다 */}
        {choices.extraShots.length > 0 && (
          <ChoiceRow
            label={t.extraShots}
            choices={choices.extraShots}
            value={options.extraShots}
            text={(v) => strings.shots[v]}
            onSelect={set('extraShots')}
          />
        )}
        {choices.sweetness.length > 0 && (
          <ChoiceRow
            label={t.sweetness}
            choices={choices.sweetness}
            value={options.sweetness}
            text={(v) => strings.sweetness[v]}
            onSelect={set('sweetness')}
          />
        )}
      </div>

      <div className="options__footer">
        <button type="button" className="btn btn--primary options__start" onClick={() => onStart(options)}>
          {t.start}
        </button>
      </div>
    </main>
  )
}

type RowProps<V extends string | number> = {
  label: string
  choices: Choice<V>[]
  value: V
  text: (value: V) => string
  tone?: (value: V) => string // 아이스·핫처럼 색을 입히는 선택지의 클래스
  onSelect: (value: V) => void
}

// 옵션 하나(온도, 사이즈 …)의 선택지 한 줄. 막힌 선택지는 흐리게 하고 사유를 적는다.
function ChoiceRow<V extends string | number>({ label, choices, value, text, tone, onSelect }: RowProps<V>) {
  const labelId = useId()
  return (
    <div className="option-row">
      <h2 className="option-row__label" id={labelId}>
        {label}
      </h2>
      <div className="option-row__choices" role="radiogroup" aria-labelledby={labelId}>
        {choices.map((choice) => {
          const selected = choice.value === value
          const classes = ['choice', tone?.(choice.value), selected && 'choice--selected'].filter(Boolean).join(' ')
          return (
            <button
              key={String(choice.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={choice.disabled}
              className={classes}
              onClick={() => onSelect(choice.value)}
            >
              {/* 색만으로 구분하지 않도록 선택된 것에는 ✓를 붙인다 */}
              <span className="choice__text">{selected ? `✓ ${text(choice.value)}` : text(choice.value)}</span>
              {choice.reason && <span className="choice__reason">{choice.reason}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

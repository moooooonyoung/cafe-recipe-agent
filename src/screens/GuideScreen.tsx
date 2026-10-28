import { getMenu, type MenuId } from '../data/menus'
import type { Options } from '../data/types'
import { menuText, strings } from '../i18n'
import { optionSummary } from '../logic/summary'

type Props = {
  menuId: MenuId
  options: Options
  onBack: () => void
}

// 임시 화면: 7단계에서 재료 목록과 단계 목록을 채운다. 지금은 선택한 옵션 요약만 보여준다.
export default function GuideScreen({ menuId, options, onBack }: Props) {
  const menu = getMenu(menuId)
  return (
    <main style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: 'var(--space-5) var(--page-pad)' }}>
      <button type="button" className="btn" onClick={onBack}>
        {strings.guide.back}
      </button>
      <h1 style={{ fontSize: 'var(--font-size-title)' }}>{menuText[menuId].name}</h1>
      <p style={{ fontSize: 'var(--font-size-summary)', fontWeight: 'var(--font-weight-bold)' }}>
        {optionSummary(menu, options).join(' · ')}
      </p>
      <p>{strings.guide.placeholder}</p>
    </main>
  )
}

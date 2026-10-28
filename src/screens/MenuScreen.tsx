import { categoryOrder, menus } from '../data/menus'
import type { Stock } from '../data/stock'
import type { Temperature } from '../data/types'
import { menuText, strings } from '../i18n'
import { menuStatus, unavailableTemps } from '../logic/status'
import './MenuScreen.css'

type Props = {
  stock: Stock
  onOpenStock: () => void
}

const t = strings.menu
const tempOrder: readonly Temperature[] = ['ice', 'hot']

export default function MenuScreen({ stock, onOpenStock }: Props) {
  return (
    <main className="menu">
      <header className="menu__header">
        <h1 className="menu__title">{strings.appTitle}</h1>
        <button type="button" className="btn" onClick={onOpenStock}>
          {t.openStock}
        </button>
      </header>

      <div className="menu__groups">
        {categoryOrder.map((category) => (
          <section key={category} aria-labelledby={`menu-group-${category}`}>
            <h2 className="menu-group__title" id={`menu-group-${category}`}>
              {t.category[category]}
            </h2>
            <ul className="menu-group__list">
              {menus
                .filter((menu) => menu.category === category)
                .map((menu) => {
                  const temps: readonly Temperature[] = menu.temps
                  // 정상 / 대체 필요 / 제조 불가는 재고가 바뀔 때마다 다시 계산한다
                  const { status, reasons = [] } = menuStatus(menu, stock)
                  const offTemps = unavailableTemps(menu, stock)
                  return (
                    <li key={menu.id} className={`menu-card menu-card--${status}`}>
                      <div className="menu-card__main">
                        <span className="menu-card__name">{menuText[menu.id].name}</span>
                        <span className="menu-card__temps">
                          {tempOrder
                            .filter((temp) => temps.includes(temp))
                            .map((temp) => (
                              // 안 되는 온도는 흐리게 + 취소선: 색을 못 봐도 알 수 있다
                              <span key={temp} className={`temp temp--${temp}${offTemps.includes(temp) ? ' temp--off' : ''}`}>
                                {strings.temp[temp]}
                                {offTemps.includes(temp) && <span className="visually-hidden"> {t.tempOff}</span>}
                              </span>
                            ))}
                        </span>
                      </div>
                      {status === 'substitute' && (
                        <p className="badge badge--sub">
                          <span className="badge__label">{t.substitute}</span>
                          {reasons.map((line) => (
                            <span key={line} className="badge__line">
                              {line}
                            </span>
                          ))}
                        </p>
                      )}
                      {status === 'blocked' && (
                        <p className="badge badge--danger">
                          <span className="badge__label">{t.blocked}</span>
                          {reasons.map((line) => (
                            <span key={line} className="badge__line">
                              {line}
                            </span>
                          ))}
                        </p>
                      )}
                    </li>
                  )
                })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}

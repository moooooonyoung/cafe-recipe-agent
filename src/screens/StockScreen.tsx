import { useState } from 'react'
import { ingredients, type IngredientId, type IngredientInfo } from '../data/ingredients'
import { defaultStock, type Stock } from '../data/stock'
import { ingredientNames, strings } from '../i18n'
import './StockScreen.css'

type Props = {
  stock: Stock
  onToggle: (id: IngredientId) => void
  onReset: () => void
  onBack: () => void
}

// 재고 화면에 보이는 재료: 항상 있는 재료(물)는 뺀다
const items = (Object.keys(ingredients) as IngredientId[]).filter((id) => {
  const info: IngredientInfo = ingredients[id]
  return !info.alwaysAvailable
})

const t = strings.stock

export default function StockScreen({ stock, onToggle, onReset, onBack }: Props) {
  // 초기화는 실수로 누르기 쉬워서 한 번 더 묻는다
  const [asking, setAsking] = useState(false)

  const soldOutCount = items.filter((id) => !stock[id]).length
  const isDefault = items.every((id) => stock[id] === defaultStock[id])

  return (
    <main className="stock">
      <header className="stock__header">
        <button type="button" className="btn" onClick={onBack}>
          {t.back}
        </button>

        <div className="stock__heading">
          <h1 className="stock__title">{t.title}</h1>
          <p className="stock__hint">{t.hint}</p>
        </div>

        <p className={soldOutCount > 0 ? 'stock__summary stock__summary--warn' : 'stock__summary'} aria-live="polite">
          {soldOutCount > 0 ? t.soldOutCount(soldOutCount) : t.allInStock}
        </p>

        <div className="stock__reset">
          {asking && !isDefault ? (
            <>
              <span className="stock__ask">{t.resetAsk}</span>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  onReset()
                  setAsking(false)
                }}
              >
                {t.reset}
              </button>
              <button type="button" className="btn" onClick={() => setAsking(false)}>
                {t.resetCancel}
              </button>
            </>
          ) : (
            <button type="button" className="btn" disabled={isDefault} onClick={() => setAsking(true)}>
              {t.reset}
            </button>
          )}
        </div>
      </header>

      <ul className="stock__grid">
        {items.map((id) => {
          const inStock = stock[id]
          return (
            <li key={id}>
              <button
                type="button"
                role="switch"
                aria-checked={inStock}
                className={inStock ? 'stock-item' : 'stock-item stock-item--out'}
                onClick={() => onToggle(id)}
              >
                <span className="stock-item__name">{ingredientNames[id]}</span>
                {/* 색만으로 구분하지 않도록 기호와 글자를 함께 쓴다 */}
                <span className="stock-item__state">{inStock ? `✓ ${t.inStock}` : `✕ ${t.soldOut}`}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </main>
  )
}

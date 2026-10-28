import { useState } from 'react'
import type { IngredientId } from './data/ingredients'
import type { Stock } from './data/stock'
import { resetStock, toggleSoldOut } from './logic/stock'
import { browserStore, loadStock, saveStock } from './logic/stockStorage'

// 재고 상태. 바꿀 때마다 localStorage에 저장하고, 처음 열 때 저장된 재고를 읽는다.
export function useStock() {
  const [stock, setStock] = useState<Stock>(() => loadStock(browserStore()))

  function update(next: Stock) {
    setStock(next)
    saveStock(browserStore(), next)
  }

  return {
    stock,
    toggle: (id: IngredientId) => update(toggleSoldOut(stock, id)),
    reset: () => update(resetStock()),
  }
}

import { describe, expect, it } from 'vitest'
import { defaultStock } from '../data/stock'
import { isAvailable, resetStock, toggleSoldOut } from './stock'
import { soldOut } from './testHelpers'

describe('재고', () => {
  it('재료를 누르면 품절이 되고 다시 누르면 있음으로 돌아온다', () => {
    const once = toggleSoldOut(defaultStock, 'milk')
    expect(once.milk).toBe(false)
    expect(toggleSoldOut(once, 'milk').milk).toBe(true)
  })

  it('재고를 바꿔도 기본 재고 객체는 바뀌지 않는다', () => {
    toggleSoldOut(defaultStock, 'milk')
    expect(defaultStock.milk).toBe(true)
  })

  it('재고 초기화를 하면 기본 재고 상태로 돌아간다', () => {
    const changed = toggleSoldOut(toggleSoldOut(defaultStock, 'milk'), 'ice')
    expect(changed).not.toEqual(defaultStock)
    expect(resetStock()).toEqual(defaultStock)
  })

  it('초기화한 재고를 바꿔도 기본 재고 객체는 바뀌지 않는다', () => {
    const reset = resetStock()
    expect(reset).not.toBe(defaultStock)
    reset.milk = false
    expect(defaultStock.milk).toBe(true)
  })

  it('항상 있는 재료(물)는 품절로 바꿔도 있는 것으로 본다', () => {
    expect(isAvailable('water', soldOut('water'))).toBe(true)
    expect(isAvailable('milk', soldOut('milk'))).toBe(false)
  })
})

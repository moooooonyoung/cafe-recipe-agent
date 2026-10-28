import { describe, expect, it } from 'vitest'
import { defaultStock } from '../data/stock'
import { STOCK_KEY, loadStock, saveStock, type Store } from './stockStorage'
import { toggleSoldOut } from './stock'

// 메모리에만 저장하는 가짜 저장소
function fakeStore(initial: Record<string, string> = {}): Store & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value
    },
  }
}

describe('재고 저장', () => {
  it('저장된 값이 없으면 기본 재고로 시작한다', () => {
    expect(loadStock(fakeStore())).toEqual(defaultStock)
  })

  it('저장한 재고를 다시 열면 그대로 읽어 온다', () => {
    const store = fakeStore()
    const changed = toggleSoldOut(toggleSoldOut(defaultStock, 'milk'), 'ice')
    saveStock(store, changed)
    expect(loadStock(store)).toEqual(changed)
  })

  it('저장된 값이 깨져 있으면 기본 재고로 시작한다', () => {
    expect(loadStock(fakeStore({ [STOCK_KEY]: '{깨진 json' }))).toEqual(defaultStock)
    expect(loadStock(fakeStore({ [STOCK_KEY]: '"문자열"' }))).toEqual(defaultStock)
  })

  it('저장된 값에 없는 재료는 기본값으로 채운다', () => {
    const store = fakeStore({ [STOCK_KEY]: JSON.stringify({ milk: false }) })
    expect(loadStock(store)).toEqual({ ...defaultStock, milk: false })
  })

  it('알 수 없는 재료와 true/false가 아닌 값은 무시한다', () => {
    const store = fakeStore({ [STOCK_KEY]: JSON.stringify({ milk: false, ice: 'no', 없는재료: false }) })
    const stock = loadStock(store)
    expect(stock).toEqual({ ...defaultStock, milk: false })
    expect(stock).not.toHaveProperty('없는재료')
  })

  it('저장소를 읽을 수 없어도 기본 재고로 시작한다', () => {
    const broken: Store = {
      getItem: () => {
        throw new Error('접근 불가')
      },
      setItem: () => {},
    }
    expect(loadStock(broken)).toEqual(defaultStock)
  })

  it('저장소에 쓸 수 없어도 오류 없이 넘어간다', () => {
    const full: Store = {
      getItem: () => null,
      setItem: () => {
        throw new Error('저장 공간 부족')
      },
    }
    expect(() => saveStock(full, defaultStock)).not.toThrow()
  })
})

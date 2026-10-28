import { describe, expect, it } from 'vitest'
import { ingredientNames, menuText, strings, substitutionNotes } from '../i18n'
import type { MenuText } from '../i18n/types'
import { ingredients, type IngredientId, type IngredientInfo } from './ingredients'
import { categoryOrder, menus, type MenuId } from './menus'
import { baseDefaults, sweetnessPumps } from './options'
import { defaultStock } from './stock'
import { substitutions } from './substitutions'
import type { Menu, Temperature } from './types'

const allMenus: readonly Menu[] = menus
const ingredientIds = Object.keys(ingredients) as IngredientId[]
const fillLevels = Object.keys(strings.fillLevel)
const textOf = (menu: Menu): MenuText => menuText[menu.id as MenuId]
const refsOf = (sentence: string) => [...sentence.matchAll(/\{(\w+)\}/g)].map((m) => m[1])

// 그 온도 레시피에 적힌 재료 + 당도로 더해지는 시럽
function usedIds(menu: Menu, temp: Temperature): string[] {
  const ids: string[] = Object.keys(menu.recipes[temp] ?? {})
  if (menu.sweetener) ids.push(menu.sweetener)
  return ids
}

// 단계 목록(온도별 + 라지 전용)을 [이름, 온도, 문장 목록]으로 펼친다
function allStepLists(menu: Menu, text: MenuText) {
  const lists: { label: string; temp: string; steps: readonly string[] }[] = []
  for (const [temp, steps] of Object.entries(text.steps)) lists.push({ label: `${menu.id}/${temp}`, temp, steps })
  for (const [temp, steps] of Object.entries(text.largeSteps ?? {})) lists.push({ label: `${menu.id}/large/${temp}`, temp, steps })
  return lists
}

describe('재료 데이터', () => {
  it('모든 재료에 한국어 이름이 있다', () => {
    for (const id of ingredientIds) expect(ingredientNames[id]?.length, id).toBeGreaterThan(0)
  })

  it('모든 재료의 단위에 표시 문구가 있다', () => {
    for (const id of ingredientIds) expect(strings.unit[ingredients[id].unit], id).toBeTruthy()
  })

  it('기본 재고에 모든 재료가 있고 항상 있는 재료는 있음이다', () => {
    expect(Object.keys(defaultStock).sort()).toEqual([...ingredientIds].sort())
    for (const id of ingredientIds) {
      const info: IngredientInfo = ingredients[id]
      if (info.alwaysAvailable) expect(defaultStock[id], id).toBe(true)
    }
  })
})

describe('대체 규칙 데이터', () => {
  it('대체 재료로 적은 재료 id가 실제 재료 목록에 존재한다', () => {
    for (const [from, candidates] of Object.entries(substitutions)) {
      expect(ingredientIds, `원래 재료 ${from}`).toContain(from)
      for (const c of candidates) expect(ingredientIds, `${from}의 후보 ${c.id}`).toContain(c.id)
    }
  })

  it('재료 자신을 대체 후보로 적지 않았고 후보가 겹치지 않는다', () => {
    for (const [from, candidates] of Object.entries(substitutions)) {
      const ids = candidates.map((c) => c.id)
      expect(ids, from).not.toContain(from)
      expect(new Set(ids).size, from).toBe(ids.length)
    }
  })

  it('대체 비율은 생략하거나 0보다 큰 수다', () => {
    for (const [from, candidates] of Object.entries(substitutions)) {
      for (const c of candidates) if (c.ratio !== undefined) expect(c.ratio, `${from} → ${c.id}`).toBeGreaterThan(0)
    }
  })

  it('대체 후보마다 안내 메모가 있고 후보가 아닌 메모는 없다', () => {
    for (const [from, candidates] of Object.entries(substitutions)) {
      for (const c of candidates) {
        const note = substitutionNotes[from as IngredientId]?.[c.id]
        expect(note?.length, `${from} → ${c.id}`).toBeGreaterThan(0)
      }
    }
    for (const [from, notes] of Object.entries(substitutionNotes)) {
      const candidateIds = (substitutions[from as IngredientId] ?? []).map((c) => c.id)
      for (const to of Object.keys(notes)) expect(candidateIds, `${from} → ${to} 메모`).toContain(to)
    }
  })
})

describe('메뉴 데이터', () => {
  it('메뉴 id가 겹치지 않고 모든 메뉴에 한국어 이름이 있다', () => {
    const ids = allMenus.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const menu of allMenus) expect(textOf(menu)?.name?.length, menu.id).toBeGreaterThan(0)
  })

  it('모든 메뉴에 필수 항목(id, 카테고리, 온도, 온도별 레시피)이 있다', () => {
    for (const menu of allMenus) {
      expect(menu.id, 'id').toBeTruthy()
      expect(categoryOrder, `${menu.id} 카테고리`).toContain(menu.category)
      expect(menu.temps.length, `${menu.id} 온도`).toBeGreaterThan(0)
      // 지원하는 온도마다 레시피가 있고, 지원하지 않는 온도의 레시피는 없다
      expect(Object.keys(menu.recipes).sort(), `${menu.id} 레시피 온도`).toEqual([...menu.temps].sort())
      for (const temp of menu.temps) {
        expect(Object.keys(menu.recipes[temp] ?? {}).length, `${menu.id}/${temp} 재료`).toBeGreaterThan(0)
      }
    }
  })

  it('메뉴 화면의 모든 카테고리에 메뉴가 하나 이상 있고 카테고리 순서에 중복이 없다', () => {
    expect(new Set(categoryOrder).size).toBe(categoryOrder.length)
    for (const category of categoryOrder) {
      expect(allMenus.filter((m) => m.category === category).length, category).toBeGreaterThan(0)
    }
  })

  it('모든 카테고리에 한국어 이름이 있다', () => {
    for (const category of categoryOrder) expect(strings.menu.category[category]?.length, category).toBeGreaterThan(0)
  })

  it('레시피의 재료 id가 실제 재료 목록에 존재한다', () => {
    for (const menu of allMenus) {
      for (const temp of menu.temps) {
        for (const id of Object.keys(menu.recipes[temp] ?? {})) expect(ingredientIds, `${menu.id}/${temp} ${id}`).toContain(id)
      }
    }
  })

  it('모든 재료에 레귤러/라지 양이 있고 라지가 레귤러보다 적지 않다', () => {
    for (const menu of allMenus) {
      for (const temp of menu.temps) {
        for (const [id, amount] of Object.entries(menu.recipes[temp] ?? {})) {
          const where = `${menu.id}/${temp} ${id}`
          for (const size of ['regular', 'large'] as const) {
            const qty = amount[size]
            const valid = typeof qty === 'number' ? qty > 0 : fillLevels.includes(qty)
            expect(valid, `${where} ${size}`).toBe(true)
          }
          if (typeof amount.regular === 'number' && typeof amount.large === 'number') {
            expect(amount.large, `${where} 라지`).toBeGreaterThanOrEqual(amount.regular)
          }
        }
      }
    }
  })

  it('당도 시럽은 실제 재료이고 레시피에 따로 적지 않았다', () => {
    for (const menu of allMenus) {
      if (!menu.sweetener) continue
      expect(ingredientIds, `${menu.id} 당도 시럽`).toContain(menu.sweetener)
      for (const temp of menu.temps) {
        expect(Object.keys(menu.recipes[temp] ?? {}), `${menu.id}/${temp}`).not.toContain(menu.sweetener)
      }
    }
  })

  it('에스프레소가 들어가는 메뉴는 커피 메뉴이고 커피 메뉴에는 에스프레소가 있다', () => {
    for (const menu of allMenus) {
      for (const temp of menu.temps) {
        const hasEspresso = 'espresso' in (menu.recipes[temp] ?? {})
        expect(hasEspresso, `${menu.id}/${temp}`).toBe(menu.category === 'coffee')
      }
    }
  })

  it('기본 옵션의 온도는 메뉴가 지원하는 온도다', () => {
    for (const menu of allMenus) {
      const temp = menu.defaults?.temp ?? baseDefaults.temp
      expect(menu.temps, `${menu.id} 기본 온도 ${temp}`).toContain(temp)
    }
  })

  it('대체 불가 예외로 적은 재료가 그 메뉴 레시피에 실제로 있다', () => {
    for (const menu of allMenus) {
      const inMenu = new Set(menu.temps.flatMap((t) => usedIds(menu, t)))
      for (const id of menu.nonSubstitutable ?? []) expect(inMenu.has(id), `${menu.id}의 대체 불가 ${id}`).toBe(true)
    }
  })
})

describe('단계 문장 데이터', () => {
  it('메뉴가 지원하는 온도마다 단계 목록이 있고 지원하지 않는 온도의 단계는 없다', () => {
    for (const menu of allMenus) {
      const text = textOf(menu)
      expect(Object.keys(text.steps).sort(), `${menu.id} 단계 온도`).toEqual([...menu.temps].sort())
      for (const temp of menu.temps) expect(text.steps[temp]?.length, `${menu.id}/${temp}`).toBeGreaterThan(0)
      // 라지 전용 단계는 예외라서 있다면 지원하는 온도에만 있어야 한다
      for (const temp of Object.keys(text.largeSteps ?? {})) expect(menu.temps, `${menu.id} 라지 ${temp}`).toContain(temp)
    }
  })

  it('단계 문장이 참조하는 재료가 그 레시피의 재료(또는 당도 시럽)에 있다', () => {
    for (const menu of allMenus) {
      for (const { label, temp, steps } of allStepLists(menu, textOf(menu))) {
        const allowed = usedIds(menu, temp as Temperature)
        for (const sentence of steps) {
          for (const ref of refsOf(sentence)) expect(allowed, `${label}: "${sentence}"의 {${ref}}`).toContain(ref)
        }
      }
    }
  })

  it('레시피의 모든 재료와 당도 시럽이 그 온도의 단계에 한 번 이상 나온다', () => {
    for (const menu of allMenus) {
      for (const temp of menu.temps) {
        const mentioned = new Set((textOf(menu).steps[temp] ?? []).flatMap(refsOf))
        for (const id of usedIds(menu, temp)) expect(mentioned.has(id), `${menu.id}/${temp}의 ${id}`).toBe(true)
      }
    }
  })

  it('단계 문장에 짝이 맞지 않는 중괄호가 없다', () => {
    for (const menu of allMenus) {
      for (const { label, steps } of allStepLists(menu, textOf(menu))) {
        for (const sentence of steps) {
          expect(sentence.replace(/\{\w+\}/g, ''), `${label}: "${sentence}"`).not.toMatch(/[{}]/)
        }
      }
    }
  })
})

describe('옵션 데이터', () => {
  it('당도 펌프 수는 없음이 0이고 단계가 올라갈수록 줄지 않으며 라지가 레귤러보다 적지 않다', () => {
    const levels = ['none', 'less', 'normal', 'more'] as const
    for (const size of ['regular', 'large'] as const) {
      expect(sweetnessPumps[size].none, size).toBe(0)
      const pumps = levels.map((l) => sweetnessPumps[size][l])
      expect(pumps, size).toEqual([...pumps].sort((a, b) => a - b))
    }
    for (const l of levels) expect(sweetnessPumps.large[l], l).toBeGreaterThanOrEqual(sweetnessPumps.regular[l])
  })
})

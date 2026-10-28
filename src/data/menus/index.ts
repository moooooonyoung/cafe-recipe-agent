import { americano } from './americano'
import { cappuccino } from './cappuccino'
import { chamomileTea } from './chamomile_tea'
import { chocoLatte } from './choco_latte'
import { grapefruitAde } from './grapefruit_ade'
import { latte } from './latte'
import { lemonAde } from './lemon_ade'
import { matchaLatte } from './matcha_latte'
import { oatLatte } from './oat_latte'
import { strawberryLatte } from './strawberry_latte'
import { vanillaLatte } from './vanilla_latte'

// 메뉴 카드가 보이는 순서
export const menus = [
  americano,
  latte,
  vanillaLatte,
  cappuccino,
  oatLatte,
  chocoLatte,
  matchaLatte,
  strawberryLatte,
  lemonAde,
  grapefruitAde,
  chamomileTea,
] as const

export type MenuId = (typeof menus)[number]['id']

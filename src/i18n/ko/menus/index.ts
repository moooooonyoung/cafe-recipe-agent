import type { MenuId } from '../../../data/menus'
import type { MenuText } from '../../types'
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

// 메뉴 id → 메뉴명·단계 문장. MenuId가 빠지면 타입 오류가 난다.
export const menuText: Record<MenuId, MenuText> = {
  americano,
  latte,
  vanilla_latte: vanillaLatte,
  cappuccino,
  oat_latte: oatLatte,
  choco_latte: chocoLatte,
  matcha_latte: matchaLatte,
  strawberry_latte: strawberryLatte,
  lemon_ade: lemonAde,
  grapefruit_ade: grapefruitAde,
  chamomile_tea: chamomileTea,
}

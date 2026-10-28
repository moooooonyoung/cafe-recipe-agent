import { ko } from './ko/ui'

export type Strings = typeof ko

// 지금은 한국어만 있다. 영어를 추가할 때 여기서 언어를 고른다.
export const strings: Strings = ko
export { ingredientNames } from './ko/ingredients'
export { menuText } from './ko/menus'
export { substitutionNotes } from './ko/substitutions'

import type { MenuText } from '../../types'

export const americano: MenuText = {
  name: '아메리카노',
  steps: {
    hot: [
      '{espresso} 추출해 컵에 받기',
      '{syrup} 넣고 저어 섞기',
      '뜨거운 {water} 붓기',
      '뚜껑을 닫아 전달하기',
    ],
    ice: [
      '{espresso} 추출해 컵에 받기',
      '{syrup} 넣고 저어 섞기',
      '{water} 붓기',
      '{ice} 담기',
      '뚜껑을 닫아 전달하기',
    ],
  },
}

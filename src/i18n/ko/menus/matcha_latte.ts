import type { MenuText } from '../../types'

export const matchaLatte: MenuText = {
  name: '말차 라떼',
  steps: {
    hot: [
      '{matcha_powder}에 뜨거운 {water} 붓고 덩어리 없이 풀기',
      '{syrup} 넣고 저어 섞기',
      '{milk} 스팀해 붓기',
      '뚜껑을 닫아 전달하기',
    ],
    ice: [
      '{matcha_powder}에 {water} 붓고 덩어리 없이 풀기',
      '{syrup} 넣고 저어 섞기',
      '{ice} 담기',
      '{milk} 붓기',
      '가볍게 저어 뚜껑을 닫아 전달하기',
    ],
  },
}

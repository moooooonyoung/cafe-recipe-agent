import type { MenuText } from '../../types'

export const vanillaLatte: MenuText = {
  name: '바닐라 라떼',
  steps: {
    hot: [
      '{espresso} 추출해 컵에 받기',
      '{vanilla_syrup} 넣고 저어 섞기',
      '{milk} 스팀해 붓기',
      '뚜껑을 닫아 전달하기',
    ],
    ice: [
      '{espresso} 추출해 컵에 받기',
      '{vanilla_syrup} 넣고 저어 섞기',
      '{ice} 담기',
      '{milk} 붓기',
      '가볍게 저어 뚜껑을 닫아 전달하기',
    ],
  },
}

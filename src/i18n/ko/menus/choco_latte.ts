import type { MenuText } from '../../types'

export const chocoLatte: MenuText = {
  name: '초코 라떼',
  steps: {
    hot: [
      '컵에 {chocolate_sauce} 담기',
      '{syrup} 넣기',
      '{milk} 스팀해 붓기',
      '소스가 풀리도록 저어 뚜껑을 닫아 전달하기',
    ],
    ice: [
      '컵에 {chocolate_sauce} 담기',
      '{syrup} 넣기',
      '{milk} 붓고 소스가 풀리도록 젓기',
      '{ice} 담기',
      '뚜껑을 닫아 전달하기',
    ],
  },
}

import type { MenuText } from '../../types'

// 출처: 아이스 단계 순서는 근무 경험 기준, 핫은 샘플 값
export const latte: MenuText = {
  name: '카페라떼',
  steps: {
    hot: [
      '{espresso} 추출해 컵에 받기',
      '{syrup} 넣고 저어 섞기',
      '{milk} 스팀해 붓기',
      '뚜껑을 닫아 전달하기',
    ],
    ice: [
      '컵에 {ice} 담기',
      '{milk} 붓기',
      '{espresso} 추출해 샷잔에 받기',
      '{syrup} 넣고 저어 섞기',
      '샷잔의 에스프레소를 컵에 붓고 뚜껑을 닫아 전달하기',
    ],
  },
}

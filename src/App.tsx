import StockScreen from './screens/StockScreen'
import { useStock } from './useStock'

// 5단계에서 메뉴 선택 화면이 생기기 전까지는 재고 관리 화면만 보여준다.
export default function App() {
  const { stock, toggle, reset } = useStock()
  return <StockScreen stock={stock} onToggle={toggle} onReset={reset} />
}

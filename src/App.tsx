import { useState } from 'react'
import MenuScreen from './screens/MenuScreen'
import StockScreen from './screens/StockScreen'
import { useStock } from './useStock'

// 라우팅 라이브러리 없이 화면 상태로 전환한다. 6단계에서 옵션 화면과 가이드 화면이 더해진다.
type Screen = 'menu' | 'stock'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const { stock, toggle, reset } = useStock()

  if (screen === 'stock') {
    return <StockScreen stock={stock} onToggle={toggle} onReset={reset} onBack={() => setScreen('menu')} />
  }
  return <MenuScreen stock={stock} onOpenStock={() => setScreen('stock')} />
}

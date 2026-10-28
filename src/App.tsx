import { useState } from 'react'
import type { MenuId } from './data/menus'
import type { Options } from './data/types'
import GuideScreen from './screens/GuideScreen'
import MenuScreen from './screens/MenuScreen'
import OptionsScreen from './screens/OptionsScreen'
import StockScreen from './screens/StockScreen'
import { useStock } from './useStock'

// 라우팅 라이브러리 없이 화면 상태로 전환한다. 가이드 화면은 7단계에서 채운다.
type Screen =
  | { name: 'menu' }
  | { name: 'stock' }
  | { name: 'options'; menuId: MenuId }
  | { name: 'guide'; menuId: MenuId; options: Options }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'menu' })
  const { stock, toggle, reset } = useStock()
  const toMenu = () => setScreen({ name: 'menu' })

  switch (screen.name) {
    case 'stock':
      return <StockScreen stock={stock} onToggle={toggle} onReset={reset} onBack={toMenu} />
    case 'options':
      return (
        <OptionsScreen
          menuId={screen.menuId}
          stock={stock}
          onBack={toMenu}
          onStart={(options) => setScreen({ name: 'guide', menuId: screen.menuId, options })}
        />
      )
    case 'guide':
      return (
        <GuideScreen
          menuId={screen.menuId}
          options={screen.options}
          onBack={() => setScreen({ name: 'options', menuId: screen.menuId })}
        />
      )
    default:
      return (
        <MenuScreen
          stock={stock}
          onOpenStock={() => setScreen({ name: 'stock' })}
          onSelect={(menuId) => setScreen({ name: 'options', menuId })}
        />
      )
  }
}

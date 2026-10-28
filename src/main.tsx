import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 공통 스타일이 화면별 CSS보다 먼저 와야 화면 CSS가 공통 규칙을 덮어쓸 수 있다
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

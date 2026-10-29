import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages 주소가 https://<계정>.github.io/cafe-recipe-agent/ 라서 저장소 이름을 base로 둔다
  base: '/cafe-recipe-agent/',
  plugins: [react()],
})

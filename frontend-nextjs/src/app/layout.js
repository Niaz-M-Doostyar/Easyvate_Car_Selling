// src/app/layout.js
import './global.css'                 // ← global styles (no hydration issue)

export default function RootLayout({ children }) {
  return children
}
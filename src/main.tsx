import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

function renderApp() {
  const rootEl = document.getElementById('root')
  if (!rootEl) {
    console.error('[main] 找不到 #root 元素')
    return
  }

  try {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <BrowserRouter basename="/zhizhao-match">
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    )
  } catch (err) {
    console.error('[main] React 渲染失败:', err)
    rootEl.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0A0F1A;color:#E2E8F0;font-family:sans-serif;padding:20px;text-align:center;">
        <div>
          <h2 style="color:#EF4444;margin-bottom:8px;">应用加载失败</h2>
          <p style="color:#94A3B8;font-size:14px;margin-bottom:16px;">页面渲染异常，请尝试刷新页面</p>
          <button onclick="location.reload()" style="background:#1A73E8;color:white;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px;">刷新页面</button>
        </div>
      </div>
    `
  }
}

renderApp()
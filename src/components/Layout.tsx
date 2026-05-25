import { useState, useLayoutEffect, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppStore, UserMode } from '../store/useAppStore'
import { User, GraduationCap, Building2, Zap, Menu, X, Key, CheckCircle2, AlertCircle, Loader2, RefreshCw, LogOut, RotateCcw } from 'lucide-react'
import { useSync } from '../providers/SyncProvider'

const modeTabs: { key: UserMode; label: string; icon: typeof User; desc: string }[] = [
  { key: 'jobseeker', label: '求职者', icon: User, desc: '技能测试 · 画像生成 · 岗位匹配' },
  { key: 'student', label: '大学生', icon: GraduationCap, desc: '技能测试 · 画像生成 · 成长追踪' },
  { key: 'hr', label: 'HR', icon: Building2, desc: '岗位画像 · 岗位管理 · 人才匹配' },
]

export default function Layout() {
  const { userMode, setUserMode, resetAll, resetAllData, logout, apiKey, setApiKey, showApiKeyModal, setShowApiKeyModal, isDemoUser, isSharedAccount } = useAppStore()
  const { syncStatus, errorMessage, clearSyncStatus } = useSync()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0)
    })
    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [location.pathname])
  const [apiKeyInput, setApiKeyInput] = useState(apiKey)
  const [syncDismissed, setSyncDismissed] = useState(false)
  const [showLogoutMenu, setShowLogoutMenu] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleModeSwitch = (mode: UserMode) => {
    setUserMode(mode)
    resetAll()
    setMobileMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
    }
  }

  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col dot-bg">
      <header className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-tech-500 to-teal-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-heading font-bold text-white tracking-tight">
                  智聘
                </h1>
                <p className="text-[10px] text-slate-500 tracking-wider uppercase">
                  双向精准匹配
                </p>
              </div>
            </button>

            <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5">
              {modeTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleModeSwitch(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                    userMode === tab.key
                      ? 'bg-tech-500/20 text-tech-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {userMode === tab.key && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-tech-400" />
                  )}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
            {isDemoUser && (
              <div className="relative">
                <button
                  onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tech-500/10 border border-tech-500/20 text-tech-300 text-[11px] font-heading hover:bg-tech-500/20 transition-all"
                >
                  <Zap className="w-3 h-3" />
                  {isSharedAccount ? '体验模式' : '本地访客'}
                </button>
                {showLogoutMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLogoutMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 glass-card p-1.5 min-w-[160px] shadow-xl border border-white/10">
                      <button
                        onClick={() => {
                          setShowLogoutMenu(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                      <button
                        onClick={() => {
                          setShowLogoutMenu(false)
                          setShowResetConfirm(true)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left"
                      >
                        <RotateCcw className="w-4 h-4" />
                        重置账号数据
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            <button
              onClick={() => {
                setApiKeyInput(apiKey)
                setShowApiKeyModal(true)
              }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                apiKey
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20'
                  : 'bg-gold-500/10 border border-gold-500/20 text-gold-400 hover:bg-gold-500/20'
              }`}
              title={apiKey ? 'AI Key 已配置' : '点击配置 AI Key'}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{apiKey ? 'AI Key ✓' : 'AI Key'}</span>
              {!apiKey && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-deep-900/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {modeTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleModeSwitch(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    userMode === tab.key
                      ? 'bg-tech-500/15 text-tech-300'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{tab.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {!isHome && (
        <button
          onClick={() => navigate('/')}
          className="fixed top-20 left-4 z-40 glass-card p-2.5 rounded-xl text-slate-400 hover:text-white transition-all group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {syncStatus !== 'idle' && syncStatus !== 'connected' && !syncDismissed && (
        <div
          className={`text-center py-1.5 text-[11px] font-medium flex items-center justify-center gap-1.5 relative ${
            syncStatus === 'loading' ? 'bg-tech-500/10 text-tech-400 border-b border-tech-500/20' :
            syncStatus === 'syncing' ? 'bg-gold-500/10 text-gold-400 border-b border-gold-500/20' :
            'bg-red-500/10 text-red-400 border-b border-red-500/20'
          }`}
        >
          {syncStatus === 'loading' && <><Loader2 className="w-3 h-3 animate-spin" /> 正在从云端同步数据...</>}
          {syncStatus === 'syncing' && <><Loader2 className="w-3 h-3 animate-spin" /> 正在保存数据到云端...</>}
          {syncStatus === 'error' && <><AlertCircle className="w-3 h-3" /> {errorMessage || '数据同步失败，数据仅保存在本地'}</>}
          {syncStatus === 'error' && (
            <button
              onClick={() => clearSyncStatus()}
              className="ml-2 px-2 py-0.5 rounded text-[10px] text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 transition-all inline-flex items-center gap-1"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              重试
            </button>
          )}
          <button
            onClick={() => {
              setSyncDismissed(true)
              setTimeout(() => setSyncDismissed(false), 8000)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 transition-all opacity-60 hover:opacity-100"
            title="关闭通知"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <main className="flex-1">
          <Outlet />
        </main>

        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="glass-card p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-lg">重置账号数据</h3>
                  <p className="text-xs text-slate-400">此操作将清除所有数据且不可恢复</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-2 leading-relaxed">
                重置后以下数据将被<span className="text-red-400 font-medium">永久删除</span>：
              </p>
              <ul className="text-xs text-slate-500 space-y-1 mb-5 list-disc list-inside">
                <li>所有历史技能画像</li>
                <li>所有成长记录</li>
                <li>HR 岗位数据</li>
                <li>意向岗位数据</li>
                <li>候选人/匹配数据</li>
                <li>AI API Key 配置</li>
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    resetAllData()
                    setShowResetConfirm(false)
                  }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  确认重置
                </button>
              </div>
            </div>
          </div>
        )}

        {showApiKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="glass-card p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  apiKey ? 'bg-green-500/10' : 'bg-gold-500/10'
                }`}>
                  <Key className={`w-5 h-5 ${apiKey ? 'text-green-400' : 'text-gold-400'}`} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-lg">配置 AI API Key</h3>
                  <p className="text-xs text-slate-400">输入 DeepSeek API Key 以启用 AI 功能</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-1.5 block">API Key</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-tech-500/50 transition-all"
                />
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-gold-400" />
                  <span className="text-xs font-heading text-white">安全说明</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1">
                  <li>· Key 仅存储在浏览器本地，不会被上传到第三方</li>
                  <li>· API 调用通过前端直连 DeepSeek 官方接口</li>
                  <li>· 模型固定为 deepseek-v4-flash，不可修改</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApiKeyModal(false)
                    setApiKeyInput(apiKey)
                  }}
                  className="flex-1 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setApiKey(apiKeyInput.trim())
                    setShowApiKeyModal(false)
                  }}
                  className="btn-primary flex-1 text-sm flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="border-t border-white/5 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-slate-600">
            智聘 · 双向精准匹配引擎 — Demo v2.0
          </p>
          {isDemoUser && (
            <p className="text-[10px] text-tech-500/50 mt-1 font-heading">
              {isSharedAccount
                ? '共享体验账号 · 数据持久化至 Supabase · 跨设备同步'
                : '本地访客模式 · 数据暂存于本地 · 功能正常可用'}
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
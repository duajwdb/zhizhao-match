import { useEffect, useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAppStore, setAuthMode, rehydrateStore } from './store/useAppStore'
import { getExistingSessionWithTimeout, isSupabaseConfigured } from './config/supabaseClient'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PositionSelectPage from './pages/PositionSelectPage'
import QuizPage from './pages/QuizPage'
import HRAssistPage from './pages/HRAssistPage'
import ResultPage from './pages/ResultPage'
import GrowthPage from './pages/GrowthPage'
import HRJobManagePage from './pages/HRJobManagePage'
import JobSeekerJobsPage from './pages/JobSeekerJobsPage'
import MatchPage from './pages/MatchPage'
import EvaluatePage from './pages/EvaluatePage'
import HRCandidatePage from './pages/HRCandidatePage'
import SeedDataPage from './pages/SeedDataPage'
import SupabaseDiagnosticPage from './pages/SupabaseDiagnosticPage'
import { SyncProvider } from './providers/SyncProvider'
import { Loader2, RefreshCw, AlertTriangle, LogIn } from 'lucide-react'

const AUTH_TIMEOUT_MS = 5000

function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center dot-bg">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-tech-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">正在验证身份...</p>
      </div>
    </div>
  )
}

function AppLoadingError({ error, onRetry, onSkip }: { error: string; onRetry: () => void; onSkip: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center dot-bg px-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 mb-4">
          <AlertTriangle className="w-7 h-7 text-gold-400" />
        </div>
        <h3 className="font-heading font-semibold text-white text-lg mb-2">连接超时</h3>
        <p className="text-sm text-slate-400 mb-2">身份验证服务响应缓慢，可能由于网络波动。</p>
        <p className="text-xs text-slate-500 mb-6 font-mono break-all">{error}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={onRetry}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            重新连接
          </button>
          <button
            onClick={onSkip}
            className="px-5 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all border border-tech-500/30 flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            跳过验证，直接登录
          </button>
        </div>
      </div>
    </div>
  )
}

function AppMain() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/select-position" element={<PositionSelectPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/quiz/hr-ai" element={<HRAssistPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/growth" element={<GrowthPage />} />
        <Route path="/hr/jobs" element={<HRJobManagePage />} />
        <Route path="/jobs" element={<JobSeekerJobsPage />} />
        <Route path="/match" element={<MatchPage />} />
        <Route path="/evaluate" element={<EvaluatePage />} />
        <Route path="/hr/candidates" element={<HRCandidatePage />} />
        <Route path="/seed-data" element={<SeedDataPage />} />
        <Route path="/supabase-diagnostic" element={<SupabaseDiagnosticPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  const { isDemoUser, isAuthReady, setDemoAuth, setAuthReady, resetAuth, loadPresets } = useAppStore()
  const [initError, setInitError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[Global] 未处理的 Promise 拒绝:', event.reason)
      event.preventDefault()
    }

    const handleGlobalError = (event: ErrorEvent) => {
      console.error('[Global] 未捕获的错误:', event.message, event.filename, event.lineno)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleGlobalError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleGlobalError)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const existingAuthMode = (() => {
        try { return localStorage.getItem('zhizhao_auth_mode') as 'demo' | 'guest' | null }
        catch { return null }
      })()
      const preservedMode = existingAuthMode || 'guest'

      if (!isSupabaseConfigured()) {
        setAuthMode('guest')
        await rehydrateStore()
        if (!cancelled) {
          setAuthReady()
        }
        return
      }

      try {
        const session = await getExistingSessionWithTimeout(AUTH_TIMEOUT_MS)

        if (cancelled) return

        if (session) {
          setAuthMode('demo')
          await rehydrateStore()
          setDemoAuth(session.userId, true)
        } else {
          if (preservedMode === 'demo') {
            await rehydrateStore()
            const state = useAppStore.getState()
            if (state.isDemoUser && state.demoUserId) {
              setDemoAuth(state.demoUserId, true)
            }
          } else {
            setAuthMode('guest')
            await rehydrateStore()
          }
        }
      } catch (err) {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : '身份验证异常'
        console.error('[App] 身份验证失败:', msg)
        setInitError(msg)
      } finally {
        if (!cancelled) {
          setAuthReady()
        }
      }
    }

    init()

    return () => { cancelled = true }
  }, [setDemoAuth, setAuthReady, retryKey])

  const handleRetry = useCallback(() => {
    resetAuth()
    setInitError(null)
    setRetryKey((k) => k + 1)
  }, [resetAuth])

  const handleSkip = useCallback(() => {
    setInitError(null)
    setAuthReady()
  }, [setAuthReady])

  if (!isAuthReady) {
    if (initError) {
      return <AppLoadingError error={initError} onRetry={handleRetry} onSkip={handleSkip} />
    }
    return <AppLoading />
  }

  if (!isDemoUser) {
    return (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <SyncProvider>
        <AppMain />
      </SyncProvider>
    </ErrorBoundary>
  )
}
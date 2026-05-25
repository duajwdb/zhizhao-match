import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] 捕获到未处理的错误:', error.message)
    console.error('[ErrorBoundary] 组件堆栈:', errorInfo.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center dot-bg px-4">
          <div className="glass-card p-8 max-w-lg w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-5">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-heading font-bold text-white mb-3">
              页面加载异常
            </h2>
            <p className="text-sm text-slate-400 mb-2 leading-relaxed">
              应用遇到了一个未预期的错误，这可能是由于网络波动或服务暂时不可用导致的。
            </p>
            <details className="text-left mb-6">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">
                查看错误详情
              </summary>
              <pre className="mt-2 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-red-400 whitespace-pre-wrap break-all max-h-32 overflow-auto">
                {this.state.error?.message || '未知错误'}
              </pre>
            </details>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                重试
              </button>
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
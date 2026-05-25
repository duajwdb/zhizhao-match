import { useAppStore } from '../store/useAppStore'
import { Key, ArrowRight } from 'lucide-react'

interface APIKeyGuardProps {
  featureName: string
  compact?: boolean
}

export default function APIKeyGuard({ featureName, compact = false }: APIKeyGuardProps) {
  const { setShowApiKeyModal } = useAppStore()

  if (compact) {
    return (
      <div className="p-4 rounded-xl bg-gold-500/[0.04] border border-gold-500/15">
        <p className="text-xs text-slate-400 mb-3">
          需要配置 DeepSeek API Key 才能使用 <span className="text-gold-400 font-medium">{featureName}</span> 功能
        </p>
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 transition-colors font-medium"
        >
          <Key className="w-3.5 h-3.5" />
          前往配置 API Key
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="py-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 mb-4">
        <Key className="w-7 h-7 text-gold-400" />
      </div>
      <h4 className="text-white font-heading font-semibold mb-2">需要配置 AI API Key</h4>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
        {featureName} 功能依赖 DeepSeek AI 大模型能力。
        请先配置您的 API Key 以激活此功能，Key 仅存储在浏览器本地。
      </p>
      <button
        onClick={() => setShowApiKeyModal(true)}
        className="btn-primary inline-flex items-center gap-2 text-sm"
      >
        <Key className="w-4 h-4" />
        前往配置 API Key
      </button>
    </div>
  )
}
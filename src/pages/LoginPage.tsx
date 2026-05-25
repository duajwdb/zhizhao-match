import { useState } from 'react'
import { useAppStore, setAuthMode } from '../store/useAppStore'
import { rehydrateStore } from '../store/useAppStore'
import { signInDemoAccount } from '../config/supabaseClient'
import { motion } from 'framer-motion'
import { Zap, LogIn, Loader2, AlertCircle, Sparkles, Users, Shield, TrendingUp, UserPlus, RotateCcw } from 'lucide-react'

function createLocalGuestId(): string {
  const key = 'zhizhao_guest_user_id'
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const id = `guest_${crypto.randomUUID()}`
  localStorage.setItem(key, id)
  return id
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const { setDemoAuth, resetAllData } = useAppStore()

  const handleDemoLogin = async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const { userId, isSharedAccount } = await signInDemoAccount()
      setAuthMode('demo')
      await rehydrateStore()
      setDemoAuth(userId, isSharedAccount)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '登录失败，请重试'
      setError(msg)
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setAuthMode('guest')
    await rehydrateStore()
    const guestId = createLocalGuestId()
    setDemoAuth(guestId, false)
  }

  const features = [
    { icon: Sparkles, label: '技能测评', desc: '标准化测试构建能力画像' },
    { icon: Users, label: '双向匹配', desc: '精准连接求职者与企业' },
    { icon: TrendingUp, label: '成长追踪', desc: '可视化职业发展轨迹' },
    { icon: Shield, label: '数据安全', desc: '数据加密持久化存储' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center dot-bg px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-tech-500 to-teal-500 mb-5 shadow-lg shadow-tech-500/20"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-heading font-bold text-white mb-2"
          >
            智聘
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gradient text-lg font-heading font-semibold mb-3"
          >
            双向精准匹配引擎
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed"
          >
            通过标准化技能测试、AI 画像生成与智能匹配算法，
            实现求职者与岗位之间的精准双向匹配
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-xs font-heading text-gold-400 tracking-wider uppercase">
              体验账号 · 一键登录
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            无需注册，点击下方按钮即可立即体验完整功能。
            您的所有数据将<span className="text-slate-400">持久化保存</span>，
            下次访问时可自动恢复。
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/15 mb-4"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 leading-relaxed">{error}</p>
            </motion.div>
          )}

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2.5 py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                正在登录...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                体验账号一键登录
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-slate-500 bg-[#0A0F1A]">或</span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm text-slate-300 hover:text-white border border-tech-500/20 hover:border-tech-500/40 hover:bg-tech-500/5 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            本地访客模式（无需联网）
          </button>

          <p className="text-center text-[11px] text-slate-600 mt-3">
            点击即表示同意使用体验账号，数据将保存至云端数据库
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-6"
        >
          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            重置体验账号
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 gap-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="glass-card p-3 text-center"
            >
              <feature.icon className="w-4 h-4 text-tech-400 mx-auto mb-1.5" />
              <p className="text-xs font-heading text-slate-300 mb-0.5">{feature.label}</p>
              <p className="text-[10px] text-slate-500">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-[11px] text-slate-600 mt-6"
        >
          智聘 Demo v2.0 · Supabase 数据持久化
        </motion.p>

        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-lg">重置体验账号</h3>
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
              <p className="text-xs text-slate-500 mb-5 p-3 rounded-lg bg-gold-500/5 border border-gold-500/10">
                重置完成后将返回全新登录界面，您可以重新开始体验。
              </p>
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
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
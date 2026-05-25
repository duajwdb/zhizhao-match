import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2, MessageCircle, CheckCircle2, Eye, EyeOff, Star,
  Shield, ArrowLeft, Users, Search, X, Send, Clock,
  AlertTriangle, UserCheck, Sparkles, TrendingUp, Edit3,
} from 'lucide-react'

const POSITION_LABELS: Record<string, string> = { ai_engineer: 'AI工程师', '3d_modeler': '3D建模师' }

export default function HRCandidatePage() {
  const {
    hrCandidates,
    removeHrCandidate,
    updateCandidateStatus,
    addHrCandidateReputationRating,
    addCandidateChatMessage,
  } = useAppStore()
  const navigate = useNavigate()

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [chatTargetId, setChatTargetId] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [ratingTargetId, setRatingTargetId] = useState<string | null>(null)
  const [ratingValue, setRatingValue] = useState(3)
  const [modifyConfirmStep, setModifyConfirmStep] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCandidates = hrCandidates.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return c.name.toLowerCase().includes(q) || POSITION_LABELS[c.position]?.toLowerCase().includes(q)
  })

  const handleDelete = (id: string) => {
    removeHrCandidate(id)
    setDeleteConfirmId(null)
  }

  const handleMarkInterviewed = (id: string) => {
    updateCandidateStatus(id, 'interviewed')
  }

  const handleSendMessage = (id: string) => {
    if (!chatInput.trim()) return
    addCandidateChatMessage(id, 'hr', chatInput.trim())
    setTimeout(() => {
      const autoReplies = [
        '感谢您的关注，期待进一步沟通！',
        '好的，我方便在周一至周五上午面试。',
        '请问岗位的具体工作地点在哪里？',
        '非常感谢这次机会，我会认真准备的。',
        '能否再多介绍一下团队情况呢？',
      ]
      addCandidateChatMessage(id, 'candidate', autoReplies[Math.floor(Math.random() * autoReplies.length)])
    }, 800 + Math.random() * 1200)
    setChatInput('')
  }

  const handleRatingSubmit = (id: string) => {
    const candidate = hrCandidates.find((c) => c.id === id)
    if (!candidate) return

    const isModify = !!candidate.reputationRatedAt && !candidate.reputationModified

    if (isModify && !modifyConfirmStep) {
      setModifyConfirmStep(true)
      return
    }

    addHrCandidateReputationRating(id, ratingValue)
    setRatingTargetId(null)
    setModifyConfirmStep(false)
    setRatingValue(3)
  }

  const handleOpenRating = (id: string) => {
    const candidate = hrCandidates.find((c) => c.id === id)
    if (!candidate) return
    if (candidate.reputationModified) return
    setRatingTargetId(id)
    setModifyConfirmStep(false)
    setRatingValue(candidate.reputationRatings.length > 0 ? candidate.reputationRatings[candidate.reputationRatings.length - 1] : 3)
  }

  const targetCandidate = chatTargetId ? hrCandidates.find((c) => c.id === chatTargetId) : null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 返回首页
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-white">候选人管理</h1>
            <p className="text-slate-500 text-sm mt-1">
              管理匹配中添加的候选人，进行状态跟踪与信誉评价
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10">
            <Users className="w-4 h-4 text-tech-400" />
            <span className="text-sm text-tech-300 font-heading">{hrCandidates.length}</span>
            <span className="text-xs text-slate-500">位候选人</span>
          </div>
        </div>

        {hrCandidates.length > 0 && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索候选人姓名或岗位..."
              className="w-full max-w-xs bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-tech-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-[calc(15rem-28px)] top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </motion.div>

      {hrCandidates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-tech-500/10 border border-tech-500/20 mb-4">
            <Users className="w-8 h-8 text-tech-400" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-white mb-2">暂无候选人</h3>
          <p className="text-slate-500 text-sm mb-6">前往匹配页面，在匹配结果中添加候选人</p>
          <button onClick={() => navigate('/match')} className="btn-primary text-sm px-5 py-2.5">
            前往匹配
          </button>
        </motion.div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {filteredCandidates.map((candidate, idx) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-5 group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tech-500/20 to-violet-500/20 border border-tech-500/20 flex items-center justify-center text-white font-bold text-sm">
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold text-white text-base truncate">{candidate.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-tech-500/10 text-tech-300 border border-tech-500/20">
                          {POSITION_LABELS[candidate.position]}
                        </span>
                        <span className="text-xs text-slate-500">
                          匹配于 {new Date(candidate.addedAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                      <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-violet-300 font-heading">匹配 {candidate.matchScore}%</span>
                    </div>

                    {candidate.status === 'interviewed' ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20">
                          <Shield className="w-3.5 h-3.5 text-teal-400" />
                          <span className="text-xs text-teal-300 font-heading">信誉 {candidate.reputationScore}</span>
                        </div>
                        {candidate.reputationModified ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20">
                            <CheckCircle2 className="w-3 h-3 text-teal-400" />
                            <span className="text-xs text-teal-400 font-heading">
                              已评价 ({candidate.reputationRatings[candidate.reputationRatings.length - 1]}星
                              {candidate.reputationModifiedAt && (
                                <span className="ml-1 text-teal-600">
                                  · 修改于 {new Date(candidate.reputationModifiedAt).toLocaleDateString('zh-CN')}
                                </span>
                              )}
                            </span>
                          </div>
                        ) : candidate.reputationRatedAt ? (
                          <button
                            onClick={() => handleOpenRating(candidate.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                          >
                            <Edit3 className="w-3 h-3" />
                            修改评分 (
                            {new Date(candidate.reputationRatedAt).toLocaleDateString('zh-CN')})
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenRating(candidate.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gold-400 hover:text-gold-300 bg-gold-500/10 border border-gold-500/20 hover:bg-gold-500/20 transition-all"
                          >
                            <Star className="w-3 h-3" />
                            评分
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">
                        <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-xs text-slate-600">面试后解锁信誉评分</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setChatTargetId(candidate.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-tech-400 hover:text-tech-300 hover:bg-tech-500/10 border border-tech-500/20 hover:border-tech-500/30 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">发起沟通</span>
                  </button>

                  {candidate.status === 'confirmed' ? (
                    <button
                      onClick={() => handleMarkInterviewed(candidate.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 border border-teal-500/20 hover:border-teal-500/30 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">标记已面试</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-teal-600 bg-teal-500/5 border border-teal-500/10">
                      <UserCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">已面试</span>
                    </div>
                  )}

                  <button
                    onClick={() => setDeleteConfirmId(candidate.id)}
                    className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white">确认删除</h3>
                  <p className="text-xs text-slate-400">此操作不可撤销</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-6">确定要从候选人列表中移除此候选人吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2.5 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {ratingTargetId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                  (() => {
                    const c = hrCandidates.find((x) => x.id === ratingTargetId)
                    return c?.reputationRatedAt && !c?.reputationModified
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-gold-500/10 border-gold-500/20'
                  })()
                }`}>
                  {(() => {
                    const c = hrCandidates.find((x) => x.id === ratingTargetId)
                    return c?.reputationRatedAt && !c?.reputationModified
                      ? <Edit3 className="w-5 h-5 text-amber-400" />
                      : <Star className="w-5 h-5 text-gold-400" />
                  })()}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white">
                    {(() => {
                      const c = hrCandidates.find((x) => x.id === ratingTargetId)
                      return c?.reputationRatedAt && !c?.reputationModified ? '修改评价' : '首次评价'
                    })()}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {(() => {
                      const c = hrCandidates.find((x) => x.id === ratingTargetId)
                      return c?.reputationRatedAt && !c?.reputationModified
                        ? `当前评分：${c.reputationRatings[c.reputationRatings.length - 1]} 星，修改机会仅此一次`
                        : '对候选人面试表现进行信誉评分'
                    })()}
                  </p>
                </div>
              </div>

              {modifyConfirmStep ? (
                <>
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-300 font-medium">确认修改评分？</p>
                      <p className="text-xs text-amber-400/70 mt-0.5">此操作将覆盖原评分，修改机会仅此一次，请谨慎操作</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModifyConfirmStep(false)}
                      className="flex-1 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                    >
                      返回
                    </button>
                    <button
                      onClick={() => handleRatingSubmit(ratingTargetId)}
                      className="flex-1 py-2.5 rounded-lg text-sm bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 transition-all"
                    >
                      确认修改
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRatingValue(star)}
                        className={`p-2 rounded-lg transition-all ${
                          star <= ratingValue
                            ? 'text-gold-400 scale-110'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        <Star className={`w-8 h-8 ${star <= ratingValue ? 'fill-gold-400' : 'fill-transparent'}`} />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setRatingTargetId(null)}
                      className="flex-1 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleRatingSubmit(ratingTargetId)}
                      className="flex-1 py-2.5 rounded-lg text-sm bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 border border-gold-500/30 transition-all"
                    >
                      {(() => {
                        const c = hrCandidates.find((x) => x.id === ratingTargetId)
                        return c?.reputationRatedAt && !c?.reputationModified ? '提交修改' : '提交评分'
                      })()}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {chatTargetId && targetCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-lg w-full max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tech-500/20 to-violet-500/20 border border-tech-500/20 flex items-center justify-center text-white font-bold text-xs">
                    {targetCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-white text-sm">{targetCandidate.name}</h3>
                    <p className="text-xs text-slate-500">模拟沟通窗口</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatTargetId(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3" style={{ minHeight: '260px', maxHeight: '360px' }}>
                {targetCandidate.chatMessages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">发送第一条消息，开始模拟沟通</p>
                  </div>
                )}
                {targetCandidate.chatMessages.map((msg, mi) => (
                  <div
                    key={mi}
                    className={`flex ${msg.role === 'hr' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.role === 'hr'
                          ? 'bg-tech-500/20 text-tech-200 rounded-br-md'
                          : 'bg-white/[0.05] text-slate-300 rounded-bl-md'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-[10px] mt-1 opacity-50">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(targetCandidate.id)}
                    placeholder="输入消息..."
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-tech-500/50 transition-all"
                  />
                  <button
                    onClick={() => handleSendMessage(targetCandidate.id)}
                    disabled={!chatInput.trim()}
                    className="btn-primary p-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useSync } from '../providers/SyncProvider'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, Send, Shield, ThumbsUp, ThumbsDown, MessageSquare,
  Clock, TrendingUp, ShieldCheck, ShieldAlert, RotateCcw,
  CheckCircle2, AlertTriangle
} from 'lucide-react'

const HONESTY_TAGS = [
  { key: 'skill_truth', label: '技能真实性', icon: ShieldCheck },
  { key: 'communication', label: '沟通坦诚度', icon: MessageSquare },
  { key: 'experience', label: '经验描述准确性', icon: ThumbsUp },
]

interface EvaluationRecord {
  id: number
  date: string
  honestyScore: number
  tags: string[]
  reason: string
  evaluator: string
}

const DEMO_EVALUATIONS: EvaluationRecord[] = [
  {
    id: 1,
    date: '2026-03-15',
    honestyScore: 4.8,
    tags: ['skill_truth', 'communication'],
    reason: '技能描述与面试表现高度一致，技术方案讲解清晰有条理。',
    evaluator: '张经理',
  },
  {
    id: 2,
    date: '2026-01-20',
    honestyScore: 4.2,
    tags: ['skill_truth', 'experience'],
    reason: '项目经验描述准确，能够清晰介绍技术选型背景和实际落地效果。',
    evaluator: '李主管',
  },
  {
    id: 3,
    date: '2025-11-08',
    honestyScore: 3.8,
    tags: ['communication'],
    reason: '技术基础扎实，但在交流中对部分边界条件的描述不够完整。',
    evaluator: '王总监',
  },
]

export default function EvaluatePage() {
  const { selectedPosition } = useAppStore()
  const { syncEvaluation } = useSync()
  const [currentReputation, setCurrentReputation] = useState(4.5)
  const [honestyScore, setHonestyScore] = useState(0)
  const [hoverScore, setHoverScore] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [reverseTags, setReverseTags] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const isBelow4 = currentReputation < 4.0
  const nextRecovery = '2026-06-01'

  const handleSubmit = async () => {
    if (honestyScore === 0 || reason.length < 15) return

    const newTotal = (currentReputation * 3 + honestyScore) / 4
    setCurrentReputation(Math.round(newTotal * 10) / 10)
    setSubmitted(true)

    syncEvaluation({
      honesty_score: honestyScore,
      dimension_tags: selectedTags,
      comment: reason,
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tech-500/10 border border-tech-500/20 text-tech-300 text-xs font-medium tracking-wide uppercase mb-4">
            <Shield className="w-3.5 h-3.5" />
            动态信誉评价
          </div>
          <h1 className="text-2xl md:text-3xl font-display text-white mb-2">面试后评价</h1>
          <p className="text-slate-400 text-sm">双向评价，构建真实可信的人才生态</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-tech-400" />
              当前信誉档案
            </h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-slate-400 hover:text-white transition-all"
            >
              {showHistory ? '收起' : '查看评价历史'}
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-heading font-bold text-white mb-1">
                {currentReputation.toFixed(1)}
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= Math.round(currentReputation) ? 'text-gold-400 fill-gold-400' : 'text-slate-600'}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">综合信誉分</p>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">技能真实性</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
                </div>
                <span className="text-green-400 font-heading">4.6</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">沟通坦诚度</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full">
                  <div className="h-full bg-tech-500 rounded-full" style={{ width: '90%' }} />
                </div>
                <span className="text-tech-400 font-heading">4.8</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">经验准确性</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full">
                  <div className="h-full bg-gold-500 rounded-full" style={{ width: '70%' }} />
                </div>
                <span className="text-gold-400 font-heading">4.1</span>
              </div>
            </div>
          </div>

          {isBelow4 && (
            <div className="mt-4 p-3 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-start gap-3">
              <RotateCcw className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gold-300 font-heading mb-1">信誉回血机制</p>
                <p className="text-[11px] text-slate-400">
                  当前信誉分低于4星。完成新的技能测试后，系统将于下月1日（{nextRecovery}）自动恢复至4星基准。
                </p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t border-white/5 mt-4 pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>近期评价记录</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      近3个月内评价权重最高
                    </span>
                  </div>
                  {DEMO_EVALUATIONS.map((evaluation, idx) => {
                    const isRecent = new Date(evaluation.date) > new Date('2026-02-01')
                    return (
                      <div
                        key={evaluation.id}
                        className={`p-3 rounded-lg ${
                          isRecent ? 'bg-white/[0.03] border border-white/5' : 'bg-white/[0.01] border border-white/[0.02] opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{evaluation.date}</span>
                            <span className="text-xs text-slate-600">评价人：{evaluation.evaluator}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <span className="text-xs font-heading font-bold text-gold-400">
                              {evaluation.honestyScore}
                            </span>
                            <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-1.5">{evaluation.reason}</p>
                        <div className="flex items-center gap-1.5">
                          {evaluation.tags.map((tag) => {
                            const tagDef = HONESTY_TAGS.find((t) => t.key === tag)
                            return tagDef ? (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-tech-500/10 text-tech-400"
                              >
                                {tagDef.label}
                              </span>
                            ) : null
                          })}
                          {isRecent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400">
                              有效期内
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="font-heading font-semibold text-white text-sm flex items-center gap-2 mb-6">
              <Star className="w-4 h-4 text-gold-400" />
              HR面试评价
            </h3>

            <div className="space-y-5">
              <div>
                <p className="text-sm text-slate-300 mb-3 font-heading">诚实分评分</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onMouseEnter={() => setHoverScore(s)}
                      onMouseLeave={() => setHoverScore(0)}
                      onClick={() => setHonestyScore(s)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          s <= (hoverScore || honestyScore) ? 'text-gold-400 fill-gold-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  {honestyScore > 0 && (
                    <span className="ml-3 text-sm text-gold-400 font-heading font-bold">
                      {honestyScore} 星
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-3 font-heading">评价维度标签（可多选）</p>
                <div className="flex flex-wrap gap-2">
                  {HONESTY_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag.key)
                    return (
                      <button
                        key={tag.key}
                        onClick={() => {
                          setSelectedTags((prev) =>
                            prev.includes(tag.key)
                              ? prev.filter((t) => t !== tag.key)
                              : [...prev, tag.key]
                          )
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all ${
                          isSelected
                            ? 'bg-tech-500/15 text-tech-300 border border-tech-500/30'
                            : 'bg-white/[0.02] text-slate-400 border border-white/5 hover:text-slate-300'
                        }`}
                      >
                        <tag.icon className="w-3.5 h-3.5" />
                        {tag.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-3 font-heading">
                  评价理由 <span className="text-slate-500 font-normal">（至少15字）</span>
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="请说明评分理由，例如：该候选人技能展示与描述一致，沟通思路清晰..."
                  rows={4}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-tech-500/50 transition-all"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  已输入 {reason.length} 字 {reason.length < 15 && '（还需至少15字）'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={honestyScore === 0 || reason.length < 15}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              提交评价
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="font-heading font-bold text-white text-lg mb-2">评价已提交</h3>
            <p className="text-sm text-slate-400 mb-6">
              您的评价已成功计入信誉档案，综合信誉分已更新为{' '}
              <span className="text-gold-400 font-heading font-bold">{currentReputation.toFixed(1)}</span>
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-4 rounded-lg bg-tech-500/[0.04] border border-tech-500/10 text-left">
                <p className="text-xs text-tech-400 font-heading mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  信誉分动态更新机制
                </p>
                <ul className="text-[11px] text-slate-400 space-y-1">
                  <li>· 每次评价按权重纳入综合信誉分计算</li>
                  <li>· 近3个月内评价权重最高，随时间自动衰减</li>
                  <li>· 信誉分低于4星时触发"回血机制"</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitted(false)
                setHonestyScore(0)
                setReason('')
                setSelectedTags([])
              }}
              className="btn-secondary text-sm"
            >
              提交新的评价
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-card p-6">
            <h3 className="font-heading font-semibold text-white text-sm flex items-center gap-2 mb-4">
              <ThumbsUp className="w-4 h-4 text-tech-400" />
              求职者反向评价 <span className="text-[10px] text-slate-500 font-normal">（隐私保护）</span>
            </h3>

            <p className="text-xs text-slate-400 mb-4">
              您的反馈将匿名展示，帮助改善招聘体验，同时形成对企业的双向约束。
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-2">岗位描述真实性</p>
                <div className="flex items-center gap-4">
                  {[
                    { score: 1, label: '差' },
                    { score: 2, label: '一般' },
                    { score: 3, label: '良好' },
                    { score: 4, label: '优秀' },
                    { score: 5, label: '完美' },
                  ].map(({ score, label }) => (
                    <button
                      key={score}
                      onClick={() => setReverseTags(
                        reverseTags.includes(`company_${score}`)
                          ? reverseTags.filter((t) => t !== `company_${score}`)
                          : [`company_${score}`]
                      )}
                      className="flex flex-col items-center gap-1 text-xs text-slate-400 hover:text-tech-400 transition-all"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                        reverseTags.includes(`company_${score}`)
                          ? 'bg-tech-500/15 border-tech-500/50 text-tech-400'
                          : 'border-white/5'
                      }`}>
                        {score}
                      </div>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">面试体验评价（匿名）</p>
                <textarea
                  placeholder="您的反馈将帮助改善招聘流程..."
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-tech-500/50 transition-all"
                />
              </div>
            </div>

            <button className="btn-secondary mt-4 text-sm flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              匿名提交反馈
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="font-heading font-semibold text-white text-sm flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-gold-400" />
            信誉机制说明
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: TrendingUp, color: 'text-tech-400',
                title: '动态更新', desc: '每次面试评价后，新获得的"诚实分"按权重纳入综合信誉分计算。',
              },
              {
                icon: RotateCcw, color: 'text-gold-400',
                title: '回血机制', desc: '信誉分低于4星的求职者，完成新技能测试后，下月1日自动恢复至4星基准。',
              },
              {
                icon: Clock, color: 'text-teal-400',
                title: '时效管理', desc: '匹配算法优先采用近3个月内评价，历史评价权重随时间自动衰减。',
              },
              {
                icon: TrendingUp, color: 'text-green-400',
                title: '权重加成', desc: '高信誉求职者在匹配排序中获得优先推荐权重，形成正向激励循环。',
              },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span className="text-xs font-heading font-semibold text-white">{item.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
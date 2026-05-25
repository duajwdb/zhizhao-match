import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useSync } from '../providers/SyncProvider'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2, Clock, AlertTriangle, Target, MessageCircle, X, Send
} from 'lucide-react'
import { POSITION_LABELS } from '../config/questionBankMapping'

export default function JobSeekerJobsPage() {
  const { jobseekerJobs, addJobseekerJobChatMessage } = useAppStore()
  const { syncDeleteJobseekerJob } = useSync()
  const navigate = useNavigate()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [chatTargetId, setChatTargetId] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  const handleSendMessage = (id: string) => {
    if (!chatInput.trim()) return
    addJobseekerJobChatMessage(id, 'hr', chatInput.trim())
    setTimeout(() => {
      const autoReplies = [
        '感谢您的关注，我们已经收到您的简历！',
        '好的，我们会在1-3个工作日内安排面试。',
        '您好，请问您方便在周一至周五参加面试吗？',
        '感谢您对我们公司的关注，期待进一步沟通！',
        '您的背景很符合我们的要求，HR稍后会与您联系。',
        '面试安排好后我们会通过邮件通知您，请注意查收。',
        '感谢您的耐心等待，我们正在审核您的资料。',
      ]
      addJobseekerJobChatMessage(id, 'company', autoReplies[Math.floor(Math.random() * autoReplies.length)])
    }, 800 + Math.random() * 1200)
    setChatInput('')
  }

  const targetJob = chatTargetId ? jobseekerJobs.find((j) => j.id === chatTargetId) : null
  const safeChatMessages = targetJob?.chatMessages ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-white">意向岗位管理</h1>
            <p className="text-slate-500 text-sm mt-1">管理您关注的意向岗位，可通过匹配排行榜添加</p>
          </div>
        </div>

        {jobseekerJobs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <Target className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-white mb-2">暂无意向岗位</h3>
            <p className="text-slate-500 text-sm mb-6">前往匹配页面，在匹配排行榜中添加意向岗位</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">岗位名称</th>
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">类型</th>
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">添加时间</th>
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                    <th className="text-right p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {jobseekerJobs.map((job) => (
                    <tr key={job.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <span className="font-heading font-semibold text-white text-sm">{job.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-400">{POSITION_LABELS[job.position as keyof typeof POSITION_LABELS]}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(job.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400">
                          关注中
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setChatTargetId(job.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-tech-400 hover:bg-tech-500/10 transition-all"
                            title="发起沟通"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            发起沟通
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(job.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {jobseekerJobs.map((job) => (
                <div key={job.id} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-semibold text-white text-sm">{job.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {POSITION_LABELS[job.position as keyof typeof POSITION_LABELS]} · {formatDate(job.createdAt)}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-500/10 text-teal-400">
                      关注中
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setChatTargetId(job.id)}
                      className="py-2 px-3 rounded-lg text-xs text-tech-400 hover:bg-tech-500/10 transition-all flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      发起沟通
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(job.id)}
                      className="py-2 px-3 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <AnimatePresence>
          {chatTargetId && targetJob && (
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
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500/20 to-amber-500/20 border border-gold-500/20 flex items-center justify-center text-gold-400 font-bold text-xs">
                      {targetJob.company ? targetJob.company.charAt(0) : targetJob.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-white text-sm">
                        {targetJob.company || targetJob.name}
                      </h3>
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
                  {safeChatMessages.length === 0 && (
                    <div className="text-center py-12">
                      <MessageCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">发送第一条消息，开始模拟沟通</p>
                    </div>
                  )}
                  {safeChatMessages.map((msg, mi) => (
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
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(targetJob.id)}
                      placeholder="输入消息..."
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-gold-500/50 transition-all"
                    />
                    <button
                      onClick={() => handleSendMessage(targetJob.id)}
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

          {deleteConfirm && (
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
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white">确认删除</h3>
                    <p className="text-xs text-slate-400">此操作不可撤销</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => { syncDeleteJobseekerJob(deleteConfirm); setDeleteConfirm(null) }}
                    className="flex-1 py-2.5 rounded-lg text-sm text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all"
                  >
                    确认删除
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
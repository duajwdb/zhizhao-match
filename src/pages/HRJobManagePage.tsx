import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useSync } from '../providers/SyncProvider'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Search, FileText, Clock, AlertTriangle, Briefcase, MoreVertical
} from 'lucide-react'

export default function HRJobManagePage() {
  const { removeHrJob, getMergedHrJobs, isPresetJob } = useAppStore()
  const { syncDeleteHrJob } = useSync()
  const navigate = useNavigate()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const mergedJobs = getMergedHrJobs()

  const positionLabels: Record<string, string> = {
    ai_engineer: 'AI工程师',
    '3d_modeler': '3D建模师',
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  const handleMatch = (jobId: string) => {
    navigate('/match', { state: { jobId } })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-white">岗位库管理</h1>
            <p className="text-slate-500 text-sm mt-1">管理已发布的岗位信息</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/quiz')}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> 自主答题
            </button>
            <button
              onClick={() => navigate('/quiz/hr-ai', { state: { initialMode: 'proxy' } })}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> AI代答
            </button>
          </div>
        </div>

        {mergedJobs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-white mb-2">暂无岗位</h3>
            <p className="text-slate-500 text-sm mb-6">点击上方按钮创建第一个岗位画像</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">岗位名称</th>
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">类型</th>
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">创建时间</th>
                    <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                    <th className="text-right p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedJobs.map((job) => (
                    <tr key={job.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <span className="font-heading font-semibold text-white text-sm">{job.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-400">{positionLabels[job.position]}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(job.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          job.status === 'active' ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {job.status === 'active' ? '已发布' : '草稿'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleMatch(job.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-tech-400 hover:bg-tech-500/10 transition-all"
                          >
                            <Search className="w-3.5 h-3.5" /> 匹配
                          </button>
                          <button
                            onClick={() => navigate(`/result`, {
                              state: {
                                profile: {
                                  name: job.name,
                                  position: job.position,
                                  mode: 'hr' as const,
                                  dimensions: job.dimensions || [],
                                  totalScore: job.totalScore || 0,
                                  starRating: job.starRating || 0,
                                  textReport: job.profileDoc,
                                  date: job.createdAt,
                                  curveNode: '',
                                }
                              }
                            })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 transition-all"
                          >
                            <FileText className="w-3.5 h-3.5" /> 查看
                          </button>
                          <button
                            onClick={() => { if (!isPresetJob(job)) setDeleteConfirm(job.id) }}
                            className={`p-1.5 rounded-lg transition-all ${
                              isPresetJob(job)
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                            }`}
                            title={isPresetJob(job) ? '预设岗位不可删除' : '删除岗位'}
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
              {mergedJobs.map((job) => (
                <div key={job.id} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-semibold text-white text-sm">{job.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{positionLabels[job.position]} · {formatDate(job.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      job.status === 'active' ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {job.status === 'active' ? '已发布' : '草稿'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMatch(job.id)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium text-tech-400 bg-tech-500/10 hover:bg-tech-500/20 transition-all"
                    >
                      匹配
                    </button>
                    <button
                      onClick={() => { if (!isPresetJob(job)) setDeleteConfirm(job.id) }}
                      className={`py-2 px-3 rounded-lg text-xs transition-all ${
                        isPresetJob(job)
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-red-400 hover:bg-red-500/10'
                      }`}
                      title={isPresetJob(job) ? '预设岗位不可删除' : '删除岗位'}
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
                    onClick={() => { syncDeleteHrJob(deleteConfirm); setDeleteConfirm(null) }}
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
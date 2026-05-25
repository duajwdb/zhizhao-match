import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAppStore, ProfileData } from '../store/useAppStore'
import { useSync } from '../providers/SyncProvider'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, FileText, Database, Star, Zap, ArrowRight, Award, Activity, X, CheckCircle2, AlertCircle
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer
} from 'recharts'
import MarkdownReport from '../components/MarkdownReport'

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { userMode, savedProfileIds, addSavedProfileId } = useAppStore()
  const { syncProfile, syncHrJob, syncGrowthRecord } = useSync()
  const [showJdModal, setShowJdModal] = useState(false)
  const [editableJd, setEditableJd] = useState('')
  const [savedToDB, setSavedToDB] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'info'; message: string } | null>(null)
  const [hrJobSaved, setHrJobSaved] = useState(false)

  const profile = (location.state as { profile?: ProfileData })?.profile

  useEffect(() => {
    if (profile?.id && savedProfileIds.includes(profile.id)) {
      setSavedToDB(true)
    }
  }, [profile, savedProfileIds])

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400">暂无画像数据</p>
        <button onClick={() => navigate('/')} className="btn-secondary mt-4">返回首页</button>
      </div>
    )
  }

  const positionLabels: Record<string, string> = {
    ai_engineer: 'AI工程师',
    '3d_modeler': '3D建模师',
  }

  const dimensionColors = [
    '#1A73E8', '#00B4D8', '#F0A500', '#7C3AED', '#EC4899',
  ]

  const handleSaveToDB = async () => {
    if (savedToDB) {
      setSaveFeedback({ type: 'info', message: '该技能画像已保存，无法重复提交' })
      return
    }
    try {
      const profileId = profile.id || `profile_${Date.now()}`
      const profileWithId = { ...profile, id: profileId }
      if (userMode === 'hr') {
        await syncHrJob({
          id: `job_${Date.now()}`,
          name: profile.name,
          position: profile.position,
          status: 'active',
          createdAt: new Date().toISOString(),
          description: profile.textReport.substring(0, 100),
          profileDoc: profile.textReport,
          dimensions: profile.dimensions,
          totalScore: profile.totalScore,
          starRating: profile.starRating,
          company: '',
          chatMessages: [],
        })
      } else {
        await syncProfile(profileWithId)
        await syncGrowthRecord({
          date: profileWithId.date,
          score: profileWithId.totalScore,
          curveNode: profileWithId.curveNode,
          growthPlan: '',
          profileId,
        })
        addSavedProfileId(profileId)
      }
      setSavedToDB(true)
      setSaveFeedback({ type: 'success', message: '录入成功' })
    } catch {
      setSaveFeedback({ type: 'info', message: '保存异常，请重试' })
    }
  }

  const handleGrowth = () => {
    navigate('/growth', { state: { profile } })
  }

  const handleMatch = () => {
    navigate('/match')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-tech-300 text-xs tracking-wide uppercase mb-2">
                <Award className="w-3.5 h-3.5" />
                {userMode === 'hr' ? '岗位画像报告' : '技能画像报告'}
              </div>
              <h1 className="text-2xl md:text-3xl font-display text-white">
                {positionLabels[profile.position] || profile.position}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                测试时间：{new Date(profile.date).toLocaleString('zh-CN')}
              </p>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-bold font-heading ${
                profile.totalScore >= 80 ? 'text-gold-400' :
                profile.totalScore >= 60 ? 'text-tech-400' : 'text-slate-400'
              }`}>
                {profile.totalScore}
              </div>
              <div className="text-xs text-slate-500 mt-1">综合得分</div>
              <div className="flex justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= profile.starRating ? 'fill-gold-400 text-gold-400' : 'text-slate-600'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-tech-400" />
              各维度得分
            </h3>
            {profile.dimensions.map((dim, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-medium">{dim.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {'★'.repeat(dim.starRating)}{'☆'.repeat(5 - dim.starRating)}
                    </span>
                    <span className="font-heading font-bold text-white text-sm w-10 text-right">
                      {dim.score}
                    </span>
                    <span className="text-xs text-slate-600">/ {dim.maxScore}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: dimensionColors[i % dimensionColors.length] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8"
        >
          <h3 className="font-heading font-semibold text-white text-sm flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-tech-400" />
            技能评分雷达图
          </h3>
          <div className="w-full h-[320px] md:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={profile.dimensions.map((d) => ({
                  dimension: d.name.length > 4 ? d.name.slice(0, 4) + '…' : d.name,
                  fullName: d.name,
                  score: d.maxScore > 0 ? Math.round((d.score / d.maxScore) * 100) : 0,
                  max: 100,
                }))}
                cx="50%"
                cy="50%"
                outerRadius="70%"
              >
                <PolarGrid stroke="rgba(148,163,184,0.15)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#475569', fontSize: 10 }}
                  stroke="rgba(148,163,184,0.1)"
                />
                <Radar
                  name="当前能力"
                  dataKey="score"
                  stroke="#1A73E8"
                  strokeWidth={2}
                  fill="#1A73E8"
                  fillOpacity={0.2}
                  dot={{ fill: '#1A73E8', r: 4 }}
                  activeDot={{ fill: '#3B8CEE', r: 6, stroke: '#1A73E8', strokeWidth: 2 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          <h3 className="font-heading font-semibold text-white text-sm flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-tech-400" />
            {userMode === 'hr' ? '岗位画像报告' : '人物画像报告'}
          </h3>
          <MarkdownReport content={profile.textReport} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {userMode !== 'hr' && (
            <button onClick={handleSaveToDB} disabled={savedToDB} className={`flex-1 flex items-center justify-center gap-2 text-sm ${savedToDB ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 py-3 px-4 rounded-xl cursor-default' : 'btn-primary'}`}>
              <Database className="w-4 h-4" />
              {savedToDB ? '已保存技能画像' : userMode === 'student' ? '保存技能画像' : '录入数据库'}
            </button>
          )}
          {userMode !== 'hr' && (
            <button onClick={handleGrowth} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              进入成长模式
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {userMode === 'jobseeker' && (
            <button onClick={handleMatch} className="btn-gold flex-1 flex items-center justify-center gap-2 text-sm">
              <Zap className="w-4 h-4" />
              岗位库匹配
            </button>
          )}
          {userMode === 'hr' && (
            <>
              <button
                onClick={async () => {
                  if (hrJobSaved) {
                    setSaveFeedback({ type: 'info', message: '该岗位画像已上传，无法重复提交' })
                    return
                  }
                  try {
                    await syncHrJob({
                      id: `job_${Date.now()}`,
                      name: profile.name,
                      position: profile.position,
                      status: 'active',
                      createdAt: new Date().toISOString(),
                      description: profile.textReport.substring(0, 100),
                      profileDoc: profile.textReport,
                      dimensions: profile.dimensions,
                      totalScore: profile.totalScore,
                      starRating: profile.starRating,
                      company: '',
                      chatMessages: [],
                    })
                    setHrJobSaved(true)
                    setSaveFeedback({ type: 'success', message: '已上传至岗位库' })
                  } catch {
                    setSaveFeedback({ type: 'info', message: '上传异常，请重试' })
                  }
                }}
                disabled={hrJobSaved}
                className={`flex-1 flex items-center justify-center gap-2 text-sm ${hrJobSaved ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 py-3 px-4 rounded-xl cursor-default' : 'btn-primary'}`}
              >
                <Database className="w-4 h-4" />
                {hrJobSaved ? '已上传至岗位库' : '上传至岗位库'}
              </button>
              <button
                onClick={() => { setEditableJd(profile.textReport); setShowJdModal(true) }}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                查看 / 编辑JD
              </button>
              <button onClick={() => navigate('/hr/jobs')} className="btn-secondary flex items-center justify-center gap-2 text-sm px-3">
                <Database className="w-4 h-4" />
                岗位库
              </button>
            </>
          )}
        </motion.div>

        <AnimatePresence>
          {saveFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center"
            >
              <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-heading font-medium ${
                saveFeedback.type === 'success'
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  : 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
              }`}>
                {saveFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {saveFeedback.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {showJdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-white text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-tech-400" />
                岗位 JD — {profile.name}
              </h3>
              <button onClick={() => setShowJdModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">您可以在此查看和编辑岗位描述。修改后将自动保存。</p>
            <textarea
              value={editableJd}
              onChange={(e) => setEditableJd(e.target.value)}
              rows={16}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-tech-500/50 transition-all font-mono"
            />
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => setShowJdModal(false)} className="btn-secondary flex-1 text-sm">
                关闭
              </button>
              <button
                onClick={async () => {
                  await syncHrJob({
                    id: `job_${Date.now()}`,
                    name: profile.name,
                    position: profile.position,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    description: editableJd.substring(0, 100),
                    profileDoc: editableJd,
                    dimensions: profile.dimensions,
                    totalScore: profile.totalScore,
                    starRating: profile.starRating,
                    company: '',
                    chatMessages: [],
                  })
                  setHrJobSaved(true)
                  setShowJdModal(false)
                }}
                className="btn-primary flex-1 text-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                保存并录入岗位库
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
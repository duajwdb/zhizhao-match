import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useSync } from '../providers/SyncProvider'
import { motion } from 'framer-motion'
import {
  Sparkles, Briefcase, TrendingUp, Clock, Trash2, Eye, Target,
  FileText, Users, Search, Shield, Zap, GraduationCap, Building2, Database, Activity, UserCheck
} from 'lucide-react'

export default function DashboardPage() {
  const { userMode, profileHistory, getMergedProfileHistory, isPresetProfile, setPosition, hrCandidates } = useAppStore()
  const navigate = useNavigate()
  const { syncDeleteProfile } = useSync()

  const filteredHistory = getMergedProfileHistory()

  const handleStartQuiz = () => {
    setPosition('ai_engineer')
    if (userMode === 'hr') {
      navigate('/quiz/hr-ai')
    } else {
      navigate('/select-position')
    }
  }

  const handleViewProfile = (profile: typeof profileHistory[0]) => {
    navigate('/result', { state: { profile } })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const descriptions = {
    jobseeker: '通过标准化技能测试构建专属能力画像，让实力成为最好的简历',
    student: '提前规划职业路径，通过测评了解自身定位，追踪成长每一步',
    hr: '智能生成岗位画像，精准匹配人才库，构建高效招聘流程',
  }

  const icons = {
    jobseeker: Sparkles,
    student: GraduationCap,
    hr: Building2,
  }

  const ModeIcon = icons[userMode]

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const positionLabels: Record<string, string> = {
    ai_engineer: 'AI工程师',
    '3d_modeler': '3D建模师',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tech-500/10 border border-tech-500/20 text-tech-300 text-xs font-medium tracking-wide uppercase">
            <ModeIcon className="w-3.5 h-3.5" />
            {userMode === 'jobseeker' ? '求职者模式' : userMode === 'student' ? '大学生模式' : 'HR模式'}
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-white leading-tight">
            {userMode === 'jobseeker' && '让能力为你代言'}
            {userMode === 'student' && '每一步成长都有迹可循'}
            {userMode === 'hr' && '精准画像，高效匹配'}
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-base leading-relaxed">
            {descriptions[userMode]}
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <button
            onClick={handleStartQuiz}
            className="glass-card p-8 text-left group cursor-pointer hover:scale-[1.02] transition-all duration-300 md:col-span-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-tech-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-tech-500/10 transition-colors" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tech-500 to-tech-400 flex items-center justify-center shadow-lg shadow-tech-500/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold text-white">
                    {userMode === 'hr' ? '生成岗位画像' : '生成技能画像'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {userMode === 'hr' ? '自主答题 / AI代答' : '标准化题库测评'}
                  </p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {userMode === 'hr'
                  ? '选择自主答题或让AI帮您快速生成岗位需求画像，一键输出标准化JD文档'
                  : '选择目标岗位，完成标准化技能测试，AI将为您生成专属能力画像和可视化评分报告'}
              </p>
              <span className="btn-primary inline-flex items-center gap-2 text-sm">
                立即开始
                <Zap className="w-4 h-4" />
              </span>
            </div>
          </button>

          {userMode === 'jobseeker' && (
            <>
              <button
                onClick={() => navigate('/match')}
                className="glass-card p-8 text-left group cursor-pointer hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-lg shadow-gold-500/20 mb-4">
                  <Target className="w-6 h-6 text-deep-900" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2">岗位库匹配</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  将最新技能画像与HR发布的岗位进行智能匹配
                </p>
                <span className="text-gold-400 text-sm font-medium group-hover:text-gold-300 transition-colors inline-flex items-center gap-1">
                  开始匹配 <Search className="w-3.5 h-3.5" />
                </span>
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="glass-card p-8 text-left group cursor-pointer hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tech-500 to-tech-400 flex items-center justify-center shadow-lg shadow-tech-500/20 mb-4">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2">意向岗位管理</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  添加和管理您关注的意向岗位，精准定位求职目标
                </p>
                <span className="text-tech-400 text-sm font-medium group-hover:text-tech-300 transition-colors">
                  进入管理 →
                </span>
              </button>
              <button
                onClick={() => navigate('/growth')}
                className="glass-card p-8 text-left group cursor-pointer hover:scale-[1.02] transition-all duration-300 md:col-span-2"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2">成长模式</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  查看成长曲线与AI定制的学习规划
                </p>
                <span className="text-teal-400 text-sm font-medium group-hover:text-teal-300 transition-colors inline-flex items-center gap-1">
                  进入成长模式 <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </button>
            </>
          )}

          {userMode === 'student' && (
            <button
              onClick={() => navigate('/growth')}
              className="glass-card p-8 text-left group cursor-pointer hover:scale-[1.02] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">成长模式</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                查看成长曲线与AI定制的学习规划
              </p>
              <span className="text-teal-400 text-sm font-medium group-hover:text-teal-300 transition-colors inline-flex items-center gap-1">
                进入成长模式 <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </button>
          )}

          {userMode === 'hr' && (
            <>
              <button
                onClick={() => navigate('/hr/jobs')}
                className="glass-card p-8 text-left group cursor-pointer hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2">岗位库管理</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  查看、管理已发布的岗位信息
                </p>
                <span className="text-teal-400 text-sm font-medium group-hover:text-teal-300 transition-colors">
                  进入管理 →
                </span>
              </button>

              <button
                onClick={() => navigate('/match')}
                className="glass-card p-8 text-left group cursor-pointer hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-lg shadow-gold-500/20 mb-4">
                  <Users className="w-6 h-6 text-deep-900" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2">匹配人才库</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  选择岗位画像，从人才数据库中智能匹配
                </p>
                <span className="text-gold-400 text-sm font-medium group-hover:text-gold-300 transition-colors">
                  开始匹配 →
                </span>
              </button>

              <button
                onClick={() => navigate('/hr/candidates')}
                className="glass-card p-8 text-left group cursor-pointer hover:scale-[1.02] transition-all duration-300 md:col-span-2 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold text-white">候选人管理</h3>
                      <p className="text-sm text-slate-500">匹配沟通 / 状态跟踪 / 信誉评分</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    管理匹配中添加的候选人，发起模拟沟通、跟踪面试状态，对已面试候选人进行信誉评分
                  </p>
                  <span className="btn-primary inline-flex items-center gap-2 text-sm">
                    进入管理
                    <UserCheck className="w-4 h-4" />
                  </span>
                  {hrCandidates.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
                      {hrCandidates.length}
                    </span>
                  )}
                </div>
              </button>
            </>
          )}
        </motion.div>

        {userMode !== 'hr' && filteredHistory.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading font-bold text-white">历史画像</h2>
                <p className="text-sm text-slate-500 mt-1">按时间倒序展示所有测试记录</p>
              </div>
            </div>
            <div className="space-y-3">
              {filteredHistory.map((profile, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer hover:scale-[1.005]"
                  onClick={() => handleViewProfile(profile)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                      profile.starRating >= 4 ? 'bg-gold-500/15 text-gold-400' :
                      profile.starRating >= 3 ? 'bg-tech-500/15 text-tech-400' :
                      'bg-slate-500/15 text-slate-400'
                    }`}>
                      {profile.totalScore}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-semibold text-white text-sm">
                          {isPresetProfile(profile) ? '【预设】' : ''}{positionLabels[profile.position] || profile.position}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          profile.starRating >= 4 ? 'bg-gold-500/15 text-gold-400' :
                          profile.starRating >= 3 ? 'bg-tech-500/15 text-tech-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {'★'.repeat(profile.starRating)}{'☆'.repeat(5 - profile.starRating)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(profile.date)}</span>
                        <span className="text-tech-400">{profile.curveNode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      className="p-2 rounded-lg text-slate-400 hover:text-tech-400 hover:bg-tech-500/10 transition-all"
                      onClick={(e) => { e.stopPropagation(); handleViewProfile(profile) }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-2 rounded-lg transition-all ${
                        isPresetProfile(profile)
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                      }`}
                      onClick={(e) => { e.stopPropagation(); if (!isPresetProfile(profile)) syncDeleteProfile(index, profile.id) }}
                      title={isPresetProfile(profile) ? '预设画像不可删除' : '删除画像'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {userMode !== 'hr' && filteredHistory.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">暂无历史画像记录</p>
            <p className="text-slate-600 text-xs mt-1">完成一次技能测试后，画像将出现在这里</p>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, label: '去标签化', desc: '仅凭能力说话' },
            { icon: TrendingUp, label: '成长追踪', desc: '进步有迹可循' },
            { icon: Users, label: '双向匹配', desc: '精准高效推荐' },
            { icon: Zap, label: 'AI辅助', desc: '智能评分画像' },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-5 text-center group cursor-default">
              <feature.icon className="w-6 h-6 text-tech-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-heading font-semibold text-white mb-1">{feature.label}</div>
              <div className="text-xs text-slate-500">{feature.desc}</div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="text-center pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/seed-data')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-slate-500 hover:text-tech-400 hover:bg-tech-500/5 transition-all border border-white/5"
          >
            <Database className="w-3.5 h-3.5" />
            种子数据管理
          </button>
          <button
            onClick={() => navigate('/supabase-diagnostic')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-slate-500 hover:text-tech-400 hover:bg-tech-500/5 transition-all border border-white/5"
          >
            <Activity className="w-3.5 h-3.5" />
            Supabase 诊断
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
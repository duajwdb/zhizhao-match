import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, Position, DimensionScore, type ProfileData } from '../store/useAppStore'
import { fetchTalentPool, fetchJobPool, insertMatchResults } from '../services/database'
import { getDimensionNames, getDimensionMax, AI_TALENTS, MODELER_TALENTS, AI_JOBS, MODELER_JOBS } from '../data/seedData'
import type { SeedTalent, SeedJob } from '../data/seedData'
import APIKeyGuard from '../components/APIKeyGuard'
import { useSync } from '../providers/SyncProvider'
import { isSupabaseConfigured } from '../config/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Sparkles, Users, Shield, Zap, Star,
  Eye, EyeOff, CheckCircle2, ArrowRight, ChevronDown, ChevronUp,
  Filter, Clock, ShieldCheck, AlertCircle, Briefcase, Target, Edit3,
  Key, Loader2, BookmarkPlus, UserPlus, TrendingUp
} from 'lucide-react'
import { POSITION_LABELS } from '../config/questionBankMapping'

const QUIZ_TO_SEED_DIM_NAMES: Record<string, string> = {
  '基础理论层': '基础理论',
  'AI核心技术层': 'AI核心',
  '工程落地层': '工程落地',
  '场景转化层': '场景转化',
  '合规治理与软技能': '合规软技',
  '前沿研究与创新': '前沿创新',
  '软件操作能力': '软件操作',
  '建模技术能力': '建模技术',
  'UV与纹理能力': 'UV纹理',
  '美术基础与设计素养': '美术素养',
  '渲染与光照能力': '渲染光照',
  '项目与工程实践能力': '项目实践',
  '动画与绑定能力': '动画绑定',
}

const PROXIMITY_EXPLANATION: Record<string, string> = {
  ai_engineer: 'AI工程师 · 技能接近度匹配',
  '3d_modeler': '3D建模师 · 技能接近度匹配',
}
const FALLBACK_EXPLANATION = '综合评分排序'

function getBuiltinTargetDims(position: Position): number[] {
  const dimMax = getDimensionMax(position)
  const dimNames = getDimensionNames(position)
  const talents = position === 'ai_engineer' ? AI_TALENTS : MODELER_TALENTS
  const totalTalents = talents.length

  return dimNames.map((name, di) => {
    const sum = talents.reduce((acc, t) => acc + (t.dimension_scores[name] ?? 0), 0)
    return Math.round((sum / totalTalents / dimMax[di]) * 100)
  })
}

function calculateProximityScore(
  dimPercentagesA: number[],
  dimPercentagesB: number[]
): number {
  if (dimPercentagesA.length === 0 || dimPercentagesB.length === 0) return 0
  const len = Math.min(dimPercentagesA.length, dimPercentagesB.length)
  const sumSquaredDiffs = dimPercentagesA.slice(0, len).reduce((sum, aVal, i) => {
    const bVal = dimPercentagesB[i] ?? aVal
    const diff = (aVal - bVal) / 100
    return sum + diff * diff
  }, 0)
  const rmse = Math.sqrt(sumSquaredDiffs / len)
  return Math.round(Math.max(0, (1 - rmse) * 100))
}

function getProfileDimPercentages(dimensions: DimensionScore[], position: Position): number[] {
  const dimMax = getDimensionMax(position)
  const dimNames = getDimensionNames(position)
  return dimNames.map((seedName, di) => {
    const dim = dimensions.find(
      (d) => d.name === seedName || QUIZ_TO_SEED_DIM_NAMES[d.name] === seedName
    )
    if (!dim || dim.maxScore <= 0) return 0
    return Math.round((dim.score / dimMax[di]) * 100)
  })
}

interface Candidate {
  id: number
  name: string
  position: string
  matchScore: number
  dimensionMatch: number[]
  reputation: number
  skillProfile: string
  isRevealed: boolean
  highlights: string[]
  gaps: string[]
  status: 'pending' | 'interacted' | 'confirmed'
}

function buildCandidatesFromTalent(
  rawTalents: any[],
  matchedPosition: string,
  targetDimPercentages: number[]
): Candidate[] {
  const dimNames = getDimensionNames(matchedPosition as Position)
  const dimMax = getDimensionMax(matchedPosition as Position)

  return rawTalents.map((t, i) => {
    const scores = t.dimension_scores as Record<string, number> | undefined
    const dimPercentages = dimNames.map((name, di) => {
      const raw = scores?.[name] ?? 0
      return Math.round((raw / dimMax[di]) * 100)
    })

    const proximityBase = targetDimPercentages.length > 0
      ? calculateProximityScore(dimPercentages, targetDimPercentages)
      : Math.round(dimPercentages.reduce((a, b) => a + b, 0) / dimPercentages.length)

    const repWeight = Math.min(1.05, 1 + (t.reputation - 4) * 0.025)
    const matchScore = Math.min(100, Math.max(0, Math.round(proximityBase * repWeight)))

    const highlights: string[] = []
    const gaps: string[] = []

    if (targetDimPercentages.length > 0) {
      dimNames.forEach((name, di) => {
        const diff = dimPercentages[di] - targetDimPercentages[di]
        if (diff >= 10) highlights.push(`${name}超越(+${diff})`)
        else if (dimPercentages[di] >= 80) highlights.push(`${name}匹配`)
        if (diff <= -15) gaps.push(`${name}差距(${diff})`)
        else if (dimPercentages[di] < 50) gaps.push(`${name}待提升`)
      })
    } else {
      dimNames.forEach((name, di) => {
        if (dimPercentages[di] >= 85) highlights.push(`${name}突出`)
        else if (dimPercentages[di] < 50) gaps.push(`${name}待提升`)
      })
    }

    return {
      id: t.id ?? (1000 + i),
      name: t.name ?? `候选人${i + 1}`,
      position: matchedPosition,
      matchScore,
      dimensionMatch: dimPercentages,
      reputation: t.reputation ?? 4.0,
      skillProfile: t.skill_profile ?? '',
      isRevealed: false,
      highlights: highlights.length > 0 ? highlights : ['综合能力均衡'],
      gaps: gaps.length > 0 ? gaps : ['持续成长中'],
      status: 'pending' as const,
    }
  })
}

function buildCandidatesFromJobs(rawJobs: any[], seekerDimPercentages: number[]): Candidate[] {
  return rawJobs.map((j, i) => {
    const scores = j.dimension_scores as Record<string, number> | undefined
    const dimNames = getDimensionNames(j.position as Position)
    const dimMax = getDimensionMax(j.position as Position)
    const jobDimPercentages = dimNames.map((name, di) => {
      const raw = scores?.[name] ?? 0
      return Math.round((raw / dimMax[di]) * 100)
    })

    const proximityBase = seekerDimPercentages.length > 0
      ? calculateProximityScore(jobDimPercentages, seekerDimPercentages)
      : (j.demand_intensity ?? 50)

    const highlights: string[] = []
    const gaps: string[] = []

    if (seekerDimPercentages.length > 0) {
      dimNames.forEach((name, di) => {
        const diff = seekerDimPercentages[di] - jobDimPercentages[di]
        if (diff >= 10) highlights.push(`${name}领先(+${diff})`)
        else if (seekerDimPercentages[di] >= jobDimPercentages[di]) highlights.push(`${name}胜任`)
        if (diff <= -15) gaps.push(`${name}需提升(${diff})`)
      })
    }

    return {
      id: j.id ?? (2000 + i),
      name: `${j.company_name ?? '未知公司'} · ${j.job_name ?? '未知岗位'}`,
      position: j.position ?? 'ai_engineer',
      matchScore: proximityBase,
      dimensionMatch: jobDimPercentages,
      reputation: 4.5,
      skillProfile: j.responsibilities ?? '',
      isRevealed: true,
      highlights: highlights.length > 0 ? highlights : [j.suggested_level ?? '', `需求强度: ${j.demand_intensity ?? '-'}`],
      gaps: gaps.length > 0 ? gaps : [],
      status: 'pending' as const,
    }
  })
}

function getReputationColor(rating: number): string {
  if (rating >= 4.8) return 'text-green-400'
  if (rating >= 4.0) return 'text-tech-400'
  if (rating >= 3.0) return 'text-gold-400'
  return 'text-red-400'
}

function getReputationBg(rating: number): string {
  if (rating >= 4.8) return 'bg-green-500/10 border-green-500/20'
  if (rating >= 4.0) return 'bg-tech-500/10 border-tech-500/20'
  if (rating >= 3.0) return 'bg-gold-500/10 border-gold-500/20'
  return 'bg-red-500/10 border-red-500/20'
}

export default function MatchPage() {
  const { selectedPosition, userMode, hrJobs, matchResults, setMatchResults, getMergedProfileHistory, apiKey, setShowApiKeyModal, addJobseekerJob, addHrJob, addHrCandidate, hrCandidates } = useAppStore()

const navigate = useNavigate()
  const { syncEvaluation, syncJobseekerJob, syncHrJob } = useSync()

  const [matchPhase, setMatchPhase] = useState<'select' | 'ready' | 'running' | 'results'>('select')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedSeekerProfile, setSelectedSeekerProfile] = useState<ProfileData | null>(null)
  const [selectedMatchPosition, setSelectedMatchPosition] = useState<Position>('ai_engineer')
  const [isRunning, setIsRunning] = useState(false)
  const [stage, setStage] = useState<'idle' | 'screening' | 'ranking' | 'done'>('idle')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [sortBy, setSortBy] = useState<'score' | 'reputation'>('score')
  const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null)
  const [confirmedCandidates, setConfirmedCandidates] = useState<number[]>([])
  const [apiKeyBlocked, setApiKeyBlocked] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [saveProgress, setSaveProgress] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [targetDimPercentages, setTargetDimPercentages] = useState<number[]>([])
  const [matchMode, setMatchMode] = useState<'proximity' | 'fallback'>('proximity')

  const isHR = userMode === 'hr'

  const selectedJob = hrJobs.find((j) => j.id === selectedJobId) || null

  const seekerProfile = selectedSeekerProfile

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const handleSelectHRJob = (jobId: string) => {
    setSelectedJobId(jobId)
    setMatchPhase('ready')
  }

  const handleSelectSeekerProfile = (profile: ProfileData) => {
    setSelectedSeekerProfile(profile)
    setSelectedMatchPosition(profile.position)
    setMatchPhase('ready')
  }

  const handleStartQuiz = () => {
    navigate('/select-position')
  }

  const handleBackToSelect = () => {
    setSelectedJobId(null)
    setSelectedSeekerProfile(null)
    setMatchPhase('select')
  }

  const sortedCandidates = [...candidates].sort((a, b) => {
    if (sortBy === 'reputation') {
      const repDiff = b.reputation - a.reputation
      if (Math.abs(repDiff) > 0.5) return repDiff
    }
    return b.matchScore - a.matchScore
  })

  const handleRunMatch = async () => {
    if (!apiKey) {
      setApiKeyBlocked(true)
      return
    }
    setApiKeyBlocked(false)

    setIsRunning(true)
    setStage('screening')
    setCandidates([])
    setSaveStatus('idle')
    setSaveProgress(0)
    setMatchPhase('running')

    setTimeout(() => {
      setStage('ranking')
    }, 1800)

    setTimeout(async () => {
      const matchedPosition = isHR
        ? (selectedJob?.position || 'ai_engineer')
        : selectedMatchPosition

      let ranked: Candidate[] = []
      let targetDims: number[] = []
      let usedMode: 'proximity' | 'fallback' = 'proximity'

      const talentSeeds = matchedPosition === 'ai_engineer' ? AI_TALENTS : MODELER_TALENTS
      const jobSeeds = matchedPosition === 'ai_engineer' ? AI_JOBS : MODELER_JOBS

      try {
        if (isHR) {
          let rawTalents = await fetchTalentPool(matchedPosition)
          if (rawTalents.length === 0) {
            rawTalents = talentSeeds.map((t) => ({ ...t, id: 1000 + t.sort_order }))
            console.warn('[MatchPage] 使用本地种子人才数据')
          }

          if (rawTalents.length > 0) {
            if (selectedJob && selectedJob.dimensions && selectedJob.dimensions.length > 0) {
              const jobPos = selectedJob.position
              const jobDimNames = getDimensionNames(jobPos)
              const jobDimMax = getDimensionMax(jobPos)
              targetDims = jobDimNames.map((name, di) => {
                const dim = selectedJob.dimensions.find(
                  (d) => d.name === name || QUIZ_TO_SEED_DIM_NAMES[d.name] === name
                )
                if (!dim || dim.maxScore <= 0) return 0
                return Math.round((dim.score / jobDimMax[di]) * 100)
              })
              if (targetDims.length === 0 || targetDims.every((v) => v === 0)) {
                usedMode = 'fallback'
              }
            }

            if (targetDims.length === 0) {
              const matchedJobName = selectedJob?.name?.toLowerCase() ?? ''
              let matchedSeedJob = jobSeeds.find((j: SeedJob) => {
                const seedName = j.job_name.toLowerCase()
                if (!matchedJobName || !seedName) return false
                return seedName.includes(matchedJobName.split('·')[0]?.trim() ?? '') ||
                       matchedJobName.includes(seedName)
              })

              if (!matchedSeedJob && jobSeeds.length > 0) {
                matchedSeedJob = jobSeeds[0]
              }

              if (matchedSeedJob) {
                const jobScores = matchedSeedJob.dimension_scores
                const posForJob = (matchedSeedJob.position || matchedPosition) as Position
                const jobDimNames = getDimensionNames(posForJob)
                const jobDimMax = getDimensionMax(posForJob)
                targetDims = jobDimNames.map((name, di) => {
                  const raw = jobScores?.[name] ?? 0
                  return Math.round((raw / jobDimMax[di]) * 100)
                })
              } else {
                targetDims = getBuiltinTargetDims(matchedPosition)
              }

              if (targetDims.length === 0) {
                targetDims = getBuiltinTargetDims(matchedPosition)
                usedMode = 'fallback'
              }
            }

            setTargetDimPercentages(targetDims)
            ranked = buildCandidatesFromTalent(rawTalents, matchedPosition, targetDims)
          }
        } else {
          let rawJobs = await fetchJobPool(matchedPosition)
          if (rawJobs.length === 0) {
            rawJobs = jobSeeds.map((j) => ({ ...j, id: 2000 + j.sort_order }))
            console.warn('[MatchPage] 使用本地种子岗位数据')
          }

          if (rawJobs.length > 0) {
            const seekerDims = seekerProfile
              ? getProfileDimPercentages(seekerProfile.dimensions, matchedPosition)
              : []

            if (seekerDims.length === 0 || seekerDims.every((v) => v === 0)) {
              usedMode = 'fallback'
            }

            setTargetDimPercentages(seekerDims)
            ranked = buildCandidatesFromJobs(rawJobs, seekerDims)
          }
        }
      } catch {
        console.warn('[MatchPage] 种子数据不可用，匹配引擎已启动但无数据')
        usedMode = 'fallback'
      }

      if (ranked.length === 0 && isHR) {
        let rawTalents = await fetchTalentPool(matchedPosition)
        if (rawTalents.length === 0) {
          rawTalents = talentSeeds.map((t) => ({ ...t, id: 1000 + t.sort_order }))
        }
        if (rawTalents.length > 0) {
          const fbDims = getBuiltinTargetDims(matchedPosition)
          setTargetDimPercentages(fbDims)
          usedMode = 'fallback'
          ranked = buildCandidatesFromTalent(rawTalents, matchedPosition, fbDims)
        }
      }

      setMatchMode(usedMode)

      ranked.sort((a, b) => b.matchScore - a.matchScore)
      const seen = new Set<string>()
      ranked = ranked.filter((c) => {
        const key = `${c.name}|${c.position || matchedPosition}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setCandidates(ranked)
      setStage('done')
      setIsRunning(false)
      setMatchPhase('results')

      const allResults = ranked.map((c) => ({
        id: String(c.id),
        name: c.name,
        matchScore: c.matchScore,
        matchPoints: c.highlights,
        gapPoints: c.gaps,
        reputationScore: c.reputation,
        recentTags: [],
      }))
      setMatchResults(allResults)

      saveResultsAsync(allResults, matchedPosition)
    }, 3200)
  }

  const saveResultsAsync = useCallback(async (
    results: Array<{ id: string; name: string; matchScore: number; matchPoints: string[]; gapPoints: string[]; reputationScore: number; recentTags: string[] }>,
    _matchedPosition: string
  ) => {
    if (!isSupabaseConfigured()) {
      setSaveStatus('done')
      setSaveProgress(100)
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
      return
    }

    setSaveStatus('saving')
    setSaveProgress(10)

    try {
      const rows = results.map((r) => ({
        name: r.name,
        match_score: r.matchScore,
        match_points: r.matchPoints,
        gap_points: r.gapPoints,
        reputation_score: r.reputationScore,
        recent_tags: r.recentTags,
      }))

      setSaveProgress(30)
      const saved = await insertMatchResults(rows)
      setSaveProgress(80)

      if (saved) {
        setSaveStatus('done')
        setSaveProgress(100)
        setTimeout(() => {
          setSaveStatus('idle')
        }, 2000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    }
  }, [])

  const handleRetrySave = useCallback(() => {
    saveResultsAsync(
      matchResults.map((r) => ({
        id: r.id,
        name: r.name,
        matchScore: r.matchScore,
        matchPoints: r.matchPoints,
        gapPoints: r.gapPoints,
        reputationScore: r.reputationScore,
        recentTags: r.recentTags,
      })),
      isHR ? (selectedJob?.position || 'ai_engineer') : selectedMatchPosition
    )
  }, [matchResults, isHR, selectedJob, selectedMatchPosition, saveResultsAsync])

  const handleReveal = (id: number) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isRevealed: !c.isRevealed } : c))
    )
  }

  const handleConfirmInterest = async (candidate: Candidate) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidate.id ? { ...c, status: 'confirmed' as const } : c
      )
    )
    setConfirmedCandidates((prev) => [...prev, candidate.id])

    if (isHR) {
      const alreadyAdded = hrCandidates.some((c) => c.id === `hrc_${candidate.id}`)
      if (alreadyAdded) {
        setToastMessage('该候选人已在列表中')
        return
      }
      addHrCandidate({
        id: `hrc_${candidate.id}`,
        name: candidate.name,
        position: candidate.position as 'ai_engineer' | '3d_modeler',
        matchScore: candidate.matchScore,
        reputationScore: Math.round((candidate.reputation ?? 4.5) * 20),
        reputationRatings: [],
        reputationRatedAt: null,
        reputationModifiedAt: null,
        reputationModified: false,
        dimensionMatch: candidate.dimensionMatch || [],
        highlights: candidate.highlights || [],
        gaps: candidate.gaps || [],
        status: 'confirmed',
        addedAt: new Date().toISOString(),
        chatMessages: [],
        isRevealed: true,
      })
      setToastMessage('已添加为候选人')
    } else {
      const parsedName = candidate.name.includes('·') ? candidate.name.split('·')[1]?.trim() || candidate.name : candidate.name
      const companyName = candidate.name.includes('·') ? candidate.name.split('·')[0]?.trim() || '' : ''
      const jobData = {
        id: `jsjob_${Date.now()}`,
        name: `${parsedName}${companyName ? ' @ ' + companyName : ''} - ${POSITION_LABELS[candidate.position as keyof typeof POSITION_LABELS]}`,
        position: candidate.position as 'ai_engineer' | '3d_modeler',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        description: '',
        profileDoc: '',
        dimensions: [],
        totalScore: 0,
        starRating: 0,
        company: companyName,
        chatMessages: [],
      }
      addJobseekerJob(jobData)
      await syncJobseekerJob(jobData)
      setToastMessage('已添加为意向岗位')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tech-500/10 border border-tech-500/20 text-tech-300 text-xs font-medium tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            双向精准匹配
          </div>
          <h1 className="text-2xl md:text-3xl font-display text-white mb-2">
            {isHR ? '人才匹配引擎' : '岗位匹配引擎'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isHR
              ? '基于岗位画像，从人才库中匹配最合适的人选'
              : '基于技能画像，从岗位库中匹配最合适的岗位'}
          </p>
        </div>

        {matchPhase === 'select' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8"
          >
            {isHR ? (
              <>
                <h3 className="font-heading font-semibold text-white text-lg mb-1">选择待匹配岗位</h3>
                <p className="text-sm text-slate-400 mb-6">从岗位库中选择一个岗位，启动人才匹配引擎</p>

                {hrJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                      <Briefcase className="w-7 h-7 text-slate-600" />
                    </div>
                    <p className="text-slate-400 text-sm mb-4">暂无岗位，请先创建岗位画像</p>
                    <button onClick={() => navigate('/quiz/hr-ai')} className="btn-primary text-sm">
                      创建岗位画像
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {hrJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => handleSelectHRJob(job.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          selectedJobId === job.id
                            ? 'border-tech-500 bg-tech-500/10'
                            : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-heading font-semibold text-white text-sm">{job.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {POSITION_LABELS[job.position as keyof typeof POSITION_LABELS]} · {new Date(job.createdAt).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                          <ArrowRight className={`w-4 h-4 transition-colors ${selectedJobId === job.id ? 'text-tech-400' : 'text-slate-600'}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="font-heading font-semibold text-white text-lg mb-1">选择历史技能画像</h3>
                <p className="text-sm text-slate-400 mb-6">选择一份已完成测评的技能画像，系统将基于该画像进行岗位匹配</p>

                {(() => {
                  const mergedProfiles = getMergedProfileHistory()
                  if (mergedProfiles.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                          <Target className="w-7 h-7 text-slate-600" />
                        </div>
                        <p className="text-slate-400 text-sm mb-4">暂无技能画像，请先生成</p>
                        <button onClick={() => navigate('/select-position')} className="btn-primary text-sm">
                          生成技能画像
                        </button>
                      </div>
                    )
                  }
                  return (
                    <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
                      {mergedProfiles.map((profile) => {
                        const isPreset = profile.name.startsWith('【预设】')
                        return (
                          <button
                            key={`${profile.name}-${profile.position}-${profile.date}`}
                            onClick={() => handleSelectSeekerProfile(profile)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                              selectedSeekerProfile?.name === profile.name && selectedSeekerProfile?.position === profile.position
                                ? 'border-tech-500 bg-tech-500/10'
                                : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-heading font-semibold text-white text-sm">{profile.name}</p>
                                  {isPreset && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-gold-500/10 text-gold-400 border border-gold-500/20">
                                      预设
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {POSITION_LABELS[profile.position as keyof typeof POSITION_LABELS]} · {profile.totalScore}分 · {profile.starRating}星 · {new Date(profile.date).toLocaleDateString('zh-CN')}
                                </p>
                              </div>
                              <ArrowRight className={`w-4 h-4 transition-colors ${selectedSeekerProfile?.name === profile.name ? 'text-tech-400' : 'text-slate-600'}`} />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })()}
              </>
            )}

            {isHR && hrJobs.length === 0 ? null : (
              <div className="flex items-center justify-center gap-4 mb-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-gold-400" />
                  信誉权重加成
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-tech-400" />
                  去标签化匹配
                </div>
              </div>
            )}

            {(matchPhase === 'select' && (isHR ? selectedJobId : selectedSeekerProfile)) ? (
              <div className="text-center">
                {(!apiKey || apiKeyBlocked) && (
                  <div className="mb-6">
                    <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/10 text-left mb-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-gold-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-heading font-semibold text-gold-300 mb-1">AI精排需要配置 API Key</p>
                          <p className="text-xs text-slate-400 mb-3">
                            启动匹配引擎的AI精排功能需要有效的 DeepSeek API Key。
                            请在下方完成配置后再启动匹配。
                          </p>
                          <button
                            onClick={() => {
                              setApiKeyBlocked(false)
                              setShowApiKeyModal(true)
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 transition-all"
                          >
                            <Key className="w-3.5 h-3.5" />
                            配置 API Key
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {(!apiKey || apiKeyBlocked) ? (
                  <button
                    disabled
                    className="bg-slate-700 text-slate-500 px-6 py-3 rounded-xl font-heading font-semibold text-sm inline-flex items-center gap-2 cursor-not-allowed"
                  >
                    <Key className="w-4 h-4" />
                    请先配置 API Key
                  </button>
                ) : (
                  <button onClick={handleRunMatch} className="btn-primary inline-flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    启动匹配
                  </button>
                )}
              </div>
            ) : !isHR && (
              <div className="text-center p-4 rounded-xl bg-gold-500/5 border border-gold-500/10">
                <p className="text-sm text-gold-400 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  请先完成对应职业的标准化技能测试
                </p>
                <button onClick={handleStartQuiz} className="btn-secondary text-xs mt-3">
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" /> 前往测试
                </button>
              </div>
            )}
          </motion.div>
        )}

        {matchPhase === 'ready' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-tech-500/10 flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-tech-400" />
            </div>
            <h3 className="font-heading font-semibold text-white text-lg mb-3">启动两阶段匹配引擎</h3>

            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-tech-500/10 border border-tech-500/20">
                <Zap className="w-4 h-4 text-tech-400" />
                <div className="text-left">
                  <p className="text-xs font-heading font-semibold text-tech-300">第一阶段</p>
                  <p className="text-[10px] text-slate-400">向量初筛 Top 20-50</p>
                </div>
              </div>
              <span className="text-slate-600">→</span>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <div className="text-left">
                  <p className="text-xs font-heading font-semibold text-teal-300">第二阶段</p>
                  <p className="text-[10px] text-slate-400">AI 精排 0-100分</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gold-400" />
                信誉权重加成
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-tech-400" />
                去标签化匹配
              </div>
            </div>

            {isHR && selectedJob && (
              <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-left">
                <p className="text-xs text-slate-500 mb-1">当前匹配岗位</p>
                <p className="text-sm text-white font-medium">{selectedJob.name}</p>
              </div>
            )}

            {!isHR && selectedSeekerProfile && (
              <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-left">
                <p className="text-xs text-slate-500 mb-1">当前匹配画像</p>
                <p className="text-sm text-white font-medium">{selectedSeekerProfile.name}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span>{POSITION_LABELS[selectedSeekerProfile.position as keyof typeof POSITION_LABELS]}</span>
                  <span>{selectedSeekerProfile.totalScore}分</span>
                  <span>{'★'.repeat(Math.round(selectedSeekerProfile.starRating))}</span>
                  <span>{new Date(selectedSeekerProfile.date).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            )}

            {(!apiKey || apiKeyBlocked) && (
              <div className="mb-4">
                <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/10 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gold-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-heading font-semibold text-gold-300 mb-1">AI精排需要配置 API Key</p>
                      <p className="text-xs text-slate-400 mb-3">
                        启动匹配引擎的AI精排功能需要有效的 DeepSeek API Key。
                        请在下方完成配置后再启动匹配。
                      </p>
                      <button
                        onClick={() => {
                          setApiKeyBlocked(false)
                          setShowApiKeyModal(true)
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 transition-all"
                      >
                        <Key className="w-3.5 h-3.5" />
                        配置 API Key
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <button onClick={handleBackToSelect} className="btn-secondary text-sm">
                {isHR ? '重新选择岗位' : '重新选择画像'}
              </button>
              {(!apiKey || apiKeyBlocked) ? (
                <button
                  disabled
                  className="bg-slate-700 text-slate-500 px-4 py-2 rounded-xl font-heading font-semibold text-sm inline-flex items-center gap-2 cursor-not-allowed"
                >
                  <Key className="w-4 h-4" />
                  请先配置 API Key
                </button>
              ) : (
                <button onClick={handleRunMatch} className="btn-primary inline-flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4" />
                  启动匹配
                </button>
              )}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {(isRunning || stage === 'done') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-tech-400" />
                  匹配进度
                </h3>
                {stage === 'done' && (
                  <span className="text-xs px-2 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    完成
                  </span>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">阶段一：向量初筛</span>
                  <span className={`text-xs ${stage === 'done' || stage === 'ranking' ? 'text-teal-400' : stage === 'screening' ? 'text-tech-400' : 'text-slate-600'}`}>
                    {stage === 'done' || stage === 'ranking' ? '✓ 完成 (Top 20)' : stage === 'screening' ? '进行中...' : '等待中'}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-tech-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: stage === 'done' || stage === 'ranking' ? '100%' : stage === 'screening' ? '60%' : '0%' }}
                    transition={{ duration: 1.2 }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">阶段二：AI精排</span>
                  <span className={`text-xs ${stage === 'done' ? 'text-teal-400' : stage === 'ranking' ? 'text-tech-400' : 'text-slate-600'}`}>
                    {stage === 'done' ? '✓ 完成 (5维精评)' : stage === 'ranking' ? '进行中...' : '等待中'}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-teal-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: stage === 'done' ? '100%' : stage === 'ranking' ? '50%' : '0%' }}
                    transition={{ duration: 1.5 }}
                  />
                </div>
              </div>

              {stage === 'done' && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSortBy('score')}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      sortBy === 'score'
                        ? 'bg-tech-500/15 text-tech-300 border border-tech-500/30'
                        : 'text-slate-400 border border-white/5 hover:text-white'
                    }`}
                  >
                    按匹配度排序
                  </button>
                  <button
                    onClick={() => setSortBy('reputation')}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      sortBy === 'reputation'
                        ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
                        : 'text-slate-400 border border-white/5 hover:text-white'
                    }`}
                  >
                    按信誉度排序
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {stage === 'done' && saveStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${
              saveStatus === 'saving'
                ? 'bg-tech-500/5 border-tech-500/10'
                : saveStatus === 'done'
                  ? 'bg-teal-500/5 border-teal-500/10'
                  : 'bg-red-500/5 border-red-500/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {saveStatus === 'saving' && <Loader2 className="w-4 h-4 text-tech-400 animate-spin" />}
                {saveStatus === 'done' && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                {saveStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                <div>
                  <p className={`text-sm font-heading font-semibold ${
                    saveStatus === 'saving' ? 'text-tech-300' : saveStatus === 'done' ? 'text-teal-400' : 'text-red-400'
                  }`}>
                    {saveStatus === 'saving' ? '正在保存匹配结果到云端...' : saveStatus === 'done' ? '匹配结果已就绪' : '保存失败'}
                  </p>
                  {saveStatus === 'saving' && (
                    <p className="text-xs text-slate-500 mt-0.5">请勿关闭页面 ({saveProgress}%)</p>
                  )}
                </div>
              </div>
              {saveStatus === 'error' && (
                <button
                  onClick={handleRetrySave}
                  className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 transition-all"
                >
                  重试
                </button>
              )}
              {saveStatus === 'done' && (
                <button
                  onClick={() => setSaveStatus('idle')}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
                >
                  关闭
                </button>
              )}
            </div>
            {saveStatus === 'saving' && (
              <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-tech-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${saveProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </motion.div>
        )}

        {stage === 'done' && sortedCandidates.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="font-heading font-semibold text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-tech-400" />
              匹配结果（{sortedCandidates.length}人）
              <span
                className={`ml-2 px-2 py-0.5 rounded text-[10px] font-normal border ${
                  matchMode === 'proximity'
                    ? 'bg-tech-500/10 text-tech-300 border-tech-500/20'
                    : 'bg-gold-500/10 text-gold-300 border-gold-500/20'
                }`}
              >
                {matchMode === 'proximity' ? (
                  <><TrendingUp className="w-3 h-3 inline mr-0.5" />技能接近度排序</>
                ) : (
                  '降级评分排序'
                )}
              </span>
            </h3>

            {sortedCandidates.map((candidate, idx) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <div className="glass-card overflow-hidden">
                  <button
                    onClick={() => setExpandedCandidate(expandedCandidate === candidate.id ? null : candidate.id)}
                    className="w-full p-5 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-tech-500/10 flex items-center justify-center">
                          {candidate.isRevealed ? (
                            <Eye className="w-6 h-6 text-tech-400" />
                          ) : (
                            <EyeOff className="w-6 h-6 text-slate-500" />
                          )}
                        </div>
                        {candidate.status === 'confirmed' && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-white">
                          {candidate.isRevealed ? candidate.name : `匿名候选人 #${idx + 1}`}
                        </p>
                        <p className="text-xs text-slate-500">{POSITION_LABELS[candidate.position as keyof typeof POSITION_LABELS]}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right mr-2">
                        <div className="flex items-center gap-1">
                          <span className={`text-lg font-heading font-bold ${candidate.matchScore >= 85 ? 'text-green-400' : candidate.matchScore >= 70 ? 'text-tech-400' : 'text-gold-400'}`}>
                            {candidate.matchScore}
                          </span>
                          <span className="text-xs text-slate-500">分</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShieldCheck className={`w-3 h-3 ${getReputationColor(candidate.reputation)}`} />
                          <span className={`text-xs font-heading ${getReputationColor(candidate.reputation)}`}>
                            {candidate.reputation.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      {expandedCandidate === candidate.id ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expandedCandidate === candidate.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5"
                    >
                      <div className="border-t border-white/5 pt-4 space-y-4">
                        {targetDimPercentages.length > 0 && (
                          <div className="flex items-center gap-2 mb-1">
                            <div className="px-2 py-0.5 rounded text-[10px] bg-tech-500/10 text-tech-400 border border-tech-500/20">
                              <Target className="w-3 h-3 inline mr-1" />
                              技能接近度匹配
                            </div>
                            <span className="text-[10px] text-slate-500">岗位需求与人才技能欧氏距离相似度算法</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 flex-wrap">
                          {candidate.dimensionMatch.map((score, i) => {
                            const dimNames = getDimensionNames(candidate.position as Position)
                            const targetScore = targetDimPercentages[i]
                            const hasTarget = targetScore !== undefined
                            const diff = hasTarget ? score - targetScore : 0
                            const isAbove = hasTarget && diff >= 10
                            const isBelow = hasTarget && diff <= -15
                            const isMatch = hasTarget && Math.abs(diff) <= 10

                            return (
                            <div key={i} className="flex items-center gap-2">
                              <div className="relative w-12 h-12">
                                <svg className="w-12 h-12 -rotate-90">
                                  <circle
                                    cx="24" cy="24" r="20"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="3"
                                  />
                                  {hasTarget && (
                                    <circle
                                      cx="24" cy="24" r="20"
                                      fill="none"
                                      stroke="rgba(255,255,255,0.12)"
                                      strokeWidth="2"
                                      strokeDasharray={`${(targetScore / 100) * 126} 126`}
                                      strokeLinecap="round"
                                    />
                                  )}
                                  <circle
                                    cx="24" cy="24" r="20"
                                    fill="none"
                                    stroke={isAbove ? '#10B981' : isBelow ? '#EF4444' : isMatch ? '#1A73E8' : score >= 80 ? '#10B981' : score >= 65 ? '#1A73E8' : '#F0A500'}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(score / 100) * 126} 126`}
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-heading font-bold text-white">
                                  {score}
                                </span>
                              </div>
                              <div>
                                <span className="text-[11px] text-slate-300 block leading-tight">
                                  {dimNames[i] ?? `维度${i + 1}`}
                                </span>
                                {hasTarget && (
                                  <span className={`text-[9px] ${isAbove ? 'text-green-400' : isBelow ? 'text-red-400' : 'text-slate-500'}`}>
                                    {isAbove ? `↑${diff}` : isBelow ? `↓${Math.abs(diff)}` : `≈目标`}
                                  </span>
                                )}
                              </div>
                            </div>
                          )})}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1.5">匹配亮点</p>
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.highlights.map((h, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20"
                                >
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 mb-1.5">待补足项</p>
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.gaps.map((g, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-gold-500/10 text-gold-400 border border-gold-500/20"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className={`p-3 rounded-lg ${getReputationBg(candidate.reputation)}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-heading font-semibold text-white">信誉档案</span>
                            <span className={`text-xs font-heading ${getReputationColor(candidate.reputation)}`}>
                              {candidate.reputation.toFixed(1)} / 5.0
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>近3个月评价 · </span>
                            <span className="text-green-400">技能真实性高</span>
                            <span>·</span>
                            <span className="text-tech-400">沟通坦诚</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          {candidate.status === 'confirmed' ? (
                            <div className="flex items-center gap-2 text-sm text-teal-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>双方已确认意向，已解锁联系方式</span>
                            </div>
                          ) : (
                            <>
                              {!candidate.isRevealed && (
                                <button
                                  onClick={() => handleReveal(candidate.id)}
                                  className="px-4 py-2 rounded-lg text-sm bg-white/5 text-slate-300 hover:bg-white/10 transition-all flex items-center gap-1.5"
                                >
                                  <Eye className="w-4 h-4" />
                                  揭露信息
                                </button>
                              )}
                              {candidate.isRevealed && (
                                <button
                                  onClick={() => {
                                    handleConfirmInterest(candidate)
                                  }}
                                  className="btn-primary flex items-center gap-1.5 text-sm"
                                >
                                  {isHR ? (
                                    <><UserPlus className="w-4 h-4" />添加为候选人</>
                                  ) : (
                                    <><BookmarkPlus className="w-4 h-4" />添加为意向岗位</>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-8 inset-x-0 flex justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="px-6 py-3 rounded-xl bg-teal-500/90 text-white text-sm font-heading font-medium shadow-lg backdrop-blur-sm flex items-center gap-2 pointer-events-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              {toastMessage}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore, ProfileData, DimensionScore } from '../store/useAppStore'
import { useSync } from '../providers/SyncProvider'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, BookOpen, Lightbulb, Target, MapPin,
  ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Clock, AlertTriangle, CheckCircle2, Flag, Calendar,
  Sparkles, Bot, Loader2, Star
} from 'lucide-react'
import MarkdownReport from '../components/MarkdownReport'
import APIKeyGuard from '../components/APIKeyGuard'
import { AI_ENGINEER_CURVE_NODES, MODELER_CURVE_NODES, getCurveNode } from '../config/questionBankMapping'
import { getCurveData, getCurveDimensions, interpolateCurvePosition, AI_ENGINEER_DIMENSIONS, CurveNodeData } from '../data/growthCurveData'
import { callDeepSeek, buildGrowthPlanPrompt } from '../config/aiService'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceDot, ReferenceArea
} from 'recharts'

interface StageBenchmark {
  stage: number
  label: string
  tag: string
  totalRange: [number, number]
  dimensions: Record<string, number>
}

const AI_ENGINEER_BENCHMARKS: StageBenchmark[] = [
  {
    stage: 1, label: 'AI基础认知期', tag: 'AI探索者',
    totalRange: [0, 20],
    dimensions: { '基础理论层': 30, 'AI核心技术层': 15, '工程落地层': 5, '场景转化层': 10, '合规治理与软技能': 15, '前沿研究与创新': 5 },
  },
  {
    stage: 2, label: 'AI应用开发期', tag: 'AI应用开发者',
    totalRange: [21, 45],
    dimensions: { '基础理论层': 55, 'AI核心技术层': 50, '工程落地层': 35, '场景转化层': 30, '合规治理与软技能': 35, '前沿研究与创新': 15 },
  },
  {
    stage: 3, label: 'AI工程化期', tag: 'AI工程实践者',
    totalRange: [46, 70],
    dimensions: { '基础理论层': 70, 'AI核心技术层': 70, '工程落地层': 65, '场景转化层': 55, '合规治理与软技能': 55, '前沿研究与创新': 30 },
  },
  {
    stage: 4, label: 'AI架构深耕期', tag: 'AI技术领航者',
    totalRange: [71, 100],
    dimensions: { '基础理论层': 85, 'AI核心技术层': 90, '工程落地层': 90, '场景转化层': 80, '合规治理与软技能': 80, '前沿研究与创新': 60 },
  },
]

const MODELER_BENCHMARKS: StageBenchmark[] = [
  {
    stage: 1, label: '建模入门期', tag: '3D初学者',
    totalRange: [0, 20],
    dimensions: { '软件操作能力': 30, '建模技术能力': 15, 'UV与纹理能力': 10, '美术基础与设计素养': 20, '渲染与光照能力': 12, '项目与工程实践能力': 8, '动画与绑定能力': 5 },
  },
  {
    stage: 2, label: '建模成长期', tag: '3D实践者',
    totalRange: [21, 45],
    dimensions: { '软件操作能力': 63, '建模技术能力': 48, 'UV与纹理能力': 42, '美术基础与设计素养': 50, '渲染与光照能力': 45, '项目与工程实践能力': 35, '动画与绑定能力': 20 },
  },
  {
    stage: 3, label: '建模精进期', tag: '3D专业者',
    totalRange: [46, 70],
    dimensions: { '软件操作能力': 82, '建模技术能力': 73, 'UV与纹理能力': 68, '美术基础与设计素养': 70, '渲染与光照能力': 69, '项目与工程实践能力': 64, '动画与绑定能力': 32 },
  },
  {
    stage: 4, label: '建模专家期', tag: '3D艺术家',
    totalRange: [71, 100],
    dimensions: { '软件操作能力': 96, '建模技术能力': 93, 'UV与纹理能力': 91, '美术基础与设计素养': 90, '渲染与光照能力': 91, '项目与工程实践能力': 91, '动画与绑定能力': 48 },
  },
]

interface GapResult {
  dimensionName: string
  currentPct: number
  targetPct: number
  gap: number
  status: 'ok' | 'consolidate' | 'weak'
  weight: number
}

function analyzeGaps(
  dimensions: DimensionScore[],
  benchmarks: StageBenchmark[],
  totalScore: number
): { currentStage: StageBenchmark; nextStage: StageBenchmark | null; gaps: GapResult[] } {
  const stageIdx = benchmarks.findIndex(
    (b) => totalScore >= b.totalRange[0] && totalScore <= b.totalRange[1]
  )
  const currentStage = benchmarks[Math.max(0, stageIdx)]
  const nextStage = stageIdx >= 0 && stageIdx < benchmarks.length - 1 ? benchmarks[stageIdx + 1] : null

  const target = nextStage || currentStage

  const gaps: GapResult[] = dimensions.map((dim) => {
    const targetPct = target.dimensions[dim.name] ?? 50
    const currentPct = dim.maxScore > 0 ? Math.round((dim.score / dim.maxScore) * 100) : 0
    const gap = targetPct - currentPct

    let status: 'ok' | 'consolidate' | 'weak' = 'ok'
    if (gap > 15) status = 'weak'
    else if (gap > 5) status = 'consolidate'

    return { dimensionName: dim.name, currentPct, targetPct, gap, status, weight: dim.maxScore }
  })

  gaps.sort((a, b) => {
    if (a.status === 'weak' && b.status !== 'weak') return -1
    if (a.status !== 'weak' && b.status === 'weak') return 1
    if (a.status === 'consolidate' && b.status === 'ok') return -1
    if (a.status === 'ok' && b.status === 'consolidate') return 1
    return b.weight - a.weight
  })

  return { currentStage, nextStage, gaps }
}

function generateLocalGrowthPlan(
  profile: ProfileData,
  benchmarkData: StageBenchmark[],
  curveNodes: typeof AI_ENGINEER_CURVE_NODES
): string {
  const { currentStage, nextStage, gaps } = analyzeGaps(profile.dimensions, benchmarkData, profile.totalScore)
  const curveNode = getCurveNode(profile.totalScore, profile.position)

  const rows: string[] = []
  rows.push(`## 成长计划`)
  rows.push(``)
  rows.push(`**📍 当前定位：** ${profile.totalScore}/100 分，位于「${curveNode.tag}」`)
  rows.push(``)
  if (nextStage) {
    rows.push(`**🏆 阶段目标：** 达到「${nextStage.tag}」阶段 — ${nextStage.label}`)
    rows.push(`**📅 建议周期：** 根据差距分析，预计需要持续努力提升`)
  } else {
    rows.push(`**🏆 阶段目标：** 已处于最高阶段「${currentStage.tag}」，保持领先并持续创新`)
  }
  rows.push(``)
  rows.push(`---`)
  rows.push(``)
  const priorityGaps = gaps.filter((g) => g.status !== 'ok').slice(0, 3)
  if (priorityGaps.length > 0) {
    rows.push(`### ⚠️ 优先提升维度`)
    rows.push(``)
    for (const g of priorityGaps) {
      const icon = g.status === 'weak' ? '🔴短板优先' : '🔶需要巩固'
      rows.push(`- **${g.dimensionName}：** 当前 ${g.currentPct}%，目标 ${g.targetPct}%，差距 ${g.gap}%  ${icon}`)
    }
    rows.push(``)
  } else {
    rows.push(`### ✅ 各维度均已达当前阶段标准，继续保持！`)
    rows.push(``)
  }
  return rows.join('\n')
}

function generateGrowthTargets(
  profile: ProfileData,
  benchmarkData: StageBenchmark[],
  curveNodes: typeof AI_ENGINEER_CURVE_NODES
): Array<{
  dimensionName: string; currentScore: number; currentPct: number; targetPct: number
  targetScore: number; gap: number; gapPct: number; timelineLabel: string
  status: 'ok' | 'consolidate' | 'weak'; weight: number
}> {
  const { nextStage } = analyzeGaps(profile.dimensions, benchmarkData, profile.totalScore)

  if (!nextStage) {
    return profile.dimensions.map((d) => {
      const pct = d.maxScore > 0 ? Math.round((d.score / d.maxScore) * 100) : 0
      return {
        dimensionName: d.name, currentScore: d.score, currentPct: pct,
        targetPct: 100, targetScore: d.maxScore, gap: d.maxScore - d.score,
        gapPct: 100 - pct, timelineLabel: '持续精进', status: 'ok' as const, weight: d.maxScore,
      }
    })
  }

  return profile.dimensions.map((d) => {
    const targetPct = nextStage.dimensions[d.name] ?? 50
    const currentPct = d.maxScore > 0 ? Math.round((d.score / d.maxScore) * 100) : 0
    const gapPct = targetPct - currentPct
    const targetScore = Math.round((targetPct / 100) * d.maxScore)
    const gap = targetScore - d.score
    let status: 'ok' | 'consolidate' | 'weak' = 'ok'
    if (gapPct > 20) status = 'weak'
    else if (gapPct > 8) status = 'consolidate'
    let timelineLabel = ''
    if (status === 'weak') timelineLabel = '建议1-2个月重点攻克'
    else if (status === 'consolidate') timelineLabel = '建议3-4周巩固提升'
    else timelineLabel = '已达标，保持即可'
    return { dimensionName: d.name, currentScore: d.score, currentPct, targetPct, targetScore, gap, gapPct, timelineLabel, status, weight: d.maxScore }
  })
}

function getDimensionColors(index: number): string {
  const colors = ['#1A73E8', '#00B4D8', '#F0A500', '#7C3AED', '#EC4899', '#10B981', '#EF4444']
  return colors[index % colors.length]
}

function getLineColor(index: number): string {
  const colors = ['#1A73E8', '#00B4D8', '#10B981', '#F0A500', '#7C3AED', '#EC4899', '#EF4444', '#14B8A6']
  return colors[index % colors.length]
}

export default function GrowthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { growthRecords, apiKey, userMode, profileHistory, updateGrowthPlanByProfileId } = useAppStore()
  const { syncGrowthRecord } = useSync()
  const initialProfile = (location.state as { profile?: ProfileData })?.profile
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(initialProfile || null)
  const profile = selectedProfile

  const [expandedPlan, setExpandedPlan] = useState<string | null>('gap-analysis')
  const [expandedTextPlan, setExpandedTextPlan] = useState(false)
  const [expandedLearning, setExpandedLearning] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState(false)

  const [aiGrowthPlan, setAiGrowthPlan] = useState('')
  const [aiLearningResources, setAiLearningResources] = useState('')
  const [aiProjectPractice, setAiProjectPractice] = useState('')
  const [loadingGrowthPlan, setLoadingGrowthPlan] = useState(false)
  const [loadingLearning, setLoadingLearning] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)

  const benchmarks = useMemo(() => {
    if (!profile) return AI_ENGINEER_BENCHMARKS
    return profile.position === 'ai_engineer' ? AI_ENGINEER_BENCHMARKS : MODELER_BENCHMARKS
  }, [profile])

  const curveNodes = useMemo(() => {
    if (!profile) return AI_ENGINEER_CURVE_NODES
    return profile.position === 'ai_engineer' ? AI_ENGINEER_CURVE_NODES : MODELER_CURVE_NODES
  }, [profile])

  const curveData = useMemo(() => {
    if (!profile) return []
    return getCurveData(profile.position === 'ai_engineer' ? 'ai_engineer' : '3d_modeler')
  }, [profile])

  const curveDimensions = useMemo(() => {
    if (!profile) return AI_ENGINEER_DIMENSIONS
    return getCurveDimensions(profile.position === 'ai_engineer' ? 'ai_engineer' : '3d_modeler')
  }, [profile])

  const userPosition = useMemo(() => {
    if (!profile) return null
    return interpolateCurvePosition(curveData, profile.totalScore)
  }, [profile, curveData])

  const localGrowthPlanMarkdown = useMemo(() => {
    if (!profile) return ''
    return generateLocalGrowthPlan(profile, benchmarks, curveNodes)
  }, [profile, benchmarks, curveNodes])

  const gapAnalysis = useMemo(() => {
    if (!profile) return null
    return analyzeGaps(profile.dimensions, benchmarks, profile.totalScore)
  }, [profile, benchmarks])

  const growthTargets = useMemo(() => {
    if (!profile) return []
    return generateGrowthTargets(profile, benchmarks, curveNodes)
  }, [profile, benchmarks, curveNodes])

  const chartData = useMemo(() => {
    return curveData.map((node) => ({
      time: node.time,
      ...Object.fromEntries(curveDimensions.map(d => [d.key, node[d.key]])),
      milestone: node.milestone,
      stage: node.stage,
    }))
  }, [curveData, curveDimensions])

  const stageAreas = useMemo(() => {
    if (curveData.length === 0) return []
    const areas: Array<{ x1: number; x2: number; stage: number }> = []
    let currentStage = curveData[0].stage
    let startTime = curveData[0].time
    for (let i = 1; i < curveData.length; i++) {
      if (curveData[i].stage !== currentStage || i === curveData.length - 1) {
        areas.push({ x1: startTime, x2: curveData[i].time, stage: currentStage })
        currentStage = curveData[i].stage
        startTime = curveData[i].time
      }
    }
    return areas
  }, [curveData])

  const fetchAIGrowthPlan = useCallback(async () => {
    if (!profile || !apiKey) return
    setLoadingGrowthPlan(true)
    try {
      const gapText = gapAnalysis?.gaps
        .filter((g) => g.status !== 'ok')
        .map((g) => `${g.dimensionName}：当前${g.currentPct}%，目标${g.targetPct}%，差距${g.gap}%`)
        .join('\n') || '各维度均已达标'
      const { system, user } = buildGrowthPlanPrompt(
        profile.position === 'ai_engineer' ? 'AI工程师' : '3D建模师',
        profile.curveNode,
        profile.totalScore,
        profile.dimensions,
        gapText
      )
      const result = await callDeepSeek(apiKey, system, user, 0.7)
      setAiGrowthPlan(result)
    } catch (err) {
      console.error('AI成长规划生成失败:', err)
      setAiGrowthPlan(localGrowthPlanMarkdown)
    } finally {
      setLoadingGrowthPlan(false)
    }
  }, [profile, apiKey, gapAnalysis, localGrowthPlanMarkdown])

  const fetchAILearningResources = useCallback(async () => {
    if (!profile || !apiKey) return
    setLoadingLearning(true)
    try {
      const weakDims = gapAnalysis?.gaps
        .filter((g) => g.status !== 'ok')
        .map((g) => g.dimensionName)
        .join('、') || '各维度'
      const result = await callDeepSeek(
        apiKey,
        `你是一个职业发展顾问。根据用户的技能评估数据，推荐针对性的学习资源。

输出格式（Markdown）：
## 在线课程推荐
推荐2-3个具体课程或学习平台

## 书籍与文档
推荐2-3本经典书籍或官方文档

## 社区与实践
推荐相关的技术社区、开源项目或实践平台

## 学习路线建议
给出一个分阶段的学习路径

请推荐实际存在的资源，不要编造虚构课程。用中文输出。`,
        `岗位：${profile.position === 'ai_engineer' ? 'AI工程师' : '3D建模师'}
当前阶段：${profile.curveNode}
综合得分：${profile.totalScore}/100
薄弱维度：${weakDims}

各维度得分：
${profile.dimensions.map((d) => `- ${d.name}：${d.score}/${d.maxScore} 分`).join('\n')}`,
        0.7
      )
      setAiLearningResources(result)
    } catch (err) {
      console.error('AI学习资源生成失败:', err)
      setAiLearningResources('')
    } finally {
      setLoadingLearning(false)
    }
  }, [profile, apiKey, gapAnalysis])

  const fetchAIProjectPractice = useCallback(async () => {
    if (!profile || !apiKey) return
    setLoadingProjects(true)
    try {
      const curveNode = getCurveNode(profile.totalScore, profile.position)
      const result = await callDeepSeek(
        apiKey,
        `你是一个技术导师。根据用户的技能水平和成长阶段，推荐具体的项目实践方向。

输出格式（Markdown）：
## 入门级项目
推荐1-2个适合当前水平的实战项目

## 进阶挑战
推荐1-2个具有挑战性的进阶项目

## 作品集建议
给出作品集构建的具体建议

## 实战技巧
分享2-3个实用的工程实践技巧

项目建议要具体、可执行。用中文输出。`,
        `岗位：${profile.position === 'ai_engineer' ? 'AI工程师' : '3D建模师'}
当前阶段：${curveNode.tag}
综合得分：${profile.totalScore}/100

各维度得分：
${profile.dimensions.map((d) => `- ${d.name}：${d.score}/${d.maxScore} 分（${'★'.repeat(d.starRating)}${'☆'.repeat(5 - d.starRating)}）`).join('\n')}`,
        0.7
      )
      setAiProjectPractice(result)
    } catch (err) {
      console.error('AI项目实践生成失败:', err)
      setAiProjectPractice('')
    } finally {
      setLoadingProjects(false)
    }
  }, [profile, apiKey])

  const handleExpandTextPlan = () => {
    const willExpand = !expandedTextPlan
    setExpandedTextPlan(willExpand)
    if (willExpand && !aiGrowthPlan && apiKey) {
      fetchAIGrowthPlan()
    }
  }

  const handleExpandLearning = () => {
    const willExpand = !expandedLearning
    setExpandedLearning(willExpand)
    if (willExpand && !aiLearningResources && apiKey) {
      fetchAILearningResources()
    }
  }

  const handleExpandProjects = () => {
    const willExpand = !expandedProjects
    setExpandedProjects(willExpand)
    if (willExpand && !aiProjectPractice && apiKey) {
      fetchAIProjectPractice()
    }
  }

  const profileRef = useRef(profile)
  profileRef.current = profile

  useEffect(() => {
    if (!aiGrowthPlan || !profileRef.current?.id) return
    updateGrowthPlanByProfileId(profileRef.current.id, aiGrowthPlan)
    syncGrowthRecord({
      date: profileRef.current.date,
      score: profileRef.current.totalScore,
      curveNode: profileRef.current.curveNode,
      growthPlan: aiGrowthPlan || localGrowthPlanMarkdown,
      profileId: profileRef.current.id,
    })
  }, [aiGrowthPlan, updateGrowthPlanByProfileId, syncGrowthRecord, localGrowthPlanMarkdown])

  const filteredProfiles = profileHistory.filter((p) => p.mode === userMode)

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-display text-white">成长模式</h1>
              <p className="text-slate-500 text-sm mt-1">查看成长曲线与AI定制的学习规划</p>
            </div>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-white mb-2">暂无历史技能画像</h3>
              <p className="text-slate-500 text-sm mb-6">请先完成技能测试并保存画像，即可在此查看成长分析</p>
              <button onClick={() => navigate('/')} className="btn-secondary">返回首页</button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold text-white mb-1">请选择一个历史技能画像</h2>
                <p className="text-sm text-slate-500">选择后即可查看对应的成长曲线与AI定制规划</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProfiles.map((p, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedProfile(p)}
                    className="glass-card p-5 text-left group cursor-pointer hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-heading font-semibold text-white text-sm">
                          {p.position === 'ai_engineer' ? 'AI工程师' : '3D建模师'}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(p.date).toLocaleDateString('zh-CN', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className={`text-2xl font-bold font-heading ${
                        p.totalScore >= 80 ? 'text-gold-400' :
                        p.totalScore >= 60 ? 'text-tech-400' : 'text-slate-400'
                      }`}>
                        {p.totalScore}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3 h-3 ${star <= p.starRating ? 'fill-gold-400 text-gold-400' : 'text-slate-600'}`} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.dimensions.slice(0, 4).map((dim, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-slate-400">
                          {dim.name.length > 4 ? dim.name.slice(0, 4) + '…' : dim.name}: {dim.score}
                        </span>
                      ))}
                      {p.dimensions.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500">+{p.dimensions.length - 4}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-3 text-tech-400 text-xs font-medium group-hover:text-tech-300 transition-colors">
                      查看成长分析 <ArrowRight className="w-3 h-3" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    )
  }

  const maxTime = Math.max(...curveData.map(d => d.time), 1)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => initialProfile ? navigate(-1) : setSelectedProfile(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-white">成长追踪</h1>
            <p className="text-slate-500 text-sm">可视化您的职业成长轨迹，AI智能规划进阶路径</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <h3 className="font-heading font-semibold text-white text-sm flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-tech-400" />
            成长曲线 · {curveNodes.length}阶段标准化曲线
          </h3>

          <div className="w-full h-[400px] md:h-[460px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 20, left: 30, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                {stageAreas.map((area, i) => (
                  <ReferenceArea
                    key={i}
                    x1={area.x1}
                    x2={area.x2}
                    y1={0}
                    y2={100}
                    fill={i % 2 === 0 ? 'rgba(26,115,232,0.03)' : 'rgba(0,180,216,0.03)'}
                    fillOpacity={1}
                  />
                ))}
                <XAxis
                  dataKey="time"
                  type="number"
                  domain={[0, maxTime]}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  stroke="rgba(255,255,255,0.06)"
                  label={{ value: '累计时间（月）', position: 'insideBottom', offset: -12, fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  stroke="rgba(255,255,255,0.06)"
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: '能力得分（%）', position: 'insideLeft', offset: 0, fill: '#94A3B8', fontSize: 12, fontWeight: 600, angle: -90 }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,23,42,0.96)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: '#E2E8F0',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => {
                    const label = curveDimensions.find(d => d.label === name)?.label || curveDimensions.find(d => d.key === name)?.label || name
                    return [`${value}%`, label]
                  }}
                  labelFormatter={(label: number) => `${label} 个月`}
                />
                {curveDimensions.map((dim, i) => (
                  <Line
                    key={dim.key}
                    type="monotone"
                    dataKey={dim.key}
                    name={dim.label}
                    stroke={getLineColor(i)}
                    strokeWidth={dim.key === 'total' ? 3 : 2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, fill: getLineColor(i) }}
                    connectNulls
                  />
                ))}
                {userPosition && (
                  <ReferenceDot
                    x={userPosition.x}
                    y={userPosition.y}
                    r={8}
                    fill="#1A73E8"
                    stroke="#fff"
                    strokeWidth={3}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex mt-6 justify-center gap-5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded-full bg-tech-500 border-2 border-white" style={{ backgroundColor: '#1A73E8' }} />
              <span className="text-slate-300 font-medium">当前位置</span>
            </div>
            {curveDimensions.map((dim, i) => (
              <div key={dim.key} className="flex items-center gap-1.5 text-xs">
                <div className="w-3.5 h-0.5 rounded" style={{ backgroundColor: getLineColor(i) }} />
                <span className="text-slate-400">{dim.label}</span>
              </div>
            ))}
          </div>

          {curveData.filter(d => d.milestone).length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-slate-500 mb-2 font-heading">里程碑节点</p>
              <div className="flex flex-wrap gap-2">
                {curveData.filter(d => d.milestone).map((d) => (
                  <span key={d.node} className="text-[10px] px-2 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400">
                    ★ {d.milestone}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {growthTargets.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="glass-card overflow-hidden">
              <button
                onClick={() => setExpandedPlan(expandedPlan === 'targets' ? null : 'targets')}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <span className="font-heading font-semibold text-white text-sm">成长目标看板</span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {gapAnalysis?.nextStage ? `目标阶段：${gapAnalysis.nextStage.tag} — 各维度量化提升目标` : '已处于最高阶段，追求卓越'}
                    </p>
                  </div>
                </div>
                {expandedPlan === 'targets' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedPlan === 'targets' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5">
                  <div className="border-t border-white/5 pt-4 space-y-4">
                    {growthTargets.sort((a, b) => {
                      if (a.status === 'weak' && b.status !== 'weak') return -1
                      if (a.status !== 'weak' && b.status === 'weak') return 1
                      return b.gapPct - a.gapPct
                    }).map((gt, i) => {
                      const progressPct = gt.targetPct > 0 ? Math.min(100, Math.round((gt.currentPct / gt.targetPct) * 100)) : 0
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                          className={`p-4 rounded-xl border ${
                            gt.status === 'weak' ? 'border-red-500/20 bg-red-500/[0.03]' :
                            gt.status === 'consolidate' ? 'border-gold-500/20 bg-gold-500/[0.03]' :
                            'border-green-500/20 bg-green-500/[0.03]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getDimensionColors(i) }} />
                              <span className="font-heading font-semibold text-white text-sm">{gt.dimensionName}</span>
                              {gt.status === 'weak' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">优先提升</span>}
                              {gt.status === 'consolidate' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold-500/15 text-gold-400 font-medium">需要巩固</span>}
                            </div>
                            <span className="text-xs text-slate-500">{gt.timelineLabel}</span>
                          </div>
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-400">当前</span>
                                <span className="text-slate-600">目标</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-heading font-bold">
                                <span className="text-white">{gt.currentScore} 分</span>
                                <span className="text-slate-600">({gt.currentPct}%)</span>
                                <span className="text-slate-600">→</span>
                                <span className={gt.status === 'weak' ? 'text-red-400' : gt.status === 'consolidate' ? 'text-gold-400' : 'text-green-400'}>{gt.targetScore} 分</span>
                                <span className="text-slate-500">({gt.targetPct}%)</span>
                              </div>
                            </div>
                            {gt.gap > 0 && (
                              <div className="text-right">
                                <span className="text-[10px] text-slate-500">需提升</span>
                                <div className={`text-sm font-heading font-bold ${gt.status === 'weak' ? 'text-red-400' : 'text-gold-400'}`}>+{gt.gap} 分</div>
                              </div>
                            )}
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div className="h-full rounded-full" style={{ width: `${progressPct}%`, backgroundColor: getDimensionColors(i) }} initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-slate-500">达成 {progressPct}%</span>
                            {gt.gap > 0 && <span className="text-[10px] text-slate-500">距目标还需 {gt.gapPct}%</span>}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {gapAnalysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="glass-card overflow-hidden">
              <button onClick={() => setExpandedPlan(expandedPlan === 'gap-analysis' ? null : 'gap-analysis')} className="w-full p-5 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-gold-400" />
                  </div>
                  <div>
                    <span className="font-heading font-semibold text-white text-sm">维度差距分析</span>
                    <p className="text-xs text-slate-500 mt-0.5">{gapAnalysis.nextStage ? `目标阶段：${gapAnalysis.nextStage.tag}` : '已处于最高阶段'}</p>
                  </div>
                </div>
                {expandedPlan === 'gap-analysis' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedPlan === 'gap-analysis' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5">
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    {gapAnalysis.gaps.map((g, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {g.status === 'weak' ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> : g.status === 'consolidate' ? <Flag className="w-3.5 h-3.5 text-gold-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                            <span className="text-slate-300 font-medium">{g.dimensionName}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className={`font-heading font-bold ${g.status === 'weak' ? 'text-red-400' : g.status === 'consolidate' ? 'text-gold-400' : 'text-green-400'}`}>{g.currentPct}%</span>
                            <span className="text-slate-600">→</span>
                            <span className="text-slate-400">{g.targetPct}%</span>
                            {g.gap > 0 && <span className={g.status === 'weak' ? 'text-red-400' : 'text-gold-400'}>-{g.gap}%</span>}
                          </div>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="flex h-full">
                            <motion.div className="h-full rounded-l-full" style={{ width: `${Math.min(g.currentPct, g.targetPct)}%`, backgroundColor: getDimensionColors(i) }} initial={{ width: 0 }} animate={{ width: `${Math.min(g.currentPct, g.targetPct)}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                            {g.gap > 0 && (
                              <motion.div className="h-full rounded-r-full opacity-30" style={{ width: `${Math.abs(g.gap)}%`, backgroundColor: g.status === 'weak' ? '#EF4444' : '#F0A500' }} initial={{ width: 0 }} animate={{ width: `${Math.abs(g.gap)}%` }} transition={{ duration: 0.8, delay: i * 0.15 }} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="glass-card overflow-hidden">
            <button onClick={handleExpandTextPlan} className="w-full p-5 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-tech-500/10 flex items-center justify-center">
                  {loadingGrowthPlan ? <Loader2 className="w-4 h-4 text-tech-400 animate-spin" /> : <Bot className="w-4 h-4 text-tech-400" />}
                </div>
                <div>
                  <span className="font-heading font-semibold text-white text-sm">AI成长规划</span>
                  <p className="text-xs text-slate-500 mt-0.5">{apiKey ? 'DeepSeek AI 基于差距分析生成个性化方案' : '需要配置 API Key 方可使用'}</p>
                </div>
              </div>
              {expandedTextPlan ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {expandedTextPlan && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5">
                <div className="border-t border-white/5 pt-4">
                  {!apiKey ? (
                    <APIKeyGuard featureName="AI成长规划" compact />
                  ) : (
                    <>
                      {!aiGrowthPlan && loadingGrowthPlan && (
                        <div className="flex items-center gap-3 py-6 justify-center">
                          <Loader2 className="w-5 h-5 text-tech-400 animate-spin" />
                          <span className="text-sm text-slate-400">AI 正在生成成长规划...</span>
                        </div>
                      )}
                      {aiGrowthPlan && <MarkdownReport content={aiGrowthPlan} />}
                      {aiGrowthPlan && (
                        <button onClick={fetchAIGrowthPlan} disabled={loadingGrowthPlan} className="mt-3 flex items-center gap-1.5 text-xs text-tech-400 hover:text-tech-300 transition-colors">
                          <Sparkles className="w-3 h-3" /> 重新生成
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="glass-card overflow-hidden">
            <button onClick={handleExpandLearning} className="w-full p-5 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-tech-500/10 flex items-center justify-center">
                  {loadingLearning ? <Loader2 className="w-4 h-4 text-tech-400 animate-spin" /> : <BookOpen className="w-4 h-4 text-tech-400" />}
                </div>
                <div>
                  <span className="font-heading font-semibold text-white text-sm">学习资源推荐</span>
                  <p className="text-xs text-slate-500 mt-0.5">{apiKey ? 'DeepSeek AI 个性化学习资源推荐' : '需要配置 API Key 方可使用'}</p>
                </div>
              </div>
              {expandedLearning ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {expandedLearning && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5">
                <div className="border-t border-white/5 pt-4">
                  {!apiKey ? (
                    <APIKeyGuard featureName="学习资源推荐" compact />
                  ) : (
                    <>
                      {loadingLearning && (
                        <div className="flex items-center gap-3 py-6 justify-center">
                          <Loader2 className="w-5 h-5 text-tech-400 animate-spin" />
                          <span className="text-sm text-slate-400">AI 正在分析学习路径...</span>
                        </div>
                      )}
                      {aiLearningResources && <MarkdownReport content={aiLearningResources} />}
                      {aiLearningResources && (
                        <button onClick={fetchAILearningResources} disabled={loadingLearning} className="mt-3 flex items-center gap-1.5 text-xs text-tech-400 hover:text-tech-300 transition-colors">
                          <Sparkles className="w-3 h-3" /> 重新生成
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <div className="glass-card overflow-hidden">
            <button onClick={handleExpandProjects} className="w-full p-5 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-tech-500/10 flex items-center justify-center">
                  {loadingProjects ? <Loader2 className="w-4 h-4 text-tech-400 animate-spin" /> : <Lightbulb className="w-4 h-4 text-tech-400" />}
                </div>
                <div>
                  <span className="font-heading font-semibold text-white text-sm">项目实践方向</span>
                  <p className="text-xs text-slate-500 mt-0.5">{apiKey ? 'DeepSeek AI 针对性项目实践建议' : '需要配置 API Key 方可使用'}</p>
                </div>
              </div>
              {expandedProjects ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {expandedProjects && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5">
                <div className="border-t border-white/5 pt-4">
                  {!apiKey ? (
                    <APIKeyGuard featureName="项目实践方向" compact />
                  ) : (
                    <>
                      {loadingProjects && (
                        <div className="flex items-center gap-3 py-6 justify-center">
                          <Loader2 className="w-5 h-5 text-tech-400 animate-spin" />
                          <span className="text-sm text-slate-400">AI 正在生成项目建议...</span>
                        </div>
                      )}
                      {aiProjectPractice && <MarkdownReport content={aiProjectPractice} />}
                      {aiProjectPractice && (
                        <button onClick={fetchAIProjectPractice} disabled={loadingProjects} className="mt-3 flex items-center gap-1.5 text-xs text-tech-400 hover:text-tech-300 transition-colors">
                          <Sparkles className="w-3 h-3" /> 重新生成
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {growthRecords.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h3 className="font-heading font-semibold text-white text-sm flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-tech-400" />
              历史成绩对比
            </h3>
            <div className="space-y-3">
              {growthRecords.map((record, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString('zh-CN')}</span>
                    <span className="text-sm text-slate-300">{record.curveNode}</span>
                  </div>
                  <span className={`font-heading font-bold ${record.score >= profile.totalScore ? 'text-teal-400' : 'text-slate-400'}`}>
                    {record.score}分
                    {i === 0 && record.score < profile.totalScore && <span className="text-green-400 text-xs ml-1">↑{profile.totalScore - record.score}</span>}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{new Date(profile.date).toLocaleDateString('zh-CN')}</span>
                  <span className="text-sm text-white font-medium">{profile.curveNode}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-tech-500/15 text-tech-400">当前</span>
                </div>
                <span className="font-heading font-bold text-tech-400">{profile.totalScore}分</span>
              </div>
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  )
}
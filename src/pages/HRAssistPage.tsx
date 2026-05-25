import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore, QuizAnswer, Position } from '../store/useAppStore'
import { useSync } from '../providers/SyncProvider'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Sparkles, MessageCircle, ArrowRight, ArrowLeft,
  Check, Briefcase, Cpu, Users, Target, Clock, CheckCircle2,
  SkipForward, AlertCircle, Edit3, FileText, Bot, Zap, Loader2, XCircle, Box
} from 'lucide-react'
import { getQuestionBank } from '../data/questionBanks'
import { calculateScore, generateAnswersSummary } from '../config/scoringEngine'
import { getCurveNode, POSITION_LABELS, QuestionData } from '../config/questionBankMapping'
import { callDeepSeek, buildJDPrompt, buildHRProxyPrompt } from '../config/aiService'
import APIKeyGuard from '../components/APIKeyGuard'

const dialogueStages = [
  {
    stage: 1,
    title: '业务背景',
    icon: Briefcase,
    question: '请描述您要招聘的岗位所属的业务场景和团队定位。例如：负责什么产品线？团队规模多大？向谁汇报？',
    placeholder: '请输入业务背景信息...\n\n例如：我们正在组建一个新的AI团队，负责公司核心推荐系统的研发，该岗位将直接向CTO汇报...',
  },
  {
    stage: 2,
    title: '硬性技能',
    icon: Cpu,
    question: '请列出该岗位的核心技术要求和必备技能。包括编程语言、框架、工具、项目经验等硬性要求。',
    placeholder: '请输入硬性技能要求...\n\n例如：精通Python和PyTorch，熟悉Transformer架构，有大规模数据处理经验...',
  },
  {
    stage: 3,
    title: '软性素质',
    icon: Users,
    question: '请描述对该岗位候选人的软性素质要求。包括沟通能力、团队协作、学习能力、抗压能力等。',
    placeholder: '请输入软性素质要求...\n\n例如：需要具备良好的跨部门沟通能力，能够将技术方案清晰地传达给非技术团队...',
  },
  {
    stage: 4,
    title: '边界条件',
    icon: Target,
    question: '请明确该岗位的边界条件。包括工作地点、薪资范围、远程办公政策、学历要求等。',
    placeholder: '请输入边界条件...\n\n例如：Base北京/上海，接受远程混合办公，薪资范围30-50K...',
  },
]

function generateJD(
  dimensions: Array<{ name: string; score: number; maxScore: number; starRating: number }>,
  positionLabel: string,
  contextInputs: string[]
): string {
  const rows: string[] = []
  rows.push(`# ${positionLabel} — 岗位JD`)
  rows.push(``)
  rows.push(`## 岗位概述`)
  rows.push(``)

  const contextSection = contextInputs
    .map((txt, i) => (txt.trim() ? `**${dialogueStages[i].title}：** ${txt.trim()}` : ''))
    .filter((t) => t !== '')

  if (contextSection.length > 0) {
    rows.push(...contextSection)
  } else {
    rows.push(`基于结构化需求测评自动生成。`)
  }
  rows.push(``)

  rows.push(`---`)
  rows.push(``)
  rows.push(`## 核心能力要求`)
  rows.push(``)

  dimensions.forEach((d) => {
    const level =
      d.starRating >= 4 ? '精通' : d.starRating >= 3 ? '熟练' : d.starRating >= 2 ? '了解' : '基础'
    rows.push(`- **${d.name}：** ${level}级（需求强度 ${d.score}/${d.maxScore}）`)
  })

  rows.push(``)
  rows.push(`---`)
  rows.push(``)
  rows.push(`## 候选人画像`)
  rows.push(``)

  const priorityDims = dimensions
    .filter((d) => d.starRating >= 3)
    .sort((a, b) => b.score - a.score)

  if (priorityDims.length > 0) {
    rows.push(`### 优先要求`)
    priorityDims.forEach((d) => {
      rows.push(`- ${d.name}：需达到较高水准`)
    })
  }

  rows.push(``)
  rows.push(`### 加分项`)
  rows.push(`- 具备行业相关项目落地经验`)
  rows.push(`- 良好的技术视野和学习能力`)
  rows.push(`- 团队协作和跨部门沟通经验`)

  rows.push(``)
  rows.push(`---`)
  rows.push(``)
  rows.push(`## 招聘策略建议`)
  rows.push(``)
  rows.push(`- 根据需求强度合理设置面试评估权重`)
  rows.push(`- 核心技术维度安排实操环节考察`)
  rows.push(`- 软性素质维度通过行为面试法评估`)

  return rows.join('\n')
}

function collectAllAnswers(
  selectedOptions: Record<number, string[]>,
  persistedAnswers: QuizAnswer[]
): Map<number, { selectedIndices: number[]; skipped: boolean }> {
  const map = new Map<number, { selectedIndices: number[]; skipped: boolean }>()

  for (const [qId, selected] of Object.entries(selectedOptions)) {
    const id = Number(qId)
    const indices = selected.map((s) => s.trim().charCodeAt(0) - 65).filter((n) => n >= 0)
    map.set(id, { selectedIndices: indices, skipped: false })
  }

  for (const a of persistedAnswers) {
    if (a.skipped && !map.has(a.questionIndex)) {
      map.set(a.questionIndex, { selectedIndices: [], skipped: true })
    }
  }

  return map
}

function isQuestionSkippedByRules(
  questionId: number,
  questions: QuestionData[],
  allAnswers: Map<number, { selectedIndices: number[]; skipped: boolean }>
): boolean {
  for (const q of questions) {
    if (!q.skipRule) continue
    if (!q.skipRule.skipQuestionIds.includes(questionId)) continue

    const rule = q.skipRule
    const triggerAnswer = allAnswers.get(rule.triggerQuestionId)

    if (rule.triggerWhenOptionNotSelected) {
      if (!triggerAnswer || triggerAnswer.skipped) return true
      const required = rule.requiredOptionIndices || []
      const hasAllRequired = required.every((idx) => triggerAnswer.selectedIndices.includes(idx))
      if (!hasAllRequired) return true
    } else {
      if (triggerAnswer && !triggerAnswer.skipped && rule.triggerOptionIndex !== undefined) {
        if (triggerAnswer.selectedIndices.includes(rule.triggerOptionIndex)) return true
      }
    }
  }
  return false
}

export default function HRAssistPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedPosition, setCurrentProfile, currentProfile, addHrJob, apiKey, setPosition } = useAppStore()
  const { syncHrJob, syncQuizResults } = useSync()
  const initialMode = (location.state as { initialMode?: string })?.initialMode === 'proxy' ? 'proxy' : 'select'
  const [hrMode, setHrMode] = useState<'select' | 'self' | 'proxy'>(initialMode)
  const [showAIKeyRequired, setShowAIKeyRequired] = useState(false)
  const [proxyPhase, setProxyPhase] = useState<'dialogue' | 'answer'>('dialogue')
  const [currentStage, setCurrentStage] = useState(0)
  const [inputs, setInputs] = useState<string[]>(['', '', '', ''])
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string[]>>({})
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [proxyText, setProxyText] = useState('')
  const [showJDModal, setShowJDModal] = useState(false)
  const [jdContent, setJdContent] = useState('')
  const [editableJD, setEditableJD] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [hasPickedPosition, setHasPickedPosition] = useState(false)

  useEffect(() => {
    setPosition(null)
    setHasPickedPosition(false)
  }, [setPosition])

  const bankEntry = useMemo(() => {
    if (!selectedPosition) return null
    return getQuestionBank(selectedPosition, 'hr')
  }, [selectedPosition])

  const questions = bankEntry?.questions || []
  const totalQuestions = questions.length
  const currentQuestion = questions[quizIndex]

  const answeredCount = quizAnswers.filter((a) => !a.skipped).length
  const skippedCount = quizAnswers.filter((a) => a.skipped).length
  const progress = totalQuestions > 0 ? ((answeredCount + skippedCount) / totalQuestions) * 100 : 0

  const currentSelected = selectedOptions[currentQuestion?.id] || []

  const filledStages = inputs.filter((i) => i.trim().length > 0).length

  const getAllAnswersMap = useCallback(
    () => collectAllAnswers(selectedOptions, quizAnswers),
    [selectedOptions, quizAnswers]
  )

  const handleInputChange = (value: string) => {
    const newInputs = [...inputs]
    newInputs[currentStage] = value
    setInputs(newInputs)
  }

  const handleNextStage = () => {
    if (currentStage < 3) {
      setCurrentStage(currentStage + 1)
    }
  }

  const handlePrevStage = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1)
    }
  }

  const handleEnterSelfQuiz = () => {
    setHrMode('self')
    setQuizIndex(0)
    setQuizAnswers([])
    setSelectedOptions({})
    setInputs(['', '', '', ''])
  }

  const handleEnterProxy = () => {
    if (!apiKey) {
      setShowAIKeyRequired(true)
    } else {
      setShowAIKeyRequired(false)
      setHrMode('proxy')
      setProxyPhase('dialogue')
      setCurrentStage(0)
      setInputs(['', '', '', ''])
      setProxyText('')
    }
  }

  const handleDialogueComplete = () => {
    setProxyPhase('answer')
  }

  const handleOptionToggle = (optionLetter: string) => {
    setSelectedOptions((prev) => {
      const current = prev[currentQuestion.id] || []
      const optionIndex = optionLetter.charCodeAt(0) - 65
      const isNegative = optionIndex === currentQuestion.negativeOptionIndex

      if (currentQuestion.type === 'single') {
        return { ...prev, [currentQuestion.id]: [optionLetter] }
      }

      if (current.includes(optionLetter)) {
        return { ...prev, [currentQuestion.id]: current.filter((o) => o !== optionLetter) }
      }

      if (isNegative) {
        return { ...prev, [currentQuestion.id]: [optionLetter] }
      }

      if (currentQuestion.negativeOptionIndex !== undefined) {
        const negativeLetter = String.fromCharCode(65 + currentQuestion.negativeOptionIndex)
        if (current.includes(negativeLetter)) {
          return { ...prev, [currentQuestion.id]: [optionLetter] }
        }
      }

      return { ...prev, [currentQuestion.id]: [...current, optionLetter] }
    })
  }

  const saveCurrentAnswer = () => {
    const selected = selectedOptions[currentQuestion.id]
    if (!selected || selected.length === 0) return
    const answerStr = selected.sort().join(',')
    setQuizAnswers((prev) => {
      const existing = prev.filter((a) => a.questionIndex !== currentQuestion.id)
      return [...existing, { questionIndex: currentQuestion.id, answer: answerStr, skipped: false }]
    })
  }

  const goToNextVisibleQuestion = (fromIndex: number) => {
    const allAnswers = getAllAnswersMap()
    let nextIdx = fromIndex
    while (nextIdx < totalQuestions) {
      const q = questions[nextIdx]
      if (isQuestionSkippedByRules(q.id, questions, allAnswers)) {
        nextIdx++
        continue
      }
      break
    }
    if (nextIdx < totalQuestions) {
      setQuizIndex(nextIdx)
    }
  }

  const handleSkip = () => {
    const selected = selectedOptions[currentQuestion.id]
    const answerStr = selected && selected.length > 0 ? selected.sort().join(',') : ''
    setQuizAnswers((prev) => {
      const existing = prev.filter((a) => a.questionIndex !== currentQuestion.id)
      return [...existing, { questionIndex: currentQuestion.id, answer: answerStr, skipped: true }]
    })
    goToNextVisibleQuestion(quizIndex + 1)
  }

  const handleNext = () => {
    if (currentQuestion.type === 'text') {
      const text = currentSelected[0] || ''
      if (text.trim()) {
        setQuizAnswers((prev) => {
          const existing = prev.filter((a) => a.questionIndex !== currentQuestion.id)
          return [...existing, { questionIndex: currentQuestion.id, answer: text, skipped: false }]
        })
      }
    } else {
      saveCurrentAnswer()
    }
    if (quizIndex < totalQuestions - 1) {
      goToNextVisibleQuestion(quizIndex + 1)
    } else {
      setShowSubmitConfirm(true)
    }
  }

  const handlePrev = () => {
    saveCurrentAnswer()
    if (quizIndex > 0) {
      const allAnswers = getAllAnswersMap()
      let prevIdx = quizIndex - 1
      while (prevIdx >= 0) {
        const q = questions[prevIdx]
        if (isQuestionSkippedByRules(q.id, questions, allAnswers)) {
          prevIdx--
          continue
        }
        break
      }
      if (prevIdx >= 0) {
        setQuizIndex(prevIdx)
      }
    }
  }

  const handleSubmit = () => {
    if (!bankEntry || !selectedPosition) return

    let finalAnswers = [...quizAnswers]
    if (currentQuestion.type === 'text') {
      const text = currentSelected[0] || ''
      if (text.trim()) {
        finalAnswers = finalAnswers.filter((a) => a.questionIndex !== currentQuestion.id)
        finalAnswers.push({ questionIndex: currentQuestion.id, answer: text, skipped: false })
      }
      setQuizAnswers(finalAnswers)
    } else {
      const answers = currentSelected
      const answerStr = answers.join(',')
      finalAnswers = finalAnswers.filter((a) => a.questionIndex !== currentQuestion.id)
      finalAnswers.push({ questionIndex: currentQuestion.id, answer: answerStr, skipped: answers.length === 0 })
      setQuizAnswers(finalAnswers)
    }

    setTimeout(() => {
      const result = calculateScore(bankEntry.questions, bankEntry.scoringRules, finalAnswers)
      const summary = generateAnswersSummary(bankEntry.questions, finalAnswers, bankEntry.scoringRules.dimensions)
      const curveNode = getCurveNode(result.totalScore, selectedPosition)

      const q17Answer = finalAnswers.find((a) => a.questionIndex === 17 && !a.skipped && a.answer.trim())
      const q17Section = q17Answer
        ? `\n\n---\n\n### 开放题回答\n\n> ${q17Answer.answer}\n\n*此回答将作为AI精排人才匹配的重要参考。*`
        : ''

      const fullReport =
        `## ${POSITION_LABELS[selectedPosition]}岗位画像报告\n\n` +
        `**需求强度：** ${result.totalScore}/100　　　**建议职级：** ${curveNode.tag}\n\n` +
        `**评级：** ${'★'.repeat(result.starRating)}${'☆'.repeat(5 - result.starRating)}\n\n` +
        `---\n\n` +
        `### 各维度需求强度\n\n` +
        result.dimensionScores
          .map(
            (d) =>
              `**${d.name}：** ${d.score}/${d.maxScore} 分  ${'★'.repeat(d.starRating)}${'☆'.repeat(5 - d.starRating)}`
          )
          .join('\n\n') +
        `\n\n---\n\n` +
        `### 必备技能维度总结\n\n` +
        summary +
        q17Section

      const jd = generateJD(result.dimensionScores, POSITION_LABELS[selectedPosition], ['', '', '', ''])

      const profile = {
        name: `${POSITION_LABELS[selectedPosition]}岗位画像`,
        position: selectedPosition,
        mode: 'hr' as const,
        dimensions: result.dimensionScores,
        totalScore: result.totalScore,
        starRating: result.starRating,
        textReport: fullReport,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        curveNode: curveNode.label,
      }

      setCurrentProfile(profile)
      setJdContent(jd)
      setEditableJD(jd)
      setShowJDModal(true)

      syncQuizResults(
        finalAnswers.map((a) => ({
          question_index: a.questionIndex,
          answer: a.answer,
          skipped: a.skipped,
          position: selectedPosition,
          mode: 'hr' as const,
        }))
      )
    }, 100)
  }

  const handleProxySubmit = async () => {
    if (!bankEntry || !selectedPosition) return
    const { apiKey } = useAppStore.getState()

    const dialogueContext = dialogueStages.map((s, i) => ({
      title: s.title,
      content: inputs[i] || proxyText,
    }))

    let autoAnswers: QuizAnswer[]

    if (apiKey) {
      try {
        const questionList = bankEntry.questions
          .map(
            (q) =>
              `Q${q.id}: ${q.question}\n选项：${q.options
                .map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`)
                .join('\n')}${q.type === 'multi' ? '\n（可多选）' : '\n（单选）'}`
          )
          .join('\n\n')

        const { system, user } = buildHRProxyPrompt(
          POSITION_LABELS[selectedPosition],
          proxyText,
          questionList,
          dialogueContext
        )
        const aiResponse = await callDeepSeek(apiKey, system, user)

        const answerMap: Record<number, string> = {}
        const lines = aiResponse.split('\n')
        for (const line of lines) {
          const match = line.match(/Q(\d+):\s*(.+)/i)
          if (match) {
            const qId = parseInt(match[1])
            const rawAnswer = match[2].trim().toUpperCase()
            const letters = rawAnswer.split(/[,\s]+/).filter((l) => /^[A-F]$/.test(l))
            if (letters.length > 0) {
              answerMap[qId] = letters.sort().join(',')
            }
          }
        }

        autoAnswers = bankEntry.questions.map((q) => ({
          questionIndex: q.id,
          answer:
            answerMap[q.id] ||
            String.fromCharCode(65 + Math.floor(Math.random() * Math.min(q.options.length || 1, 3))),
          skipped: false,
        }))
      } catch (err) {
        console.error('AI代答失败，使用本地生成:', err)
        autoAnswers = bankEntry.questions.map((q) => {
          const optionsCount = Math.min(q.options.length || 1, 4)
          const pickCount = q.type === 'multi' ? 1 + Math.floor(Math.random() * 2) : 1
          const picks = new Set<string>()
          while (picks.size < pickCount) {
            picks.add(String.fromCharCode(65 + Math.floor(Math.random() * optionsCount)))
          }
          return { questionIndex: q.id, answer: Array.from(picks).sort().join(','), skipped: false }
        })
      }
    } else {
      autoAnswers = bankEntry.questions.map((q) => {
        const optionsCount = Math.min(q.options.length || 1, 4)
        const pickCount = q.type === 'multi' ? 1 + Math.floor(Math.random() * 2) : 1
        const picks = new Set<string>()
        while (picks.size < pickCount) {
          picks.add(String.fromCharCode(65 + Math.floor(Math.random() * optionsCount)))
        }
        return { questionIndex: q.id, answer: Array.from(picks).sort().join(','), skipped: false }
      })
    }

    const result = calculateScore(bankEntry.questions, bankEntry.scoringRules, autoAnswers)
    const summary = generateAnswersSummary(bankEntry.questions, autoAnswers, bankEntry.scoringRules.dimensions)
    const curveNode = getCurveNode(result.totalScore, selectedPosition)

    const dialogueContextText = inputs.some((i) => i.trim())
      ? `## 四阶段需求引导\n\n${dialogueStages
          .map((s, i) => (inputs[i].trim() ? `**${s.title}：** ${inputs[i].trim()}` : null))
          .filter(Boolean)
          .join('\n\n')}\n\n---\n\n`
      : ''

    const proxyContextText = proxyText.trim()
      ? `## 补充岗位描述\n\n${proxyText.trim()}\n\n---\n\n`
      : ''

    let aiReport = ''
    if (apiKey) {
      try {
        aiReport = await callDeepSeek(
          apiKey,
          `你是招聘需求分析师。根据四阶段需求引导和测评数据，生成一段150-200字的岗位需求画像摘要，一针见血地概括核心需求特征。`,
          `${POSITION_LABELS[selectedPosition]}岗位测评结果：综合需求强度 ${result.totalScore}/100\n${result.dimensionScores.map((d) => `${d.name}：${d.score}/${d.maxScore} 分`).join('\n')}`
        )
      } catch {
        aiReport = ''
      }
    }

    const fullReport =
      `## ${POSITION_LABELS[selectedPosition]}岗位画像报告（AI代答模式）\n\n` +
      `**需求强度：** ${result.totalScore}/100　　　**建议职级：** ${curveNode.tag}\n\n` +
      `**评级：** ${'★'.repeat(result.starRating)}${'☆'.repeat(5 - result.starRating)}\n\n` +
      (aiReport ? `> ${aiReport}\n\n` : '') +
      `---\n\n` +
      dialogueContextText +
      proxyContextText +
      `### 各维度需求强度\n\n` +
      result.dimensionScores
        .map(
          (d) =>
            `**${d.name}：** ${d.score}/${d.maxScore} 分  ${'★'.repeat(d.starRating)}${'☆'.repeat(5 - d.starRating)}`
        )
        .join('\n\n') +
      `\n\n---\n\n` +
      `### 必备技能维度总结\n\n` +
      summary

    let jd = generateJD(result.dimensionScores, POSITION_LABELS[selectedPosition], inputs)
    if (apiKey) {
      try {
        const contextInfo = inputs.filter((i) => i.trim()).map((txt, i) => `【${dialogueStages[i].title}】${txt}`).join('\n')
        const { system: jdSys, user: jdUser } = buildJDPrompt(
          POSITION_LABELS[selectedPosition],
          result.dimensionScores,
          contextInfo
        )
        jd = await callDeepSeek(apiKey, jdSys, jdUser)
      } catch (err) {
        console.error('AI JD生成失败，使用模板JD:', err)
      }
    }

    const profile = {
      name: `${POSITION_LABELS[selectedPosition]}岗位画像`,
      position: selectedPosition,
      mode: 'hr' as const,
      dimensions: result.dimensionScores,
      totalScore: result.totalScore,
      starRating: result.starRating,
      textReport: fullReport,
      date: new Date().toISOString(),
      curveNode: curveNode.label,
    }

    setCurrentProfile(profile)
    setJdContent(jd)
    setEditableJD(jd)
    setShowJDModal(true)

    syncQuizResults(
      autoAnswers.map((a) => ({
        question_index: a.questionIndex,
        answer: a.answer,
        skipped: a.skipped,
        position: selectedPosition,
        mode: 'hr' as const,
      }))
    )
  }

  if (!bankEntry) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400">请先选择岗位</p>
        <button onClick={() => navigate('/select-position')} className="btn-secondary mt-4">
          选择岗位
        </button>
      </div>
    )
  }

  if (!hasPickedPosition) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tech-500/10 border border-tech-500/20 text-tech-300 text-xs font-medium tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            HR智能助手
          </div>
          <h1 className="text-3xl md:text-4xl font-display text-white mb-3">
            选择招聘岗位
          </h1>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            选择岗位后将进入画像生成流程，AI工程师和3D建模师将加载对应的需求题库
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => { setPosition('ai_engineer'); setHasPickedPosition(true) }}
            className="glass-card p-8 text-left group cursor-pointer hover:scale-[1.02] transition-all duration-300 relative overflow-hidden shadow-violet-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-tech-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-tech-500/20 border border-violet-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Cpu className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-display text-white mb-2">AI工程师</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                人工智能领域的工程实践专家，覆盖机器学习、深度学习、NLP、计算机视觉等方向
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {['机器学习', '深度学习', 'Python', '模型部署', '数据处理'].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-slate-400 border border-white/5">{s}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-tech-400 text-sm font-medium group-hover:text-tech-300 transition-colors">
                选择此岗位 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => { setPosition('3d_modeler'); setHasPickedPosition(true) }}
            className="glass-card p-8 text-left group cursor-pointer hover:scale-[1.02] transition-all duration-300 relative overflow-hidden shadow-teal-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Box className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-display text-white mb-2">3D建模师</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                三维数字内容创作专家，覆盖角色建模、场景构建、材质贴图、渲染等方向
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {['Maya/Blender', 'ZBrush', 'Substance', 'PBR流程', '拓扑优化'].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-slate-400 border border-white/5">{s}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-teal-400 text-sm font-medium group-hover:text-teal-300 transition-colors">
                选择此岗位 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        </div>

        <div className="text-center mt-8">
          <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-slate-400 transition-all">
            返回首页
          </button>
        </div>
      </div>
    )
  }

  if (hrMode === 'select') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tech-500/10 border border-tech-500/20 text-tech-300 text-xs font-medium tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              HR智能助手
            </div>
            <h1 className="text-3xl font-display text-white mb-2">选择画像生成方式</h1>
            <p className="text-slate-400 text-sm">自主答题精准可控，AI代答高效便捷</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={handleEnterSelfQuiz}
              className="glass-card p-8 text-left hover:border-tech-500/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-tech-500/10 flex items-center justify-center mb-4 group-hover:bg-tech-500/20 transition-all">
                <Edit3 className="w-6 h-6 text-tech-400" />
              </div>
              <h3 className="font-heading font-semibold text-white text-lg mb-2">自主答题</h3>
              <p className="text-sm text-slate-400 mb-4">
                通过结构化题库逐题作答，精准量化岗位需求，生成标准化岗位画像。
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-tech-400" /> 精准可控</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 约10分钟</span>
              </div>
            </button>

            <button
              onClick={handleEnterProxy}
              className="glass-card p-8 text-left hover:border-teal-500/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/20 transition-all">
                <Bot className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="font-heading font-semibold text-white text-lg mb-2">AI代答</h3>
              <p className="text-xs text-teal-400/70 mb-1 font-medium">四阶段对话引导 + 模糊用人标注精准转化</p>
              <p className="text-sm text-slate-400 mb-4">
                通过四阶段对话引导精准确描述需求，AI自动完成题库答题并生成画像，HR确认后可微调。
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-teal-400" /> 高效快捷</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 约5分钟</span>
              </div>
            </button>
          </div>

          {showAIKeyRequired && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <APIKeyGuard featureName="AI代答" />
            </motion.div>
          )}

          <div className="text-center mt-6">
            <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-slate-400 transition-all">
              返回首页
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (hrMode === 'proxy' && !apiKey) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => { setHrMode('select'); setProxyPhase('dialogue') }} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-1">
                <Bot className="w-3 h-3" />
                AI代答模式
              </div>
            </div>
          </div>
          <APIKeyGuard featureName="AI代答" />
        </motion.div>
      </div>
    )
  }

  if (hrMode === 'proxy' && proxyPhase === 'dialogue') {
    const stage = dialogueStages[currentStage]

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => { setHrMode('select'); setProxyPhase('dialogue') }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-1">
                <Bot className="w-3 h-3" />
                AI代答模式
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              四阶段需求引导
            </div>
            <h1 className="text-3xl font-display text-white mb-2">AI辅助生成岗位画像</h1>
            <p className="text-slate-400 text-sm">
              分四阶段描述岗位需求，AI将基于引导信息自动完成题库答题并生成精准画像
            </p>
          </div>

          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {dialogueStages.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentStage(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  i === currentStage
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : i < currentStage || inputs[i].trim()
                      ? 'bg-white/5 text-slate-400 border border-white/5'
                      : 'text-slate-600 border border-white/5'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    inputs[i].trim() ? 'bg-teal-500 text-white' : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {inputs[i].trim() ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                {s.title}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="glass-card p-6"
            >
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center flex-shrink-0">
                  <stage.icon className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-base mb-1">
                    第{stage.stage}阶段：{stage.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{stage.question}</p>
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5 mb-4">
                <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                  <MessageCircle className="w-3.5 h-3.5 text-teal-400" />
                  智能助手引导
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{stage.question}</p>
              </div>

              <textarea
                value={inputs[currentStage]}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={stage.placeholder}
                rows={6}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-teal-500/50 focus:bg-white/[0.05] transition-all"
              />
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrevStage}
              disabled={currentStage === 0}
              className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
            >
              上一阶段
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{filledStages}/4 阶段已完成</span>
              {currentStage < 3 ? (
                <button
                  onClick={handleNextStage}
                  className="btn-secondary flex items-center gap-1.5 text-sm"
                >
                  下一阶段 <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleDialogueComplete} className="btn-primary flex items-center gap-1.5 text-sm">
                  进入AI代答 <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (hrMode === 'proxy' && proxyPhase === 'answer') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setProxyPhase('dialogue')}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-2">
                <Bot className="w-3 h-3" />
                AI代答 — 需求确认
              </div>
            </div>
          </div>

          {filledStages > 0 && (
            <div className="glass-card p-5 mb-6">
              <div className="flex items-center gap-2 mb-3 text-xs text-teal-400 font-heading">
                <CheckCircle2 className="w-3.5 h-3.5" />
                四阶段需求引导摘要
              </div>
              <div className="space-y-2">
                {dialogueStages.map((s, i) =>
                  inputs[i].trim() ? (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-teal-400 font-medium flex-shrink-0">{s.title}：</span>
                      <span className="text-slate-300 line-clamp-2">{inputs[i].trim()}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-white">补充岗位描述（可选）</h3>
                <p className="text-xs text-slate-500">AI将综合四阶段引导信息与此处描述完成答题</p>
              </div>
            </div>
            <textarea
              value={proxyText}
              onChange={(e) => setProxyText(e.target.value)}
              placeholder={`如需补充或粘贴完整岗位JD，请在此输入...\n\n例如：\n岗位名称：AI工程师\n核心职责：负责公司推荐系统算法研发与优化...`}
              rows={6}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-teal-500/50 transition-all"
            />
          </div>

          <div className="p-4 rounded-lg bg-teal-500/[0.04] border border-teal-500/10 mb-6">
            <p className="text-xs text-teal-400 font-heading mb-2">AI代答说明</p>
            <ul className="text-[11px] text-slate-400 space-y-1">
              <li>· AI将综合四阶段需求引导信息和补充描述，模拟完成对应题库的所有答题</li>
              <li>· 生成结果后，您可在结果页面对AI代答内容进行确认或微调</li>
              <li>· 四阶段引导信息越详细，AI代答生成的画像精准度越高</li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setProxyPhase('dialogue')}
              className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" /> 返回引导
            </button>
            <button
              onClick={handleProxySubmit}
              disabled={filledStages === 0}
              className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              AI代答生成画像
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const isTextQuestion = currentQuestion.type === 'text'
  const hasTextContent = isTextQuestion && (currentSelected[0] || '').trim().length > 0
  const isAnswered = isTextQuestion ? hasTextContent : currentSelected.length > 0

  const isNegativeSelected =
    currentQuestion.type === 'multi' &&
    currentQuestion.negativeOptionIndex !== undefined &&
    currentSelected.includes(String.fromCharCode(65 + currentQuestion.negativeOptionIndex))

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setHrMode('select')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tech-500/10 border border-tech-500/20 text-tech-300 text-xs font-medium">
              <Edit3 className="w-3 h-3" />
              自主答题模式
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-display text-white mb-2">
            {POSITION_LABELS[selectedPosition!]}岗位需求画像
          </h1>
          <p className="text-slate-400 text-sm">
            通过结构化题库精准量化岗位技能要求，{totalQuestions}道题目
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span>第 {quizIndex + 1} / {totalQuestions} 题</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-tech-400" /> 已答 {answeredCount}
              </span>
              <span className="flex items-center gap-1">
                <SkipForward className="w-3.5 h-3.5 text-gold-400" /> 跳过 {skippedCount}
              </span>
            </div>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-tech-500 to-teal-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card p-8">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-tech-500/15 border border-tech-500/20 flex items-center justify-center text-sm font-bold text-tech-400">
                  {currentQuestion.id}
                </span>
                <div className="flex-1">
                  <h2 className="text-lg font-heading font-semibold text-white leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {currentQuestion.optional && (
                      <span className="text-xs text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full font-medium">
                        选做
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {currentQuestion.type === 'text'
                        ? '【开放简答题】'
                        : currentQuestion.type === 'multi'
                          ? '【可多选】'
                          : '【单选】'}
                    </span>
                  </div>
                </div>
              </div>

              {isTextQuestion ? (
                <div className="mt-4">
                  <div className="relative">
                    <textarea
                      value={currentSelected[0] || ''}
                      onChange={(e) =>
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [currentQuestion.id]: [e.target.value],
                        }))
                      }
                      placeholder="请输入你的回答（可选）..."
                      rows={6}
                      className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-200 placeholder-slate-600 focus:border-tech-500/40 focus:bg-white/[0.05] focus:outline-none resize-none transition-all text-sm leading-relaxed"
                    />
                    <Edit3 className="absolute top-3 right-3 w-4 h-4 text-slate-600" />
                  </div>
                  {currentQuestion.optional && (
                    <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      此题为选做题，回答内容将纳入人才匹配AI精排参考
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {currentQuestion.options.map((option, i) => {
                    const optionLetter = String.fromCharCode(65 + i)
                    const isSelected = currentSelected.includes(optionLetter)
                    const isNeg = i === currentQuestion.negativeOptionIndex
                    const isDisabled =
                      currentQuestion.type === 'multi' && isNegativeSelected && !isNeg

                    return (
                      <button
                        key={i}
                        onClick={() => !isDisabled && handleOptionToggle(optionLetter)}
                        disabled={isDisabled}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? isNeg
                              ? 'border-red-500/40 bg-red-500/10 text-red-300'
                              : 'border-tech-500 bg-tech-500/10 text-tech-200'
                            : isDisabled
                              ? 'border-white/5 bg-white/[0.01] text-slate-600 cursor-not-allowed'
                              : 'border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                              isSelected
                                ? isNeg
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-tech-500 text-white'
                                : 'bg-white/5 text-slate-400'
                            }`}
                          >
                            {optionLetter}
                          </span>
                          <span className="text-sm">{option.replace(/^[A-F]\.\s*/, '')}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={quizIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> 上一题
          </button>

          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-gold-400 hover:bg-gold-500/5 transition-all"
          >
            <SkipForward className="w-4 h-4" /> 跳过
          </button>

          <button
            onClick={handleNext}
            disabled={!isAnswered && currentQuestion.type !== 'text'}
            className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {quizIndex < totalQuestions - 1 ? (
              <>
                下一题 <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                提交 <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSubmitConfirm && (
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
              className="glass-card p-8 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-lg">确认提交</h3>
                  <p className="text-sm text-slate-400">提交后系统将自动生成岗位画像报告</p>
                </div>
              </div>
              <div className="space-y-2 mb-6 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>总题数</span>
                  <span>{totalQuestions} 题</span>
                </div>
                <div className="flex justify-between">
                  <span>已作答</span>
                  <span className="text-tech-400">{answeredCount} 题</span>
                </div>
                <div className="flex justify-between">
                  <span>已跳过</span>
                  <span className="text-gold-400">{skippedCount} 题</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                >
                  继续答题
                </button>
                <button onClick={handleSubmit} className="btn-primary flex-1 text-sm">
                  确认提交
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showJDModal && (
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
              className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-tech-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-tech-400" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white text-lg">岗位JD</h3>
                    <p className="text-xs text-slate-400">在线微调后保存</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJDModal(false)}
                  className="text-slate-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 p-2 bg-gold-500/5 border border-gold-500/10 rounded-lg">
                <p className="text-[11px] text-gold-400 flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  您可以直接编辑下方JD内容，修改后将自动保存
                </p>
              </div>

              <textarea
                value={editableJD}
                onChange={(e) => setEditableJD(e.target.value)}
                rows={18}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-slate-200 resize-none focus:outline-none focus:border-tech-500/50 transition-all font-mono"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setSaveFeedback(null)
                    setShowJDModal(false)
                    navigate('/result', { state: { profile: currentProfile } })
                  }}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5 disabled:opacity-40"
                >
                  跳过，查看报告
                </button>
                <button
                  onClick={async () => {
                    const profile = currentProfile
                    if (!profile) {
                      setSaveFeedback({ type: 'error', message: '画像数据丢失，请重新生成' })
                      return
                    }
                    setSaving(true)
                    setSaveFeedback(null)
                    try {
                      await syncHrJob({
                        id: String(Date.now()),
                        name: `${POSITION_LABELS[selectedPosition!]}岗位 - ${new Date().toLocaleDateString('zh-CN')}`,
                        position: selectedPosition!,
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        description: editableJD,
                        profileDoc: profile.textReport,
                        dimensions: profile.dimensions,
                        totalScore: profile.totalScore,
                        starRating: profile.starRating,
                        company: '',
                        chatMessages: [],
                      })
                      setSaveFeedback({ type: 'success', message: '保存成功！岗位已录入岗位库' })
                    } catch (e) {
                      const msg = e instanceof Error ? e.message : '保存失败'
                      setSaveFeedback({ type: 'error', message: `保存失败：${msg}` })
                    } finally {
                      setSaving(false)
                    }
                  }}
                  disabled={saving}
                  className="btn-primary flex-1 text-sm flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      正在保存...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      保存JD并录入岗位库
                    </>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {saveFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`mt-3 flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
                      saveFeedback.type === 'success'
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {saveFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 shrink-0" />
                    )}
                    {saveFeedback.message}
                    {saveFeedback.type === 'success' && (
                      <button
                        onClick={() => {
                          setShowJDModal(false)
                          setSaveFeedback(null)
                          navigate('/result', { state: { profile: currentProfile } })
                        }}
                        className="ml-auto text-xs underline text-teal-300 hover:text-teal-200 shrink-0"
                      >
                        查看报告 →
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
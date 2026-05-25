import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, QuizAnswer } from '../store/useAppStore'
import { useSync } from '../providers/SyncProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, SkipForward, CheckCircle2, Clock, AlertCircle, Edit3 } from 'lucide-react'
import { getQuestionBank } from '../data/questionBanks'
import { calculateScore, generateAnswersSummary } from '../config/scoringEngine'
import { getCurveNode, POSITION_LABELS, QuestionData } from '../config/questionBankMapping'

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

export default function QuizPage() {
  const { selectedPosition, userMode, quizAnswers, addQuizAnswer, setCurrentProfile } = useAppStore()
  const { syncQuizResults } = useSync()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string[]>>({})

  const bankEntry = useMemo(() => {
    if (!selectedPosition) return null
    return getQuestionBank(selectedPosition, userMode)
  }, [selectedPosition, userMode])

  const questions = bankEntry?.questions || []
  const scoringRules = bankEntry?.scoringRules
  const totalQuestions = questions.length
  const currentQuestion = questions[currentIndex]

  const answeredCount = quizAnswers.filter((a) => !a.skipped).length
  const skippedCount = quizAnswers.filter((a) => a.skipped).length
  const progress = totalQuestions > 0 ? ((answeredCount + skippedCount) / totalQuestions) * 100 : 0

  const currentSelected = selectedOptions[currentQuestion?.id] || []

  const getAllAnswersMap = useCallback(
    () => collectAllAnswers(selectedOptions, quizAnswers),
    [selectedOptions, quizAnswers]
  )

  useEffect(() => {
    if (!selectedPosition) {
      navigate('/select-position')
    }
  }, [selectedPosition, navigate])

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
    addQuizAnswer({ questionIndex: currentQuestion.id, answer: answerStr, skipped: false })
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
      setCurrentIndex(nextIdx)
    }
  }

  const handleSkip = () => {
    const selected = selectedOptions[currentQuestion.id]
    if (selected && selected.length > 0) {
      const answerStr = selected.sort().join(',')
      addQuizAnswer({ questionIndex: currentQuestion.id, answer: answerStr, skipped: true })
    } else {
      addQuizAnswer({ questionIndex: currentQuestion.id, answer: '', skipped: true })
    }
    goToNextVisibleQuestion(currentIndex + 1)
  }

  const handleNext = () => {
    if (currentQuestion.type === 'text') {
      const text = currentSelected[0] || ''
      if (text.trim()) {
        addQuizAnswer({ questionIndex: currentQuestion.id, answer: text, skipped: false })
      }
    } else {
      const selected = selectedOptions[currentQuestion.id]
      if (selected && selected.length > 0) {
        const answerStr = selected.sort().join(',')
        addQuizAnswer({ questionIndex: currentQuestion.id, answer: answerStr, skipped: false })
      }
    }

    if (currentIndex < totalQuestions - 1) {
      goToNextVisibleQuestion(currentIndex + 1)
    } else {
      setShowSubmitConfirm(true)
    }
  }

  const handlePrev = () => {
    saveCurrentAnswer()
    if (currentIndex > 0) {
      const allAnswers = getAllAnswersMap()
      let prevIdx = currentIndex - 1
      while (prevIdx >= 0) {
        const q = questions[prevIdx]
        if (isQuestionSkippedByRules(q.id, questions, allAnswers)) {
          prevIdx--
          continue
        }
        break
      }
      if (prevIdx >= 0) {
        setCurrentIndex(prevIdx)
      }
    }
  }

  const handleSubmit = () => {
    if (!bankEntry || !selectedPosition) return
    if (currentQuestion.type === 'text') {
      const text = currentSelected[0] || ''
      if (text.trim()) {
        addQuizAnswer({ questionIndex: currentQuestion.id, answer: text, skipped: false })
      }
    } else {
      saveCurrentAnswer()
    }

    setTimeout(async () => {
      const result = calculateScore(bankEntry.questions, bankEntry.scoringRules, quizAnswers)
      const summary = generateAnswersSummary(bankEntry.questions, quizAnswers, bankEntry.scoringRules.dimensions)
      const curveNode = getCurveNode(result.totalScore, selectedPosition)

      const q17Answer = quizAnswers.find((a) => a.questionIndex === 17 && !a.skipped && a.answer.trim())
      const q17Section = q17Answer
        ? `\n\n---\n\n### 开放题回答\n\n> ${q17Answer.answer}\n\n*此回答将作为${
            userMode === 'hr' ? 'AI精排人才匹配' : 'AI生成成长报告'
          }的重要参考。*`
        : ''

      const fullReport =
        `## ${userMode === 'hr' ? '岗位画像报告' : '人物画像报告'}\n\n` +
        `**综合得分：** ${result.totalScore}/100　　　**评级：** ${'★'.repeat(result.starRating)}${'☆'.repeat(5 - result.starRating)}\n\n` +
        `**建议职级：** ${curveNode.tag}\n\n` +
        `---\n\n` +
        `### 各维度得分\n\n` +
        result.dimensionScores
          .map(
            (d) =>
              `**${d.name}：** ${d.score}/${d.maxScore} 分  ${'★'.repeat(d.starRating)}${'☆'.repeat(5 - d.starRating)}`
          )
          .join('\n\n') +
        `\n\n---\n\n` +
        `### 维度选项总结\n\n` +
        summary +
        q17Section

      syncQuizResults(
        quizAnswers.map((a) => ({
          question_index: a.questionIndex,
          answer: a.answer,
          skipped: a.skipped,
          position: selectedPosition,
          mode: userMode,
        }))
      )

      navigate('/result', {
        state: {
          profile: {
            name: userMode === 'hr' ? `${POSITION_LABELS[selectedPosition]}岗位画像` : '匿名求职者',
            position: selectedPosition,
            mode: userMode,
            dimensions: result.dimensionScores,
            totalScore: result.totalScore,
            starRating: result.starRating,
            textReport: fullReport,
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            curveNode: curveNode.label,
          },
        },
      })
    }, 100)
  }

  if (!selectedPosition || !bankEntry || !currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400">加载中...</p>
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span>
                第 {currentIndex + 1} / {totalQuestions} 题
              </span>
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
                      此题为选做题，回答内容将纳入{
                        userMode === 'hr' ? '人才匹配AI精排' : 'AI成长报告'
                      }参考
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {currentQuestion.options.map((option, i) => {
                    const optionLetter = String.fromCharCode(65 + i)
                    const isSelected = currentSelected.includes(optionLetter)
                    const isNegative = i === currentQuestion.negativeOptionIndex
                    const isDisabled =
                      currentQuestion.type === 'multi' && isNegativeSelected && !isNegative

                    return (
                      <button
                        key={i}
                        onClick={() => !isDisabled && handleOptionToggle(optionLetter)}
                        disabled={isDisabled}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? isNegative
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
                                ? isNegative
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
            disabled={currentIndex === 0}
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
            {currentIndex < totalQuestions - 1 ? (
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
                  <p className="text-sm text-slate-400">提交后系统将自动进行评分</p>
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
    </div>
  )
}
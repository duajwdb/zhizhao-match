import { QuestionData, ScoringRules, DimensionConfig } from '../config/questionBankMapping'
import { QuizAnswer, DimensionScore } from '../store/useAppStore'

interface ScoreResult {
  dimensionScores: DimensionScore[]
  totalScore: number
  starRating: number
}

export function calculateScore(
  questions: QuestionData[],
  rules: ScoringRules,
  answers: QuizAnswer[]
): ScoreResult {
  const dimensionScores: DimensionScore[] = rules.dimensions.map((dim) => {
    const dimQuestions = questions.filter((q) => dim.questionIndices.includes(q.id))
    let dimensionRawTotal = 0
    let dimensionMaxPossible = 0

    for (const q of dimQuestions) {
      if (q.type === 'text') continue

      const answer = answers.find((a) => a.questionIndex === q.id)

      let isNegative = false
      if (answer && !answer.skipped) {
        const selectedOptionIndex = q.options.findIndex(
          (opt) => opt.startsWith(answer.answer.charAt(0) + '.') || opt === answer.answer
        )

        if (selectedOptionIndex === q.negativeOptionIndex) {
          isNegative = true
        }
      }

      if (!answer || answer.skipped || isNegative) {
        dimensionMaxPossible += getMaxPossibleScore(q, rules)
        continue
      }

      const questionScore = getQuestionScore(q, rules, answer)
      dimensionRawTotal += questionScore
      dimensionMaxPossible += getMaxPossibleScore(q, rules)
    }

    const normalizedScore =
      dimensionMaxPossible > 0
        ? Math.round((dimensionRawTotal / dimensionMaxPossible) * dim.maxScore)
        : 0

    return {
      name: dim.name,
      score: normalizedScore,
      maxScore: dim.maxScore,
      starRating: normalizedToStars(normalizedScore, dim.maxScore),
    }
  })

  const totalScore = dimensionScores.reduce((sum, d) => sum + d.score, 0)

  const finalDimensionScores = dimensionScores.map((d) => {
    if (d.name === '综合素养' && d.maxScore === 0) {
      return {
        ...d,
        score: totalScore,
        maxScore: 100,
        starRating: normalizedToStars(totalScore, 100),
      }
    }
    return d
  })

  const starRating = scoreToStars(totalScore)

  return { dimensionScores: finalDimensionScores, totalScore, starRating }
}

function getQuestionScore(
  question: QuestionData,
  rules: ScoringRules,
  answer: QuizAnswer
): number {
  if (answer.skipped) return 0
  if (question.type === 'text') return 0

  if (question.type === 'single') {
    const selectedIndex = question.options.findIndex(
      (opt) => opt.startsWith(answer.answer.charAt(0) + '.') || opt === answer.answer
    )
    if (selectedIndex < 0) return 0
    return rules.singleSelectScores[selectedIndex] ?? 0
  }

  const selectedLetters = answer.answer
    .split(',')
    .map((s) => s.trim().charAt(0).toUpperCase())
    .filter(Boolean)

  let total = 0
  for (const letter of selectedLetters) {
    const idx = letter.charCodeAt(0) - 65
    if (idx >= 0 && idx < question.options.length) {
      if (idx === question.negativeOptionIndex) return 0
      total += rules.multiSelectScores[idx] ?? 0
    }
  }

  return total
}

function getMaxPossibleScore(question: QuestionData, rules: ScoringRules): number {
  if (question.type === 'text') return 0

  if (question.type === 'single') {
    const validScores = question.options
      .map((_, i) => (i === question.negativeOptionIndex ? 0 : rules.singleSelectScores[i] ?? 0))
      .filter((s) => s > 0)
    return validScores.length > 0 ? Math.max(...validScores) : 4
  }

  let maxScore = 0
  for (let i = 0; i < question.options.length; i++) {
    if (i === question.negativeOptionIndex) continue
    maxScore += rules.multiSelectScores[i] ?? 0
  }
  return maxScore
}

function normalizedToStars(score: number, maxScore: number): number {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  if (pct >= 90) return 5
  if (pct >= 70) return 4
  if (pct >= 50) return 3
  if (pct >= 30) return 2
  return 1
}

function scoreToStars(totalScore: number): number {
  if (totalScore >= 90) return 5
  if (totalScore >= 70) return 4
  if (totalScore >= 50) return 3
  if (totalScore >= 30) return 2
  return 1
}

export function generateAnswersSummary(
  questions: QuestionData[],
  answers: QuizAnswer[],
  dimensions: DimensionConfig[]
): string {
  const sections: string[] = []

  for (const dim of dimensions) {
    const dimQuestions = questions.filter((q) => dim.questionIndices.includes(q.id))
    const lines: string[] = []
    let hasContent = false

    for (const q of dimQuestions) {
      const answer = answers.find((a) => a.questionIndex === q.id)

      if (q.type === 'text') {
        if (answer && !answer.skipped && answer.answer.trim()) {
          lines.push(`- 【选做开放题】${answer.answer}`)
          hasContent = true
        }
        continue
      }

      if (!answer || answer.skipped) continue

      const isNegative = q.negativeOptionIndex !== undefined &&
        answer.answer.includes(
          q.options[q.negativeOptionIndex].charAt(0)
        )

      if (isNegative) continue

      const selectedLetters = answer.answer
        .split(',')
        .map((s) => s.trim().charAt(0).toUpperCase())
        .filter(Boolean)

      for (const letter of selectedLetters) {
        const idx = letter.charCodeAt(0) - 65
        if (idx >= 0 && idx < q.options.length && idx !== q.negativeOptionIndex) {
          const optionText = q.options[idx].replace(/^[A-F]\.\s*/, '')
          lines.push(`- ${optionText}`)
          hasContent = true
        }
      }
    }

    if (hasContent) {
      sections.push(`### ${dim.name}\n${lines.join('\n')}`)
    } else {
      sections.push(`### ${dim.name}\n暂无相关经验`)
    }
  }

  return sections.join('\n\n')
}
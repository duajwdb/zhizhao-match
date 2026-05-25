import { UserMode, Position } from '../store/useAppStore'

export interface SkipRule {
  triggerQuestionId: number
  triggerOptionIndex?: number
  skipQuestionIds: number[]
  triggerWhenOptionNotSelected?: boolean
  requiredOptionIndices?: number[]
}

export interface QuestionData {
  id: number
  question: string
  options: string[]
  type: 'single' | 'multi' | 'text'
  dimensionIndex: number
  negativeOptionIndex?: number
  skipRule?: SkipRule
  optional?: boolean
}

export interface DimensionConfig {
  name: string
  questionIndices: number[]
  weight: number
  maxScore: number
}

export interface ScoringRules {
  dimensions: DimensionConfig[]
  multiSelectScores: Record<number, number>
  singleSelectScores: Record<number, number>
  negativeOptionScore: number
  skipScore: number
}

export interface PositionConfig {
  position: Position
  label: string
  mode: UserMode
  questions: QuestionData[]
  scoringRules: ScoringRules
  reportTemplate: string
  growthCurveFile?: string
  growthPlanTemplate?: string
}

export interface FileMapping {
  mode: UserMode
  position: Position
  questionBankFile: string
  evaluationStandardFile: string
  reportTemplateFile: string
  growthCurveFile?: string
  growthPlanTemplateFile?: string
}

const FILE_MAPPINGS: FileMapping[] = [
  {
    mode: 'jobseeker',
    position: 'ai_engineer',
    questionBankFile: '3_1AI工程师/3_1_1AI工程师求职者端/3_1_1_1AI工程师求职者端题库.md',
    evaluationStandardFile: '3_1AI工程师/3_1_1AI工程师求职者端/3_1_1_2AI工程师求职者端 _评价标准.md',
    reportTemplateFile: '3_1AI工程师/3_1_1AI工程师求职者端/3_1_1_3AI工程师求职者端 _报告模板.md',
    growthCurveFile: '3_1AI工程师/AI工程师成长曲线.html',
    growthPlanTemplateFile: '3_1AI工程师/3_1_4AI工程师成长 .md',
  },
  {
    mode: 'hr',
    position: 'ai_engineer',
    questionBankFile: '3_1AI工程师/3_1_2AI工程师求HR端/3_1_2_1AI工程师HR端题库.md',
    evaluationStandardFile: '3_1AI工程师/3_1_2AI工程师求HR端/3_1_2_2AI工程师HR端_评价标准.md',
    reportTemplateFile: '3_1AI工程师/3_1_2AI工程师求HR端/3_1_2_3AI工程师HR端_报告模板.md',
  },
  {
    mode: 'student',
    position: 'ai_engineer',
    questionBankFile: '3_1AI工程师/3_1_3AI工程师大学生端/3_1_3_1AI工程师大学生端题库.md',
    evaluationStandardFile: '3_1AI工程师/3_1_3AI工程师大学生端/3_1_3_2AI工程师大学生端 _评价标准.md',
    reportTemplateFile: '3_1AI工程师/3_1_3AI工程师大学生端/3_1_3_3AI工程师大学生端 _报告模板.md',
    growthCurveFile: '3_1AI工程师/AI工程师成长曲线.html',
    growthPlanTemplateFile: '3_1AI工程师/3_1_4AI工程师成长 .md',
  },
  {
    mode: 'jobseeker',
    position: '3d_modeler',
    questionBankFile: '3_23D建模师/3_2_1 3D建模师求职者端/3_2_1_13D建模师求职者端题库.md',
    evaluationStandardFile: '3_23D建模师/3_2_1 3D建模师求职者端/3_2_1_23D建模师求职者端评价标准.md',
    reportTemplateFile: '3_23D建模师/3_2_1 3D建模师求职者端/3_2_1_33D建模师求职者端报告模板.md',
    growthCurveFile: '3_23D建模师/3D建模师成长曲线.html',
    growthPlanTemplateFile: '3_23D建模师/3_2_43D建模师成长.md',
  },
  {
    mode: 'hr',
    position: '3d_modeler',
    questionBankFile: '3_23D建模师/3_2_2 3D建模师HR端/3_2_2_13D建模师HR题库.md',
    evaluationStandardFile: '3_23D建模师/3_2_2 3D建模师HR端/3_2_2_23D建模师HR评价标准.md',
    reportTemplateFile: '3_23D建模师/3_2_2 3D建模师HR端/3_2_2_33D建模师HR报告模板.md',
  },
  {
    mode: 'student',
    position: '3d_modeler',
    questionBankFile: '3_23D建模师/3_2_3 3D建模师大学生端/3_2_3_13D建模师大学生端题库.md',
    evaluationStandardFile: '3_23D建模师/3_2_3 3D建模师大学生端/3_2_3_23D建模师大学生端评价标准.md',
    reportTemplateFile: '3_23D建模师/3_2_3 3D建模师大学生端/3_2_3_33D建模师大学生端报告模板.md',
    growthCurveFile: '3_23D建模师/3D建模师成长曲线.html',
    growthPlanTemplateFile: '3_23D建模师/3_2_43D建模师成长.md',
  },
]

export function getFileMapping(mode: UserMode, position: Position): FileMapping | undefined {
  return FILE_MAPPINGS.find(m => m.mode === mode && m.position === position)
}

export function getAllMappings(): FileMapping[] {
  return FILE_MAPPINGS
}

export const POSITION_LABELS: Record<Position, string> = {
  ai_engineer: 'AI工程师',
  '3d_modeler': '3D建模师',
}

export const MODE_LABELS: Record<UserMode, string> = {
  jobseeker: '求职者',
  student: '大学生',
  hr: 'HR',
}

export const AI_ENGINEER_CURVE_NODES = [
  { min: 0, max: 20, label: 'AI基础认知期', tag: 'AI探索者' },
  { min: 21, max: 45, label: 'AI应用开发期', tag: 'AI应用开发者' },
  { min: 46, max: 70, label: 'AI工程化期', tag: 'AI工程实践者' },
  { min: 71, max: 100, label: 'AI架构深耕期', tag: 'AI技术领航者' },
]

export const MODELER_CURVE_NODES = [
  { min: 0, max: 20, label: '建模入门期', tag: '3D初学者' },
  { min: 21, max: 45, label: '建模成长期', tag: '3D实践者' },
  { min: 46, max: 70, label: '建模精进期', tag: '3D专业者' },
  { min: 71, max: 100, label: '建模专家期', tag: '3D艺术家' },
]

export const CURVE_NODE_MAP: Record<Position, Array<{ min: number; max: number; label: string; tag: string }>> = {
  ai_engineer: AI_ENGINEER_CURVE_NODES,
  '3d_modeler': MODELER_CURVE_NODES,
}

export function getCurveNode(score: number, position: Position): { label: string; tag: string; stageIndex: number } {
  const nodes = position === 'ai_engineer' ? AI_ENGINEER_CURVE_NODES : MODELER_CURVE_NODES
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (score >= nodes[i].min) {
      return { label: nodes[i].label, tag: nodes[i].tag, stageIndex: i }
    }
  }
  return { label: nodes[0].label, tag: nodes[0].tag, stageIndex: 0 }
}
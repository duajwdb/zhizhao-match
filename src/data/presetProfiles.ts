import type { ProfileData, JobData, Position, UserMode, DimensionScore } from '../store/useAppStore'
import { AI_DIMENSION_NAMES, AI_DIMENSION_MAX, MODELER_DIMENSION_NAMES, MODELER_DIMENSION_MAX } from './seedData'

function makeDimensions(names: string[], maxScores: number[], scores: number[]): DimensionScore[] {
  return names.map((name, i) => ({
    name,
    score: scores[i],
    maxScore: maxScores[i],
    starRating: Math.round(((scores[i] / maxScores[i]) * 5) * 10) / 10,
  }))
}

function calcTotal(scoresArr: number[]): number {
  return scoresArr.reduce((a, b) => a + b, 0)
}

function calcStar(totalScore: number): number {
  return Math.round((totalScore / 100) * 5 * 10) / 10
}

function dateStr(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  return d.toISOString().replace('T', ' ').substring(0, 19)
}

export interface PresetProfileData extends ProfileData {
  isPreset: true
  presetId: string
}

export interface PresetJobData extends JobData {
  isPreset: true
  presetId: string
}

const AI_NAMES = AI_DIMENSION_NAMES
const AI_MAX = AI_DIMENSION_MAX
const M3D_NAMES = MODELER_DIMENSION_NAMES
const M3D_MAX = MODELER_DIMENSION_MAX

// ============================================================
//  求职者 (Jobseeker) 6个预设画像
// ============================================================

// AI Engineer 求职者
const aiJobseekerLowScores = [4, 10, 7, 4, 3, 2]
const aiJobseekerMidScores = [10, 20, 20, 7, 7, 3]
const aiJobseekerHighScores = [14, 27, 27, 9, 8, 5]

// 3D Modeler 求职者
const m3dJobseekerLowScores = [5, 7, 4, 3, 3, 4, 1]
const m3dJobseekerMidScores = [14, 18, 10, 7, 7, 11, 2]
const m3dJobseekerHighScores = [19, 23, 14, 9, 9, 14, 4]

// ============================================================
//  大学生 (Student) 6个预设画像
// ============================================================

const aiStudentLowScores = [3, 6, 4, 3, 2, 1]
const aiStudentMidScores = [8, 15, 12, 6, 6, 2]
const aiStudentHighScores = [12, 22, 20, 7, 7, 3]

const m3dStudentLowScores = [4, 5, 3, 2, 2, 3, 0]
const m3dStudentMidScores = [10, 12, 7, 5, 5, 8, 1]
const m3dStudentHighScores = [16, 18, 11, 7, 7, 12, 2]

// ============================================================
//  HR 岗位 (HR JobData) 6个预设画像
// ============================================================

const aiHrLowScores = [5, 10, 8, 4, 3, 0]
const aiHrMidScores = [10, 20, 20, 6, 6, 2]
const aiHrHighScores = [14, 28, 26, 9, 8, 4]

const m3dHrLowScores = [8, 6, 4, 3, 2, 4, 0]
const m3dHrMidScores = [14, 16, 10, 7, 6, 10, 1]
const m3dHrHighScores = [18, 23, 14, 9, 9, 14, 4]

// ============================================================
//  辅助函数
// ============================================================

function jobseekerProfile(
  name: string, pos: Position, dimNames: string[], dimMax: number[],
  scores: number[], level: string, skillDesc: string, dateOffset: number, curveNode: string
): ProfileData {
  const dims = makeDimensions(dimNames, dimMax, scores)
  return {
    name: `【预设】${name}`,
    position: pos,
    mode: 'jobseeker',
    dimensions: dims,
    totalScore: calcTotal(scores),
    starRating: calcStar(calcTotal(scores)),
    textReport: `【求职者·${pos === 'ai_engineer' ? 'AI工程师' : '3D建模师'}·${level}级】${skillDesc}`,
    date: dateStr(dateOffset),
    curveNode,
  }
}

function studentProfile(
  name: string, pos: Position, dimNames: string[], dimMax: number[],
  scores: number[], level: string, skillDesc: string, dateOffset: number, curveNode: string
): ProfileData {
  const dims = makeDimensions(dimNames, dimMax, scores)
  return {
    name: `【预设】${name}`,
    position: pos,
    mode: 'student',
    dimensions: dims,
    totalScore: calcTotal(scores),
    starRating: calcStar(calcTotal(scores)),
    textReport: `【大学生·${pos === 'ai_engineer' ? 'AI工程师' : '3D建模师'}·${level}级】${skillDesc}`,
    date: dateStr(dateOffset),
    curveNode,
  }
}

function hrJob(
  name: string, pos: Position, dimNames: string[], dimMax: number[],
  scores: number[], level: string, company: string, jd: string, dateOffset: number
): JobData {
  const dims = makeDimensions(dimNames, dimMax, scores)
  return {
    id: `preset_hr_${pos}_${level}`,
    name: `【预设】${name}`,
    position: pos,
    status: 'active',
    createdAt: dateStr(dateOffset),
    description: jd.substring(0, 100),
    profileDoc: jd,
    dimensions: dims,
    totalScore: calcTotal(scores),
    starRating: calcStar(calcTotal(scores)),
    company,
    chatMessages: [],
  }
}

// ============================================================
//  角色姓名池（具有多样性和独特性）
// ============================================================

const JS_AI_NAMES = ['张铭远', '吴思睿', '何子帆']
const JS_M3D_NAMES = ['陈卓然', '徐佳桐', '方俊昊']
const ST_AI_NAMES = ['刘雨辰', '沈雪瑶', '王敬轩']
const ST_M3D_NAMES = ['赵明哲', '林小雅', '韩宇阳']
const HR_COMPANIES = ['星途科技', '锦程数字', '鑫创未来', '卓望互娱', '千寻智能', '中科智造']

// 技能描述
const JS_AI_SKILLS = {
  low: '具备Python和PyTorch基础，可独立完成数据预处理和简单模型训练，对NLP和CV技术有初步了解，正在通过项目实战积累工程经验',
  mid: '精通Transformer架构微调，熟练使用LangChain构建RAG系统，参与过2个企业级智能问答项目交付，具备模型量化部署经验',
  high: '全栈AI工程师，主导过百万用户级推荐系统升级，精通大模型SFT/RLHF全流程，发表过顶会论文，具备团队技术领导力',
}

const JS_M3D_SKILLS = {
  low: '掌握Blender基础建模与展UV，能独立制作简单道具和场景元素，了解PBR材质流程，正在学习ZBrush数字雕刻',
  mid: '熟练Maya与Substance Painter全流程，擅长硬表面建模与材质表现，参与过手游角色资产制作，熟悉UE5引擎导入规范',
  high: '资深角色建模师，精通ZBrush高模雕刻与精细拓扑，主导过3A项目角色管线，擅长面部微表情建模与毛发系统',
}

const ST_AI_SKILLS = {
  low: '在校生，学过Python基础与吴恩达机器学习课程，能用Jupyter完成简单数据分析，对AI方向有浓厚兴趣但项目经验有限',
  mid: '计算机专业大四在读，熟练PyTorch框架，参加过Kaggle竞赛并获铜牌，有大模型API调用和Prompt工程实践经验',
  high: '研究生在读，研究方向为多模态大模型，参与导师国家基金项目，有2篇会议论文在审，在头部AI公司实习过6个月',
}

const ST_M3D_SKILLS = {
  low: '大一新生，美术基础较好，刚接触Blender建模，完成过简单卡通角色制作，对3D行业充满热情，正在系统学习中',
  mid: '数字媒体专业大三，熟练Blender和Substance Painter操作，有独立完成道具和场景模型的经验，参加校内3D设计大赛获奖',
  high: '美院交互设计研究生，精通Maya+ZBrush角色全流程，有独立游戏3D资产制作经验，作品曾在798展出，实习于知名游戏工作室',
}

const HR_JD = {
  ai_low: '招聘初级AI应用开发工程师，主要工作为调用公司AI中台大模型API，开发智能问答和文本分析应用。要求：应届或1年以内经验，熟练Python，了解Prompt工程，有完整项目demo优先',
  ai_mid: '招聘NLP算法工程师，负责智能客服与文档问答的模型研发。要求：2年以上NLP经验，精通BERT/GPT微调，有RAG系统搭建经验，能独立完成从需求分析到模型上线的全流程',
  ai_high: '招聘资深大模型算法工程师，负责百亿参数级模型SFT微调与RLHF对齐，主导模型迭代方向。要求：3年以上LLM研发经验，精通DeepSpeed/分布式训练，有从0到1预训练经历优先',
  m3d_low: '招聘初级3D建模师，协助主美完成游戏中低模道具与场景配件制作，按规范整理文件并提交版本管理。要求：应届或1年以内经验，熟练Blender/3ds Max基础操作，了解PBR流程，学习意愿强',
  m3d_mid: '招聘3D场景地编，使用UE5搭建开放世界场景，负责地形编辑与光照氛围营造。要求：2年以上地编经验，熟练World Creator/SpeedTree，具备良好的构图与色彩把控力',
  m3d_high: '招聘资深角色模型师，负责游戏主角高模雕刻与拓扑，输出高品质PBR资产。要求：3年以上角色制作经验，精通ZBrush/Maya/Substance，有完整3A或大型手游项目经历',
}

// ============================================================
//  导出：18个预设画像
// ============================================================

export const PRESET_JOBSEEKER_PROFILES: ProfileData[] = [
  jobseekerProfile(JS_AI_NAMES[0], 'ai_engineer', AI_NAMES, AI_MAX, aiJobseekerLowScores, '初级', JS_AI_SKILLS.low, 14, '101'),
  jobseekerProfile(JS_AI_NAMES[1], 'ai_engineer', AI_NAMES, AI_MAX, aiJobseekerMidScores, '中级', JS_AI_SKILLS.mid, 10, '102'),
  jobseekerProfile(JS_AI_NAMES[2], 'ai_engineer', AI_NAMES, AI_MAX, aiJobseekerHighScores, '高级', JS_AI_SKILLS.high, 6, '103'),
  jobseekerProfile(JS_M3D_NAMES[0], '3d_modeler', M3D_NAMES, M3D_MAX, m3dJobseekerLowScores, '初级', JS_M3D_SKILLS.low, 13, '111'),
  jobseekerProfile(JS_M3D_NAMES[1], '3d_modeler', M3D_NAMES, M3D_MAX, m3dJobseekerMidScores, '中级', JS_M3D_SKILLS.mid, 9, '112'),
  jobseekerProfile(JS_M3D_NAMES[2], '3d_modeler', M3D_NAMES, M3D_MAX, m3dJobseekerHighScores, '高级', JS_M3D_SKILLS.high, 5, '113'),
]

export const PRESET_STUDENT_PROFILES: ProfileData[] = [
  studentProfile(ST_AI_NAMES[0], 'ai_engineer', AI_NAMES, AI_MAX, aiStudentLowScores, '初级', ST_AI_SKILLS.low, 15, '201'),
  studentProfile(ST_AI_NAMES[1], 'ai_engineer', AI_NAMES, AI_MAX, aiStudentMidScores, '中级', ST_AI_SKILLS.mid, 11, '202'),
  studentProfile(ST_AI_NAMES[2], 'ai_engineer', AI_NAMES, AI_MAX, aiStudentHighScores, '高级', ST_AI_SKILLS.high, 7, '203'),
  studentProfile(ST_M3D_NAMES[0], '3d_modeler', M3D_NAMES, M3D_MAX, m3dStudentLowScores, '初级', ST_M3D_SKILLS.low, 14, '211'),
  studentProfile(ST_M3D_NAMES[1], '3d_modeler', M3D_NAMES, M3D_MAX, m3dStudentMidScores, '中级', ST_M3D_SKILLS.mid, 10, '212'),
  studentProfile(ST_M3D_NAMES[2], '3d_modeler', M3D_NAMES, M3D_MAX, m3dStudentHighScores, '高级', ST_M3D_SKILLS.high, 6, '213'),
]

export const PRESET_HR_JOBS: JobData[] = [
  hrJob(`${HR_COMPANIES[0]}·初级AI开发`, 'ai_engineer', AI_NAMES, AI_MAX, aiHrLowScores, '初级', HR_COMPANIES[0], HR_JD.ai_low, 12),
  hrJob(`${HR_COMPANIES[1]}·NLP工程师`, 'ai_engineer', AI_NAMES, AI_MAX, aiHrMidScores, '中级', HR_COMPANIES[1], HR_JD.ai_mid, 8),
  hrJob(`${HR_COMPANIES[2]}·资深大模型`, 'ai_engineer', AI_NAMES, AI_MAX, aiHrHighScores, '高级', HR_COMPANIES[2], HR_JD.ai_high, 4),
  hrJob(`${HR_COMPANIES[3]}·初级3D建模`, '3d_modeler', M3D_NAMES, M3D_MAX, m3dHrLowScores, '初级', HR_COMPANIES[3], HR_JD.m3d_low, 11),
  hrJob(`${HR_COMPANIES[4]}·场景地编`, '3d_modeler', M3D_NAMES, M3D_MAX, m3dHrMidScores, '中级', HR_COMPANIES[4], HR_JD.m3d_mid, 7),
  hrJob(`${HR_COMPANIES[5]}·资深角色`, '3d_modeler', M3D_NAMES, M3D_MAX, m3dHrHighScores, '高级', HR_COMPANIES[5], HR_JD.m3d_high, 3),
]

export function getPresetProfilesByMode(mode: UserMode): ProfileData[] {
  switch (mode) {
    case 'jobseeker': return [...PRESET_JOBSEEKER_PROFILES]
    case 'student': return [...PRESET_STUDENT_PROFILES]
    default: return []
  }
}

export function getPresetHrJobs(): JobData[] {
  return [...PRESET_HR_JOBS]
}

export { AI_NAMES, AI_MAX, M3D_NAMES, M3D_MAX }
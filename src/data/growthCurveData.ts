export interface CurveNodeData {
  node: number
  time: number
  stage: number
  total: number
  [key: string]: number | string
  milestone: string
}

export interface CurveDimension {
  key: string
  label: string
}

export const AI_ENGINEER_CURVE_DATA: CurveNodeData[] = [
  { node: 1, time: 0, stage: 1, total: 0, theory: 0, aiCore: 0, engineering: 0, scenario: 0, compliance: 0, innovation: 0, milestone: '起点' },
  { node: 2, time: 1, stage: 1, total: 10, theory: 15.0, aiCore: 7.5, engineering: 2.5, scenario: 5.0, compliance: 7.5, innovation: 2.5, milestone: '完成第一个AI API调用项目' },
  { node: 3, time: 2, stage: 1, total: 20, theory: 30.0, aiCore: 15.0, engineering: 5.0, scenario: 10.0, compliance: 15.0, innovation: 5.0, milestone: '' },
  { node: 4, time: 4, stage: 2, total: 30, theory: 39.4, aiCore: 26.3, engineering: 16.3, scenario: 17.5, compliance: 22.5, innovation: 8.8, milestone: '' },
  { node: 5, time: 6, stage: 2, total: 40, theory: 49.8, aiCore: 38.8, engineering: 28.8, scenario: 25.8, compliance: 30.8, innovation: 12.9, milestone: '' },
  { node: 6, time: 8, stage: 2, total: 45, theory: 55.0, aiCore: 50.0, engineering: 35.0, scenario: 30.0, compliance: 35.0, innovation: 15.0, milestone: '项目实现Docker化部署' },
  { node: 7, time: 10, stage: 3, total: 50, theory: 57.5, aiCore: 54.2, engineering: 40.0, scenario: 34.2, compliance: 38.3, innovation: 17.5, milestone: '' },
  { node: 8, time: 12, stage: 3, total: 60, theory: 63.8, aiCore: 61.7, engineering: 50.0, scenario: 42.9, compliance: 45.8, innovation: 22.5, milestone: '完整MLOps管道建立' },
  { node: 9, time: 15, stage: 3, total: 65, theory: 66.9, aiCore: 65.4, engineering: 55.0, scenario: 47.1, compliance: 49.6, innovation: 25.0, milestone: '' },
  { node: 10, time: 18, stage: 3, total: 70, theory: 70.0, aiCore: 70.0, engineering: 65.0, scenario: 55.0, compliance: 55.0, innovation: 30.0, milestone: '主导首个AI项目交付' },
  { node: 11, time: 21, stage: 4, total: 75, theory: 72.1, aiCore: 72.8, engineering: 68.6, scenario: 58.6, compliance: 58.6, innovation: 34.1, milestone: '' },
  { node: 12, time: 24, stage: 4, total: 80, theory: 74.7, aiCore: 75.9, engineering: 72.4, scenario: 62.8, compliance: 62.8, innovation: 38.6, milestone: '成为团队AI技术骨干' },
  { node: 13, time: 30, stage: 4, total: 90, theory: 79.8, aiCore: 82.1, engineering: 80.2, scenario: 71.0, compliance: 71.0, innovation: 47.6, milestone: '' },
  { node: 14, time: 36, stage: 4, total: 95, theory: 82.4, aiCore: 86.0, engineering: 84.1, scenario: 75.5, compliance: 75.5, innovation: 53.8, milestone: '负责系统架构设计' },
  { node: 15, time: 48, stage: 4, total: 100, theory: 85.0, aiCore: 90.0, engineering: 90.0, scenario: 80.0, compliance: 80.0, innovation: 60.0, milestone: '达到AI架构师水平' },
]

export const AI_ENGINEER_DIMENSIONS: CurveDimension[] = [
  { key: 'total', label: '总分' },
  { key: 'theory', label: '基础理论' },
  { key: 'aiCore', label: 'AI核心' },
  { key: 'engineering', label: '工程落地' },
  { key: 'scenario', label: '场景转化' },
  { key: 'compliance', label: '合规软技能' },
  { key: 'innovation', label: '前沿创新' },
]

export const MODELER_CURVE_DATA: CurveNodeData[] = [
  { node: 1, time: 0, stage: 1, total: 0, software: 0, modeling: 0, uv: 0, art: 0, render: 0, project: 0, animation: 0, milestone: '起点' },
  { node: 2, time: 1, stage: 1, total: 8, software: 15, modeling: 5, uv: 2, art: 8, render: 3, project: 2, animation: 1, milestone: '完成软件安装与界面熟悉' },
  { node: 3, time: 2, stage: 1, total: 15, software: 30, modeling: 15, uv: 10, art: 20, render: 12, project: 8, animation: 5, milestone: '' },
  { node: 4, time: 3, stage: 1, total: 22, software: 45, modeling: 28, uv: 22, art: 32, render: 26, project: 18, animation: 10, milestone: '通过官方初级技能等级考核' },
  { node: 5, time: 4, stage: 2, total: 30, software: 55, modeling: 38, uv: 33, art: 42, render: 37, project: 26, animation: 15, milestone: '' },
  { node: 6, time: 5, stage: 2, total: 37, software: 63, modeling: 48, uv: 42, art: 50, render: 45, project: 35, animation: 20, milestone: '参与商业外包/校内项目基础资产制作' },
  { node: 7, time: 6, stage: 2, total: 44, software: 70, modeling: 58, uv: 50, art: 55, render: 53, project: 45, animation: 22, milestone: '完成第一套个人3D作品集' },
  { node: 8, time: 9, stage: 2, total: 51, software: 74, modeling: 64, uv: 56, art: 60, render: 59, project: 52, animation: 25, milestone: '与团队配合完成全流程虚拟项目' },
  { node: 9, time: 12, stage: 3, total: 58, software: 78, modeling: 68, uv: 62, art: 65, render: 64, project: 58, animation: 28, milestone: '获得首份3D相关实习/兼职' },
  { node: 10, time: 15, stage: 3, total: 66, software: 82, modeling: 73, uv: 68, art: 70, render: 69, project: 64, animation: 32, milestone: '' },
  { node: 11, time: 18, stage: 3, total: 73, software: 85, modeling: 78, uv: 73, art: 74, render: 73, project: 70, animation: 35, milestone: '掌握多款DCC软件协同' },
  { node: 12, time: 21, stage: 3, total: 80, software: 88, modeling: 83, uv: 79, art: 78, render: 78, project: 77, animation: 38, milestone: '带领小组解决复杂建模难题' },
  { node: 13, time: 24, stage: 4, total: 88, software: 92, modeling: 88, uv: 85, art: 83, render: 84, project: 84, animation: 42, milestone: '明确个人细分领域' },
  { node: 14, time: 30, stage: 4, total: 95, software: 96, modeling: 93, uv: 91, art: 90, render: 91, project: 91, animation: 48, milestone: '受邀进行行业分享' },
  { node: 15, time: 36, stage: 4, total: 100, software: 100, modeling: 100, uv: 100, art: 100, render: 100, project: 100, animation: 55, milestone: '达到高级/资深专业水准' },
]

export const MODELER_DIMENSIONS: CurveDimension[] = [
  { key: 'total', label: '总分' },
  { key: 'software', label: '软件操作' },
  { key: 'modeling', label: '建模技术' },
  { key: 'uv', label: 'UV纹理' },
  { key: 'art', label: '美术素养' },
  { key: 'render', label: '渲染光照' },
  { key: 'project', label: '项目实践' },
  { key: 'animation', label: '动画绑定' },
]

export function getCurveData(position: 'ai_engineer' | '3d_modeler'): CurveNodeData[] {
  return position === 'ai_engineer' ? AI_ENGINEER_CURVE_DATA : MODELER_CURVE_DATA
}

export function getCurveDimensions(position: 'ai_engineer' | '3d_modeler'): CurveDimension[] {
  return position === 'ai_engineer' ? AI_ENGINEER_DIMENSIONS : MODELER_DIMENSIONS
}

export function interpolateCurvePosition(
  curveData: CurveNodeData[],
  totalScore: number
): { x: number; y: number; nodeIndex: number } | null {
  if (totalScore <= 0) return { x: 0, y: 0, nodeIndex: 0 }

  for (let i = 1; i < curveData.length; i++) {
    if (totalScore <= curveData[i].total) {
      const prev = curveData[i - 1]
      const curr = curveData[i]
      const ratio = (totalScore - prev.total) / (curr.total - prev.total)
      return {
        x: prev.time + (curr.time - prev.time) * ratio,
        y: totalScore,
        nodeIndex: i,
      }
    }
  }

  const last = curveData[curveData.length - 1]
  return { x: last.time, y: last.total, nodeIndex: curveData.length - 1 }
}
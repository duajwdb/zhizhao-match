const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const MODEL_NAME = 'deepseek-v4-flash'

export async function callDeepSeek(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7
): Promise<string> {
  if (!apiKey) {
    throw new Error('API Key 未配置，请在页面顶部设置 DeepSeek API Key')
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`DeepSeek API 调用失败 (${response.status}): ${errorBody}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('DeepSeek API 返回内容为空')
  }

  return content
}

export function buildPortraitPrompt(
  positionLabel: string,
  dimensionResults: Array<{ name: string; score: number; maxScore: number; starRating: number }>,
  totalScore: number,
  answersSummary: string
): { system: string; user: string } {
  return {
    system: `你是一个专业的职业能力评估专家。请根据用户的技能测评数据，生成一份标准化的技能画像报告。

报告格式要求（使用 Markdown）：
## 能力总览
- 用一段话概括候选人的整体能力水平和特点

## 各维度详细分析
- 对每个维度进行分析，说明强项和待提升项

## 职业发展建议
- 给出2-3条针对性的职业发展建议

请用中文输出，语言专业、客观、有建设性。`,
    user: `岗位：${positionLabel}
综合得分：${totalScore}/100

各维度得分：
${dimensionResults.map((d) => `- ${d.name}：${d.score}/${d.maxScore} 分（${'★'.repeat(d.starRating)}${'☆'.repeat(5 - d.starRating)}）`).join('\n')}

答题详情：
${answersSummary}`,
  }
}

export function buildGrowthPlanPrompt(
  positionLabel: string,
  curveNode: string,
  totalScore: number,
  dimensionResults: Array<{ name: string; score: number; maxScore: number; starRating: number }>,
  gapAnalysis: string
): { system: string; user: string } {
  return {
    system: `你是一个职业成长规划师。请根据用户的技能数据和成长曲线位置，生成一份专业的成长规划报告。

报告格式要求（使用 Markdown）：
## 当前定位
- 分析用户当前所处的阶段和特点

## 优先提升维度
- 列出最需要提升的2-3个维度，并给出具体建议

## 学习资源推荐
- 针对薄弱维度推荐学习路径

## 实践项目建议
- 给出1-2个具体的实践项目方向

## 时间规划
- 给出合理的阶段目标和时间节点

请用中文输出，建议具体可操作。`,
    user: `岗位：${positionLabel}
当前阶段：${curveNode}
综合得分：${totalScore}/100

各维度得分：
${dimensionResults.map((d) => `- ${d.name}：${d.score}/${d.maxScore} 分`).join('\n')}

差距分析：
${gapAnalysis}`,
  }
}

export function buildJDPrompt(
  positionLabel: string,
  dimensionResults: Array<{ name: string; score: number; maxScore: number; starRating: number }>,
  contextInfo: string
): { system: string; user: string } {
  return {
    system: `你是一个资深HR，擅长撰写专业的岗位JD（职位描述）。

JD 格式要求（使用 Markdown）：
## 岗位概述
- 简要描述岗位在团队中的角色和价值

## 核心职责
- 列出3-5项核心工作职责

## 任职要求
### 硬性技能
- 根据维度分析列出具体的技术要求

### 软性素质
- 列出沟通、协作等软性要求

## 加分项
- 列出2-3个加分项目

## 我们提供
- 简要描述公司提供的平台和发展机会

请用中文输出，JD要专业、具体、有吸引力。`,
    user: `岗位名称：${positionLabel}

需求背景：
${contextInfo || '标准岗位需求'}

各维度需求强度：
${dimensionResults.map((d) => `- ${d.name}：${d.score}/${d.maxScore} 分（需求等级：${'★'.repeat(d.starRating)}${'☆'.repeat(5 - d.starRating)}）`).join('\n')}

请生成一份用于招聘发布的完整岗位JD。`,
  }
}

export function buildHRProxyPrompt(
  positionLabel: string,
  jobDescription: string,
  questionList: string,
  dialogueContext?: { title: string; content: string }[]
): { system: string; user: string } {
  const dialogueSection = dialogueContext && dialogueContext.some((d) => d.content.trim())
    ? `\n\n四阶段需求引导信息：\n${dialogueContext
        .filter((d) => d.content.trim())
        .map((d) => `【${d.title}】${d.content.trim()}`)
        .join('\n')}`
    : ''

  return {
    system: `你是一个资深的HRBP，需要根据岗位描述信息，模拟完成一份岗位需求测评问卷。

请对以下每个问题，从给出的选项中选择最合适的答案。你只需要输出问题和答案的对应关系，格式如下：

Q1: A
Q2: B, C
Q3: D
...

注意：
- 如果问题是单选，只输出一个字母
- 如果问题是多选，用逗号分隔多个字母
- 不要输出任何解释，只输出问题和答案的对应关系
- 如果某个问题无法根据描述判断，选择最合理的选项`,
    user: `岗位：${positionLabel}

岗位描述：
${jobDescription}${dialogueSection}

测评问题列表：
${questionList}`,
  }
}
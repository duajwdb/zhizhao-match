import { QuestionData, ScoringRules } from '../config/questionBankMapping'

interface QuestionBankEntry {
  questions: QuestionData[]
  scoringRules: ScoringRules
}

interface AllBanks {
  ai_engineer_jobseeker: QuestionBankEntry
  ai_engineer_student: QuestionBankEntry
  ai_engineer_hr: QuestionBankEntry
  modeler_jobseeker: QuestionBankEntry
  modeler_student: QuestionBankEntry
  modeler_hr: QuestionBankEntry
}

const banks: AllBanks = {
  ai_engineer_jobseeker: {
    questions: [
      {
        id: 1, type: 'multi', dimensionIndex: 0,
        question: '你对以下哪些数学工具感到熟悉？',
        options: ['A. 矩阵运算与特征值分解', 'B. 贝叶斯定理与交叉熵', 'C. 梯度下降及其变体的数学推导', 'D. 以上均不熟悉'],
        negativeOptionIndex: 3,
      },
      {
        id: 2, type: 'multi', dimensionIndex: 0,
        question: '在项目中，你能准确解释以下哪个模型的底层机制？',
        options: ['A. Transformer的自注意力计算过程', 'B. CNN的卷积核如何提取空间特征', 'C. LSTM的门控机制与梯度流动', 'D. 扩散模型的前向与逆向过程', 'E. 以上均不熟悉'],
        negativeOptionIndex: 4,
        skipRule: { triggerQuestionId: 1, triggerOptionIndex: 3, skipQuestionIds: [2] },
      },
      {
        id: 3, type: 'multi', dimensionIndex: 1,
        question: '你使用过以下哪些预训练模型系列？',
        options: ['A. BERT/RoBERTa', 'B. GPT系列（含ChatGPT等API）', 'C. LLaMA/通义千问等开源大模型', 'D. CLIP等多模态模型', 'E. 以上均未使用过'],
        negativeOptionIndex: 4,
      },
      {
        id: 4, type: 'multi', dimensionIndex: 1,
        question: '在你最熟悉的一个模型上，你进行过以下哪些操作？',
        options: ['A. 使用官方API进行文本生成', 'B. 使用私有数据对模型进行全量微调', 'C. 使用LoRA等轻量级微调技术进行适配', 'D. 从零开始预训练一个类似模型', 'E. 以上均未进行过'],
        negativeOptionIndex: 4,
        skipRule: { triggerQuestionId: 3, triggerOptionIndex: 4, skipQuestionIds: [4, 5] },
      },
      {
        id: 5, type: 'multi', dimensionIndex: 1,
        question: '你是否有过以下AI Agent或强化学习的实际开发经验？',
        options: ['A. 设计过简单的单Agent对话流程（如客服机器人）', 'B. 开发过多Agent协作系统，并解决过状态同步问题', 'C. 使用PPO/DPO等算法进行过大模型偏好对齐', 'D. 以上均无'],
        negativeOptionIndex: 3,
      },
      {
        id: 6, type: 'multi', dimensionIndex: 2,
        question: '你能够熟练使用哪些编程语言或框架进行AI开发？',
        options: ['A. Python + PyTorch', 'B. Python + TensorFlow/Keras', 'C. C++ 并有AI部署经验', 'D. Go/Java等后端语言并有AI集成经验', 'E. 目前仅能使用Notebook完成简单实验'],
        negativeOptionIndex: 4,
      },
      {
        id: 7, type: 'single', dimensionIndex: 2,
        question: '针对你最精通的一门语言，你进行过以下哪种程度的工程化工作？',
        options: ['A. 写过脚本，但未进行过系统开发', 'B. 参与过完整后端服务的开发，但AI模块是独立调用的', 'C. 独立负责过一个AI模块的生产级部署（含Docker化）', 'D. 主导过大型分布式AI系统的架构设计', 'E. 上述均不符合我的情况'],
        negativeOptionIndex: 4,
      },
      {
        id: 8, type: 'multi', dimensionIndex: 2,
        question: '在模型部署环节，你实际落地过以下哪些技术？',
        options: ['A. 模型量化（如INT8量化）以降低推理延迟', 'B. 使用ONNX/TensorRT进行推理加速', 'C. 搭建过完整的MLOps pipeline（CI/CD for ML）', 'D. 以上均未实际落地，仅了解概念'],
        negativeOptionIndex: 3,
      },
      {
        id: 9, type: 'multi', dimensionIndex: 2,
        question: '在RAG系统构建中，你能够解决以下哪些问题？',
        options: ['A. 针对文档选择合适的分块大小（Chunk Size）', 'B. 优化向量检索的召回率（如调优Embedding模型）', 'C. 设计rerank策略提升最终答案精度', 'D. 实现过基于知识图谱的GraphRAG', 'E. 还未实际构建过RAG系统'],
        negativeOptionIndex: 4,
      },
      {
        id: 10, type: 'multi', dimensionIndex: 3,
        question: '当业务方提出一个模糊的AI需求时，你通常会怎么做？',
        options: ['A. 直接开始技术选型，寻找最先进的模型', 'B. 先与业务方澄清具体问题、期望指标和约束条件', 'C. 对需求进行拆解，判断哪部分适合用AI解决，哪部分可以用规则', 'D. 快速做一个最小可行产品（MVP）来对齐认知', 'E. 尚无类似经验'],
        negativeOptionIndex: 4,
      },
      {
        id: 11, type: 'multi', dimensionIndex: 3,
        question: '在评估一个AI解决方案的落地价值时，你会重点考虑哪些因素？',
        options: ['A. 模型准确率等学术指标', 'B. 算力成本与ROI', 'C. 数据可得性与隐私合规', 'D. 与现有业务系统整合的难度', 'E. 尚无落地评估经验'],
        negativeOptionIndex: 4,
      },
      {
        id: 12, type: 'single', dimensionIndex: 3,
        question: '你是否独立主导过以下哪种从0到1的场景落地？',
        options: ['A. 将内部实验性AI项目成功推向生产环境', 'B. 为B端客户定制化交付过一个AI解决方案', 'C. 在公司内推动并落地了一项AI流程变革', 'D. 尚未独立主导过完整落地项目'],
        negativeOptionIndex: 3,
        skipRule: { triggerQuestionId: 10, requiredOptionIndices: [1, 2], skipQuestionIds: [12], triggerWhenOptionNotSelected: true },
      },
      {
        id: 13, type: 'multi', dimensionIndex: 4,
        question: '在使用AI处理用户简历时，你如何处理潜在的算法偏见？',
        options: ['A. 在数据预处理阶段剔除性别等敏感字段', 'B. 使用公平性指标对模型输出进行审计', 'C. 采用对抗性去偏或重加权等算法手段', 'D. 没有系统性的处理方案'],
        negativeOptionIndex: 3,
      },
      {
        id: 14, type: 'single', dimensionIndex: 4,
        question: '在跨角色协作中，你最符合以下哪种描述？',
        options: ['A. 能够与非技术同事顺畅沟通，但需要对方有基础认知', 'B. 擅长用类比和可视化向完全不懂技术的人解释AI概念', 'C. 能够编写规范的技术文档，供不同角色复用', 'D. 我更倾向于独立工作，较少进行跨角色沟通', 'E. 尚无跨角色协作经验'],
        negativeOptionIndex: 4,
      },
      {
        id: 15, type: 'single', dimensionIndex: 4,
        question: '【Prompt能力自评】在引导AI完成一项复杂任务时，你通常会？',
        options: ['A. 直接输入一句话需求，等待AI输出', 'B. 使用结构化的提示词模板，并给出示例', 'C. 采用多轮对话，逐步引导AI收敛到正确结果', 'D. 设计完整的思维链（CoT）或流程脚本，并具备纠偏策略', 'E. 尚未尝试过此类AI交互'],
        negativeOptionIndex: 4,
      },
      {
        id: 16, type: 'multi', dimensionIndex: 5,
        question: '你是否有以下学术或技术影响力产出？',
        options: ['A. 发表过AI顶会论文（如NeurIPS, CVPR, ACL等）', 'B. 参与过高知名度的开源AI项目（如PyTorch, LangChain等）', 'C. 在Kaggle等顶级竞赛中获得过银牌以上成绩', 'D. 以上均无，但持续关注前沿技术'],
        negativeOptionIndex: 3,
      },
      {
        id: 17, type: 'text', dimensionIndex: 6,
        question: '【开放题/选做】请简述你个人最具代表性的一个项目（技术栈+角色+核心贡献），以及你认为该项目中最具创新性的一点。',
        options: [],
        negativeOptionIndex: undefined,
        optional: true,
      },
    ],
    scoringRules: {
      dimensions: [
        { name: '基础理论层', questionIndices: [1, 2], weight: 15, maxScore: 15 },
        { name: 'AI核心技术层', questionIndices: [3, 4, 5], weight: 30, maxScore: 30 },
        { name: '工程落地层', questionIndices: [6, 7, 8, 9], weight: 30, maxScore: 30 },
        { name: '场景转化层', questionIndices: [10, 11, 12], weight: 10, maxScore: 10 },
        { name: '合规治理与软技能', questionIndices: [13, 14, 15], weight: 10, maxScore: 10 },
        { name: '前沿研究与创新', questionIndices: [16], weight: 5, maxScore: 5 },
        { name: '综合素养', questionIndices: [17], weight: 0, maxScore: 0 },
      ],
      multiSelectScores: { 0: 1, 1: 2, 2: 3, 3: 4 },
      singleSelectScores: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 0 },
      negativeOptionScore: 0,
      skipScore: 0,
    },
  },

  ai_engineer_student: {
    questions: [
      {
        id: 1, type: 'multi', dimensionIndex: 0,
        question: '你对以下哪些数学工具感到熟悉？',
        options: ['A. 矩阵运算与特征值分解', 'B. 贝叶斯定理与交叉熵', 'C. 梯度下降及其变体的数学推导', 'D. 以上均不熟悉'],
        negativeOptionIndex: 3,
      },
      {
        id: 2, type: 'multi', dimensionIndex: 0,
        question: '在项目中，你能准确解释以下哪个模型的底层机制？',
        options: ['A. Transformer的自注意力计算过程', 'B. CNN的卷积核如何提取空间特征', 'C. LSTM的门控机制与梯度流动', 'D. 扩散模型的前向与逆向过程', 'E. 以上均不熟悉'],
        negativeOptionIndex: 4,
        skipRule: { triggerQuestionId: 1, triggerOptionIndex: 3, skipQuestionIds: [2] },
      },
      {
        id: 3, type: 'multi', dimensionIndex: 1,
        question: '你使用过以下哪些预训练模型系列？',
        options: ['A. BERT/RoBERTa', 'B. GPT系列（含ChatGPT等API）', 'C. LLaMA/通义千问等开源大模型', 'D. CLIP等多模态模型', 'E. 以上均未使用过'],
        negativeOptionIndex: 4,
      },
      {
        id: 4, type: 'multi', dimensionIndex: 1,
        question: '在你最熟悉的一个模型上，你进行过以下哪些操作？',
        options: ['A. 使用官方API进行文本生成', 'B. 使用私有数据对模型进行全量微调', 'C. 使用LoRA等轻量级微调技术进行适配', 'D. 从零开始预训练一个类似模型', 'E. 以上均未进行过'],
        negativeOptionIndex: 4,
        skipRule: { triggerQuestionId: 3, triggerOptionIndex: 4, skipQuestionIds: [4, 5] },
      },
      {
        id: 5, type: 'multi', dimensionIndex: 1,
        question: '你是否有过以下AI Agent或强化学习的实际开发经验？',
        options: ['A. 设计过简单的单Agent对话流程（如客服机器人）', 'B. 开发过多Agent协作系统，并解决过状态同步问题', 'C. 使用PPO/DPO等算法进行过大模型偏好对齐', 'D. 以上均无'],
        negativeOptionIndex: 3,
      },
      {
        id: 6, type: 'multi', dimensionIndex: 2,
        question: '你能够熟练使用哪些编程语言或框架进行AI开发？',
        options: ['A. Python + PyTorch', 'B. Python + TensorFlow/Keras', 'C. C++ 并有AI部署经验', 'D. Go/Java等后端语言并有AI集成经验', 'E. 目前仅能使用Notebook完成简单实验'],
        negativeOptionIndex: 4,
      },
      {
        id: 7, type: 'single', dimensionIndex: 2,
        question: '针对你最精通的一门语言，你进行过以下哪种程度的工程化工作？',
        options: ['A. 写过脚本，但未进行过系统开发', 'B. 参与过完整后端服务的开发，但AI模块是独立调用的', 'C. 独立负责过一个AI模块的生产级部署（含Docker化）', 'D. 主导过大型分布式AI系统的架构设计', 'E. 上述均不符合我的情况'],
        negativeOptionIndex: 4,
      },
      {
        id: 8, type: 'multi', dimensionIndex: 2,
        question: '在模型部署环节，你实际落地过以下哪些技术？',
        options: ['A. 模型量化（如INT8量化）以降低推理延迟', 'B. 使用ONNX/TensorRT进行推理加速', 'C. 搭建过完整的MLOps pipeline（CI/CD for ML）', 'D. 以上均未实际落地，仅了解概念'],
        negativeOptionIndex: 3,
      },
      {
        id: 9, type: 'multi', dimensionIndex: 2,
        question: '在RAG系统构建中，你能够解决以下哪些问题？',
        options: ['A. 针对文档选择合适的分块大小（Chunk Size）', 'B. 优化向量检索的召回率（如调优Embedding模型）', 'C. 设计rerank策略提升最终答案精度', 'D. 实现过基于知识图谱的GraphRAG', 'E. 还未实际构建过RAG系统'],
        negativeOptionIndex: 4,
      },
      {
        id: 10, type: 'multi', dimensionIndex: 3,
        question: '当业务方提出一个模糊的AI需求时，你通常会怎么做？',
        options: ['A. 直接开始技术选型，寻找最先进的模型', 'B. 先与业务方澄清具体问题、期望指标和约束条件', 'C. 对需求进行拆解，判断哪部分适合用AI解决，哪部分可以用规则', 'D. 快速做一个最小可行产品（MVP）来对齐认知', 'E. 尚无类似经验'],
        negativeOptionIndex: 4,
      },
      {
        id: 11, type: 'multi', dimensionIndex: 3,
        question: '在评估一个AI解决方案的落地价值时，你会重点考虑哪些因素？',
        options: ['A. 模型准确率等学术指标', 'B. 算力成本与ROI', 'C. 数据可得性与隐私合规', 'D. 与现有业务系统整合的难度', 'E. 尚无落地评估经验'],
        negativeOptionIndex: 4,
      },
      {
        id: 12, type: 'single', dimensionIndex: 3,
        question: '你是否独立主导过以下哪种从0到1的场景落地？',
        options: ['A. 将内部实验性AI项目成功推向生产环境', 'B. 为B端客户定制化交付过一个AI解决方案', 'C. 在公司内推动并落地了一项AI流程变革', 'D. 尚未独立主导过完整落地项目'],
        negativeOptionIndex: 3,
        skipRule: { triggerQuestionId: 10, requiredOptionIndices: [1, 2], skipQuestionIds: [12], triggerWhenOptionNotSelected: true },
      },
      {
        id: 13, type: 'multi', dimensionIndex: 4,
        question: '在使用AI处理用户简历时，你如何处理潜在的算法偏见？',
        options: ['A. 在数据预处理阶段剔除性别等敏感字段', 'B. 使用公平性指标对模型输出进行审计', 'C. 采用对抗性去偏或重加权等算法手段', 'D. 没有系统性的处理方案'],
        negativeOptionIndex: 3,
      },
      {
        id: 14, type: 'single', dimensionIndex: 4,
        question: '在跨角色协作中，你最符合以下哪种描述？',
        options: ['A. 能够与非技术同事顺畅沟通，但需要对方有基础认知', 'B. 擅长用类比和可视化向完全不懂技术的人解释AI概念', 'C. 能够编写规范的技术文档，供不同角色复用', 'D. 我更倾向于独立工作，较少进行跨角色沟通', 'E. 尚无跨角色协作经验'],
        negativeOptionIndex: 4,
      },
      {
        id: 15, type: 'single', dimensionIndex: 4,
        question: '【Prompt能力自评】在引导AI完成一项复杂任务时，你通常会？',
        options: ['A. 直接输入一句话需求，等待AI输出', 'B. 使用结构化的提示词模板，并给出示例', 'C. 采用多轮对话，逐步引导AI收敛到正确结果', 'D. 设计完整的思维链（CoT）或流程脚本，并具备纠偏策略', 'E. 尚未尝试过此类AI交互'],
        negativeOptionIndex: 4,
      },
      {
        id: 16, type: 'multi', dimensionIndex: 5,
        question: '你是否有以下学术或技术影响力产出？',
        options: ['A. 发表过AI顶会论文（如NeurIPS, CVPR, ACL等）', 'B. 参与过高知名度的开源AI项目（如PyTorch, LangChain等）', 'C. 在Kaggle等顶级竞赛中获得过银牌以上成绩', 'D. 以上均无，但持续关注前沿技术'],
        negativeOptionIndex: 3,
      },
      {
        id: 17, type: 'text', dimensionIndex: 6,
        question: '【开放题/选做】请简述你个人最具代表性的一个项目（技术栈+角色+核心贡献），以及你认为该项目中最具创新性的一点。',
        options: [],
        negativeOptionIndex: undefined,
        optional: true,
      },
    ],
    scoringRules: {
      dimensions: [
        { name: '基础理论层', questionIndices: [1, 2], weight: 15, maxScore: 15 },
        { name: 'AI核心技术层', questionIndices: [3, 4, 5], weight: 30, maxScore: 30 },
        { name: '工程落地层', questionIndices: [6, 7, 8, 9], weight: 30, maxScore: 30 },
        { name: '场景转化层', questionIndices: [10, 11, 12], weight: 10, maxScore: 10 },
        { name: '合规治理与软技能', questionIndices: [13, 14, 15], weight: 10, maxScore: 10 },
        { name: '前沿研究与创新', questionIndices: [16], weight: 5, maxScore: 5 },
        { name: '综合素养', questionIndices: [17], weight: 0, maxScore: 0 },
      ],
      multiSelectScores: { 0: 1, 1: 2, 2: 3, 3: 4 },
      singleSelectScores: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 0 },
      negativeOptionScore: 0,
      skipScore: 0,
    },
  },

  ai_engineer_hr: {
    questions: [
      {
        id: 1, type: 'multi', dimensionIndex: 0,
        question: '该岗位是否要求候选人具备数学基础？',
        options: ['A. 必须熟悉矩阵运算与特征值分解（线性代数）', 'B. 必须理解贝叶斯定理与交叉熵（概率论与信息论）', 'C. 必须掌握梯度下降及其变体的数学推导（最优化）', 'D. 暂不要求数学基础'],
        negativeOptionIndex: 3,
      },
      {
        id: 2, type: 'multi', dimensionIndex: 0,
        question: '对经典机器学习模型的理解程度有何要求？',
        options: ['A. 需要能解释Transformer的自注意力机制', 'B. 需要能解释CNN的卷积核特征提取原理', 'C. 需要能解释LSTM的门控机制与梯度流动', 'D. 需要能解释扩散模型的前向与逆向过程', 'E. 暂不要求经典模型底层原理'],
        negativeOptionIndex: 4,
        skipRule: { triggerQuestionId: 1, triggerOptionIndex: 3, skipQuestionIds: [2] },
      },
      {
        id: 3, type: 'multi', dimensionIndex: 1,
        question: '该岗位需要使用哪些预训练模型系列？',
        options: ['A. BERT/RoBERTa 等语言理解模型', 'B. GPT系列（含大语言模型API调用）', 'C. LLaMA/通义千问等开源大模型', 'D. CLIP等多模态模型', 'E. 暂不需要使用预训练模型'],
        negativeOptionIndex: 4,
      },
      {
        id: 4, type: 'multi', dimensionIndex: 1,
        question: '对预训练模型的二次开发要求有多深？',
        options: ['A. 只需调用官方API进行文本生成/理解', 'B. 需要能使用私有数据进行全量微调', 'C. 需要能使用LoRA等轻量微调技术进行适配', 'D. 需要能从零预训练一个类似模型', 'E. 暂不需要模型二次开发'],
        negativeOptionIndex: 4,
        skipRule: { triggerQuestionId: 3, triggerOptionIndex: 4, skipQuestionIds: [4, 5] },
      },
      {
        id: 5, type: 'multi', dimensionIndex: 1,
        question: '是否要求AI Agent或强化学习方向的实战能力？',
        options: ['A. 需要设计过单Agent对话流程（如客服机器人）', 'B. 需要能开发多Agent协作系统并解决状态同步', 'C. 需要具备使用PPO/DPO进行大模型偏好对齐的经验', 'D. 暂不要求'],
        negativeOptionIndex: 3,
      },
      {
        id: 6, type: 'multi', dimensionIndex: 2,
        question: '该岗位必须掌握哪些编程语言或框架？',
        options: ['A. Python + PyTorch', 'B. Python + TensorFlow/Keras', 'C. C++ 并有AI部署经验', 'D. Go/Java等后端语言并有AI集成经验', 'E. 暂不要求特定语言，能做实验即可'],
        negativeOptionIndex: 4,
      },
      {
        id: 7, type: 'single', dimensionIndex: 2,
        question: '对编程工程化程度的要求是？',
        options: ['A. 能写脚本完成实验即可，无需系统工程', 'B. 需要参与过完整后端服务开发，AI模块独立调用', 'C. 必须独立负责过AI模块的生产级部署（含Docker化）', 'D. 需要主导过大型分布式AI系统的架构设计', 'E. 以上均不适用/暂不确定'],
        negativeOptionIndex: 4,
      },
      {
        id: 8, type: 'multi', dimensionIndex: 2,
        question: '要求候选人具备哪些模型部署与优化经验？',
        options: ['A. 必须实践过模型量化（如INT8）以降低延迟', 'B. 必须使用过ONNX/TensorRT进行推理加速', 'C. 必须搭建过完整的MLOps流水线（CI/CD for ML）', 'D. 暂不要求'],
        negativeOptionIndex: 3,
      },
      {
        id: 9, type: 'multi', dimensionIndex: 2,
        question: '该岗位是否需要RAG系统构建能力？',
        options: ['A. 需要能优化文档分块策略（Chunk Size）', 'B. 需要能调优向量检索的召回率（Embedding优化）', 'C. 需要能设计rerank策略提升答案精度', 'D. 需要能实现基于知识图谱的GraphRAG', 'E. 暂不需要RAG相关能力'],
        negativeOptionIndex: 4,
      },
      {
        id: 10, type: 'multi', dimensionIndex: 3,
        question: '该岗位在日常工作中面对模糊需求时，应具备哪些素质？',
        options: ['A. 能直接根据经验进行技术选型，寻找先进模型', 'B. 必须能主动与业务方澄清问题、期望指标和约束', 'C. 必须能拆解需求，判断哪些适合AI解决，哪些可用规则', 'D. 必须能快速制作MVP对齐业务认知', 'E. 暂不明确'],
        negativeOptionIndex: 4,
      },
      {
        id: 11, type: 'multi', dimensionIndex: 3,
        question: '在评估AI方案的落地价值时，该岗位需要重点考虑哪些因素？',
        options: ['A. 模型准确率等学术指标', 'B. 算力成本与ROI', 'C. 数据可得性与隐私合规', 'D. 与现有业务系统的整合难度', 'E. 暂不明确'],
        negativeOptionIndex: 4,
      },
      {
        id: 12, type: 'single', dimensionIndex: 3,
        question: '是否要求候选人具备独立主导0到1落地项目的经验？',
        options: ['A. 需要将内部AI实验项目成功推向生产环境', 'B. 需要有过为B端客户定制化交付AI解决方案的经历', 'C. 需要曾推动并落地过一项AI流程变革', 'D. 暂不要求独立主导经验'],
        negativeOptionIndex: 3,
        skipRule: { triggerQuestionId: 10, requiredOptionIndices: [1, 2], skipQuestionIds: [12], triggerWhenOptionNotSelected: true },
      },
      {
        id: 13, type: 'multi', dimensionIndex: 4,
        question: '在处理用户数据（如简历）的AI场景中，对候选人处理算法偏见的能力有何要求？',
        options: ['A. 必须能在数据预处理时剔除敏感字段', 'B. 必须能使用公平性指标对模型输出审计', 'C. 必须掌握对抗性去偏或重加权等算法手段', 'D. 暂不做硬性要求'],
        negativeOptionIndex: 3,
      },
      {
        id: 14, type: 'single', dimensionIndex: 4,
        question: '该岗位所需的跨角色协作能力需要达到什么程度？',
        options: ['A. 能够与非技术同事沟通，但需要对方有一定基础认知', 'B. 需要擅长用类比和可视化向完全不懂技术的人解释AI', 'C. 需要能编写规范的技术文档供不同角色复用', 'D. 岗位偏向独立工作，协作要求不高', 'E. 暂不确定'],
        negativeOptionIndex: 4,
      },
      {
        id: 15, type: 'single', dimensionIndex: 4,
        question: '对于"用提示词（Prompt）引导AI完成复杂任务"这一新范式能力，该岗位的要求是？',
        options: ['A. 只需能直接输入需求获取结果即可', 'B. 能使用结构化提示词模板并给出示例', 'C. 需要能通过多轮对话逐步引导AI收敛到正确结果', 'D. 需要能设计完整的思维链（CoT）流程并具备纠偏策略', 'E. 暂不要求'],
        negativeOptionIndex: 4,
      },
      {
        id: 16, type: 'multi', dimensionIndex: 5,
        question: '该岗位是否需要候选人在学术或技术社区有一定影响力？',
        options: ['A. 需要发表过AI顶会论文（如NeurIPS、CVPR等）', 'B. 需要参与过知名开源AI项目（如PyTorch、LangChain等）', 'C. 需要在Kaggle等顶级竞赛中获得过银牌以上成绩', 'D. 以上均不要求，但必须持续关注前沿技术', 'E. 暂不要求前沿影响力'],
        negativeOptionIndex: 4,
      },
      {
        id: 17, type: 'text', dimensionIndex: 6,
        question: '【开放题/选做】请用一两句话补充说明该岗位最看重的软性特质或特殊要求（如行业背景、保密级别等）。',
        options: [],
        negativeOptionIndex: undefined,
        optional: true,
      },
    ],
    scoringRules: {
      dimensions: [
        { name: '基础理论层', questionIndices: [1, 2], weight: 15, maxScore: 15 },
        { name: 'AI核心技术层', questionIndices: [3, 4, 5], weight: 30, maxScore: 30 },
        { name: '工程落地层', questionIndices: [6, 7, 8, 9], weight: 30, maxScore: 30 },
        { name: '场景转化层', questionIndices: [10, 11, 12], weight: 10, maxScore: 10 },
        { name: '合规治理与软技能', questionIndices: [13, 14, 15], weight: 10, maxScore: 10 },
        { name: '前沿研究与创新', questionIndices: [16], weight: 5, maxScore: 5 },
        { name: '综合素养', questionIndices: [17], weight: 0, maxScore: 0 },
      ],
      multiSelectScores: { 0: 1, 1: 2, 2: 3, 3: 4 },
      singleSelectScores: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 0 },
      negativeOptionScore: 0,
      skipScore: 0,
    },
  },

  modeler_jobseeker: {
    questions: [
      {
        id: 1, type: 'multi', dimensionIndex: 0,
        question: '你能熟练使用以下哪些3D建模软件？',
        options: ['A. Maya', 'B. 3ds Max', 'C. Blender', 'D. ZBrush', 'E. Cinema 4D', 'F. 以上均不熟练'],
        negativeOptionIndex: 5,
      },
      {
        id: 2, type: 'single', dimensionIndex: 0,
        question: '在你最精通的一款建模软件中，你的操作程度是？',
        options: ['A. 能做基础模型（几何体组合、简单编辑）', 'B. 能完成完整模型制作（含UV展开和基础贴图）', 'C. 能高效完成复杂项目（熟练掌握快捷键和高级功能模块）', 'D. 能编写脚本/插件扩展软件功能', 'E. 以上均不符合'],
        negativeOptionIndex: 4,
        skipRule: { triggerQuestionId: 1, triggerOptionIndex: 5, skipQuestionIds: [2, 3] },
      },
      {
        id: 3, type: 'multi', dimensionIndex: 0,
        question: '你常用的贴图/材质制作工具有哪些？',
        options: ['A. Substance Painter', 'B. Substance Designer', 'C. Photoshop', 'D. Mari / Quixel Mixer 等', 'E. 不使用贴图工具（纯模型制作）'],
        negativeOptionIndex: 4,
      },
      {
        id: 4, type: 'multi', dimensionIndex: 1,
        question: '你熟练掌握以下哪些建模方法？',
        options: ['A. 多边形建模（硬表面/低模/高模）', 'B. NURBS曲面建模', 'C. 数字雕刻（ZBrush/Mudbox 高精度细节）', 'D. 程序化建模（Houdini/节点编辑器）', 'E. 以上均不熟练'],
        negativeOptionIndex: 4,
      },
      {
        id: 5, type: 'single', dimensionIndex: 1,
        question: '在建模过程中，你对"拓扑布线"的理解和应用程度是？',
        options: ['A. 不了解该概念', 'B. 知道基本概念，但布线不够规范', 'C. 能完成合格的拓扑布线（均匀四边形、边线循环）', 'D. 精通拓扑优化（能根据动画/细分需求设计最优布线方案）'],
        negativeOptionIndex: undefined,
        skipRule: { triggerQuestionId: 4, triggerOptionIndex: 4, skipQuestionIds: [5, 6] },
      },
      {
        id: 6, type: 'multi', dimensionIndex: 1,
        question: '你是否掌握模型的优化与LOD制作？',
        options: ['A. 能对高模进行减面处理且保持外形', 'B. 能制作多级LOD模型', 'C. 能对模型进行网格清理（合并顶点、删除废面）', 'D. 能判断模型在不同平台上的面数承载能力', 'E. 尚未掌握模型优化技能'],
        negativeOptionIndex: 4,
      },
      {
        id: 7, type: 'multi', dimensionIndex: 1,
        question: '你是否接触过AI工具辅助建模？',
        options: ['A. 使用过AI生成参考图（如MidJourney/Stable Diffusion）', 'B. 使用过AI自动拓扑/重拓扑工具', 'C. 尝试过AI生成基础模型（如文本转3D）', 'D. 了解AI工具但未实际使用', 'E. 尚未接触过AI辅助建模'],
        negativeOptionIndex: 4,
      },
      {
        id: 8, type: 'multi', dimensionIndex: 2,
        question: '你掌握以下哪些UV与纹理相关技能？',
        options: ['A. UV展开与合理布局', 'B. PBR材质制作（金属/粗糙度/法线/高度等贴图）', 'C. 手绘贴图能力', 'D. 程序化纹理生成（Substance Designer/节点编辑器）', 'E. 以上均不熟练'],
        negativeOptionIndex: 4,
      },
      {
        id: 9, type: 'multi', dimensionIndex: 2,
        question: '在纹理烘焙方面，你实际做过以下哪些工作？',
        options: ['A. 高模烘焙低模法线贴图', 'B. 烘焙AO贴图（环境光遮蔽）', 'C. 烘焙曲率/厚度等辅助贴图', 'D. 以上均未做过'],
        negativeOptionIndex: 3,
        skipRule: { triggerQuestionId: 8, triggerOptionIndex: 4, skipQuestionIds: [9] },
      },
      {
        id: 10, type: 'multi', dimensionIndex: 3,
        question: '你是否有以下美术基础或训练经历？',
        options: ['A. 系统学习过素描/速写', 'B. 掌握人体解剖学知识（骨骼/肌肉结构）', 'C. 系统学习过色彩理论', 'D. 有原画或插画创作经验', 'E. 以上均无，主要依赖软件技术'],
        negativeOptionIndex: 4,
      },
      {
        id: 11, type: 'single', dimensionIndex: 3,
        question: '在角色建模中，你对人体比例和解剖学的掌握程度是？',
        options: ['A. 了解基本比例（如7.5头身），但细节靠感觉', 'B. 能准确表现出主要骨骼和肌肉结构', 'C. 精通解剖学，能模拟极限动作下的肌肉变形和皮肤褶皱', 'D. 不涉及角色建模 / 不确定'],
        negativeOptionIndex: 3,
      },
      {
        id: 12, type: 'multi', dimensionIndex: 4,
        question: '你在渲染方面具备以下哪些经验？',
        options: ['A. 使用过离线渲染器（V-Ray/Arnold/Redshift等）', 'B. 使用过实时渲染引擎（Unreal Engine/Unity等）', 'C. 设置过完整的灯光环境（三点光照/HDRI环境光）', 'D. 能优化渲染参数在质量和效率间取得平衡', 'E. 以上均无实际操作经验'],
        negativeOptionIndex: 4,
      },
      {
        id: 13, type: 'multi', dimensionIndex: 4,
        question: '你是否掌握以下渲染进阶技术？',
        options: ['A. 多通道分层渲染（Z-Depth/AO/ID蒙版等）', 'B. 光照贴图烘焙（Lightmap UVs）', 'C. 后期合成与调色基础', 'D. 以上均未掌握'],
        negativeOptionIndex: 3,
        skipRule: { triggerQuestionId: 12, triggerOptionIndex: 4, skipQuestionIds: [13] },
      },
      {
        id: 14, type: 'multi', dimensionIndex: 5,
        question: '你是否完整参与过3D建模相关项目？',
        options: ['A. 参与过课程作业级别的建模项目', 'B. 参与过商业外包/接单项目', 'C. 参与过游戏/影视/动画等正式产品开发', 'D. 独立完成过从概念到最终渲染的全流程作品', 'E. 尚未参与过实际项目'],
        negativeOptionIndex: 4,
      },
      {
        id: 15, type: 'multi', dimensionIndex: 5,
        question: '在团队协作中，你具备以下哪些经验？',
        options: ['A. 与策划/原画师协作完成模型需求对接', 'B. 与动画/绑定师配合完成模型交付', 'C. 按规范管理项目文件（命名/版本/目录结构）', 'D. 参与过跨部门（如美术与程序）的技术沟通', 'E. 以上均无'],
        negativeOptionIndex: 4,
      },
      {
        id: 16, type: 'multi', dimensionIndex: 6,
        question: '你是否具备以下动画或绑定相关技能？',
        options: ['A. 能搭建基础骨骼系统（如Maya Rigging/Blender Rigify）', 'B. 能完成蒙皮与权重绘制，使模型变形自然', 'C. 能制作基础角色动画（行走、跑步等）', 'D. 能制作机械刚体动画（部件运动演示）', 'E. 以上均无'],
        negativeOptionIndex: 4,
      },
      {
        id: 17, type: 'text', dimensionIndex: 7,
        question: '【开放题/选做】请简要描述你最具代表性的一个3D建模作品（项目背景/创作目的、所用软件工具链、你在其中负责的环节、遇到的最大技术挑战及解决方法）。',
        options: [],
        negativeOptionIndex: undefined,
        optional: true,
      },
    ],
    scoringRules: {
      dimensions: [
        { name: '软件操作能力', questionIndices: [1, 2, 3], weight: 20, maxScore: 20 },
        { name: '建模技术能力', questionIndices: [4, 5, 6, 7], weight: 25, maxScore: 25 },
        { name: 'UV与纹理能力', questionIndices: [8, 9], weight: 15, maxScore: 15 },
        { name: '美术基础与设计素养', questionIndices: [10, 11], weight: 10, maxScore: 10 },
        { name: '渲染与光照能力', questionIndices: [12, 13], weight: 10, maxScore: 10 },
        { name: '项目与工程实践能力', questionIndices: [14, 15], weight: 15, maxScore: 15 },
        { name: '动画与绑定能力', questionIndices: [16], weight: 5, maxScore: 5 },
        { name: '综合素养', questionIndices: [17], weight: 0, maxScore: 0 },
      ],
      multiSelectScores: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 },
      singleSelectScores: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 0 },
      negativeOptionScore: 0,
      skipScore: 0,
    },
  },

  modeler_student: {
    questions: [
      {
        id: 1, type: 'multi', dimensionIndex: 0,
        question: '你能熟练使用以下哪些3D建模软件？',
        options: ['A. Maya', 'B. 3ds Max', 'C. Blender', 'D. ZBrush', 'E. Cinema 4D', 'F. 以上均不熟练'],
        negativeOptionIndex: 5,
      },
      {
        id: 2, type: 'single', dimensionIndex: 0,
        question: '在你最精通的一款建模软件中，你的操作程度是？',
        options: ['A. 能做基础模型（几何体组合、简单编辑）', 'B. 能完成完整模型制作（含UV展开和基础贴图）', 'C. 能高效完成复杂项目（熟练掌握快捷键和高级功能模块）', 'D. 能编写脚本/插件扩展软件功能', 'E. 以上均不符合'],
        negativeOptionIndex: 4,
        skipRule: { triggerQuestionId: 1, triggerOptionIndex: 5, skipQuestionIds: [2, 3] },
      },
      {
        id: 3, type: 'multi', dimensionIndex: 0,
        question: '你常用的贴图/材质制作工具有哪些？',
        options: ['A. Substance Painter', 'B. Substance Designer', 'C. Photoshop', 'D. Mari / Quixel Mixer 等', 'E. 不使用贴图工具（纯模型制作）'],
        negativeOptionIndex: 4,
      },
      {
        id: 4, type: 'multi', dimensionIndex: 1,
        question: '你熟练掌握以下哪些建模方法？',
        options: ['A. 多边形建模（硬表面/低模/高模）', 'B. NURBS曲面建模', 'C. 数字雕刻（ZBrush/Mudbox 高精度细节）', 'D. 程序化建模（Houdini/节点编辑器）', 'E. 以上均不熟练'],
        negativeOptionIndex: 4,
      },
      {
        id: 5, type: 'single', dimensionIndex: 1,
        question: '在建模过程中，你对"拓扑布线"的理解和应用程度是？',
        options: ['A. 不了解该概念', 'B. 知道基本概念，但布线不够规范', 'C. 能完成合格的拓扑布线（均匀四边形、边线循环）', 'D. 精通拓扑优化（能根据动画/细分需求设计最优布线方案）'],
        negativeOptionIndex: undefined,
        skipRule: { triggerQuestionId: 4, triggerOptionIndex: 4, skipQuestionIds: [5, 6] },
      },
      {
        id: 6, type: 'multi', dimensionIndex: 1,
        question: '你是否掌握模型的优化与LOD制作？',
        options: ['A. 能对高模进行减面处理且保持外形', 'B. 能制作多级LOD模型', 'C. 能对模型进行网格清理（合并顶点、删除废面）', 'D. 能判断模型在不同平台上的面数承载能力', 'E. 尚未掌握模型优化技能'],
        negativeOptionIndex: 4,
      },
      {
        id: 7, type: 'multi', dimensionIndex: 1,
        question: '你是否接触过AI工具辅助建模？',
        options: ['A. 使用过AI生成参考图（如MidJourney/Stable Diffusion）', 'B. 使用过AI自动拓扑/重拓扑工具', 'C. 尝试过AI生成基础模型（如文本转3D）', 'D. 了解AI工具但未实际使用', 'E. 尚未接触过AI辅助建模'],
        negativeOptionIndex: 4,
      },
      {
        id: 8, type: 'multi', dimensionIndex: 2,
        question: '你掌握以下哪些UV与纹理相关技能？',
        options: ['A. UV展开与合理布局', 'B. PBR材质制作（金属/粗糙度/法线/高度等贴图）', 'C. 手绘贴图能力', 'D. 程序化纹理生成（Substance Designer/节点编辑器）', 'E. 以上均不熟练'],
        negativeOptionIndex: 4,
      },
      {
        id: 9, type: 'multi', dimensionIndex: 2,
        question: '在纹理烘焙方面，你实际做过以下哪些工作？',
        options: ['A. 高模烘焙低模法线贴图', 'B. 烘焙AO贴图（环境光遮蔽）', 'C. 烘焙曲率/厚度等辅助贴图', 'D. 以上均未做过'],
        negativeOptionIndex: 3,
        skipRule: { triggerQuestionId: 8, triggerOptionIndex: 4, skipQuestionIds: [9] },
      },
      {
        id: 10, type: 'multi', dimensionIndex: 3,
        question: '你是否有以下美术基础或训练经历？',
        options: ['A. 系统学习过素描/速写', 'B. 掌握人体解剖学知识（骨骼/肌肉结构）', 'C. 系统学习过色彩理论', 'D. 有原画或插画创作经验', 'E. 以上均无，主要依赖软件技术'],
        negativeOptionIndex: 4,
      },
      {
        id: 11, type: 'single', dimensionIndex: 3,
        question: '在角色建模中，你对人体比例和解剖学的掌握程度是？',
        options: ['A. 了解基本比例（如7.5头身），但细节靠感觉', 'B. 能准确表现出主要骨骼和肌肉结构', 'C. 精通解剖学，能模拟极限动作下的肌肉变形和皮肤褶皱', 'D. 不涉及角色建模 / 不确定'],
        negativeOptionIndex: 3,
      },
      {
        id: 12, type: 'multi', dimensionIndex: 4,
        question: '你在渲染方面具备以下哪些经验？',
        options: ['A. 使用过离线渲染器（V-Ray/Arnold/Redshift等）', 'B. 使用过实时渲染引擎（Unreal Engine/Unity等）', 'C. 设置过完整的灯光环境（三点光照/HDRI环境光）', 'D. 能优化渲染参数在质量和效率间取得平衡', 'E. 以上均无实际操作经验'],
        negativeOptionIndex: 4,
      },
      {
        id: 13, type: 'multi', dimensionIndex: 4,
        question: '你是否掌握以下渲染进阶技术？',
        options: ['A. 多通道分层渲染（Z-Depth/AO/ID蒙版等）', 'B. 光照贴图烘焙（Lightmap UVs）', 'C. 后期合成与调色基础', 'D. 以上均未掌握'],
        negativeOptionIndex: 3,
        skipRule: { triggerQuestionId: 12, triggerOptionIndex: 4, skipQuestionIds: [13] },
      },
      {
        id: 14, type: 'multi', dimensionIndex: 5,
        question: '你是否完整参与过3D建模相关项目？',
        options: ['A. 参与过课程作业级别的建模项目', 'B. 参与过商业外包/接单项目', 'C. 参与过游戏/影视/动画等正式产品开发', 'D. 独立完成过从概念到最终渲染的全流程作品', 'E. 尚未参与过实际项目'],
        negativeOptionIndex: 4,
      },
      {
        id: 15, type: 'multi', dimensionIndex: 5,
        question: '在团队协作中，你具备以下哪些经验？',
        options: ['A. 与策划/原画师协作完成模型需求对接', 'B. 与动画/绑定师配合完成模型交付', 'C. 按规范管理项目文件（命名/版本/目录结构）', 'D. 参与过跨部门（如美术与程序）的技术沟通', 'E. 以上均无'],
        negativeOptionIndex: 4,
      },
      {
        id: 16, type: 'multi', dimensionIndex: 6,
        question: '你是否具备以下动画或绑定相关技能？',
        options: ['A. 能搭建基础骨骼系统（如Maya Rigging/Blender Rigify）', 'B. 能完成蒙皮与权重绘制，使模型变形自然', 'C. 能制作基础角色动画（行走、跑步等）', 'D. 能制作机械刚体动画（部件运动演示）', 'E. 以上均无'],
        negativeOptionIndex: 4,
      },
      {
        id: 17, type: 'text', dimensionIndex: 7,
        question: '【开放题/选做】请简要描述你最具代表性的一个3D建模作品（项目背景/创作目的、所用软件工具链、你在其中负责的环节、遇到的最大技术挑战及解决方法）。',
        options: [],
        negativeOptionIndex: undefined,
        optional: true,
      },
    ],
    scoringRules: {
      dimensions: [
        { name: '软件操作能力', questionIndices: [1, 2, 3], weight: 20, maxScore: 20 },
        { name: '建模技术能力', questionIndices: [4, 5, 6, 7], weight: 25, maxScore: 25 },
        { name: 'UV与纹理能力', questionIndices: [8, 9], weight: 15, maxScore: 15 },
        { name: '美术基础与设计素养', questionIndices: [10, 11], weight: 10, maxScore: 10 },
        { name: '渲染与光照能力', questionIndices: [12, 13], weight: 10, maxScore: 10 },
        { name: '项目与工程实践能力', questionIndices: [14, 15], weight: 15, maxScore: 15 },
        { name: '动画与绑定能力', questionIndices: [16], weight: 5, maxScore: 5 },
        { name: '综合素养', questionIndices: [17], weight: 0, maxScore: 0 },
      ],
      multiSelectScores: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 },
      singleSelectScores: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 0 },
      negativeOptionScore: 0,
      skipScore: 0,
    },
  },

  modeler_hr: {
    questions: [
      {
        id: 1, type: 'multi', dimensionIndex: 0,
        question: '该岗位必须熟练使用哪些3D建模软件？',
        options: ['A. Maya', 'B. 3ds Max', 'C. Blender', 'D. ZBrush', 'E. Cinema 4D', 'F. 暂不限制具体软件'],
        negativeOptionIndex: 5,
      },
      {
        id: 2, type: 'single', dimensionIndex: 0,
        question: '对最核心建模软件的掌握程度，至少需要达到以下哪个层次？',
        options: ['A. 能做基础模型即可（几何体组合、简单编辑）', 'B. 能独立完成完整模型制作（含UV和基础贴图）', 'C. 能高效完成复杂项目（熟练快捷键和高级功能模块）', 'D. 需要能编写脚本/插件扩展软件功能', 'E. 暂不确定'],
        negativeOptionIndex: 4,
        skipRule: { triggerQuestionId: 1, triggerOptionIndex: 5, skipQuestionIds: [2, 3] },
      },
      {
        id: 3, type: 'multi', dimensionIndex: 0,
        question: '该岗位需要掌握哪些贴图/材质制作工具？',
        options: ['A. Substance Painter', 'B. Substance Designer', 'C. Photoshop', 'D. Mari / Quixel Mixer 等专业工具', 'E. 暂不需要贴图工具（纯模型制作岗位）'],
        negativeOptionIndex: 4,
      },
      {
        id: 4, type: 'multi', dimensionIndex: 1,
        question: '该岗位必须掌握哪些建模方法？',
        options: ['A. 多边形建模（硬表面/低模/高模）', 'B. NURBS曲面建模', 'C. 数字雕刻（ZBrush/Mudbox 高精度细节）', 'D. 程序化建模（Houdini/节点编辑器）', 'E. 暂不限制具体建模方法'],
        negativeOptionIndex: 4,
      },
      {
        id: 5, type: 'single', dimensionIndex: 1,
        question: '对"拓扑布线"能力的最低要求是？',
        options: ['A. 不要求了解该概念', 'B. 知道基本概念即可，布线规范性可入职后培养', 'C. 必须能完成合格的拓扑布线（均匀四边形、边线循环）', 'D. 必须精通拓扑优化（能根据动画/细分需求设计最优布线方案）'],
        negativeOptionIndex: undefined,
        skipRule: { triggerQuestionId: 4, triggerOptionIndex: 4, skipQuestionIds: [5, 6] },
      },
      {
        id: 6, type: 'multi', dimensionIndex: 1,
        question: '该岗位是否需要具备模型优化与LOD制作能力？',
        options: ['A. 需要能对高模进行减面处理且保持外形', 'B. 需要能制作多级LOD模型', 'C. 需要能对模型进行网格清理（合并顶点、删除废面）', 'D. 需要能判断模型在不同平台上的面数承载能力', 'E. 暂不要求模型优化技能'],
        negativeOptionIndex: 4,
      },
      {
        id: 7, type: 'multi', dimensionIndex: 1,
        question: '该岗位是否需要候选人接触过AI辅助建模工具？',
        options: ['A. 使用过AI生成参考图（如MidJourney/Stable Diffusion）优先考虑', 'B. 使用过AI自动拓扑/重拓扑工具优先考虑', 'C. 尝试过AI生成基础模型（如文本转3D）优先考虑', 'D. 了解AI工具即可，不作硬性要求', 'E. 暂不要求AI辅助经验'],
        negativeOptionIndex: 4,
      },
      {
        id: 8, type: 'multi', dimensionIndex: 2,
        question: '该岗位需要掌握以下哪些UV与纹理技能？',
        options: ['A. UV展开与合理布局', 'B. PBR材质制作（金属/粗糙度/法线/高度等贴图）', 'C. 手绘贴图能力', 'D. 程序化纹理生成（Substance Designer/节点编辑器）', 'E. 暂不要求'],
        negativeOptionIndex: 4,
      },
      {
        id: 9, type: 'multi', dimensionIndex: 2,
        question: '该岗位是否需要纹理烘焙经验？',
        options: ['A. 需要能烘焙法线贴图（高模→低模）', 'B. 需要能烘焙AO贴图', 'C. 需要能烘焙曲率/厚度等辅助贴图', 'D. 暂不要求'],
        negativeOptionIndex: 3,
        skipRule: { triggerQuestionId: 8, triggerOptionIndex: 4, skipQuestionIds: [9] },
      },
      {
        id: 10, type: 'multi', dimensionIndex: 3,
        question: '该岗位是否要求候选人具备以下美术基础？',
        options: ['A. 需要系统学习过素描/速写', 'B. 需要掌握人体解剖学知识（角色岗专项）', 'C. 需要系统学习过色彩理论', 'D. 需要有原画或插画创作经验', 'E. 暂不要求美术基础，主要看重软件技术'],
        negativeOptionIndex: 4,
      },
      {
        id: 11, type: 'single', dimensionIndex: 3,
        question: '如果涉及角色建模，对人体的掌握程度要求是？',
        options: ['A. 了解基本比例即可（如7.5头身），细节可放宽', 'B. 必须能准确表现主要骨骼和肌肉结构', 'C. 必须精通解剖学，能模拟极限动作下的肌肉变形和皮肤褶皱', 'D. 不涉及角色建模 / 暂不确定'],
        negativeOptionIndex: 3,
      },
      {
        id: 12, type: 'multi', dimensionIndex: 4,
        question: '该岗位需要具备以下哪些渲染经验？',
        options: ['A. 必须使用过离线渲染器（V-Ray/Arnold/Redshift等）', 'B. 必须使用过实时渲染引擎（Unreal Engine/Unity等）', 'C. 需要能独立设置完整灯光环境（三点光照/HDRI）', 'D. 需要能优化渲染参数，平衡质量与效率', 'E. 暂不要求渲染经验'],
        negativeOptionIndex: 4,
      },
      {
        id: 13, type: 'multi', dimensionIndex: 4,
        question: '是否要求以下渲染进阶技术？',
        options: ['A. 需要掌握多通道分层渲染（Z-Depth/AO/ID蒙版等）', 'B. 需要掌握光照贴图烘焙（Lightmap UVs）', 'C. 需要具备后期合成与调色基础', 'D. 暂不要求'],
        negativeOptionIndex: 3,
        skipRule: { triggerQuestionId: 12, triggerOptionIndex: 4, skipQuestionIds: [13] },
      },
      {
        id: 14, type: 'multi', dimensionIndex: 5,
        question: '该岗位需要候选人具备哪类项目经验？',
        options: ['A. 课程作业或同等水平的建模练习即可', 'B. 需要参与过商业外包/接单项目', 'C. 需要参与过游戏/影视/动画等正式产品开发', 'D. 需要能独立完成从概念到最终渲染的全流程作品', 'E. 暂不要求项目经验'],
        negativeOptionIndex: 4,
      },
      {
        id: 15, type: 'multi', dimensionIndex: 5,
        question: '对团队协作和工程规范的要求有哪些？',
        options: ['A. 需要能根据策划/原画需求独立完成模型制作', 'B. 需要能与动画/绑定/程序等岗位进行技术对接', 'C. 需要按统一规范管理项目文件（命名/版本/目录结构）', 'D. 需要有过跨部门技术沟通经验', 'E. 暂不要求'],
        negativeOptionIndex: 4,
      },
      {
        id: 16, type: 'multi', dimensionIndex: 6,
        question: '该岗位是否需要动画或绑定相关技能？',
        options: ['A. 需要能搭建基础骨骼系统', 'B. 需要能完成蒙皮与权重绘制', 'C. 需要能制作基础角色动画（行走、跑步等）', 'D. 需要能制作机械刚体动画', 'E. 暂不要求'],
        negativeOptionIndex: 4,
      },
      {
        id: 17, type: 'text', dimensionIndex: 7,
        question: '【开放题/选做】请补充该岗位的其他特殊要求或期望（如：是否有特定行业背景偏好？是否需要熟悉某种引擎规范？是否要求英语或沟通等软技能？）。',
        options: [],
        negativeOptionIndex: undefined,
        optional: true,
      },
    ],
    scoringRules: {
      dimensions: [
        { name: '软件操作能力', questionIndices: [1, 2, 3], weight: 20, maxScore: 20 },
        { name: '建模技术能力', questionIndices: [4, 5, 6, 7], weight: 25, maxScore: 25 },
        { name: 'UV与纹理能力', questionIndices: [8, 9], weight: 15, maxScore: 15 },
        { name: '美术基础与设计素养', questionIndices: [10, 11], weight: 10, maxScore: 10 },
        { name: '渲染与光照能力', questionIndices: [12, 13], weight: 10, maxScore: 10 },
        { name: '项目与工程实践能力', questionIndices: [14, 15], weight: 15, maxScore: 15 },
        { name: '动画与绑定能力', questionIndices: [16], weight: 5, maxScore: 5 },
        { name: '综合素养', questionIndices: [17], weight: 0, maxScore: 0 },
      ],
      multiSelectScores: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 },
      singleSelectScores: { 0: 1, 1: 2, 2: 3, 3: 4, 4: 0 },
      negativeOptionScore: 0,
      skipScore: 0,
    },
  },
}

export function getQuestionBank(
  position: 'ai_engineer' | '3d_modeler',
  mode: 'jobseeker' | 'student' | 'hr'
): QuestionBankEntry {
  if (position === 'ai_engineer') {
    if (mode === 'hr') return banks.ai_engineer_hr
    if (mode === 'student') return banks.ai_engineer_student
    return banks.ai_engineer_jobseeker
  }
  if (mode === 'hr') return banks.modeler_hr
  if (mode === 'student') return banks.modeler_student
  return banks.modeler_jobseeker
}

export default banks
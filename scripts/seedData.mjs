import https from 'https'

const SUPABASE_URL = 'https://hbzbnyvjkuqivcfbgumk.supabase.co'
const ANON_KEY = 'sb_publishable_2oqoombRmJ15ksIxvzRjjw_nmRr9sZf'

function supabaseRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}${path}`)
    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'DELETE' ? 'return=minimal' : 'return=representation',
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null })
        } catch {
          resolve({ status: res.statusCode, body: data })
        }
      })
    })
    req.on('error', (err) => reject(err))
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

const AI_TALENTS = [
  { sort_order: 1, position: 'ai_engineer', name: '林逸凡', dimension_scores: { '基础理论': 14, 'AI核心': 28, '工程落地': 27, '场景转化': 9, '合规软技': 8, '前沿创新': 5 }, total_score: 91, skill_profile: '理论基础扎实，精通大模型全流程微调与分布式部署，具备完整项目主导经验', reputation: 4.8 },
  { sort_order: 2, position: 'ai_engineer', name: '陈思睿', dimension_scores: { '基础理论': 13, 'AI核心': 27, '工程落地': 28, '场景转化': 8, '合规软技': 9, '前沿创新': 4 }, total_score: 89, skill_profile: '工程落地能力突出，擅长MLOps体系搭建与模型量化部署，有3个开源项目维护经验', reputation: 4.9 },
  { sort_order: 3, position: 'ai_engineer', name: '张栩宁', dimension_scores: { '基础理论': 12, 'AI核心': 26, '工程落地': 25, '场景转化': 9, '合规软技': 7, '前沿创新': 5 }, total_score: 84, skill_profile: '顶会论文一作，深耕强化学习与大模型对齐，学术与工程兼备', reputation: 4.7 },
  { sort_order: 4, position: 'ai_engineer', name: '王语晴', dimension_scores: { '基础理论': 11, 'AI核心': 25, '工程落地': 24, '场景转化': 8, '合规软技': 8, '前沿创新': 3 }, total_score: 79, skill_profile: 'RAG系统经验丰富，独立交付过3个企业级文档问答项目', reputation: 4.5 },
  { sort_order: 5, position: 'ai_engineer', name: '赵启明', dimension_scores: { '基础理论': 10, 'AI核心': 24, '工程落地': 22, '场景转化': 7, '合规软技': 7, '前沿创新': 4 }, total_score: 74, skill_profile: '全栈AI工程师，前端到部署均可独立完成，擅长快速MVP验证', reputation: 4.6 },
  { sort_order: 6, position: 'ai_engineer', name: '周若涵', dimension_scores: { '基础理论': 9, 'AI核心': 22, '工程落地': 20, '场景转化': 8, '合规软技': 9, '前沿创新': 2 }, total_score: 70, skill_profile: '合规意识强，具备完整的数据隐私保护与算法公平性审计经验', reputation: 4.8 },
  { sort_order: 7, position: 'ai_engineer', name: '吴子轩', dimension_scores: { '基础理论': 8, 'AI核心': 21, '工程落地': 19, '场景转化': 6, '合规软技': 6, '前沿创新': 3 }, total_score: 63, skill_profile: '熟练调用主流大模型API，完成过多个智能客服Agent搭建', reputation: 4.3 },
  { sort_order: 8, position: 'ai_engineer', name: '郑雅文', dimension_scores: { '基础理论': 7, 'AI核心': 18, '工程落地': 16, '场景转化': 5, '合规软技': 7, '前沿创新': 1 }, total_score: 54, skill_profile: '计算机视觉方向，擅长多模态模型应用与迁移学习', reputation: 4.4 },
  { sort_order: 9, position: 'ai_engineer', name: '孙浩然', dimension_scores: { '基础理论': 13, 'AI核心': 20, '工程落地': 14, '场景转化': 7, '合规软技': 8, '前沿创新': 2 }, total_score: 64, skill_profile: '数学功底深厚，但工程经验尚在积累，适合算法研究岗', reputation: 4.1 },
  { sort_order: 10, position: 'ai_engineer', name: '李沛霖', dimension_scores: { '基础理论': 6, 'AI核心': 16, '工程落地': 15, '场景转化': 5, '合规软技': 6, '前沿创新': 1 }, total_score: 49, skill_profile: '应届生，已完成2个AI课程项目，熟练使用PyTorch与HuggingFace', reputation: 4.2 },
  { sort_order: 11, position: 'ai_engineer', name: '黄逸辰', dimension_scores: { '基础理论': 11, 'AI核心': 23, '工程落地': 26, '场景转化': 6, '合规软技': 5, '前沿创新': 3 }, total_score: 74, skill_profile: '偏向后端出身的AI工程师，擅长高并发推理服务架构设计', reputation: 4.5 },
  { sort_order: 12, position: 'ai_engineer', name: '刘若溪', dimension_scores: { '基础理论': 8, 'AI核心': 19, '工程落地': 17, '场景转化': 9, '合规软技': 8, '前沿创新': 2 }, total_score: 63, skill_profile: '产品sense强，能快速将业务需求转化为技术方案并输出MVP', reputation: 4.7 },
  { sort_order: 13, position: 'ai_engineer', name: '许博文', dimension_scores: { '基础理论': 12, 'AI核心': 21, '工程落地': 23, '场景转化': 5, '合规软技': 6, '前沿创新': 4 }, total_score: 71, skill_profile: '算法竞赛出身，Kaggle银牌，模型选型与A/B测试经验丰富', reputation: 4.3 },
  { sort_order: 14, position: 'ai_engineer', name: '马晓彤', dimension_scores: { '基础理论': 5, 'AI核心': 15, '工程落地': 12, '场景转化': 4, '合规软技': 5, '前沿创新': 1 }, total_score: 42, skill_profile: '大二在读，自驱力强，已完成深度学习入门，正在学习RAG技术', reputation: 4.9 },
  { sort_order: 15, position: 'ai_engineer', name: '朱子涵', dimension_scores: { '基础理论': 9, 'AI核心': 20, '工程落地': 18, '场景转化': 7, '合规软技': 7, '前沿创新': 3 }, total_score: 64, skill_profile: '曾参与大型企业AI中台建设，熟悉微服务拆分与模型服务化', reputation: 4.4 },
  { sort_order: 16, position: 'ai_engineer', name: '沈清扬', dimension_scores: { '基础理论': 14, 'AI核心': 25, '工程落地': 15, '场景转化': 6, '合规软技': 9, '前沿创新': 5 }, total_score: 74, skill_profile: '理论研究型人才，发表过NeurIPS Workshop论文，工程偏弱', reputation: 4.0 },
  { sort_order: 17, position: 'ai_engineer', name: '韩雨桐', dimension_scores: { '基础理论': 7, 'AI核心': 17, '工程落地': 20, '场景转化': 5, '合规软技': 6, '前沿创新': 2 }, total_score: 57, skill_profile: '偏工程型，擅长将开源模型私有化部署并集成到现有系统', reputation: 4.6 },
  { sort_order: 18, position: 'ai_engineer', name: '唐宇轩', dimension_scores: { '基础理论': 10, 'AI核心': 18, '工程落地': 22, '场景转化': 8, '合规软技': 5, '前沿创新': 1 }, total_score: 64, skill_profile: '项目经理转型AI，强于需求拆解与跨团队协作，技术中等', reputation: 4.8 },
  { sort_order: 19, position: 'ai_engineer', name: '冯梓萱', dimension_scores: { '基础理论': 8, 'AI核心': 14, '工程落地': 10, '场景转化': 6, '合规软技': 8, '前沿创新': 1 }, total_score: 47, skill_profile: 'AI伦理方向，毕业论文为"生成式AI偏见检测"，代码能力尚待提升', reputation: 4.3 },
  { sort_order: 20, position: 'ai_engineer', name: '何志远', dimension_scores: { '基础理论': 11, 'AI核心': 22, '工程落地': 21, '场景转化': 7, '合规软技': 7, '前沿创新': 2 }, total_score: 70, skill_profile: '全链路AI工程师，擅长推荐系统，从特征工程到在线预估均有实战', reputation: 4.5 },
  { sort_order: 21, position: 'ai_engineer', name: '罗逸飞', dimension_scores: { '基础理论': 6, 'AI核心': 12, '工程落地': 13, '场景转化': 4, '合规软技': 5, '前沿创新': 0 }, total_score: 40, skill_profile: '培训转行中，已完成Python和PyTorch基础，正在做第一个RAG Demo', reputation: 4.1 },
  { sort_order: 22, position: 'ai_engineer', name: '梁思源', dimension_scores: { '基础理论': 13, 'AI核心': 24, '工程落地': 19, '场景转化': 8, '合规软技': 6, '前沿创新': 3 }, total_score: 73, skill_profile: '具备CV+NLP双栈能力，主导过公司内部AI能力中台建设', reputation: 4.2 },
  { sort_order: 23, position: 'ai_engineer', name: '宋佳怡', dimension_scores: { '基础理论': 5, 'AI核心': 10, '工程落地': 8, '场景转化': 3, '合规软技': 4, '前沿创新': 0 }, total_score: 30, skill_profile: '非CS专业自学AI，已能调用API完成简单文本处理任务', reputation: 4.7 },
  { sort_order: 24, position: 'ai_engineer', name: '董明哲', dimension_scores: { '基础理论': 10, 'AI核心': 19, '工程落地': 24, '场景转化': 6, '合规软技': 7, '前沿创新': 2 }, total_score: 68, skill_profile: '专注MLOps，搭建过完整的CI/CD for ML流水线，覆盖训练到部署', reputation: 4.5 },
  { sort_order: 25, position: 'ai_engineer', name: '顾婉清', dimension_scores: { '基础理论': 7, 'AI核心': 16, '工程落地': 14, '场景转化': 8, '合规软技': 9, '前沿创新': 1 }, total_score: 55, skill_profile: '用户体验导向的AI产品开发，擅长将复杂模型用可视化方式解释', reputation: 4.6 },
  { sort_order: 26, position: 'ai_engineer', name: '秦浩宇', dimension_scores: { '基础理论': 12, 'AI核心': 25, '工程落地': 17, '场景转化': 7, '合规软技': 6, '前沿创新': 4 }, total_score: 71, skill_profile: '视觉大模型方向，精通ViT与CLIP架构，有多模态推理优化经验', reputation: 4.3 },
  { sort_order: 27, position: 'ai_engineer', name: '姜雨萌', dimension_scores: { '基础理论': 6, 'AI核心': 13, '工程落地': 11, '场景转化': 5, '合规软技': 5, '前沿创新': 1 }, total_score: 41, skill_profile: '参加过一期AI训练营，能基于LangChain搭建简单RAG问答系统', reputation: 4.4 },
  { sort_order: 28, position: 'ai_engineer', name: '贺子辰', dimension_scores: { '基础理论': 9, 'AI核心': 20, '工程落地': 18, '场景转化': 9, '合规软技': 8, '前沿创新': 2 }, total_score: 66, skill_profile: '擅长AI应用的产品化包装，负责过ToB AI SaaS工具0到1落地', reputation: 4.8 },
  { sort_order: 29, position: 'ai_engineer', name: '方雅琪', dimension_scores: { '基础理论': 4, 'AI核心': 9, '工程落地': 7, '场景转化': 4, '合规软技': 3, '前沿创新': 0 }, total_score: 27, skill_profile: '大一新生，对AI有浓厚兴趣，正在自学吴恩达机器学习课程', reputation: 4.9 },
  { sort_order: 30, position: 'ai_engineer', name: '雷天翊', dimension_scores: { '基础理论': 14, 'AI核心': 27, '工程落地': 26, '场景转化': 7, '合规软技': 8, '前沿创新': 5 }, total_score: 87, skill_profile: '博士生，研究方向为大模型可解释性，发表过ICLR会议论文', reputation: 4.2 },
  { sort_order: 31, position: 'ai_engineer', name: '田若曦', dimension_scores: { '基础理论': 8, 'AI核心': 17, '工程落地': 16, '场景转化': 6, '合规软技': 7, '前沿创新': 2 }, total_score: 56, skill_profile: 'NLP方向，熟练使用HuggingFace生态，可独立完成文本分类/生成任务', reputation: 4.5 },
  { sort_order: 32, position: 'ai_engineer', name: '石景轩', dimension_scores: { '基础理论': 10, 'AI核心': 21, '工程落地': 25, '场景转化': 5, '合规软技': 5, '前沿创新': 3 }, total_score: 69, skill_profile: '偏底层工程，擅长GPU算力调度与推理加速，为团队提供基础设施', reputation: 4.1 },
  { sort_order: 33, position: 'ai_engineer', name: '蓝晓晨', dimension_scores: { '基础理论': 7, 'AI核心': 15, '工程落地': 13, '场景转化': 8, '合规软技': 6, '前沿创新': 1 }, total_score: 50, skill_profile: '设计背景转AI，擅长用NoCode工具搭建AI工作流，Prompt工程熟练', reputation: 4.6 },
  { sort_order: 34, position: 'ai_engineer', name: '蔡明远', dimension_scores: { '基础理论': 11, 'AI核心': 23, '工程落地': 20, '场景转化': 7, '合规软技': 8, '前沿创新': 4 }, total_score: 73, skill_profile: '有金融AI经验，熟悉风控模型与数据隐私合规，工程化规范', reputation: 4.7 },
  { sort_order: 35, position: 'ai_engineer', name: '袁梦琪', dimension_scores: { '基础理论': 5, 'AI核心': 11, '工程落地': 9, '场景转化': 4, '合规软技': 5, '前沿创新': 0 }, total_score: 34, skill_profile: '文科生跨专业自学AI，目前已能独立完成简单的AI文本分析脚本', reputation: 4.8 },
  { sort_order: 36, position: 'ai_engineer', name: '丁亦然', dimension_scores: { '基础理论': 12, 'AI核心': 22, '工程落地': 19, '场景转化': 6, '合规软技': 7, '前沿创新': 3 }, total_score: 69, skill_profile: '具备语音+NLP多模态经验，做过智能语音助手全流程开发', reputation: 4.3 },
  { sort_order: 37, position: 'ai_engineer', name: '任思恒', dimension_scores: { '基础理论': 9, 'AI核心': 18, '工程落地': 22, '场景转化': 7, '合规软技': 6, '前沿创新': 2 }, total_score: 64, skill_profile: '偏向数据工程，擅长构建训练数据集与数据清洗Pipeline', reputation: 4.0 },
  { sort_order: 38, position: 'ai_engineer', name: '段雨桐', dimension_scores: { '基础理论': 6, 'AI核心': 14, '工程落地': 10, '场景转化': 5, '合规软技': 4, '前沿创新': 1 }, total_score: 40, skill_profile: '参加过2次Hackathon并获奖，学习能力强但项目经验尚浅', reputation: 4.9 },
  { sort_order: 39, position: 'ai_engineer', name: '汤皓宸', dimension_scores: { '基础理论': 13, 'AI核心': 26, '工程落地': 24, '场景转化': 8, '合规软技': 9, '前沿创新': 4 }, total_score: 84, skill_profile: '团队技术负责人，主导过千万级用户量的AI推荐系统架构升级', reputation: 4.5 },
  { sort_order: 40, position: 'ai_engineer', name: '白若涵', dimension_scores: { '基础理论': 4, 'AI核心': 8, '工程落地': 6, '场景转化': 3, '合规软技': 3, '前沿创新': 0 }, total_score: 24, skill_profile: '对AI有兴趣，完成过简单的大模型API调用实验，属入门级爱好者', reputation: 4.2 },
  { sort_order: 41, position: 'ai_engineer', name: '龙昊然', dimension_scores: { '基础理论': 10, 'AI核心': 19, '工程落地': 17, '场景转化': 8, '合规软技': 7, '前沿创新': 2 }, total_score: 63, skill_profile: '擅长AI教育场景，独立开发过AI辅助教学工具并在校内落地使用', reputation: 4.6 },
  { sort_order: 42, position: 'ai_engineer', name: '乔紫萱', dimension_scores: { '基础理论': 7, 'AI核心': 16, '工程落地': 15, '场景转化': 6, '合规软技': 8, '前沿创新': 1 }, total_score: 53, skill_profile: '注重AI安全，完成过模型红队测试与鲁棒性检验项目', reputation: 4.4 },
  { sort_order: 43, position: 'ai_engineer', name: '陆一鸣', dimension_scores: { '基础理论': 11, 'AI核心': 24, '工程落地': 23, '场景转化': 5, '合规软技': 5, '前沿创新': 3 }, total_score: 71, skill_profile: '游戏AI方向，擅长用强化学习优化NPC行为逻辑', reputation: 4.1 },
  { sort_order: 44, position: 'ai_engineer', name: '叶思齐', dimension_scores: { '基础理论': 5, 'AI核心': 12, '工程落地': 11, '场景转化': 4, '合规软技': 4, '前沿创新': 0 }, total_score: 36, skill_profile: '职校AI专业在读，基础操作熟练，正在寻找第一份AI实习机会', reputation: 4.7 },
  { sort_order: 45, position: 'ai_engineer', name: '邱博雅', dimension_scores: { '基础理论': 12, 'AI核心': 20, '工程落地': 18, '场景转化': 9, '合规软技': 9, '前沿创新': 3 }, total_score: 71, skill_profile: '咨询背景转AI，强在业务梳理与方案设计，技术可实现性判断准确', reputation: 4.8 },
  { sort_order: 46, position: 'ai_engineer', name: '傅哲瀚', dimension_scores: { '基础理论': 8, 'AI核心': 15, '工程落地': 20, '场景转化': 5, '合规软技': 6, '前沿创新': 1 }, total_score: 55, skill_profile: '擅长AI+IoT场景，有边缘端模型部署与优化实战经验', reputation: 4.2 },
  { sort_order: 47, position: 'ai_engineer', name: '尹诗涵', dimension_scores: { '基础理论': 6, 'AI核心': 13, '工程落地': 9, '场景转化': 7, '合规软技': 5, '前沿创新': 1 }, total_score: 41, skill_profile: '产品运营转AI开发，Prompt工程与Agent搭建熟练，编程基础薄弱', reputation: 4.5 },
  { sort_order: 48, position: 'ai_engineer', name: '钟逸风', dimension_scores: { '基础理论': 14, 'AI核心': 28, '工程落地': 29, '场景转化': 9, '合规软技': 8, '前沿创新': 4 }, total_score: 92, skill_profile: '接近架构师水准，全栈AI能力覆盖，有跨国团队协作经验', reputation: 4.6 },
  { sort_order: 49, position: 'ai_engineer', name: '安雅南', dimension_scores: { '基础理论': 9, 'AI核心': 17, '工程落地': 12, '场景转化': 8, '合规软技': 7, '前沿创新': 2 }, total_score: 55, skill_profile: 'AI技术布道者，擅长制作教学内容和内部培训，工程实践中等', reputation: 4.9 },
  { sort_order: 50, position: 'ai_engineer', name: '季凌霄', dimension_scores: { '基础理论': 3, 'AI核心': 7, '工程落地': 5, '场景转化': 2, '合规软技': 2, '前沿创新': 0 }, total_score: 19, skill_profile: '刚接触AI不到1个月，完成过一次在线体验课，处于探索阶段', reputation: 4.2 },
]

const MODELER_TALENTS = [
  { sort_order: 1, position: '3d_modeler', name: '孟桓卿', dimension_scores: { '软件操作': 19, '建模技术': 24, 'UV纹理': 14, '美术素养': 9, '渲染光照': 9, '项目实践': 14, '动画绑定': 4 }, total_score: 93, skill_profile: '行业资深专家，精通 Maya/ZBrush/Substance 全流程，曾主导3A级角色资产制作，拓扑布线精良', reputation: 4.9 },
  { sort_order: 2, position: '3d_modeler', name: '苏瑾禾', dimension_scores: { '软件操作': 17, '建模技术': 22, 'UV纹理': 13, '美术素养': 8, '渲染光照': 8, '项目实践': 13, '动画绑定': 3 }, total_score: 84, skill_profile: '游戏角色主美，擅长高精度数字雕刻与PBR材质表现，有完整项目交付经验', reputation: 4.7 },
  { sort_order: 3, position: '3d_modeler', name: '程砚舟', dimension_scores: { '软件操作': 15, '建模技术': 20, 'UV纹理': 12, '美术素养': 9, '渲染光照': 7, '项目实践': 11, '动画绑定': 2 }, total_score: 76, skill_profile: '美术功底深厚，素描与色彩能力强，能独立完成从原画到引擎内最终效果的全流程', reputation: 4.5 },
  { sort_order: 4, position: '3d_modeler', name: '温珞宁', dimension_scores: { '软件操作': 14, '建模技术': 18, 'UV纹理': 11, '美术素养': 7, '渲染光照': 6, '项目实践': 9, '动画绑定': 1 }, total_score: 66, skill_profile: '初级场景建模师，熟练 Blender 与 Unity 场景搭建，UV展开规范，可独立完成中小型场景', reputation: 4.8 },
  { sort_order: 5, position: '3d_modeler', name: '薛景珩', dimension_scores: { '软件操作': 12, '建模技术': 16, 'UV纹理': 10, '美术素养': 6, '渲染光照': 5, '项目实践': 8, '动画绑定': 0 }, total_score: 57, skill_profile: '工业建模方向，擅长 Rhino/3ds Max 曲面建模与产品渲染，有多个电商项目经验', reputation: 4.3 },
  { sort_order: 6, position: '3d_modeler', name: '江蓼清', dimension_scores: { '软件操作': 11, '建模技术': 14, 'UV纹理': 8, '美术素养': 5, '渲染光照': 5, '项目实践': 7, '动画绑定': 0 }, total_score: 50, skill_profile: '在校生，通过培训掌握了次世代资产制作基本流程，能完成简单道具模型', reputation: 4.6 },
  { sort_order: 7, position: '3d_modeler', name: '谈佑笙', dimension_scores: { '软件操作': 10, '建模技术': 12, 'UV纹理': 7, '美术素养': 4, '渲染光照': 4, '项目实践': 5, '动画绑定': 0 }, total_score: 42, skill_profile: '刚完成3D建模基础课程，能用 Blender 制作简单角色和场景，正在学习贴图绘制', reputation: 4.4 },
  { sort_order: 8, position: '3d_modeler', name: '楼芮溪', dimension_scores: { '软件操作': 8, '建模技术': 10, 'UV纹理': 5, '美术素养': 3, '渲染光照': 3, '项目实践': 3, '动画绑定': 0 }, total_score: 32, skill_profile: '非科班自学爱好者，能借助教程完成单个小物件建模，UV概念尚模糊', reputation: 4.2 },
  { sort_order: 9, position: '3d_modeler', name: '陆砚青', dimension_scores: { '软件操作': 18, '建模技术': 23, 'UV纹理': 13, '美术素养': 8, '渲染光照': 9, '项目实践': 13, '动画绑定': 4 }, total_score: 88, skill_profile: '技术美术方向，擅长材质Shader编写与渲染管线优化，能解决复杂光影问题', reputation: 4.7 },
  { sort_order: 10, position: '3d_modeler', name: '易晚晴', dimension_scores: { '软件操作': 13, '建模技术': 17, 'UV纹理': 9, '美术素养': 6, '渲染光照': 6, '项目实践': 8, '动画绑定': 1 }, total_score: 60, skill_profile: '熟练使用 C4D 制作动态图形与产品动画，擅长 Octane 渲染，节奏感强', reputation: 4.5 },
  { sort_order: 11, position: '3d_modeler', name: '阮司羽', dimension_scores: { '软件操作': 16, '建模技术': 19, 'UV纹理': 12, '美术素养': 7, '渲染光照': 7, '项目实践': 10, '动画绑定': 2 }, total_score: 73, skill_profile: '游戏场景地编，熟练使用 UE4/UE5 地形编辑与场景装配，优化面数经验丰富', reputation: 4.4 },
  { sort_order: 12, position: '3d_modeler', name: '迟棠音', dimension_scores: { '软件操作': 12, '建模技术': 15, 'UV纹理': 10, '美术素养': 8, '渲染光照': 6, '项目实践': 7, '动画绑定': 1 }, total_score: 59, skill_profile: '美术与设计双修，造型能力强，作品多次在校内展览获奖，技术尚在提升中', reputation: 4.8 },
  { sort_order: 13, position: '3d_modeler', name: '纪宸远', dimension_scores: { '软件操作': 14, '建模技术': 20, 'UV纹理': 11, '美术素养': 7, '渲染光照': 8, '项目实践': 12, '动画绑定': 3 }, total_score: 75, skill_profile: '外包对接经验丰富，能准确理解策划需求并指导初中级人员，擅长硬表面建模', reputation: 4.6 },
  { sort_order: 14, position: '3d_modeler', name: '白露晞', dimension_scores: { '软件操作': 7, '建模技术': 9, 'UV纹理': 4, '美术素养': 3, '渲染光照': 2, '项目实践': 2, '动画绑定': 0 }, total_score: 27, skill_profile: '大二学生，刚接触 3ds Max，能创建简单几何体组合，对材质灯光无系统学习', reputation: 4.9 },
  { sort_order: 15, position: '3d_modeler', name: '翟凌朔', dimension_scores: { '软件操作': 15, '建模技术': 21, 'UV纹理': 13, '美术素养': 8, '渲染光照': 8, '项目实践': 12, '动画绑定': 3 }, total_score: 80, skill_profile: '汽车可视化方向，精通 Maya+V-Ray 高品质渲染，曲面建模精度高', reputation: 4.5 },
  { sort_order: 16, position: '3d_modeler', name: '栾瑾瑜', dimension_scores: { '软件操作': 10, '建模技术': 13, 'UV纹理': 8, '美术素养': 9, '渲染光照': 5, '项目实践': 4, '动画绑定': 0 }, total_score: 49, skill_profile: '雕塑专业转行，造型和人体解剖功底扎实，但软件熟练度和项目经验不足', reputation: 4.2 },
  { sort_order: 17, position: '3d_modeler', name: '裴沐晴', dimension_scores: { '软件操作': 11, '建模技术': 15, 'UV纹理': 9, '美术素养': 5, '渲染光照': 6, '项目实践': 8, '动画绑定': 1 }, total_score: 55, skill_profile: '一年经验初级岗，能配合组长完成模型减面与LOD制作，熟悉 Perforce 版本管理', reputation: 4.7 },
  { sort_order: 18, position: '3d_modeler', name: '盛叙白', dimension_scores: { '软件操作': 13, '建模技术': 16, 'UV纹理': 10, '美术素养': 6, '渲染光照': 7, '项目实践': 9, '动画绑定': 1 }, total_score: 62, skill_profile: '室内设计可视化，熟练 3ds Max+CR 渲染器，能快速出图，擅长商业快速表现', reputation: 4.3 },
  { sort_order: 19, position: '3d_modeler', name: '柳含霁', dimension_scores: { '软件操作': 8, '建模技术': 11, 'UV纹理': 7, '美术素养': 4, '渲染光照': 4, '项目实践': 3, '动画绑定': 0 }, total_score: 37, skill_profile: '参加过短期数字雕刻班，能用 ZBrush 雕刻简单生物头部，但拓扑与展UV不熟练', reputation: 4.4 },
  { sort_order: 20, position: '3d_modeler', name: '祁望舒', dimension_scores: { '软件操作': 14, '建模技术': 18, 'UV纹理': 11, '美术素养': 7, '渲染光照': 7, '项目实践': 10, '动画绑定': 2 }, total_score: 69, skill_profile: '多面手建模师，能胜任角色和场景两种资产制作，适应多种风格', reputation: 4.5 },
  { sort_order: 21, position: '3d_modeler', name: '练溪午', dimension_scores: { '软件操作': 9, '建模技术': 12, 'UV纹理': 6, '美术素养': 4, '渲染光照': 3, '项目实践': 4, '动画绑定': 0 }, total_score: 38, skill_profile: '培训机构学员，完成过一套武器资产全流程，布线有待提高，贴图重复度高', reputation: 4.1 },
  { sort_order: 22, position: '3d_modeler', name: '顾予安', dimension_scores: { '软件操作': 16, '建模技术': 22, 'UV纹理': 14, '美术素养': 8, '渲染光照': 8, '项目实践': 12, '动画绑定': 4 }, total_score: 84, skill_profile: '高级角色建模师，精通面部微表情雕刻与服饰布料模拟，带领过4人角色小组', reputation: 4.6 },
  { sort_order: 23, position: '3d_modeler', name: '辛柚柚', dimension_scores: { '软件操作': 6, '建模技术': 8, 'UV纹理': 3, '美术素养': 2, '渲染光照': 2, '项目实践': 1, '动画绑定': 0 }, total_score: 22, skill_profile: '纯兴趣探索阶段，尝试过 Nomad 雕塑 App，无专业软件经验', reputation: 4.9 },
  { sort_order: 24, position: '3d_modeler', name: '贺兰舟', dimension_scores: { '软件操作': 12, '建模技术': 16, 'UV纹理': 10, '美术素养': 5, '渲染光照': 6, '项目实践': 8, '动画绑定': 2 }, total_score: 59, skill_profile: '机械模型专精，擅长使用 Fusion 360 参数化建模与3D打印全流程，了解公差', reputation: 4.3 },
  { sort_order: 25, position: '3d_modeler', name: '柯镜辞', dimension_scores: { '软件操作': 11, '建模技术': 14, 'UV纹理': 9, '美术素养': 8, '渲染光照': 5, '项目实践': 5, '动画绑定': 0 }, total_score: 52, skill_profile: '美院背景，擅长手工模型与数字表现结合，常制作艺术装置可视化，个人风格强烈', reputation: 4.7 },
  { sort_order: 26, position: '3d_modeler', name: '巫启祯', dimension_scores: { '软件操作': 17, '建模技术': 21, 'UV纹理': 12, '美术素养': 7, '渲染光照': 8, '项目实践': 11, '动画绑定': 3 }, total_score: 79, skill_profile: '具备完整的影视高模制作经验，能配合动画组提供正确的面部布线拓扑', reputation: 4.4 },
  { sort_order: 27, position: '3d_modeler', name: '桑稚瑶', dimension_scores: { '软件操作': 8, '建模技术': 10, 'UV纹理': 5, '美术素养': 3, '渲染光照': 3, '项目实践': 2, '动画绑定': 0 }, total_score: 31, skill_profile: '选修课接触 3D 建模，使用 Blender 制作过简单卡通角色，无实际项目经历', reputation: 4.5 },
  { sort_order: 28, position: '3d_modeler', name: '岑予墨', dimension_scores: { '软件操作': 13, '建模技术': 17, 'UV纹理': 11, '美术素养': 6, '渲染光照': 7, '项目实践': 9, '动画绑定': 1 }, total_score: 64, skill_profile: '建筑可视化方向，熟练使用 SketchUp+Enscape 快速方案表现，也使用 3ds Max 精模渲染', reputation: 4.6 },
  { sort_order: 29, position: '3d_modeler', name: '倪小奈', dimension_scores: { '软件操作': 5, '建模技术': 6, 'UV纹理': 2, '美术素养': 2, '渲染光照': 1, '项目实践': 1, '动画绑定': 0 }, total_score: 17, skill_profile: '零基础兴趣者，仅看过一些在线教程，未上手任何软件', reputation: 4.0 },
  { sort_order: 30, position: '3d_modeler', name: '骆星野', dimension_scores: { '软件操作': 18, '建模技术': 23, 'UV纹理': 14, '美术素养': 9, '渲染光照': 9, '项目实践': 14, '动画绑定': 5 }, total_score: 92, skill_profile: '技术美术/动画绑定专家，精通 Biped 与四足生物骨骼架构，权重绘制完美，并能开发自动化脚本', reputation: 4.8 },
  { sort_order: 31, position: '3d_modeler', name: '涂绛雪', dimension_scores: { '软件操作': 10, '建模技术': 13, 'UV纹理': 8, '美术素养': 6, '渲染光照': 5, '项目实践': 6, '动画绑定': 0 }, total_score: 48, skill_profile: '主要使用 Marvelous Designer 制作布料模型，对服装版型有研究，其他软件较弱', reputation: 4.4 },
  { sort_order: 32, position: '3d_modeler', name: '宁书砚', dimension_scores: { '软件操作': 12, '建模技术': 15, 'UV纹理': 9, '美术素养': 5, '渲染光照': 6, '项目实践': 8, '动画绑定': 2 }, total_score: 57, skill_profile: '手绘贴图见长，能使用 BodyPaint 及 Photoshop 绘制风格化纹理，适应 NPR 项目', reputation: 4.2 },
  { sort_order: 33, position: '3d_modeler', name: '简鹿鸣', dimension_scores: { '软件操作': 9, '建模技术': 11, 'UV纹理': 6, '美术素养': 7, '渲染光照': 4, '项目实践': 4, '动画绑定': 0 }, total_score: 41, skill_profile: '工业设计背景，Rhino 曲面建模较熟练，但多边形建模与角色制作接触较少', reputation: 4.6 },
  { sort_order: 34, position: '3d_modeler', name: '折云旗', dimension_scores: { '软件操作': 14, '建模技术': 18, 'UV纹理': 12, '美术素养': 7, '渲染光照': 7, '项目实践': 10, '动画绑定': 1 }, total_score: 69, skill_profile: '游戏武器道具专家，硬表面建模规整，熟悉法线贴图与倒角细节，作品可用于实际开发', reputation: 4.5 },
  { sort_order: 35, position: '3d_modeler', name: '池蘅芜', dimension_scores: { '软件操作': 7, '建模技术': 9, 'UV纹理': 4, '美术素养': 5, '渲染光照': 3, '项目实践': 2, '动画绑定': 0 }, total_score: 30, skill_profile: '美术师范类学生，造型与色彩基础扎实，但3D软件刚入门，处于工具学习期', reputation: 4.7 },
  { sort_order: 36, position: '3d_modeler', name: '商引弦', dimension_scores: { '软件操作': 15, '建模技术': 20, 'UV纹理': 11, '美术素养': 8, '渲染光照': 8, '项目实践': 11, '动画绑定': 2 }, total_score: 75, skill_profile: '有2年游戏特效配合经验，理解粒子系统与模型交互，能根据特效需求优化模型结构', reputation: 4.3 },
  { sort_order: 37, position: '3d_modeler', name: '蒲玄素', dimension_scores: { '软件操作': 11, '建模技术': 13, 'UV纹理': 9, '美术素养': 6, '渲染光照': 5, '项目实践': 7, '动画绑定': 0 }, total_score: 51, skill_profile: '擅长快速原型制作，用于产品经理演示，熟练 Tinkercad 与 Fusion 360 基础功能', reputation: 4.1 },
  { sort_order: 38, position: '3d_modeler', name: '洛言蹊', dimension_scores: { '软件操作': 16, '建模技术': 19, 'UV纹理': 13, '美术素养': 7, '渲染光照': 7, '项目实践': 10, '动画绑定': 2 }, total_score: 74, skill_profile: '曾参与独立游戏制作，负责全部3D资产，使用 Blender 全流程，从建模到引擎导入', reputation: 4.6 },
  { sort_order: 39, position: '3d_modeler', name: '玄朗宁', dimension_scores: { '软件操作': 18, '建模技术': 22, 'UV纹理': 14, '美术素养': 9, '渲染光照': 9, '项目实践': 13, '动画绑定': 4 }, total_score: 89, skill_profile: '具备团队管理经验，曾带领5人团队完成年度重点项目，交付率高且品质稳定', reputation: 4.7 },
  { sort_order: 40, position: '3d_modeler', name: '席幼菱', dimension_scores: { '软件操作': 6, '建模技术': 7, 'UV纹理': 3, '美术素养': 2, '渲染光照': 2, '项目实践': 1, '动画绑定': 0 }, total_score: 21, skill_profile: '刚毕业大学生，只完成过课堂作业，作品集仅包含几个基础静物模型', reputation: 4.3 },
  { sort_order: 41, position: '3d_modeler', name: '应枕书', dimension_scores: { '软件操作': 12, '建模技术': 16, 'UV纹理': 10, '美术素养': 6, '渲染光照': 6, '项目实践': 8, '动画绑定': 1 }, total_score: 59, skill_profile: '模型师兼教学博主，善于用案例讲解建模思路，粉丝群活跃，技术等级中等', reputation: 4.8 },
  { sort_order: 42, position: '3d_modeler', name: '申屠素', dimension_scores: { '软件操作': 10, '建模技术': 14, 'UV纹理': 9, '美术素养': 8, '渲染光照': 5, '项目实践': 6, '动画绑定': 0 }, total_score: 52, skill_profile: '时装数字化方向，熟练使用 CLO/MD 制作虚拟服装，对材质物理属性敏感', reputation: 4.5 },
  { sort_order: 43, position: '3d_modeler', name: '路知白', dimension_scores: { '软件操作': 13, '建模技术': 17, 'UV纹理': 10, '美术素养': 5, '渲染光照': 7, '项目实践': 9, '动画绑定': 1 }, total_score: 62, skill_profile: '手办原型师，精通 ZBrush 雕刻与实体化输出，细节丰富但实时渲染经验较少', reputation: 4.2 },
  { sort_order: 44, position: '3d_modeler', name: '郁小桥', dimension_scores: { '软件操作': 8, '建模技术': 10, 'UV纹理': 5, '美术素养': 3, '渲染光照': 3, '项目实践': 3, '动画绑定': 0 }, total_score: 32, skill_profile: '职校在读，刚通过学校课程完成第一个完整道具模型，正在学习 Substance Painter', reputation: 4.9 },
  { sort_order: 45, position: '3d_modeler', name: '封北亭', dimension_scores: { '软件操作': 14, '建模技术': 19, 'UV纹理': 12, '美术素养': 8, '渲染光照': 8, '项目实践': 11, '动画绑定': 3 }, total_score: 75, skill_profile: '有建筑与游戏双背景，能根据不同引擎调整模型规范，善用 Trim Sheet 纹理', reputation: 4.5 },
  { sort_order: 46, position: '3d_modeler', name: '明如铮', dimension_scores: { '软件操作': 11, '建模技术': 15, 'UV纹理': 9, '美术素养': 5, '渲染光照': 6, '项目实践': 7, '动画绑定': 1 }, total_score: 54, skill_profile: '擅长 CAD 翻建逆向工程，将点云数据转化为实体模型，用于工业仿真', reputation: 4.0 },
  { sort_order: 47, position: '3d_modeler', name: '陶见微', dimension_scores: { '软件操作': 9, '建模技术': 12, 'UV纹理': 7, '美术素养': 6, '渲染光照': 4, '项目实践': 5, '动画绑定': 0 }, total_score: 43, skill_profile: '自学数字人方向，能使用 MetaHuman 进行面部调整与模型适配，技术探索欲强', reputation: 4.6 },
  { sort_order: 48, position: '3d_modeler', name: '褚苍术', dimension_scores: { '软件操作': 18, '建模技术': 24, 'UV纹理': 15, '美术素养': 9, '渲染光照': 9, '项目实践': 14, '动画绑定': 5 }, total_score: 94, skill_profile: '综合能力极强，精通多款 DCC 软件，曾担任外包团队技术顾问，有海外3A项目经验', reputation: 4.8 },
  { sort_order: 49, position: '3d_modeler', name: '冷松庭', dimension_scores: { '软件操作': 12, '建模技术': 14, 'UV纹理': 8, '美术素养': 7, '渲染光照': 6, '项目实践': 7, '动画绑定': 1 }, total_score: 55, skill_profile: '擅长古风场景搭建，对中式建筑结构有研究，作品文化底蕴深，但通用题材较少', reputation: 4.7 },
  { sort_order: 50, position: '3d_modeler', name: '胥小满', dimension_scores: { '软件操作': 4, '建模技术': 5, 'UV纹理': 2, '美术素养': 1, '渲染光照': 1, '项目实践': 1, '动画绑定': 0 }, total_score: 14, skill_profile: '仅接触3D建模概念不足一周，目前仅能理解三维空间坐标系，尚无实操能力', reputation: 4.0 },
]

const AI_JOBS = [
  { sort_order: 1, position: 'ai_engineer', company_name: '沧溟智能', job_name: '资深大模型算法工程师', responsibilities: '负责百亿参数级大模型的SFT微调与RLHF对齐，优化推理延迟，主导模型迭代方向', requirements: '3年以上LLM研发经验，精通PyTorch/DeepSpeed，有从0到1预训练或大规模微调经历', dimension_scores: { '基础理论': 14, 'AI核心': 28, '工程落地': 26, '场景转化': 8, '合规软技': 8, '前沿创新': 4 }, demand_intensity: 88, suggested_level: 'L4 高级' },
  { sort_order: 2, position: 'ai_engineer', company_name: '星垂科技', job_name: 'NLP算法工程师', responsibilities: '负责智能客服与文档问答系统的NLP模型研发，包括意图识别、实体抽取与多轮对话管理', requirements: '2年以上NLP经验，熟悉BERT/GPT系列模型微调，有RAG系统搭建经验优先', dimension_scores: { '基础理论': 11, 'AI核心': 24, '工程落地': 20, '场景转化': 7, '合规软技': 7, '前沿创新': 2 }, demand_intensity: 71, suggested_level: 'L3 中级' },
  { sort_order: 3, position: 'ai_engineer', company_name: '云际智联', job_name: 'AI平台开发工程师', responsibilities: '设计并维护公司AI中台，负责模型训练平台与推理服务的容器化部署、资源调度与性能优化', requirements: '精通Kubernetes/Docker，掌握模型量化与TensorRT推理加速，有MLOps体系建设经验', dimension_scores: { '基础理论': 10, 'AI核心': 18, '工程落地': 28, '场景转化': 6, '合规软技': 6, '前沿创新': 1 }, demand_intensity: 69, suggested_level: 'L3 中级' },
  { sort_order: 4, position: 'ai_engineer', company_name: '鹿鸣科技', job_name: '初级AI应用开发工程师', responsibilities: '基于公司AI中台调用大模型API，开发智能问答、文本分析等业务应用，编写技术文档', requirements: '应届或1年以内经验，熟练Python，了解Prompt工程与API调用，有完整项目demo优先', dimension_scores: { '基础理论': 6, 'AI核心': 12, '工程落地': 8, '场景转化': 4, '合规软技': 4, '前沿创新': 0 }, demand_intensity: 34, suggested_level: 'L2 初级' },
  { sort_order: 5, position: 'ai_engineer', company_name: '渡川数据', job_name: '数据标注与模型评测工程师', responsibilities: '构建AI模型评测体系，设计评测数据集与标注规范，输出模型效果分析报告，驱动模型迭代', requirements: '熟悉数据标注流程与质量管控，了解BLEU/ROUGE等常用指标，有标注平台使用经验', dimension_scores: { '基础理论': 7, 'AI核心': 10, '工程落地': 9, '场景转化': 5, '合规软技': 7, '前沿创新': 1 }, demand_intensity: 39, suggested_level: 'L2 初级' },
  { sort_order: 6, position: 'ai_engineer', company_name: '泛音网络', job_name: '推荐算法工程师', responsibilities: '负责短视频推荐系统的召回与排序算法优化，提升用户时长与留存率，设计在线A/B实验方案', requirements: '2年以上推荐系统经验，熟悉DeepFM/DSSM等模型，有大规模稀疏特征处理与实时推理经验', dimension_scores: { '基础理论': 11, 'AI核心': 20, '工程落地': 22, '场景转化': 8, '合规软技': 6, '前沿创新': 2 }, demand_intensity: 69, suggested_level: 'L3 中级' },
  { sort_order: 7, position: 'ai_engineer', company_name: '清辉智能', job_name: 'AI产品技术经理', responsibilities: '负责AI产品的技术方案设计与需求拆解，协调算法与工程团队完成项目交付，把控技术可行性', requirements: '3年以上AI相关经验，具备较强的需求分析与跨团队沟通能力，有AI产品0到1落地经验', dimension_scores: { '基础理论': 8, 'AI核心': 12, '工程落地': 10, '场景转化': 10, '合规软技': 8, '前沿创新': 1 }, demand_intensity: 49, suggested_level: 'L3 中级' },
  { sort_order: 8, position: 'ai_engineer', company_name: '竹石科技', job_name: '计算机视觉算法工程师', responsibilities: '负责图像分类与目标检测模型的研究与落地，优化模型在移动端的推理速度与精度', requirements: '精通PyTorch，熟悉YOLO/Swin Transformer等主流架构，有模型量化和移动端部署经验', dimension_scores: { '基础理论': 12, 'AI核心': 22, '工程落地': 18, '场景转化': 5, '合规软技': 5, '前沿创新': 3 }, demand_intensity: 65, suggested_level: 'L3 中级' },
  { sort_order: 9, position: 'ai_engineer', company_name: '微光科技', job_name: 'AI实习算法工程师', responsibilities: '协助算法团队完成数据预处理、模型训练实验记录与结果可视化，参与论文复现与技术调研', requirements: '在校硕士或优秀本科生，有深度学习基础，使用过PyTorch/TensorFlow，每周出勤4天以上', dimension_scores: { '基础理论': 5, 'AI核心': 10, '工程落地': 5, '场景转化': 2, '合规软技': 3, '前沿创新': 1 }, demand_intensity: 26, suggested_level: 'L1 入门' },
  { sort_order: 10, position: 'ai_engineer', company_name: '瀚海智能', job_name: 'AI安全与合规工程师', responsibilities: '负责AI系统的安全评估与算法公平性审计，设计对抗性测试用例，输出合规报告并提出修复方案', requirements: '了解AI伦理与隐私保护法规，有模型鲁棒性测试或偏见检测经验，熟悉红队测试流程', dimension_scores: { '基础理论': 9, 'AI核心': 14, '工程落地': 8, '场景转化': 6, '合规软技': 10, '前沿创新': 2 }, demand_intensity: 49, suggested_level: 'L3 中级' },
]

const MODELER_JOBS = [
  { sort_order: 1, position: '3d_modeler', company_name: '墨羽互娱', job_name: '资深角色模型师', responsibilities: '负责游戏主角及重要NPC的高模雕刻与拓扑，输出高品质PBR资产，配合动画组优化面部表情布线', requirements: '3年以上角色制作经验，精通ZBrush/Maya/Substance，有完整3A或大型手游项目经历', dimension_scores: { '软件操作': 18, '建模技术': 24, 'UV纹理': 14, '美术素养': 9, '渲染光照': 8, '项目实践': 14, '动画绑定': 4 }, demand_intensity: 91, suggested_level: 'L4 高级' },
  { sort_order: 2, position: '3d_modeler', company_name: '青时科技', job_name: '3D场景地编', responsibilities: '使用UE5搭建开放世界场景，负责地形编辑、场景装配与光照氛围营造，优化场景性能', requirements: '2年以上UE地编经验，熟悉World Creator/SpeedTree等工具，具备良好的构图与色彩把控力', dimension_scores: { '软件操作': 16, '建模技术': 18, 'UV纹理': 10, '美术素养': 8, '渲染光照': 9, '项目实践': 12, '动画绑定': 1 }, demand_intensity: 74, suggested_level: 'L3 中级' },
  { sort_order: 3, position: '3d_modeler', company_name: '弦上视觉', job_name: '影视高模建模师', responsibilities: '负责影视级角色与道具的高精度模型制作，配合灯光渲染部门完成分层渲染资产输出', requirements: '精通Maya+V-Ray/Arnold流程，能制作电影级精度的硬表面与生物模型，了解多通道渲染', dimension_scores: { '软件操作': 15, '建模技术': 20, 'UV纹理': 12, '美术素养': 7, '渲染光照': 9, '项目实践': 11, '动画绑定': 2 }, demand_intensity: 76, suggested_level: 'L3 中级' },
  { sort_order: 4, position: '3d_modeler', company_name: '初末文化', job_name: '初级3D建模师', responsibilities: '协助主美完成游戏中低模道具与场景配件的制作，按规范整理文件并提交SVN', requirements: '应届或1年以内经验，熟练Blender或3ds Max基础操作，了解PBR流程，学习意愿强', dimension_scores: { '软件操作': 10, '建模技术': 10, 'UV纹理': 6, '美术素养': 4, '渲染光照': 3, '项目实践': 4, '动画绑定': 0 }, demand_intensity: 37, suggested_level: 'L2 初级' },
  { sort_order: 5, position: '3d_modeler', company_name: '锐方制造', job_name: '工业产品建模师', responsibilities: '根据工程图纸完成高精度工业产品模型，输出用于3D打印与AR展示的优化模型', requirements: '精通Rhino/Fusion 360参数化建模，了解工程制图与公差标注，有产品动画经验优先', dimension_scores: { '软件操作': 12, '建模技术': 16, 'UV纹理': 7, '美术素养': 4, '渲染光照': 6, '项目实践': 9, '动画绑定': 2 }, demand_intensity: 56, suggested_level: 'L3 中级' },
  { sort_order: 6, position: '3d_modeler', company_name: '锦时网络', job_name: '电商建模渲染师', responsibilities: '负责电商平台产品白底图建模与高质量渲染，产出用于详情页与主图的多角度展示图', requirements: '熟练3ds Max/C4D+Octane/RS渲染，擅长快速出图与多品类适配，可兼顾简单动画', dimension_scores: { '软件操作': 12, '建模技术': 11, 'UV纹理': 8, '美术素养': 5, '渲染光照': 8, '项目实践': 7, '动画绑定': 1 }, demand_intensity: 52, suggested_level: 'L2 初级' },
  { sort_order: 7, position: '3d_modeler', company_name: '尺玉互娱', job_name: '技术美术', responsibilities: '配合美术与程序团队优化渲染管线，编写材质Shader，制定模型与贴图规范，解决性能瓶颈', requirements: '3年以上TA经验，精通UE4/UE5材质系统，有HLSL/GLSL基础，能独立完成Shader开发', dimension_scores: { '软件操作': 17, '建模技术': 16, 'UV纹理': 13, '美术素养': 7, '渲染光照': 9, '项目实践': 12, '动画绑定': 3 }, demand_intensity: 77, suggested_level: 'L4 高级' },
  { sort_order: 8, position: '3d_modeler', company_name: '非晚建筑', job_name: '建筑可视化建模师', responsibilities: '根据CAD图纸与SketchUp模型搭建建筑精模，完成日景/夜景/鸟瞰等多角度渲染输出', requirements: '2年以上建筑可视化经验，熟练3ds Max+CR/VRay，能理解建筑结构与景观搭配', dimension_scores: { '软件操作': 13, '建模技术': 14, 'UV纹理': 9, '美术素养': 6, '渲染光照': 8, '项目实践': 9, '动画绑定': 0 }, demand_intensity: 59, suggested_level: 'L2 初级' },
  { sort_order: 9, position: '3d_modeler', company_name: '澜山数字', job_name: '实习3D场景建模师', responsibilities: '协助场景组完成石块、植被、破损道具等复用资产制作，参与项目日常反馈迭代', requirements: '在校生或应届，使用Blender/Maya基本操作，提交作品集含3件以上完整模型，每周出勤4天以上', dimension_scores: { '软件操作': 7, '建模技术': 8, 'UV纹理': 4, '美术素养': 3, '渲染光照': 2, '项目实践': 3, '动画绑定': 0 }, demand_intensity: 27, suggested_level: 'L1 入门' },
  { sort_order: 10, position: '3d_modeler', company_name: '未已科技', job_name: '数字人3D建模师', responsibilities: '负责超写实数字人面部建模与皮肤纹理制作，配合绑定组完成面部表情驱动测试', requirements: '精通Maya+ZBrush+WrapX流程，有人体解剖功底，了解FACS面部编码系统', dimension_scores: { '软件操作': 16, '建模技术': 20, 'UV纹理': 14, '美术素养': 9, '渲染光照': 7, '项目实践': 11, '动画绑定': 3 }, demand_intensity: 80, suggested_level: 'L4 高级' },
]

async function clearTable(table) {
  console.log(`正在清理 ${table}...`)
  const result = await supabaseRequest('DELETE', `/rest/v1/${table}?select=id`)
  console.log(`  ${table} 清理结果: status=${result.status}`)
}

async function insertBatch(table, records, batchSize = 20) {
  console.log(`正在插入 ${records.length} 条数据到 ${table}...`)
  let inserted = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    try {
      const result = await supabaseRequest('POST', `/rest/v1/${table}`, batch)
      if (result.status >= 200 && result.status < 300) {
        inserted += batch.length
        console.log(`  批次 ${Math.floor(i / batchSize) + 1}: ${batch.length} 条成功`)
      } else {
        console.log(`  批次 ${Math.floor(i / batchSize) + 1}: 状态码 ${result.status}, 错误:`, JSON.stringify(result.body).substring(0, 200))
      }
    } catch (err) {
      console.log(`  批次 ${Math.floor(i / batchSize) + 1}: 错误 - ${err.message}`)
    }
  }

  console.log(`  ${table}: 总计插入 ${inserted}/${records.length} 条`)
  return inserted
}

async function verifyCount(table, expected) {
  try {
    const result = await supabaseRequest('GET', `/rest/v1/${table}?select=count`)
    if (result.status === 200 && Array.isArray(result.body)) {
      const count = result.body.length
      console.log(`${table}: 验证 ${count} 条 (期望: ${expected})`)
      return count
    }
    console.log(`${table}: 验证失败, status=${result.status}`)
  } catch (err) {
    console.log(`${table}: 验证错误 - ${err.message}`)
  }
  return 0
}

async function main() {
  console.log('========================================')
  console.log('  智聘 · 种子数据恢复脚本')
  console.log('========================================\n')

  console.log('【步骤1】清理现有数据...')
  await clearTable('talent_pool')
  await clearTable('job_pool')
  console.log('')

  console.log('【步骤2】插入人才库数据...')
  const allTalents = [...AI_TALENTS, ...MODELER_TALENTS]
  const talentsInserted = await insertBatch('talent_pool', allTalents, 20)
  console.log('')

  console.log('【步骤3】插入岗位库数据...')
  const allJobs = [...AI_JOBS, ...MODELER_JOBS]
  const jobsInserted = await insertBatch('job_pool', allJobs, 20)
  console.log('')

  console.log('【步骤4】验证数据完整性...')
  const talentCount = await verifyCount('talent_pool', 100)
  const jobCount = await verifyCount('job_pool', 20)

  console.log('\n========================================')
  console.log('  恢复结果汇总')
  console.log('========================================')
  console.log(`  talent_pool: ${talentCount}/100 条`)
  console.log(`  job_pool:    ${jobCount}/20 条`)
  console.log('========================================')

  if (talentCount === 100 && jobCount === 20) {
    console.log('✅ 所有种子数据恢复成功！')
  } else {
    console.log('⚠️  数据恢复存在差异，请检查 Supabase 表结构')
  }
}

main().catch(console.error)
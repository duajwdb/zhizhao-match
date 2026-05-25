import https from 'https'

const SUPABASE_URL = 'https://hbzbnyvjkuqivcfbgumk.supabase.co'
const ANON_KEY = 'sb_publishable_2oqoombRmJ15ksIxvzRjjw_nmRr9sZf'

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path)
    const opts = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      timeout: 15000,
    }
    const r = https.request(opts, (res) => {
      let d = ''
      res.on('data', (c) => (d += c))
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }) }
        catch { resolve({ status: res.statusCode, body: d }) }
      })
    })
    r.on('error', reject)
    r.on('timeout', () => { r.destroy(); reject(new Error('timeout')) })
    if (body) r.write(JSON.stringify(body))
    r.end()
  })
}

const candidateProfiles = [
  { name: '【预设】张铭远', position: 'ai_engineer', mode: 'jobseeker', dimensions: [{ name: '基础理论', score: 4, max_score: 15, star_rating: 1.3 }, { name: 'AI核心', score: 10, max_score: 30, star_rating: 1.7 }, { name: '工程落地', score: 7, max_score: 30, star_rating: 1.2 }, { name: '场景转化', score: 4, max_score: 10, star_rating: 2.0 }, { name: '合规软技', score: 3, max_score: 10, star_rating: 1.5 }, { name: '前沿创新', score: 2, max_score: 5, star_rating: 2.0 }], total_score: 30, star_rating: 1.5, text_report: '【求职者·AI工程师·初级级】具备Python和PyTorch基础，可独立完成数据预处理和简单模型训练，对NLP和CV技术有初步了解，正在通过项目实战积累工程经验', date: '2026-05-11 00:00:00', curve_node: 101 },
  { name: '【预设】吴思睿', position: 'ai_engineer', mode: 'jobseeker', dimensions: [{ name: '基础理论', score: 10, max_score: 15, star_rating: 3.3 }, { name: 'AI核心', score: 20, max_score: 30, star_rating: 3.3 }, { name: '工程落地', score: 20, max_score: 30, star_rating: 3.3 }, { name: '场景转化', score: 7, max_score: 10, star_rating: 3.5 }, { name: '合规软技', score: 7, max_score: 10, star_rating: 3.5 }, { name: '前沿创新', score: 3, max_score: 5, star_rating: 3.0 }], total_score: 67, star_rating: 3.4, text_report: '【求职者·AI工程师·中级级】精通Transformer架构微调，熟练使用LangChain构建RAG系统，参与过2个企业级智能问答项目交付，具备模型量化部署经验', date: '2026-05-15 00:00:00', curve_node: 102 },
  { name: '【预设】何子帆', position: 'ai_engineer', mode: 'jobseeker', dimensions: [{ name: '基础理论', score: 14, max_score: 15, star_rating: 4.7 }, { name: 'AI核心', score: 27, max_score: 30, star_rating: 4.5 }, { name: '工程落地', score: 27, max_score: 30, star_rating: 4.5 }, { name: '场景转化', score: 9, max_score: 10, star_rating: 4.5 }, { name: '合规软技', score: 8, max_score: 10, star_rating: 4.0 }, { name: '前沿创新', score: 5, max_score: 5, star_rating: 5.0 }], total_score: 90, star_rating: 4.5, text_report: '【求职者·AI工程师·高级级】全栈AI工程师，主导过百万用户级推荐系统升级，精通大模型SFT/RLHF全流程，发表过顶会论文，具备团队技术领导力', date: '2026-05-19 00:00:00', curve_node: 103 },
  { name: '【预设】陈卓然', position: '3d_modeler', mode: 'jobseeker', dimensions: [{ name: '软件操作', score: 5, max_score: 20, star_rating: 1.3 }, { name: '建模技术', score: 7, max_score: 25, star_rating: 1.4 }, { name: 'UV纹理', score: 4, max_score: 15, star_rating: 1.3 }, { name: '美术素养', score: 3, max_score: 10, star_rating: 1.5 }, { name: '渲染光照', score: 3, max_score: 10, star_rating: 1.5 }, { name: '项目实践', score: 4, max_score: 15, star_rating: 1.3 }, { name: '动画绑定', score: 1, max_score: 5, star_rating: 1.0 }], total_score: 27, star_rating: 1.4, text_report: '【求职者·3D建模师·初级级】掌握Blender基础建模与展UV，能独立制作简单道具和场景元素，了解PBR材质流程，正在学习ZBrush数字雕刻', date: '2026-05-12 00:00:00', curve_node: 111 },
  { name: '【预设】徐佳桐', position: '3d_modeler', mode: 'jobseeker', dimensions: [{ name: '软件操作', score: 14, max_score: 20, star_rating: 3.5 }, { name: '建模技术', score: 18, max_score: 25, star_rating: 3.6 }, { name: 'UV纹理', score: 10, max_score: 15, star_rating: 3.3 }, { name: '美术素养', score: 7, max_score: 10, star_rating: 3.5 }, { name: '渲染光照', score: 7, max_score: 10, star_rating: 3.5 }, { name: '项目实践', score: 11, max_score: 15, star_rating: 3.7 }, { name: '动画绑定', score: 2, max_score: 5, star_rating: 2.0 }], total_score: 69, star_rating: 3.4, text_report: '【求职者·3D建模师·中级级】熟练Maya与Substance Painter全流程，擅长硬表面建模与材质表现，参与过手游角色资产制作，熟悉UE5引擎导入规范', date: '2026-05-16 00:00:00', curve_node: 112 },
  { name: '【预设】方俊昊', position: '3d_modeler', mode: 'jobseeker', dimensions: [{ name: '软件操作', score: 19, max_score: 20, star_rating: 4.8 }, { name: '建模技术', score: 23, max_score: 25, star_rating: 4.6 }, { name: 'UV纹理', score: 14, max_score: 15, star_rating: 4.7 }, { name: '美术素养', score: 9, max_score: 10, star_rating: 4.5 }, { name: '渲染光照', score: 9, max_score: 10, star_rating: 4.5 }, { name: '项目实践', score: 14, max_score: 15, star_rating: 4.7 }, { name: '动画绑定', score: 4, max_score: 5, star_rating: 4.0 }], total_score: 92, star_rating: 4.6, text_report: '【求职者·3D建模师·高级级】资深角色建模师，精通ZBrush高模雕刻与精细拓扑，主导过3A项目角色管线，擅长面部微表情建模与毛发系统', date: '2026-05-20 00:00:00', curve_node: 113 },
  { name: '【预设】刘雨辰', position: 'ai_engineer', mode: 'student', dimensions: [{ name: '基础理论', score: 3, max_score: 15, star_rating: 1.0 }, { name: 'AI核心', score: 6, max_score: 30, star_rating: 1.0 }, { name: '工程落地', score: 4, max_score: 30, star_rating: 0.7 }, { name: '场景转化', score: 3, max_score: 10, star_rating: 1.5 }, { name: '合规软技', score: 2, max_score: 10, star_rating: 1.0 }, { name: '前沿创新', score: 1, max_score: 5, star_rating: 1.0 }], total_score: 19, star_rating: 1.0, text_report: '【大学生·AI工程师·初级级】在校生，学过Python基础与吴恩达机器学习课程，能用Jupyter完成简单数据分析，对AI方向有浓厚兴趣但项目经验有限', date: '2026-05-10 00:00:00', curve_node: 201 },
  { name: '【预设】沈雪瑶', position: 'ai_engineer', mode: 'student', dimensions: [{ name: '基础理论', score: 8, max_score: 15, star_rating: 2.7 }, { name: 'AI核心', score: 15, max_score: 30, star_rating: 2.5 }, { name: '工程落地', score: 12, max_score: 30, star_rating: 2.0 }, { name: '场景转化', score: 6, max_score: 10, star_rating: 3.0 }, { name: '合规软技', score: 6, max_score: 10, star_rating: 3.0 }, { name: '前沿创新', score: 2, max_score: 5, star_rating: 2.0 }], total_score: 49, star_rating: 2.5, text_report: '【大学生·AI工程师·中级级】计算机专业大四在读，熟练PyTorch框架，参加过Kaggle竞赛并获铜牌，有大模型API调用和Prompt工程实践经验', date: '2026-05-14 00:00:00', curve_node: 202 },
  { name: '【预设】王敬轩', position: 'ai_engineer', mode: 'student', dimensions: [{ name: '基础理论', score: 12, max_score: 15, star_rating: 4.0 }, { name: 'AI核心', score: 22, max_score: 30, star_rating: 3.7 }, { name: '工程落地', score: 20, max_score: 30, star_rating: 3.3 }, { name: '场景转化', score: 7, max_score: 10, star_rating: 3.5 }, { name: '合规软技', score: 7, max_score: 10, star_rating: 3.5 }, { name: '前沿创新', score: 3, max_score: 5, star_rating: 3.0 }], total_score: 71, star_rating: 3.6, text_report: '【大学生·AI工程师·高级级】研究生在读，研究方向为多模态大模型，参与导师国家基金项目，有2篇会议论文在审，在头部AI公司实习过6个月', date: '2026-05-18 00:00:00', curve_node: 203 },
  { name: '【预设】赵明哲', position: '3d_modeler', mode: 'student', dimensions: [{ name: '软件操作', score: 4, max_score: 20, star_rating: 1.0 }, { name: '建模技术', score: 5, max_score: 25, star_rating: 1.0 }, { name: 'UV纹理', score: 3, max_score: 15, star_rating: 1.0 }, { name: '美术素养', score: 2, max_score: 10, star_rating: 1.0 }, { name: '渲染光照', score: 2, max_score: 10, star_rating: 1.0 }, { name: '项目实践', score: 3, max_score: 15, star_rating: 1.0 }, { name: '动画绑定', score: 0, max_score: 5, star_rating: 0 }], total_score: 19, star_rating: 0.9, text_report: '【大学生·3D建模师·初级级】大一新生，美术基础较好，刚接触Blender建模，完成过简单卡通角色制作，对3D行业充满热情，正在系统学习中', date: '2026-05-11 00:00:00', curve_node: 211 },
  { name: '【预设】林小雅', position: '3d_modeler', mode: 'student', dimensions: [{ name: '软件操作', score: 10, max_score: 20, star_rating: 2.5 }, { name: '建模技术', score: 12, max_score: 25, star_rating: 2.4 }, { name: 'UV纹理', score: 7, max_score: 15, star_rating: 2.3 }, { name: '美术素养', score: 5, max_score: 10, star_rating: 2.5 }, { name: '渲染光照', score: 5, max_score: 10, star_rating: 2.5 }, { name: '项目实践', score: 8, max_score: 15, star_rating: 2.7 }, { name: '动画绑定', score: 1, max_score: 5, star_rating: 1.0 }], total_score: 48, star_rating: 2.4, text_report: '【大学生·3D建模师·中级级】数字媒体专业大三，熟练Blender和Substance Painter操作，有独立完成道具和场景模型的经验，参加校内3D设计大赛获奖', date: '2026-05-15 00:00:00', curve_node: 212 },
  { name: '【预设】韩宇阳', position: '3d_modeler', mode: 'student', dimensions: [{ name: '软件操作', score: 16, max_score: 20, star_rating: 4.0 }, { name: '建模技术', score: 18, max_score: 25, star_rating: 3.6 }, { name: 'UV纹理', score: 11, max_score: 15, star_rating: 3.7 }, { name: '美术素养', score: 7, max_score: 10, star_rating: 3.5 }, { name: '渲染光照', score: 7, max_score: 10, star_rating: 3.5 }, { name: '项目实践', score: 12, max_score: 15, star_rating: 4.0 }, { name: '动画绑定', score: 2, max_score: 5, star_rating: 2.0 }], total_score: 73, star_rating: 3.6, text_report: '【大学生·3D建模师·高级级】美院交互设计研究生，精通Maya+ZBrush角色全流程，有独立游戏3D资产制作经验，作品曾在798展出，实习于知名游戏工作室', date: '2026-05-19 00:00:00', curve_node: 213 },
]

const hrJobs = [
  { name: '【预设】星途科技·初级AI开发', position: 'ai_engineer', status: 'active', description: '招聘初级AI应用开发工程师，调用AI中台大模型API开发应用', profile_doc: '招聘初级AI应用开发工程师，主要工作为调用公司AI中台大模型API，开发智能问答和文本分析应用。要求：应届或1年以内经验，熟练Python，了解Prompt工程，有完整项目demo优先', dimensions: [{ name: '基础理论', score: 5, max_score: 15, star_rating: 1.7 }, { name: 'AI核心', score: 10, max_score: 30, star_rating: 1.7 }, { name: '工程落地', score: 8, max_score: 30, star_rating: 1.3 }, { name: '场景转化', score: 4, max_score: 10, star_rating: 2.0 }, { name: '合规软技', score: 3, max_score: 10, star_rating: 1.5 }, { name: '前沿创新', score: 0, max_score: 5, star_rating: 0 }], total_score: 30, star_rating: 1.4, company: '星途科技' },
  { name: '【预设】锦程数字·NLP工程师', position: 'ai_engineer', status: 'active', description: '招聘NLP算法工程师，负责智能客服与文档问答的模型研发', profile_doc: '招聘NLP算法工程师，负责智能客服与文档问答的模型研发。要求：2年以上NLP经验，精通BERT/GPT微调，有RAG系统搭建经验，能独立完成从需求分析到模型上线的全流程', dimensions: [{ name: '基础理论', score: 10, max_score: 15, star_rating: 3.3 }, { name: 'AI核心', score: 20, max_score: 30, star_rating: 3.3 }, { name: '工程落地', score: 20, max_score: 30, star_rating: 3.3 }, { name: '场景转化', score: 6, max_score: 10, star_rating: 3.0 }, { name: '合规软技', score: 6, max_score: 10, star_rating: 3.0 }, { name: '前沿创新', score: 2, max_score: 5, star_rating: 2.0 }], total_score: 64, star_rating: 3.2, company: '锦程数字' },
  { name: '【预设】鑫创未来·资深大模型', position: 'ai_engineer', status: 'active', description: '招聘资深大模型算法工程师，负责百亿参数级模型SFT微调', profile_doc: '招聘资深大模型算法工程师，负责百亿参数级模型SFT微调与RLHF对齐，主导模型迭代方向。要求：3年以上LLM研发经验，精通DeepSpeed/分布式训练，有从0到1预训练经历优先', dimensions: [{ name: '基础理论', score: 14, max_score: 15, star_rating: 4.7 }, { name: 'AI核心', score: 28, max_score: 30, star_rating: 4.7 }, { name: '工程落地', score: 26, max_score: 30, star_rating: 4.3 }, { name: '场景转化', score: 9, max_score: 10, star_rating: 4.5 }, { name: '合规软技', score: 8, max_score: 10, star_rating: 4.0 }, { name: '前沿创新', score: 4, max_score: 5, star_rating: 4.0 }], total_score: 89, star_rating: 4.5, company: '鑫创未来' },
  { name: '【预设】卓望互娱·初级3D建模', position: '3d_modeler', status: 'active', description: '招聘初级3D建模师，协助主美完成游戏中低模道具与场景配件制作', profile_doc: '招聘初级3D建模师，协助主美完成游戏中低模道具与场景配件制作，按规范整理文件并提交版本管理。要求：应届或1年以内经验，熟练Blender/3ds Max基础操作，了解PBR流程，学习意愿强', dimensions: [{ name: '软件操作', score: 8, max_score: 20, star_rating: 2.0 }, { name: '建模技术', score: 6, max_score: 25, star_rating: 1.2 }, { name: 'UV纹理', score: 4, max_score: 15, star_rating: 1.3 }, { name: '美术素养', score: 3, max_score: 10, star_rating: 1.5 }, { name: '渲染光照', score: 2, max_score: 10, star_rating: 1.0 }, { name: '项目实践', score: 4, max_score: 15, star_rating: 1.3 }, { name: '动画绑定', score: 0, max_score: 5, star_rating: 0 }], total_score: 27, star_rating: 1.3, company: '卓望互娱' },
  { name: '【预设】千寻智能·场景地编', position: '3d_modeler', status: 'active', description: '招聘3D场景地编，使用UE5搭建开放世界场景', profile_doc: '招聘3D场景地编，使用UE5搭建开放世界场景，负责地形编辑与光照氛围营造。要求：2年以上地编经验，熟练World Creator/SpeedTree，具备良好的构图与色彩把控力', dimensions: [{ name: '软件操作', score: 14, max_score: 20, star_rating: 3.5 }, { name: '建模技术', score: 16, max_score: 25, star_rating: 3.2 }, { name: 'UV纹理', score: 10, max_score: 15, star_rating: 3.3 }, { name: '美术素养', score: 7, max_score: 10, star_rating: 3.5 }, { name: '渲染光照', score: 6, max_score: 10, star_rating: 3.0 }, { name: '项目实践', score: 10, max_score: 15, star_rating: 3.3 }, { name: '动画绑定', score: 1, max_score: 5, star_rating: 1.0 }], total_score: 64, star_rating: 3.2, company: '千寻智能' },
  { name: '【预设】中科智造·资深角色', position: '3d_modeler', status: 'active', description: '招聘资深角色模型师，负责游戏主角高模雕刻与拓扑', profile_doc: '招聘资深角色模型师，负责游戏主角高模雕刻与拓扑，输出高品质PBR资产。要求：3年以上角色制作经验，精通ZBrush/Maya/Substance，有完整3A或大型手游项目经历', dimensions: [{ name: '软件操作', score: 18, max_score: 20, star_rating: 4.5 }, { name: '建模技术', score: 23, max_score: 25, star_rating: 4.6 }, { name: 'UV纹理', score: 14, max_score: 15, star_rating: 4.7 }, { name: '美术素养', score: 9, max_score: 10, star_rating: 4.5 }, { name: '渲染光照', score: 9, max_score: 10, star_rating: 4.5 }, { name: '项目实践', score: 14, max_score: 15, star_rating: 4.7 }, { name: '动画绑定', score: 4, max_score: 5, star_rating: 4.0 }], total_score: 91, star_rating: 4.6, company: '中科智造' },
]

async function clearExistingPresets(table) {
  const nameCol = 'name'
  const r = await req('DELETE', `/rest/v1/${table}?${nameCol}=ilike.【预设】*`)
  console.log(`  清理 ${table} 已有预设: status=${r.status}`)
}

async function insertBatch(table, records) {
  let inserted = 0
  for (const record of records) {
    try {
      const r = await req('POST', `/rest/v1/${table}`, record)
      if (r.status >= 200 && r.status < 300) {
        inserted++
        console.log(`  OK ${record.name} (${table})`)
      } else {
        console.log(`  FAIL ${record.name}: status=${r.status} ${JSON.stringify(r.body).substring(0, 120)}`)
      }
    } catch (err) {
      console.log(`  ERR ${record.name}: ${err.message}`)
    }
  }
  return inserted
}

async function main() {
  console.log('========================================')
  console.log('  预设画像种子数据插入脚本 v2')
  console.log('========================================\n')

  console.log('【步骤1】清理已有预设数据...')
  await clearExistingPresets('candidate_profiles')
  await clearExistingPresets('hr_jobs')
  console.log('')

  console.log('【步骤2】插入12个求职者/大学生预设画像...')
  const cpInserted = await insertBatch('candidate_profiles', candidateProfiles)
  console.log(`  结果: ${cpInserted}/12\n`)

  console.log('【步骤3】插入6个HR预设岗位...')
  const hjInserted = await insertBatch('hr_jobs', hrJobs)
  console.log(`  结果: ${hjInserted}/6\n`)

  console.log('========================================')
  console.log(`  汇总: candidate_profiles ${cpInserted}/12, hr_jobs ${hjInserted}/6`)
  console.log('========================================')
}

main().catch(console.error)
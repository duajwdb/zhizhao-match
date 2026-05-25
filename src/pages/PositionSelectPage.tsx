import { useNavigate } from 'react-router-dom'
import { useAppStore, Position } from '../store/useAppStore'
import { motion } from 'framer-motion'
import { Cpu, Box, ArrowRight, Sparkles } from 'lucide-react'

const positions: { key: Position; label: string; icon: typeof Cpu; color: string; borderColor: string; glowColor: string; desc: string; skills: string[] }[] = [
  {
    key: 'ai_engineer',
    label: 'AI工程师',
    icon: Cpu,
    color: 'from-violet-500/20 to-tech-500/20',
    borderColor: 'border-violet-500/30',
    glowColor: 'shadow-violet-500/20',
    desc: '人工智能领域的工程实践专家，覆盖机器学习、深度学习、NLP、计算机视觉等方向',
    skills: ['机器学习', '深度学习', 'Python', '模型部署', '数据处理'],
  },
  {
    key: '3d_modeler',
    label: '3D建模师',
    icon: Box,
    color: 'from-teal-500/20 to-cyan-500/20',
    borderColor: 'border-teal-500/30',
    glowColor: 'shadow-teal-500/20',
    desc: '三维数字内容创作专家，覆盖角色建模、场景构建、材质贴图、渲染等方向',
    skills: ['Maya/Blender', 'ZBrush', 'Substance', 'PBR流程', '拓扑优化'],
  },
]

export default function PositionSelectPage() {
  const { setPosition, userMode } = useAppStore()
  const navigate = useNavigate()

  const handleSelect = (pos: Position) => {
    setPosition(pos)
    navigate('/quiz')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tech-500/10 border border-tech-500/20 text-tech-300 text-xs font-medium tracking-wide uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          选择目标岗位
        </div>
        <h1 className="text-3xl md:text-4xl font-display text-white mb-3">
          选择您的目标岗位
        </h1>
        <p className="text-slate-400 max-w-md mx-auto text-sm">
          {userMode === 'student'
            ? '大学生最多可选择1-2个方向进行测评，先选择一个开始吧'
            : '选择岗位后将进入标准化题库测评流程'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {positions.map((pos, index) => (
          <motion.button
            key={pos.key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 + 0.2 }}
            onClick={() => handleSelect(pos.key)}
            className={`glass-card p-8 text-left group cursor-pointer hover:scale-[1.02] transition-all duration-300 relative overflow-hidden ${pos.glowColor}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${pos.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pos.color} border ${pos.borderColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <pos.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-display text-white mb-2">{pos.label}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">{pos.desc}</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {pos.skills.map(skill => (
                  <span key={skill} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-slate-400 border border-white/5">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-tech-400 text-sm font-medium group-hover:text-tech-300 transition-colors">
                开始测评 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
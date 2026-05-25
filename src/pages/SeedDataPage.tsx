import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Database, CheckCircle2, AlertCircle, Loader2, Upload, Trash2, RefreshCw, Download } from 'lucide-react'
import type { Position } from '../store/useAppStore'
import { POSITION_LABELS } from '../config/questionBankMapping'
import {
  AI_TALENTS, AI_JOBS, MODELER_TALENTS, MODELER_JOBS,
  type SeedTalent, type SeedJob
} from '../data/seedData'
import {
  countTalentPool, countJobPool,
  insertTalentBatch, insertJobBatch,
  clearTalentPool, clearJobPool
} from '../services/database'

interface TableStatus {
  name: string
  label: string
  count: number
  loading: boolean
  importing: boolean
  clearing: boolean
  result: { success: boolean; message: string } | null
}

export default function SeedDataPage() {
  const [tables, setTables] = useState<Record<string, TableStatus>>({})
  const [globalLoading, setGlobalLoading] = useState(true)
  const [globalResult, setGlobalResult] = useState<{ success: boolean; message: string } | null>(null)

  const loadCounts = async () => {
    setGlobalLoading(true)
    const keys = ['ai_talent', 'ai_job', 'modeler_talent', 'modeler_job']
    const counts = await Promise.all([
      countTalentPool('ai_engineer'),
      countJobPool('ai_engineer'),
      countTalentPool('3d_modeler'),
      countJobPool('3d_modeler'),
    ])
    const newTables: Record<string, TableStatus> = {}
    const labels = ['AI工程师人才库', 'AI工程师岗位库', '3D建模师人才库', '3D建模师岗位库']
    keys.forEach((key, i) => {
      newTables[key] = {
        name: key,
        label: labels[i],
        count: counts[i],
        loading: false,
        importing: false,
        clearing: false,
        result: null,
      }
    })
    setTables(newTables)
    setGlobalLoading(false)
    setGlobalResult(null)
  }

  useEffect(() => {
    loadCounts()
  }, [])

  const getDataForTable = (key: string): { talents?: SeedTalent[]; jobs?: SeedJob[]; position: Position } => {
    switch (key) {
      case 'ai_talent': return { talents: AI_TALENTS, position: 'ai_engineer' }
      case 'ai_job': return { jobs: AI_JOBS, position: 'ai_engineer' }
      case 'modeler_talent': return { talents: MODELER_TALENTS, position: '3d_modeler' }
      case 'modeler_job': return { jobs: MODELER_JOBS, position: '3d_modeler' }
      default: return { position: 'ai_engineer' }
    }
  }

  const handleImport = async (key: string) => {
    setTables((prev) => ({ ...prev, [key]: { ...prev[key], importing: true, result: null } }))

    const { talents, jobs, position } = getDataForTable(key)

    if (talents) {
      const rows = talents.map((t) => ({
        position: t.position,
        name: t.name,
        dimension_scores: t.dimension_scores,
        total_score: t.total_score,
        skill_profile: t.skill_profile,
        reputation: t.reputation,
        sort_order: t.sort_order,
      }))
      const { inserted, error } = await insertTalentBatch(rows)
      setTables((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          importing: false,
          count: error ? prev[key].count : prev[key].count + inserted,
          result: error
            ? { success: false, message: `导入失败: ${error}` }
            : { success: true, message: `成功导入 ${inserted} 条记录` },
        },
      }))
    } else if (jobs) {
      const rows = jobs.map((j) => ({
        position: j.position,
        company_name: j.company_name,
        job_name: j.job_name,
        responsibilities: j.responsibilities,
        requirements: j.requirements,
        dimension_scores: j.dimension_scores,
        demand_intensity: j.demand_intensity,
        suggested_level: j.suggested_level,
        sort_order: j.sort_order,
      }))
      const { inserted, error } = await insertJobBatch(rows)
      setTables((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          importing: false,
          count: error ? prev[key].count : prev[key].count + inserted,
          result: error
            ? { success: false, message: `导入失败: ${error}` }
            : { success: true, message: `成功导入 ${inserted} 条记录` },
        },
      }))
    }
  }

  const handleClear = async (key: string) => {
    setTables((prev) => ({ ...prev, [key]: { ...prev[key], clearing: true, result: null } }))

    const { position } = getDataForTable(key)
    const isTalent = key.includes('talent')
    const { deleted, error } = isTalent
      ? await clearTalentPool(position)
      : await clearJobPool(position)

    setTables((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        clearing: false,
        count: error ? prev[key].count : Math.max(0, prev[key].count - deleted),
        result: error
          ? { success: false, message: `清空失败: ${error}` }
          : { success: true, message: `成功删除 ${deleted} 条记录` },
      },
    }))
  }

  const handleImportAll = async () => {
    setGlobalResult(null)
    setGlobalLoading(true)
    const results: string[] = []
    const keys = ['ai_talent', 'ai_job', 'modeler_talent', 'modeler_job']

    for (const key of keys) {
      const { talents, jobs, position } = getDataForTable(key)
      setTables((prev) => ({ ...prev, [key]: { ...prev[key], importing: true, result: null } }))

      if (talents) {
        const rows = talents.map((t) => ({
          position: t.position,
          name: t.name,
          dimension_scores: t.dimension_scores,
          total_score: t.total_score,
          skill_profile: t.skill_profile,
          reputation: t.reputation,
          sort_order: t.sort_order,
        }))
        const { inserted, error } = await insertTalentBatch(rows)
        if (error) {
          results.push(`${tables[key]?.label || key}: 导入失败 - ${error}`)
        } else {
          results.push(`${tables[key]?.label || key}: 成功导入 ${inserted} 条`)
        }
      } else if (jobs) {
        const rows = jobs.map((j) => ({
          position: j.position,
          company_name: j.company_name,
          job_name: j.job_name,
          responsibilities: j.responsibilities,
          requirements: j.requirements,
          dimension_scores: j.dimension_scores,
          demand_intensity: j.demand_intensity,
          suggested_level: j.suggested_level,
          sort_order: j.sort_order,
        }))
        const { inserted, error } = await insertJobBatch(rows)
        if (error) {
          results.push(`${tables[key]?.label || key}: 导入失败 - ${error}`)
        } else {
          results.push(`${tables[key]?.label || key}: 成功导入 ${inserted} 条`)
        }
      }
    }

    setGlobalLoading(false)
    await loadCounts()
    setGlobalResult({
      success: results.every((r) => r.includes('成功')),
      message: results.join('\n'),
    })
  }

  const allTablesReady = Object.values(tables).every((t) => t.count > 0)
  const anyTablePopulated = Object.values(tables).some((t) => t.count > 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tech-500/10 border border-tech-500/20 text-tech-300 text-xs font-medium tracking-wide uppercase mb-4">
            <Database className="w-3.5 h-3.5" />
            种子数据管理
          </div>
          <h1 className="text-2xl md:text-3xl font-display text-white mb-2">数据库导入工具</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            将AI工程师和3D建模师的模拟人才库与岗位库数据导入 Supabase，以支持产品匹配功能测试。
            导入前请先在 Supabase SQL Editor 中执行建表脚本。
          </p>
        </div>

        {globalResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-5 rounded-xl border ${
              globalResult.success
                ? 'bg-green-500/5 border-green-500/10'
                : 'bg-gold-500/5 border-gold-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              {globalResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gold-400 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={`text-sm font-heading font-semibold ${globalResult.success ? 'text-green-400' : 'text-gold-400'}`}>
                  {globalResult.success ? '全部导入完成' : '导入过程中出现问题'}
                </p>
                <pre className="text-xs text-slate-400 mt-2 whitespace-pre-wrap">{globalResult.message}</pre>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold text-white">数据表状态</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={loadCounts}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              刷新
            </button>
            <button
              onClick={handleImportAll}
              disabled={globalLoading}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {globalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              一键导入全部
            </button>
          </div>
        </div>

        {globalLoading && Object.keys(tables).length === 0 ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-tech-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">正在检查数据表状态...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.values(tables).map((table) => (
              <motion.div
                key={table.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      table.count > 0 ? 'bg-teal-500/10' : 'bg-slate-500/10'
                    }`}>
                      {table.count > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-teal-400" />
                      ) : (
                        <Database className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-heading font-semibold text-white">{table.label}</p>
                      <p className="text-xs text-slate-500">
                        {table.count > 0
                          ? `已有 ${table.count} 条记录`
                          : '暂无数据'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {table.count > 0 && (
                      <button
                        onClick={() => handleClear(table.name)}
                        disabled={table.clearing}
                        className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-red-500/10 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {table.clearing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        清空
                      </button>
                    )}
                    <button
                      onClick={() => handleImport(table.name)}
                      disabled={table.importing}
                      className="px-4 py-1.5 rounded-lg text-xs bg-tech-500/10 text-tech-300 border border-tech-500/20 hover:bg-tech-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {table.importing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      导入
                    </button>
                  </div>
                </div>

                {table.result && (
                  <div className={`mt-3 p-3 rounded-lg text-xs flex items-start gap-2 ${
                    table.result.success
                      ? 'bg-teal-500/5 border border-teal-500/10 text-teal-400'
                      : 'bg-red-500/5 border border-red-500/10 text-red-400'
                  }`}>
                    {table.result.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{table.result.message}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
        >
          <h3 className="text-sm font-heading font-semibold text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gold-400" />
            使用说明
          </h3>
          <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
            <li>在 Supabase 控制台的 SQL Editor 中执行 <code className="px-1.5 py-0.5 rounded bg-white/5 text-tech-400">sql/seed_tables.sql</code> 建表脚本</li>
            <li>确认 <code className="px-1.5 py-0.5 rounded bg-white/5 text-tech-400">talent_pool</code> 和 <code className="px-1.5 py-0.5 rounded bg-white/5 text-tech-400">job_pool</code> 表已创建成功</li>
            <li>点击各表"导入"按钮或"一键导入全部"，将种子数据写入 Supabase</li>
            <li>导入后刷新状态确认记录数：AI工程师人才库 50 条、岗位库 10 条、3D建模师人才库 50 条、岗位库 10 条</li>
            <li>确认数据无误后，即可在匹配引擎中使用真实种子数据进行测试</li>
          </ol>
        </motion.div>
      </motion.div>
    </div>
  )
}
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Database, Wifi, WifiOff, CheckCircle2, AlertCircle, Clock,
  Zap, Upload, RefreshCw, Loader2, Activity, Server, Shield,
  ChevronDown, ChevronUp, BarChart3, Table2, FileCheck, Hash, Users,
  Copy, ExternalLink, Terminal
} from 'lucide-react'
import { supabase, isSupabaseConfigured, getSupabase } from '../config/supabaseClient'
import {
  countTalentPool, countJobPool, fetchTalentPool, fetchJobPool,
} from '../services/database'
import { getDimensionNames, getDimensionMax } from '../data/seedData'
import type { Position } from '../store/useAppStore'

interface TestResult {
  label: string
  status: 'pending' | 'running' | 'pass' | 'fail' | 'warn'
  message: string
  details?: string
  elapsedMs?: number
}

interface SpeedResult {
  size: string
  records: number
  payloadBytes: number
  elapsedMs: number
  throughputKbps: number
  status: 'pending' | 'running' | 'pass' | 'fail'
}

interface SeedVerification {
  table: string
  label: string
  expectedCount: number
  actualCount: number
  status: 'pending' | 'running' | 'pass' | 'fail' | 'warn'
  samples: any[]
  dimensionCheck: { passed: boolean; message: string }
}

const MIN_SMALL_BYTES = 400
const MIN_MEDIUM_BYTES = 4000
const MIN_LARGE_BYTES = 20000

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const SETUP_SQL = `-- 智聘 · 种子数据表建表脚本
-- 在 Supabase SQL Editor 中粘贴并执行

CREATE TABLE IF NOT EXISTS talent_pool (
  id SERIAL PRIMARY KEY,
  position VARCHAR(50) NOT NULL CHECK (position IN ('ai_engineer', '3d_modeler')),
  name VARCHAR(100) NOT NULL,
  dimension_scores JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  skill_profile TEXT,
  reputation DECIMAL(3,1) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_pool (
  id SERIAL PRIMARY KEY,
  position VARCHAR(50) NOT NULL CHECK (position IN ('ai_engineer', '3d_modeler')),
  company_name VARCHAR(200) NOT NULL,
  job_name VARCHAR(200) NOT NULL,
  responsibilities TEXT,
  requirements TEXT,
  dimension_scores JSONB NOT NULL,
  demand_intensity INTEGER NOT NULL DEFAULT 0,
  suggested_level VARCHAR(50),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_results (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  match_score INTEGER NOT NULL DEFAULT 0,
  match_points TEXT[] DEFAULT '{}',
  gap_points TEXT[] DEFAULT '{}',
  reputation_score DECIMAL(3,1) NOT NULL DEFAULT 4.0,
  recent_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE talent_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all to talent_pool" ON talent_pool FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to job_pool" ON job_pool FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to match_results" ON match_results FOR ALL USING (true) WITH CHECK (true);`

function copyToClipboard(text: string): boolean {
  try {
    navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}

export default function SupabaseDiagnosticPage() {
  const [running, setRunning] = useState(false)
  const [pagePhase, setPagePhase] = useState<'idle' | 'running' | 'done'>('idle')

  const [connResults, setConnResults] = useState<TestResult[]>([])
  const [speedResults, setSpeedResults] = useState<SpeedResult[]>([])
  const [seedVerifications, setSeedVerifications] = useState<SeedVerification[]>([])
  const [speedTestRun, setSpeedTestRun] = useState(false)

  const [connExpanded, setConnExpanded] = useState(true)
  const [speedExpanded, setSpeedExpanded] = useState(true)
  const [seedExpanded, setSeedExpanded] = useState(true)
  const [copied, setCopied] = useState(false)

  const tablesMissing = connResults.some(
    (r) => r.label === '网络连通性' && r.status === 'warn' && r.details?.includes('表不存在')
  ) || connResults.some(
    (r) => r.label === '基础查询' && r.status === 'fail'
  )

  const connPassed = connResults.every((r) => r.status === 'pass')
  const seedPassed = seedVerifications.every((s) => s.status === 'pass' || s.status === 'warn')

  const runAllTests = useCallback(async () => {
    setRunning(true)
    setPagePhase('running')
    setConnResults([])
    setSpeedResults([])
    setSeedVerifications([])
    setSpeedTestRun(false)

    await testConnectivity()
    setSpeedTestRun(true)
    await testUploadSpeed()
    await verifySeedData()

    setPagePhase('done')
    setRunning(false)
  }, [])

  const testConnectivity = useCallback(async () => {
    const results: TestResult[] = []

    const addResult = (r: TestResult) => {
      results.push(r)
      setConnResults([...results])
    }

    addResult({ label: '环境变量配置', status: 'running', message: '检查中...' })
    const t0 = performance.now()
    if (isSupabaseConfigured()) {
      addResult({
        label: '环境变量配置', status: 'pass', message: 'VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 已配置',
        elapsedMs: Math.round(performance.now() - t0),
      })
    } else {
      addResult({
        label: '环境变量配置', status: 'fail', message: '缺少 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY',
        details: '请在 .env 文件中配置 Supabase 项目凭据',
        elapsedMs: Math.round(performance.now() - t0),
      })
      return
    }

    addResult({ label: 'SDK 初始化', status: 'running', message: '检查中...' })
    const t1 = performance.now()
    try {
      getSupabase()
      addResult({
        label: 'SDK 初始化', status: 'pass', message: '@supabase/supabase-js 客户端创建成功',
        elapsedMs: Math.round(performance.now() - t1),
      })
    } catch (err) {
      addResult({
        label: 'SDK 初始化', status: 'fail', message: `客户端创建失败: ${(err as Error).message}`,
        elapsedMs: Math.round(performance.now() - t1),
      })
      return
    }

    addResult({ label: '网络连通性', status: 'running', message: '正在连接 Supabase...' })
    const t2 = performance.now()
    try {
      const { data, error } = await supabase.from('talent_pool').select('id', { count: 'exact', head: true })
      const elapsed = Math.round(performance.now() - t2)
      if (error) {
        const isRls = error.message?.includes('violates row-level') || error.code === '42501'
        const isTableMissing = error.message?.includes('does not exist') || error.code === '42P01'
        if (isTableMissing) {
          addResult({
            label: '网络连通性', status: 'warn', message: `连接成功但 talent_pool 表不存在 (${elapsed}ms)`,
            details: '请执行 sql/seed_tables.sql 建表脚本。网络层面连接正常。',
            elapsedMs: elapsed,
          })
        } else if (isRls) {
          addResult({
            label: '网络连通性', status: 'warn', message: `连接成功但受 RLS 限制 (${elapsed}ms)`,
            details: '请检查 RLS 策略配置。网络层面连接正常。',
            elapsedMs: elapsed,
          })
        } else {
          addResult({
            label: '网络连通性', status: 'fail', message: `查询失败: ${error.message} (${elapsed}ms)`,
            elapsedMs: elapsed,
          })
        }
      } else {
        addResult({
          label: '网络连通性', status: 'pass', message: `Supabase 响应正常 (RT: ${elapsed}ms, 记录数: ${data?.length ?? '-'})`,
          elapsedMs: elapsed,
        })
      }
    } catch (err) {
      addResult({
        label: '网络连通性', status: 'fail', message: `连接异常: ${(err as Error).message}`,
        elapsedMs: Math.round(performance.now() - t2),
      })
      return
    }

    addResult({ label: '认证状态', status: 'running', message: '检查中...' })
    const t3 = performance.now()
    try {
      const { data } = await supabase.auth.getSession()
      const hasSession = !!data.session
      addResult({
        label: '认证状态',
        status: hasSession ? 'pass' : 'warn',
        message: hasSession
          ? `已认证 (session active)`
          : '匿名模式，未登录 (RLS 策略使用 public 权限)',
        elapsedMs: Math.round(performance.now() - t3),
      })
    } catch {
      addResult({
        label: '认证状态',
        status: 'warn',
        message: '无法获取 session 状态',
        elapsedMs: Math.round(performance.now() - t3),
      })
    }

    addResult({ label: '基础查询', status: 'running', message: '测试 SELECT 查询...' })
    const t4 = performance.now()
    try {
      const { data, error } = await supabase.from('talent_pool').select('id, name, position').limit(1)
      const elapsed = Math.round(performance.now() - t4)
      if (error) {
        addResult({
          label: '基础查询', status: 'fail', message: `SELECT 失败: ${error.message} (${elapsed}ms)`,
          elapsedMs: elapsed,
        })
      } else {
        addResult({
          label: '基础查询',
          status: 'pass',
          message: `SELECT 成功 (${elapsed}ms)${data && data.length > 0 ? ` — 示例: ${(data[0] as any).name}` : ' — 表为空'}`,
          elapsedMs: elapsed,
        })
      }
    } catch (err) {
      addResult({
        label: '基础查询',
        status: 'fail',
        message: `SELECT 异常: ${(err as Error).message}`,
        elapsedMs: Math.round(performance.now() - t4),
      })
    }
  }, [])

  const testUploadSpeed = useCallback(async () => {
    const results: SpeedResult[] = []

    const createTestRecords = (count: number, size: string): Record<string, unknown>[] => {
      const records: Record<string, unknown>[] = []
      for (let i = 0; i < count; i++) {
        const payload = `speed_test_${size}_${i}_${'x'.repeat(size === 'small' ? 50 : size === 'medium' ? 500 : 1000)}`
        records.push({
          name: `speed_test_${size}_${i}`,
          match_score: 50 + Math.floor(Math.random() * 50),
          match_points: [`pt_${i}_a`, `pt_${i}_b`],
          gap_points: [`gap_${i}_a`],
          reputation_score: 4.0 + Math.random(),
          recent_tags: [`tag_${i}`],
        })
      }
      return records
    }

    const runSpeedTest = async (label: string, count: number, sizeLabel: string): Promise<SpeedResult> => {
      const records = createTestRecords(count, sizeLabel)
      const payloadJson = JSON.stringify(records)
      const payloadBytes = new TextEncoder().encode(payloadJson).length

      const t0 = performance.now()
      let status: SpeedResult['status'] = 'fail'
      try {
        const { error } = await supabase.from('match_results').insert(records)
        const elapsed = performance.now() - t0
        if (error) {
          status = 'fail'
        } else {
          status = 'pass'
          await supabase.from('match_results').delete().like('name', `speed_test_${sizeLabel}_%`)
        }
        return {
          size: label,
          records: count,
          payloadBytes,
          elapsedMs: Math.round(elapsed),
          throughputKbps: Math.round((payloadBytes / 1024) / (elapsed / 1000)),
          status,
        }
      } catch {
        const elapsed = performance.now() - t0
        return {
          size: label,
          records: count,
          payloadBytes,
          elapsedMs: Math.round(elapsed),
          throughputKbps: 0,
          status: 'fail',
        }
      }
    }

    results.push({ size: '小数据量 (1条)', records: 1, payloadBytes: 0, elapsedMs: 0, throughputKbps: 0, status: 'running' })
    setSpeedResults([...results])
    const small = await runSpeedTest('小数据量 (1条)', 1, 'small')
    results[0] = small
    setSpeedResults([...results])

    results.push({ size: '中数据量 (10条)', records: 10, payloadBytes: 0, elapsedMs: 0, throughputKbps: 0, status: 'running' })
    setSpeedResults([...results])
    const medium = await runSpeedTest('中数据量 (10条)', 10, 'medium')
    results[1] = medium
    setSpeedResults([...results])

    results.push({ size: '大数据量 (50条)', records: 50, payloadBytes: 0, elapsedMs: 0, throughputKbps: 0, status: 'running' })
    setSpeedResults([...results])
    const large = await runSpeedTest('大数据量 (50条)', 50, 'large')
    results[2] = large
    setSpeedResults([...results])
  }, [])

  const verifySeedData = useCallback(async () => {
    const verifications: SeedVerification[] = [
      {
        table: 'talent_pool (AI)', label: 'AI工程师人才库', expectedCount: 50, actualCount: 0,
        status: 'running', samples: [], dimensionCheck: { passed: false, message: '' },
      },
      {
        table: 'job_pool (AI)', label: 'AI工程师岗位库', expectedCount: 10, actualCount: 0,
        status: 'running', samples: [], dimensionCheck: { passed: false, message: '' },
      },
      {
        table: 'talent_pool (3D)', label: '3D建模师人才库', expectedCount: 50, actualCount: 0,
        status: 'running', samples: [], dimensionCheck: { passed: false, message: '' },
      },
      {
        table: 'job_pool (3D)', label: '3D建模师岗位库', expectedCount: 10, actualCount: 0,
        status: 'running', samples: [], dimensionCheck: { passed: false, message: '' },
      },
    ]

    const positions: { key: number; table: string; position: Position; dimNames: string[] }[] = [
      { key: 0, table: 'talent_pool', position: 'ai_engineer', dimNames: getDimensionNames('ai_engineer') },
      { key: 1, table: 'job_pool', position: 'ai_engineer', dimNames: getDimensionNames('ai_engineer') },
      { key: 2, table: 'talent_pool', position: '3d_modeler', dimNames: getDimensionNames('3d_modeler') },
      { key: 3, table: 'job_pool', position: '3d_modeler', dimNames: getDimensionNames('3d_modeler') },
    ]

    for (const p of positions) {
      const v = verifications[p.key]
      v.status = 'running'
      setSeedVerifications([...verifications])

      try {
        const count = p.table === 'talent_pool'
          ? await countTalentPool(p.position)
          : await countJobPool(p.position)

        v.actualCount = count
        setSeedVerifications([...verifications])

        const raw = p.table === 'talent_pool'
          ? await fetchTalentPool(p.position)
          : await fetchJobPool(p.position)

        const samples = raw.slice(0, 3).map((r: any) => {
          const scores = r.dimension_scores as Record<string, number> | undefined
          const dimStr = scores
            ? p.dimNames.map((n) => `${n}:${scores[n] ?? '-'}`).join(', ')
            : '无维度数据'

          if (p.table === 'talent_pool') {
            return {
              id: r.id,
              name: r.name,
              总分: r.total_score,
              信誉分: r.reputation,
              维度: dimStr,
              技能画像: (r.skill_profile || '').substring(0, 30),
            }
          } else {
            return {
              id: r.id,
              公司: r.company_name,
              岗位: r.job_name,
              需求强度: r.demand_intensity,
              建议职级: r.suggested_level,
              维度: dimStr,
            }
          }
        })

        v.samples = samples

        const dimCheck = raw.every((r: any) => {
          const scores = r.dimension_scores as Record<string, number> | undefined
          if (!scores || typeof scores !== 'object') return false
          return p.dimNames.every((n) => {
            const val = scores[n]
            return typeof val === 'number' && val >= 0
          })
        })

        const totalRows = raw.length
        const validDims = raw.filter((r: any) => {
          const scores = r.dimension_scores as Record<string, number> | undefined
          return scores && typeof scores === 'object' && p.dimNames.every((n) => typeof scores[n] === 'number')
        }).length

        v.dimensionCheck = {
          passed: dimCheck,
          message: dimCheck
            ? `全部 ${totalRows} 条记录的维度字段结构完整`
            : `${validDims}/${totalRows} 条记录的 dimension_scores 结构正确`,
        }

        if (count === v.expectedCount) {
          v.status = dimCheck ? 'pass' : 'warn'
        } else if (count === 0) {
          v.status = 'fail'
        } else if (count > 0 && count < v.expectedCount) {
          v.status = 'warn'
        } else if (count > v.expectedCount) {
          v.status = 'warn'
        } else {
          v.status = 'fail'
        }
      } catch (err) {
        v.status = 'fail'
        v.dimensionCheck = {
          passed: false,
          message: `查询异常: ${(err as Error).message}`,
        }
      }
      setSeedVerifications([...verifications])
    }
  }, [])

  useEffect(() => {
    runAllTests()
  }, [runAllTests])

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-4 h-4 text-teal-400" />
      case 'fail': return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'warn': return <AlertCircle className="w-4 h-4 text-gold-400" />
      case 'running': return <Loader2 className="w-4 h-4 text-tech-400 animate-spin" />
      default: return <Clock className="w-4 h-4 text-slate-500" />
    }
  }

  const statusBorder = (status: string) => {
    switch (status) {
      case 'pass': return 'border-teal-500/10 bg-teal-500/3'
      case 'fail': return 'border-red-500/10 bg-red-500/3'
      case 'warn': return 'border-gold-500/10 bg-gold-500/3'
      case 'running': return 'border-tech-500/10 bg-tech-500/3'
      default: return 'border-white/5'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tech-500/10 border border-tech-500/20 text-tech-300 text-xs font-medium tracking-wide uppercase mb-4">
            <Activity className="w-3.5 h-3.5" />
            Supabase 诊断中心
          </div>
          <h1 className="text-2xl md:text-3xl font-display text-white mb-2">数据库连接与数据完整性诊断</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            全面检验 Supabase 连接状态、数据传输速度及种子数据完整性
          </p>
        </div>

        {pagePhase === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              connPassed && seedPassed
                ? 'bg-teal-500/5 border-teal-500/10'
                : 'bg-gold-500/5 border-gold-500/10'
            }`}
          >
            {connPassed && seedPassed ? (
              <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gold-400 flex-shrink-0" />
            )}
            <div>
              <p className={`text-sm font-heading font-semibold ${connPassed && seedPassed ? 'text-teal-400' : 'text-gold-300'}`}>
                {connPassed && seedPassed
                  ? '所有诊断通过 — Supabase 连接稳定，种子数据完整'
                  : '诊断发现问题，请查看各模块详情'}
              </p>
            </div>
          </motion.div>
        )}

        {pagePhase === 'done' && tablesMissing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl border-2 border-gold-500/30 bg-gold-500/5"
          >
            <div className="flex items-start gap-4">
              <Terminal className="w-6 h-6 text-gold-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-gold-300 text-sm mb-2">
                  数据库表未创建 — 请先在 Supabase 中执行建表脚本
                </h3>
                <ol className="text-xs text-slate-400 space-y-1.5 mb-4 list-decimal list-inside">
                  <li>打开 <a href="https://supabase.com/dashboard/project/_/sql/new" target="_blank" rel="noopener noreferrer" className="text-tech-400 hover:underline inline-flex items-center gap-1">Supabase SQL Editor <ExternalLink className="w-3 h-3" /></a></li>
                  <li>将下方 SQL 脚本完整粘贴到编辑器中</li>
                  <li>点击右下角 <code className="px-1.5 py-0.5 rounded bg-white/5 text-gold-400">Run</code> 执行</li>
                  <li>等待提示 "Success" 后，返回本页点击"重新运行诊断"</li>
                </ol>
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={() => {
                        const ok = copyToClipboard(SETUP_SQL)
                        setCopied(ok)
                        if (ok) setTimeout(() => setCopied(false), 2000)
                      }}
                      className="px-3 py-1.5 rounded text-xs bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 transition-all flex items-center gap-1.5"
                    >
                      {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? '已复制' : '复制 SQL'}
                    </button>
                  </div>
                  <pre className="p-4 pt-8 rounded-lg bg-black/40 border border-gold-500/10 text-xs text-slate-400 overflow-x-auto max-h-60 leading-relaxed font-mono whitespace-pre">
{`-- 智聘 · 种子数据表建表脚本
-- 请复制到 Supabase SQL Editor 中执行

CREATE TABLE IF NOT EXISTS talent_pool (
  id SERIAL PRIMARY KEY,
  position VARCHAR(50) NOT NULL CHECK (position IN ('ai_engineer', '3d_modeler')),
  name VARCHAR(100) NOT NULL,
  dimension_scores JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  skill_profile TEXT,
  reputation DECIMAL(3,1) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_pool (
  id SERIAL PRIMARY KEY,
  position VARCHAR(50) NOT NULL CHECK (position IN ('ai_engineer', '3d_modeler')),
  company_name VARCHAR(200) NOT NULL,
  job_name VARCHAR(200) NOT NULL,
  responsibilities TEXT,
  requirements TEXT,
  dimension_scores JSONB NOT NULL,
  demand_intensity INTEGER NOT NULL DEFAULT 0,
  suggested_level VARCHAR(50),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_results (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  match_score INTEGER NOT NULL DEFAULT 0,
  match_points TEXT[] DEFAULT '{}',
  gap_points TEXT[] DEFAULT '{}',
  reputation_score DECIMAL(3,1) NOT NULL DEFAULT 4.0,
  recent_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE talent_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all to talent_pool" ON talent_pool FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to job_pool" ON job_pool FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to match_results" ON match_results FOR ALL USING (true) WITH CHECK (true);`}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <SectionCard
          title="连接状态诊断"
          icon={<Wifi className="w-5 h-5" />}
          expanded={connExpanded}
          onToggle={() => setConnExpanded(!connExpanded)}
          summary={`${connResults.filter((r) => r.status === 'pass').length}/${connResults.length} 项通过`}
          summaryColor={
            connResults.length > 0
              ? connPassed ? 'text-teal-400' : 'text-gold-400'
              : 'text-slate-500'
          }
        >
          <div className="space-y-2">
            {connResults.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-3 rounded-lg border ${statusBorder(r.status)} flex items-start gap-3`}
              >
                <div className="mt-0.5">{statusIcon(r.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-heading font-semibold text-white">{r.label}</span>
                    {r.elapsedMs != null && (
                      <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-white/5">
                        {formatMs(r.elapsedMs)}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${
                    r.status === 'fail' ? 'text-red-400' :
                    r.status === 'warn' ? 'text-gold-400' :
                    r.status === 'pass' ? 'text-teal-400' :
                    'text-slate-400'
                  }`}>{r.message}</p>
                  {r.details && (
                    <p className="text-[11px] text-slate-500 mt-1">{r.details}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="数据传输速度测试"
          icon={<Upload className="w-5 h-5" />}
          expanded={speedExpanded}
          onToggle={() => setSpeedExpanded(!speedExpanded)}
          summary={speedTestRun
            ? `${speedResults.length} 组测试完成`
            : '等待中'}
          summaryColor={speedTestRun ? 'text-tech-400' : 'text-slate-500'}
        >
          {speedResults.length === 0 && !speedTestRun ? (
            <p className="text-xs text-slate-500 text-center py-4">等待连接诊断完成后自动运行...</p>
          ) : (
            <div className="space-y-3">
              {speedResults.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-lg border ${statusBorder(s.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {statusIcon(s.status)}
                      <span className="text-sm font-heading font-semibold text-white">{s.size}</span>
                    </div>
                    {s.status === 'pass' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {formatMs(s.elapsedMs)}
                      </span>
                    )}
                  </div>
                  {s.status === 'pass' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                      <div className="p-2 rounded bg-white/[0.02]">
                        <p className="text-[10px] text-slate-500">传输记录</p>
                        <p className="text-sm font-heading text-white">{s.records} 条</p>
                      </div>
                      <div className="p-2 rounded bg-white/[0.02]">
                        <p className="text-[10px] text-slate-500">数据量</p>
                        <p className="text-sm font-heading text-white">{formatBytes(s.payloadBytes)}</p>
                      </div>
                      <div className="p-2 rounded bg-white/[0.02]">
                        <p className="text-[10px] text-slate-500">耗时</p>
                        <p className="text-sm font-heading text-white">{formatMs(s.elapsedMs)}</p>
                      </div>
                      <div className="p-2 rounded bg-white/[0.02]">
                        <p className="text-[10px] text-slate-500">吞吐量</p>
                        <p className={`text-sm font-heading ${
                          s.throughputKbps >= 10 ? 'text-teal-400' :
                          s.throughputKbps >= 3 ? 'text-tech-400' :
                          'text-gold-400'
                        }`}>
                          {s.throughputKbps.toFixed(1)} KB/s
                        </p>
                      </div>
                    </div>
                  )}
                  {s.status === 'fail' && (
                    <p className="text-xs text-red-400 mt-1">上传失败 — 请检查 match_results 表是否存在</p>
                  )}
                </motion.div>
              ))}

              {speedResults.some((s) => s.status === 'pass') && (
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-heading">速度评级</span>
                    <span className={`text-xs font-heading font-semibold ${
                      speedResults.every((s) => s.elapsedMs < 3000) ? 'text-teal-400' :
                      speedResults.every((s) => s.elapsedMs < 5000) ? 'text-tech-400' :
                      'text-gold-400'
                    }`}>
                      {speedResults.every((s) => s.elapsedMs < 3000)
                        ? '优秀 (所有测试 < 3s)'
                        : speedResults.every((s) => s.elapsedMs < 5000)
                          ? '良好 (所有测试 < 5s)'
                          : '一般 (部分测试 > 5s)'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-tech-500 to-teal-500 transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.round(
                          speedResults.filter((s) => s.status === 'pass').length / 3 * 100
                        ))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="种子数据验证"
          icon={<FileCheck className="w-5 h-5" />}
          expanded={seedExpanded}
          onToggle={() => setSeedExpanded(!seedExpanded)}
          summary={
            seedVerifications.length > 0
              ? `${seedVerifications.filter((s) => s.status === 'pass' || s.status === 'warn').length}/${seedVerifications.length} 表通过`
              : '等待中'
          }
          summaryColor={
            seedVerifications.length > 0
              ? seedPassed ? 'text-teal-400' : 'text-gold-400'
              : 'text-slate-500'
          }
        >
          <div className="space-y-4">
            {seedVerifications.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-lg border ${statusBorder(v.status)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {statusIcon(v.status)}
                    <div>
                      <p className="text-sm font-heading font-semibold text-white">{v.label}</p>
                      <p className="text-xs text-slate-500">
                        {v.status === 'pass'
                          ? `数据完整: ${v.actualCount}/${v.expectedCount} 条`
                          : v.status === 'warn'
                            ? `数据不完整: ${v.actualCount}/${v.expectedCount} 条`
                            : v.actualCount === 0
                              ? '空表 — 请导入种子数据'
                              : `数据异常: ${v.actualCount} 条 (预期 ${v.expectedCount})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.dimensionCheck.message && (
                      <span className={`text-[10px] px-2 py-1 rounded ${
                        v.dimensionCheck.passed
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          : 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                      }`}>
                        {v.dimensionCheck.passed ? '维度✓' : '维度⚠'}
                      </span>
                    )}
                    <span className={`text-xs font-heading font-bold ${
                      v.actualCount === v.expectedCount ? 'text-teal-400' :
                      v.actualCount === 0 ? 'text-red-400' :
                      'text-gold-400'
                    }`}>
                      {v.actualCount} / {v.expectedCount}
                    </span>
                  </div>
                </div>

                {v.dimensionCheck.message && (
                  <p className={`text-xs mb-3 ${
                    v.dimensionCheck.passed ? 'text-teal-400' : 'text-gold-400'
                  }`}>
                    {v.dimensionCheck.message}
                  </p>
                )}

                {v.samples.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5">
                          {Object.keys(v.samples[0]).map((key) => (
                            <th key={key} className="text-left py-1.5 px-2 text-slate-500 font-medium">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {v.samples.map((row, ri) => (
                          <tr key={ri} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                            {Object.values(row).map((val, ci) => (
                              <td key={ci} className="py-1.5 px-2 text-slate-400 max-w-[200px] truncate">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {v.actualCount > 3 && (
                      <p className="text-[10px] text-slate-600 mt-1 px-2">
                        显示前 3 条，共 {v.actualCount} 条
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <div className="text-center">
          <button
            onClick={runAllTests}
            disabled={running}
            className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {running ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            重新运行诊断
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function SectionCard({
  title, icon, expanded, onToggle, summary, summaryColor, children,
}: {
  title: string
  icon: React.ReactNode
  expanded: boolean
  onToggle: () => void
  summary: string
  summaryColor: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.01] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tech-500/10 flex items-center justify-center text-tech-400">
            {icon}
          </div>
          <div>
            <h3 className="font-heading font-semibold text-white text-sm">{title}</h3>
            <p className={`text-xs ${summaryColor}`}>{summary}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="px-5 pb-5">{children}</div>
      )}
    </motion.div>
  )
}
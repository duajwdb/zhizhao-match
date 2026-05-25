import { useEffect, useCallback, useState, useRef } from 'react'
import { useAppStore, ProfileData, JobData, GrowthRecord } from '../store/useAppStore'
import { ensureAnonymousSession, isSupabaseConfigured } from '../config/supabaseClient'
import {
  fetchCandidateProfiles,
  fetchHrJobs,
  fetchJobseekerJobs,
  fetchGrowthRecords,
  insertCandidateProfile,
  insertHrJob,
  insertJobseekerJob,
  insertGrowthRecord,
  insertQuizResults,
  insertEvaluation,
  deleteCandidateProfile,
  deleteHrJob,
  deleteJobseekerJob,
  insertSingleTalent,
  insertSingleJob,
} from '../services/database'

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 2000

function toProfileData(row: any): ProfileData {
  return {
    id: row.id,
    name: row.name,
    position: row.position as ProfileData['position'],
    mode: row.mode as ProfileData['mode'],
    dimensions: ((row.dimensions || []) as any[]).map((d: any) => ({
      name: d.name,
      score: d.score,
      maxScore: d.max_score,
      starRating: d.star_rating,
    })),
    totalScore: row.total_score,
    starRating: row.star_rating,
    textReport: row.text_report,
    date: row.date,
    curveNode: row.curve_node,
  }
}

function truncateDate(dateStr: string): string {
  return dateStr.replace('T', ' ').substring(0, 19)
}

function fromProfileData(profile: ProfileData): Record<string, unknown> {
  return {
    name: profile.name,
    position: profile.position,
    mode: profile.mode,
    dimensions: profile.dimensions.map((d) => ({
      name: d.name,
      score: d.score,
      max_score: d.maxScore,
      star_rating: d.starRating,
    })),
    total_score: profile.totalScore,
    star_rating: profile.starRating,
    text_report: profile.textReport,
    date: truncateDate(profile.date),
    curve_node: profile.curveNode,
  }
}

function fromJobData(job: JobData) {
  return {
    ...(job.id && !job.id.startsWith('jsjob_') && !job.id.startsWith('hrjob_')
      ? { id: job.id }
      : {}),
    name: job.name,
    position: job.position,
    status: job.status,
    created_at: job.createdAt,
    description: job.description,
    profile_doc: job.profileDoc,
    dimensions: (job.dimensions || []).map((d) => ({
      name: d.name,
      score: d.score,
      max_score: d.maxScore,
      star_rating: d.starRating,
    })),
    total_score: job.totalScore ?? 0,
    star_rating: job.starRating ?? 0,
    company: job.company,
  }
}

function toJobData(row: Record<string, unknown>, _isHr: boolean): JobData {
  const rawDimensions = (row.dimensions as any[]) || []
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    position: (String(row.position || 'ai_engineer')) as JobData['position'],
    status: (String(row.status || 'active')) as JobData['status'],
    createdAt: String(row.created_at || new Date().toISOString()),
    description: String(row.description || ''),
    profileDoc: String(row.profile_doc || ''),
    dimensions: rawDimensions.map((d: any) => ({
      name: d.name || '',
      score: d.score || 0,
      maxScore: d.max_score || 100,
      starRating: d.star_rating || 3,
    })),
    totalScore: Number(row.total_score || 0),
    starRating: Number(row.star_rating || 0),
    company: String(row.company || ''),
    chatMessages: [],
  }
}

export type SyncStatus = 'idle' | 'loading' | 'syncing' | 'error' | 'connected'

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useSupabaseSync() {
  const store = useAppStore()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const initializedRef = useRef(false)

  const loadAllData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      console.warn('[Sync] Supabase 未配置，跳过云端数据加载，使用本地模式')
      setSyncStatus('connected')
      setIsInitialized(true)
      return
    }

    setSyncStatus('loading')

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        await ensureAnonymousSession().catch(() => {})

        const [profilesResult, hrJobsResult, jsJobsResult, growthResult] =
          await Promise.allSettled([
            fetchCandidateProfiles(),
            fetchHrJobs(),
            fetchJobseekerJobs(),
            fetchGrowthRecords(),
          ])

        const isShared = store.isSharedAccount

        if (profilesResult.status === 'fulfilled') {
          if (isShared) {
            if (profilesResult.value.length > 0) {
              const remoteProfiles = profilesResult.value.map(toProfileData)
              const localProfiles = [...store.profileHistory]
              const merged = [...remoteProfiles]
              for (const lp of localProfiles) {
                const key = `${lp.name}|${lp.position}`
                if (!merged.some((rp) => `${rp.name}|${rp.position}` === key)) {
                  merged.push(lp)
                }
              }
              store.setProfileHistory(merged)
            }
          } else if (store.profileHistory.length === 0) {
            store.setProfileHistory(profilesResult.value.map(toProfileData))
          }
        }

        if (hrJobsResult.status === 'fulfilled') {
          if (isShared) {
            if (hrJobsResult.value.length > 0) {
              const remoteJobs = hrJobsResult.value.map((r) => toJobData(r as unknown as Record<string, unknown>, true))
              const localJobs = [...store.hrJobs]
              const merged = [...remoteJobs]
              for (const lj of localJobs) {
                const key = `${lj.name}|${lj.position}`
                if (!merged.some((rj) => `${rj.name}|${rj.position}` === key)) {
                  merged.push(lj)
                }
              }
              store.setHrJobs(merged)
            }
          } else if (store.hrJobs.length === 0) {
            store.setHrJobs(hrJobsResult.value.map((r) => toJobData(r as unknown as Record<string, unknown>, true)))
          }
        }

        if (jsJobsResult.status === 'fulfilled') {
          if (isShared) {
            if (jsJobsResult.value.length > 0) {
              store.setJobseekerJobs(jsJobsResult.value.map((r) => toJobData(r as unknown as Record<string, unknown>, false)))
            }
          } else if (store.jobseekerJobs.length === 0) {
            store.setJobseekerJobs(jsJobsResult.value.map((r) => toJobData(r as unknown as Record<string, unknown>, false)))
          }
        }

        if (growthResult.status === 'fulfilled') {
          if (isShared) {
            if (growthResult.value.length > 0) {
              store.setGrowthRecords(growthResult.value.map((r) => ({
                date: r.date,
                score: r.score,
                curveNode: r.curve_node,
                growthPlan: r.growth_plan,
              })))
            }
          } else if (store.growthRecords.length === 0) {
            store.setGrowthRecords(growthResult.value.map((r) => ({
              date: r.date,
              score: r.score,
              curveNode: r.curve_node,
              growthPlan: r.growth_plan,
            })))
          }
        }

        setSyncStatus('connected')
        setErrorMessage(null)
        setIsInitialized(true)
        return
      } catch (err) {
        const msg = err instanceof Error ? err.message : '数据加载失败'
        console.error(`[Sync] 第 ${attempt + 1}/${MAX_RETRIES + 1} 次尝试失败:`, msg)

        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS * (attempt + 1))
          continue
        }

        setSyncStatus('error')
        setErrorMessage(msg)
        console.error('[Sync] 所有重试均失败，进入离线模式')
      }
    }

    setIsInitialized(true)
  }, [store])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    loadAllData()
  }, [loadAllData])

  const syncProfile = useCallback(
    async (profile: ProfileData): Promise<boolean> => {
      setSyncStatus('syncing')
      store.addProfileToHistoryLocal(profile)
      try {
        const row = fromProfileData(profile)
        const result = await insertCandidateProfile(row)
        if (result) {
          setSyncStatus('connected')
          setErrorMessage(null)
        }

        const dimScores: Record<string, number> = {}
        profile.dimensions.forEach((d) => { dimScores[d.name] = d.score })
        await insertSingleTalent({
          position: profile.position,
          name: profile.name,
          dimension_scores: dimScores,
          total_score: profile.totalScore,
          skill_profile: profile.textReport,
          reputation: 4.0,
          sort_order: 999,
        }).catch(() => {})
      } catch (e) {
        console.warn('[Sync] 画像云端同步失败，已保存至本地:', e)
      }
      setSyncStatus('connected')
      setErrorMessage(null)
      return true
    },
    [store]
  )

  const syncHrJob = useCallback(
    async (job: JobData): Promise<boolean> => {
      setSyncStatus('syncing')
      store.addHrJobLocal(job)
      try {
        const result = await insertHrJob(fromJobData(job))
        if (result) {
          setSyncStatus('connected')
          setErrorMessage(null)
        }

        const dimScores: Record<string, number> = {}
        job.dimensions.forEach((d) => { dimScores[d.name] = d.score })
        await insertSingleJob({
          position: job.position,
          company_name: job.company || '未指定公司',
          job_name: job.name,
          responsibilities: job.description,
          requirements: job.profileDoc,
          dimension_scores: dimScores,
          demand_intensity: job.totalScore || 0,
          suggested_level: job.starRating >= 4 ? '高级' : job.starRating >= 3 ? '中级' : '初级',
          sort_order: 999,
        }).catch(() => {})
      } catch (e) {
        console.warn('[Sync] 岗位同步到云端失败，已保存至本地:', e)
      }
      setSyncStatus('connected')
      setErrorMessage(null)
      return true
    },
    [store]
  )

  const syncDeleteHrJob = useCallback(
    async (id: string): Promise<boolean> => {
      store.removeHrJobLocal(id)
      try {
        await deleteHrJob(id)
      } catch (e) {
        console.warn('[Sync] 删除岗位云端同步失败，已从本地移除:', e)
      }
      return true
    },
    [store]
  )

  const syncJobseekerJob = useCallback(
    async (job: JobData): Promise<boolean> => {
      setSyncStatus('syncing')
      try {
        const result = await insertJobseekerJob(fromJobData(job))
        if (result) {
          setSyncStatus('connected')
          setErrorMessage(null)
        }
      } catch (e) {
        console.warn('[Sync] 意向岗位同步到云端失败，已保存至本地:', e)
      }
      setSyncStatus('connected')
      setErrorMessage(null)
      return true
    },
    [store]
  )

  const syncDeleteJobseekerJob = useCallback(
    async (id: string): Promise<boolean> => {
      store.removeJobseekerJobLocal(id)
      try {
        await deleteJobseekerJob(id)
      } catch (e) {
        console.warn('[Sync] 删除意向岗位云端同步失败，已从本地移除:', e)
      }
      return true
    },
    [store]
  )

  const syncDeleteProfile = useCallback(
    async (index: number, profileId?: string): Promise<boolean> => {
      store.removeProfileFromHistoryLocal(index)
      try {
        if (profileId) {
          await deleteCandidateProfile(profileId)
        }
      } catch (e) {
        console.warn('[Sync] 删除画像云端同步失败，已从本地移除:', e)
      }
      return true
    },
    [store]
  )

  const syncGrowthRecord = useCallback(async (record: GrowthRecord): Promise<boolean> => {
    setSyncStatus('syncing')
    store.addGrowthRecordLocal(record)
    try {
      const result = await insertGrowthRecord({
        date: record.date,
        score: record.score,
        curve_node: record.curveNode,
        growth_plan: record.growthPlan,
      })
      if (result) {
        setSyncStatus('connected')
        setErrorMessage(null)
      }
    } catch (e) {
      console.warn('[Sync] 成长记录云端同步失败，已保存至本地:', e)
    }
    setSyncStatus('connected')
    setErrorMessage(null)
    return true
  }, [store])

  const syncQuizResults = useCallback(
    async (results: Record<string, unknown>[]): Promise<boolean> => {
      return insertQuizResults(results)
    },
    []
  )

  const syncEvaluation = useCallback(
    async (evaluation: Record<string, unknown>): Promise<boolean> => {
      setSyncStatus('syncing')
      try {
        const result = await insertEvaluation(evaluation)
        if (result) {
          setSyncStatus('connected')
          setErrorMessage(null)
          return true
        }
      } catch (e) {
        console.warn('[Sync] 评价云端同步失败:', e)
      }
      setSyncStatus('connected')
      setErrorMessage(null)
      return true
    },
    []
  )

  const clearSyncStatus = useCallback(() => {
    setSyncStatus('connected')
    setErrorMessage(null)
  }, [])

  return {
    syncStatus,
    errorMessage,
    isInitialized,
    loadAllData,
    syncProfile,
    syncHrJob,
    syncDeleteHrJob,
    syncJobseekerJob,
    syncDeleteJobseekerJob,
    syncDeleteProfile,
    syncGrowthRecord,
    syncQuizResults,
    syncEvaluation,
    clearSyncStatus,
  }
}
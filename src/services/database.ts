/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../config/supabaseClient'

const TIMEOUT_MS = 5000

function withTimeout<T>(promise: PromiseLike<T>, label: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`[${label}] 请求超时 (${TIMEOUT_MS / 1000}s)`)), TIMEOUT_MS)
  )
  return Promise.race([promise, timeout])
}

function handleError(error: unknown, operation: string): void {
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn(`[${operation}] 网络连接失败，已回退至本地模式`)
      return
    }
    if (error.message.includes('timeout') || error.message.includes('超时')) {
      console.warn(`[${operation}] 请求超时，已回退至本地模式`)
      return
    }
    if (error.message.includes('Supabase credentials are missing')) {
      console.warn(`[${operation}] Supabase 未配置，已回退至本地模式`)
      return
    }
    console.warn(`[${operation}] 操作失败，已回退至本地模式:`, error.message)
    return
  }
  console.warn(`[${operation}] 未知错误，已回退至本地模式`)
}

export async function fetchCandidateProfiles(): Promise<any[]> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('candidate_profiles').select('*').order('created_at', { ascending: false }),
      'fetchProfiles'
    )
    if (error) throw error
    return data || []
  } catch (err) {
    handleError(err, 'fetchProfiles')
    return []
  }
}

export async function insertCandidateProfile(profile: Record<string, unknown>): Promise<any | null> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('candidate_profiles').insert(profile).select().single(),
      'insertProfile'
    )
    if (error) throw error
    return data
  } catch (err) {
    handleError(err, 'insertProfile')
    return null
  }
}

export async function deleteCandidateProfile(id: string): Promise<boolean> {
  try {
    const { error } = await withTimeout(
      supabase.from('candidate_profiles').delete().eq('id', id),
      'deleteProfile'
    )
    if (error) throw error
    return true
  } catch (err) {
    handleError(err, 'deleteProfile')
    return false
  }
}

export async function fetchHrJobs(): Promise<any[]> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('hr_jobs').select('*').order('created_at', { ascending: false }),
      'fetchHrJobs'
    )
    if (error) throw error
    return data || []
  } catch (err) {
    handleError(err, 'fetchHrJobs')
    return []
  }
}

export async function insertHrJob(job: Record<string, unknown>): Promise<any | null> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('hr_jobs').insert(job).select().single(),
      'insertHrJob'
    )
    if (error) throw error
    return data
  } catch (err) {
    handleError(err, 'insertHrJob')
    return null
  }
}

export async function deleteHrJob(id: string): Promise<boolean> {
  try {
    const { error } = await withTimeout(
      supabase.from('hr_jobs').delete().eq('id', id),
      'deleteHrJob'
    )
    if (error) throw error
    return true
  } catch (err) {
    handleError(err, 'deleteHrJob')
    return false
  }
}

export async function fetchJobseekerJobs(): Promise<any[]> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('jobseeker_jobs').select('*').order('created_at', { ascending: false }),
      'fetchJobseekerJobs'
    )
    if (error) throw error
    return data || []
  } catch (err) {
    handleError(err, 'fetchJobseekerJobs')
    return []
  }
}

export async function insertJobseekerJob(job: Record<string, unknown>): Promise<any | null> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('jobseeker_jobs').insert(job).select().single(),
      'insertJobseekerJob'
    )
    if (error) throw error
    return data
  } catch (err) {
    handleError(err, 'insertJobseekerJob')
    return null
  }
}

export async function deleteJobseekerJob(id: string): Promise<boolean> {
  try {
    const { error } = await withTimeout(
      supabase.from('jobseeker_jobs').delete().eq('id', id),
      'deleteJobseekerJob'
    )
    if (error) throw error
    return true
  } catch (err) {
    handleError(err, 'deleteJobseekerJob')
    return false
  }
}

export async function fetchGrowthRecords(): Promise<any[]> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('growth_records').select('*').order('created_at', { ascending: true }),
      'fetchGrowthRecords'
    )
    if (error) throw error
    return data || []
  } catch (err) {
    handleError(err, 'fetchGrowthRecords')
    return []
  }
}

export async function insertGrowthRecord(record: Record<string, unknown>): Promise<any | null> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('growth_records').insert(record).select().single(),
      'insertGrowthRecord'
    )
    if (error) throw error
    return data
  } catch (err) {
    handleError(err, 'insertGrowthRecord')
    return null
  }
}

export async function fetchQuizResults(position?: string, mode?: string): Promise<any[]> {
  try {
    let query = supabase.from('quiz_results').select('*').order('created_at', { ascending: true })
    if (position) query = query.eq('position', position)
    if (mode) query = query.eq('mode', mode)
    const { data, error } = await withTimeout(query, 'fetchQuizResults')
    if (error) throw error
    return data || []
  } catch (err) {
    handleError(err, 'fetchQuizResults')
    return []
  }
}

export async function insertQuizResults(results: Record<string, unknown>[]): Promise<boolean> {
  try {
    const { error } = await withTimeout(
      supabase.from('quiz_results').insert(results),
      'insertQuizResults'
    )
    if (error) throw error
    return true
  } catch (err) {
    handleError(err, 'insertQuizResults')
    return false
  }
}

export async function fetchEvaluations(): Promise<any[]> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('evaluations').select('*').order('created_at', { ascending: false }),
      'fetchEvaluations'
    )
    if (error) throw error
    return data || []
  } catch (err) {
    handleError(err, 'fetchEvaluations')
    return []
  }
}

export async function insertEvaluation(evaluation: Record<string, unknown>): Promise<any | null> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('evaluations').insert(evaluation).select().single(),
      'insertEvaluation'
    )
    if (error) throw error
    return data
  } catch (err) {
    handleError(err, 'insertEvaluation')
    return null
  }
}

export async function fetchMatchResults(): Promise<any[]> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('match_results').select('*').order('created_at', { ascending: false }),
      'fetchMatchResults'
    )
    if (error) throw error
    return data || []
  } catch (err) {
    handleError(err, 'fetchMatchResults')
    return []
  }
}

export async function insertMatchResults(results: Record<string, unknown>[]): Promise<boolean> {
  try {
    const { error } = await withTimeout(
      supabase.from('match_results').insert(results),
      'insertMatchResults'
    )
    if (error) throw error
    return true
  } catch (err) {
    handleError(err, 'insertMatchResults')
    return false
  }
}

export async function fetchTalentPool(position?: string): Promise<any[]> {
  try {
    let query = supabase.from('talent_pool').select('*').order('sort_order', { ascending: true })
    if (position) query = query.eq('position', position)
    const { data, error } = await withTimeout(query, 'fetchTalentPool')
    if (error) throw error
    return data || []
  } catch (err) {
    handleError(err, 'fetchTalentPool')
    return []
  }
}

export async function insertTalentBatch(talents: Record<string, unknown>[]): Promise<{ inserted: number; error: string | null }> {
  try {
    const batchSize = 50
    let inserted = 0

    for (let i = 0; i < talents.length; i += batchSize) {
      const batch = talents.slice(i, i + batchSize)
      const { error } = await withTimeout(
        supabase.from('talent_pool').insert(batch),
        'insertTalentBatch'
      )
      if (error) {
        return { inserted, error: error.message }
      }
      inserted += batch.length
    }

    return { inserted, error: null }
  } catch (err) {
    handleError(err, 'insertTalentBatch')
    return { inserted: 0, error: (err as Error)?.message || '未知错误' }
  }
}

export async function checkDuplicateTalent(name: string, position: string): Promise<boolean> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('talent_pool').select('id').eq('name', name).eq('position', position).limit(1),
      'checkDuplicateTalent'
    )
    if (error) throw error
    return (data?.length ?? 0) > 0
  } catch (err) {
    handleError(err, 'checkDuplicateTalent')
    return false
  }
}

export async function insertSingleTalent(talent: Record<string, unknown>): Promise<any | null> {
  try {
    const name = String(talent.name || '')
    const position = String(talent.position || '')
    const isDup = await checkDuplicateTalent(name, position)
    if (isDup) return null
    const { data, error } = await withTimeout(
      supabase.from('talent_pool').insert(talent).select().single(),
      'insertSingleTalent'
    )
    if (error) throw error
    return data
  } catch (err) {
    handleError(err, 'insertSingleTalent')
    return null
  }
}

export async function clearTalentPool(position?: string): Promise<{ deleted: number; error: string | null }> {
  try {
    let query = supabase.from('talent_pool').delete({ count: 'exact' })
    if (position) query = query.eq('position', position)
    const { count, error } = await withTimeout(query, 'clearTalentPool')
    if (error) {
      return { deleted: 0, error: error.message }
    }
    return { deleted: count || 0, error: null }
  } catch (err) {
    handleError(err, 'clearTalentPool')
    return { deleted: 0, error: (err as Error)?.message || '未知错误' }
  }
}

export async function countTalentPool(position?: string): Promise<number> {
  try {
    let query = supabase.from('talent_pool').select('*', { count: 'exact', head: true })
    if (position) query = query.eq('position', position)
    const { count, error } = await withTimeout(query, 'countTalentPool')
    if (error) throw error
    return count || 0
  } catch (err) {
    handleError(err, 'countTalentPool')
    return 0
  }
}

export async function fetchJobPool(position?: string): Promise<any[]> {
  try {
    let query = supabase.from('job_pool').select('*').order('sort_order', { ascending: true })
    if (position) query = query.eq('position', position)
    const { data, error } = await withTimeout(query, 'fetchJobPool')
    if (error) throw error
    return data || []
  } catch (err) {
    handleError(err, 'fetchJobPool')
    return []
  }
}

export async function insertJobBatch(jobs: Record<string, unknown>[]): Promise<{ inserted: number; error: string | null }> {
  try {
    const batchSize = 10
    let inserted = 0

    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize)
      const { error } = await withTimeout(
        supabase.from('job_pool').insert(batch),
        'insertJobBatch'
      )
      if (error) {
        return { inserted, error: error.message }
      }
      inserted += batch.length
    }

    return { inserted, error: null }
  } catch (err) {
    handleError(err, 'insertJobBatch')
    return { inserted: 0, error: (err as Error)?.message || '未知错误' }
  }
}

export async function checkDuplicateJob(jobName: string, position: string): Promise<boolean> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('job_pool').select('id').eq('job_name', jobName).eq('position', position).limit(1),
      'checkDuplicateJob'
    )
    if (error) throw error
    return (data?.length ?? 0) > 0
  } catch (err) {
    handleError(err, 'checkDuplicateJob')
    return false
  }
}

export async function insertSingleJob(job: Record<string, unknown>): Promise<any | null> {
  try {
    const jobName = String(job.job_name || job.name || '')
    const position = String(job.position || '')
    const isDup = await checkDuplicateJob(jobName, position)
    if (isDup) return null
    const { data, error } = await withTimeout(
      supabase.from('job_pool').insert(job).select().single(),
      'insertSingleJob'
    )
    if (error) throw error
    return data
  } catch (err) {
    handleError(err, 'insertSingleJob')
    return null
  }
}

export async function clearJobPool(position?: string): Promise<{ deleted: number; error: string | null }> {
  try {
    let query = supabase.from('job_pool').delete({ count: 'exact' })
    if (position) query = query.eq('position', position)
    const { count, error } = await withTimeout(query, 'clearJobPool')
    if (error) {
      return { deleted: 0, error: error.message }
    }
    return { deleted: count || 0, error: null }
  } catch (err) {
    handleError(err, 'clearJobPool')
    return { deleted: 0, error: (err as Error)?.message || '未知错误' }
  }
}

export async function countJobPool(position?: string): Promise<number> {
  try {
    let query = supabase.from('job_pool').select('*', { count: 'exact', head: true })
    if (position) query = query.eq('position', position)
    const { count, error } = await withTimeout(query, 'countJobPool')
    if (error) throw error
    return count || 0
  } catch (err) {
    handleError(err, 'countJobPool')
    return 0
  }
}
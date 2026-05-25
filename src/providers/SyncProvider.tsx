import { createContext, useContext, type ReactNode } from 'react'
import { useSupabaseSync, type SyncStatus } from '../hooks/useSupabaseSync'
import type { ProfileData, GrowthRecord, JobData } from '../store/useAppStore'
interface SyncContextValue {
  syncStatus: SyncStatus
  errorMessage: string | null
  isInitialized: boolean
  syncProfile: (profile: ProfileData) => Promise<boolean>
  syncHrJob: (job: JobData) => Promise<boolean>
  syncDeleteHrJob: (id: string) => Promise<boolean>
  syncJobseekerJob: (job: JobData) => Promise<boolean>
  syncDeleteJobseekerJob: (id: string) => Promise<boolean>
  syncDeleteProfile: (index: number, profileId?: string) => Promise<boolean>
  syncGrowthRecord: (record: GrowthRecord) => Promise<boolean>
  syncQuizResults: (results: Record<string, unknown>[]) => Promise<boolean>
  syncEvaluation: (evaluation: Record<string, unknown>) => Promise<boolean>
  clearSyncStatus: () => void
}

const SyncContext = createContext<SyncContextValue | null>(null)

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error('useSync must be used within SyncProvider')
  return ctx
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const sync = useSupabaseSync()

  const value: SyncContextValue = {
    syncStatus: sync.syncStatus,
    errorMessage: sync.errorMessage,
    isInitialized: sync.isInitialized,
    syncProfile: sync.syncProfile,
    syncHrJob: sync.syncHrJob,
    syncDeleteHrJob: sync.syncDeleteHrJob,
    syncJobseekerJob: sync.syncJobseekerJob,
    syncDeleteJobseekerJob: sync.syncDeleteJobseekerJob,
    syncDeleteProfile: sync.syncDeleteProfile,
    syncGrowthRecord: sync.syncGrowthRecord,
    syncQuizResults: sync.syncQuizResults,
    syncEvaluation: sync.syncEvaluation,
    clearSyncStatus: sync.clearSyncStatus,
  }

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}
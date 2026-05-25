import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { PersistStorage } from 'zustand/middleware'

const DEMO_STORAGE_KEY = 'zhizhao-store-demo'
const GUEST_STORAGE_KEY = 'zhizhao-store-guest'
const AUTH_MODE_KEY = 'zhizhao_auth_mode'

function getAuthMode(): 'demo' | 'guest' {
  if (typeof window === 'undefined') return 'guest'
  return (localStorage.getItem(AUTH_MODE_KEY) as 'demo' | 'guest') || 'guest'
}

export function setAuthMode(mode: 'demo' | 'guest'): void {
  localStorage.setItem(AUTH_MODE_KEY, mode)
}

function getStorageKey(): string {
  return getAuthMode() === 'demo' ? DEMO_STORAGE_KEY : GUEST_STORAGE_KEY
}

const routedStorage: PersistStorage<Partial<AppState>> = {
  getItem: (_name: string) => {
    const raw = localStorage.getItem(getStorageKey())
    return raw ? JSON.parse(raw) : null
  },
  setItem: (_name: string, value) => {
    localStorage.setItem(getStorageKey(), JSON.stringify(value))
  },
  removeItem: (_name: string) => {
    localStorage.removeItem(getStorageKey())
  },
}

export type UserMode = 'jobseeker' | 'student' | 'hr'
export type Position = 'ai_engineer' | '3d_modeler'

export interface DimensionScore {
  name: string
  score: number
  maxScore: number
  starRating: number
}

export interface ProfileData {
  id?: string
  name: string
  position: Position
  mode: UserMode
  dimensions: DimensionScore[]
  totalScore: number
  starRating: number
  textReport: string
  date: string
  curveNode: string
}

export interface GrowthRecord {
  date: string
  score: number
  curveNode: string
  growthPlan: string
  profileId?: string
}

export interface ChatMessage {
  role: 'hr' | 'candidate' | 'company'
  text: string
  time: string
}

export interface JobData {
  id: string
  name: string
  position: Position
  status: 'active' | 'draft'
  createdAt: string
  description: string
  profileDoc: string
  dimensions: DimensionScore[]
  totalScore: number
  starRating: number
  company: string
  chatMessages: ChatMessage[]
}

export interface MatchCandidate {
  id: string
  name: string
  matchScore: number
  matchPoints: string[]
  gapPoints: string[]
  reputationScore: number
  recentTags: string[]
}

export interface HrCandidate {
  id: string
  name: string
  position: Position
  matchScore: number
  reputationScore: number
  reputationRatings: number[]
  reputationRatedAt: string | null
  reputationModifiedAt: string | null
  reputationModified: boolean
  dimensionMatch: number[]
  highlights: string[]
  gaps: string[]
  status: 'confirmed' | 'interviewed'
  addedAt: string
  chatMessages: { role: 'hr' | 'candidate'; text: string; time: string }[]
  isRevealed: boolean
}

export interface QuizAnswer {
  questionIndex: number
  answer: string
  skipped: boolean
}

export type SyncStatus = 'idle' | 'loading' | 'syncing' | 'connected' | 'error'

interface AppState {
  userMode: UserMode
  selectedPosition: Position | null
  quizAnswers: QuizAnswer[]
  currentQuestionIndex: number
  currentProfile: ProfileData | null
  profileHistory: ProfileData[]
  growthRecords: GrowthRecord[]
  hrJobs: JobData[]
  jobseekerJobs: JobData[]
  matchResults: MatchCandidate[]
  hrCandidates: HrCandidate[]
  apiKey: string
  showApiKeyModal: boolean
  syncStatus: SyncStatus
  syncErrorMessage: string | null
  isDemoUser: boolean
  demoUserId: string | null
  isAuthReady: boolean
  isSharedAccount: boolean
  savedProfileIds: string[]

  setUserMode: (mode: UserMode) => void
  setPosition: (pos: Position | null) => void
  setQuizAnswers: (answers: QuizAnswer[]) => void
  addQuizAnswer: (answer: QuizAnswer) => void
  setCurrentQuestionIndex: (index: number) => void
  setCurrentProfile: (profile: ProfileData | null) => void

  addProfileToHistory: (profile: ProfileData) => void
  addProfileToHistoryLocal: (profile: ProfileData) => void
  removeProfileFromHistory: (index: number) => void
  removeProfileFromHistoryLocal: (index: number) => void
  setProfileHistory: (profiles: ProfileData[]) => void

  addGrowthRecord: (record: GrowthRecord) => void
  addGrowthRecordLocal: (record: GrowthRecord) => void
  removeGrowthRecordLocal: (index: number) => void
  setGrowthRecords: (records: GrowthRecord[]) => void
  updateGrowthPlanByProfileId: (profileId: string, growthPlan: string) => void

  addHrJob: (job: JobData) => void
  addHrJobLocal: (job: JobData) => void
  removeHrJob: (id: string) => void
  removeHrJobLocal: (id: string) => void
  setHrJobs: (jobs: JobData[]) => void

  addJobseekerJob: (job: JobData) => void
  addJobseekerJobLocal: (job: JobData) => void
  removeJobseekerJob: (id: string) => void
  removeJobseekerJobLocal: (id: string) => void
  setJobseekerJobs: (jobs: JobData[]) => void

  setMatchResults: (results: MatchCandidate[]) => void
  addHrCandidate: (candidate: HrCandidate) => void
  removeHrCandidate: (id: string) => void
  updateCandidateStatus: (id: string, status: 'confirmed' | 'interviewed') => void
  addHrCandidateReputationRating: (id: string, rating: number) => void
  addCandidateChatMessage: (id: string, role: 'hr' | 'candidate', text: string) => void
  addJobseekerJobChatMessage: (id: string, role: 'hr' | 'candidate' | 'company', text: string) => void
  setApiKey: (key: string) => void
  setShowApiKeyModal: (show: boolean) => void
  setSyncStatus: (status: SyncStatus, errorMessage?: string | null) => void

  setDemoAuth: (userId: string, isSharedAccount?: boolean) => void
  clearDemoAuth: () => void
  resetAuth: () => void
  setAuthReady: () => void
  addSavedProfileId: (id: string) => void
  resetAllData: () => void
  logout: () => void

  resetQuiz: () => void
  resetAll: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userMode: 'jobseeker',
      selectedPosition: null,
      quizAnswers: [],
      currentQuestionIndex: 0,
      currentProfile: null,
      profileHistory: [],
      growthRecords: [],
      hrJobs: [],
      jobseekerJobs: [],
      hrCandidates: [],
      matchResults: [],
      apiKey: '',
      showApiKeyModal: false,
      syncStatus: 'idle',
      syncErrorMessage: null,
      isDemoUser: false,
      demoUserId: null,
      isAuthReady: false,
      isSharedAccount: false,
      savedProfileIds: [],

      setUserMode: (mode) =>
        set({
          userMode: mode,
          selectedPosition: null,
          quizAnswers: [],
          currentQuestionIndex: 0,
          currentProfile: null,
        }),
      setPosition: (pos) => set({ selectedPosition: pos }),
      setQuizAnswers: (answers) => set({ quizAnswers: answers }),
      addQuizAnswer: (answer) =>
        set((state) => {
          const existing = state.quizAnswers.filter((a) => a.questionIndex !== answer.questionIndex)
          return { quizAnswers: [...existing, answer] }
        }),
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      setCurrentProfile: (profile) => set({ currentProfile: profile }),

      addProfileToHistory: (profile) =>
        set((state) => ({
          profileHistory: [profile, ...state.profileHistory],
        })),
      addProfileToHistoryLocal: (profile) =>
        set((state) => ({
          profileHistory: [profile, ...state.profileHistory],
        })),
      removeProfileFromHistory: (index) =>
        set((state) => ({
          profileHistory: state.profileHistory.filter((_, i) => i !== index),
        })),
      removeProfileFromHistoryLocal: (index) =>
        set((state) => ({
          profileHistory: state.profileHistory.filter((_, i) => i !== index),
        })),
      setProfileHistory: (profiles) => set({ profileHistory: profiles }),

      addGrowthRecord: (record) =>
        set((state) => ({
          growthRecords: [...state.growthRecords, record],
        })),
      addGrowthRecordLocal: (record) =>
        set((state) => ({
          growthRecords: [...state.growthRecords, record],
        })),
      removeGrowthRecordLocal: (index) =>
        set((state) => ({
          growthRecords: state.growthRecords.filter((_, i) => i !== index),
        })),
      setGrowthRecords: (records) => set({ growthRecords: records }),
      updateGrowthPlanByProfileId: (profileId, growthPlan) =>
        set((state) => ({
          growthRecords: state.growthRecords.map((r) =>
            r.profileId === profileId ? { ...r, growthPlan } : r
          ),
        })),

      addHrJob: (job) =>
        set((state) => ({
          hrJobs: [...state.hrJobs, job],
        })),
      addHrJobLocal: (job) =>
        set((state) => ({
          hrJobs: [...state.hrJobs, job],
        })),
      removeHrJob: (id) =>
        set((state) => ({
          hrJobs: state.hrJobs.filter((j) => j.id !== id),
        })),
      removeHrJobLocal: (id) =>
        set((state) => ({
          hrJobs: state.hrJobs.filter((j) => j.id !== id),
        })),
      setHrJobs: (jobs) => set({ hrJobs: jobs }),

      addJobseekerJob: (job) =>
        set((state) => ({
          jobseekerJobs: [...state.jobseekerJobs, job],
        })),
      addJobseekerJobLocal: (job) =>
        set((state) => ({
          jobseekerJobs: [...state.jobseekerJobs, job],
        })),
      removeJobseekerJob: (id) =>
        set((state) => ({
          jobseekerJobs: state.jobseekerJobs.filter((j) => j.id !== id),
        })),
      removeJobseekerJobLocal: (id) =>
        set((state) => ({
          jobseekerJobs: state.jobseekerJobs.filter((j) => j.id !== id),
        })),
      setJobseekerJobs: (jobs) => set({ jobseekerJobs: jobs }),

      setMatchResults: (results) => set({ matchResults: results }),
      addHrCandidate: (candidate) =>
        set((state) => ({
          hrCandidates: [...state.hrCandidates, candidate],
        })),
      removeHrCandidate: (id) =>
        set((state) => ({
          hrCandidates: state.hrCandidates.filter((c) => c.id !== id),
        })),
      updateCandidateStatus: (id, status) =>
        set((state) => ({
          hrCandidates: state.hrCandidates.map((c) =>
            c.id === id ? { ...c, status } : c
          ),
        })),
      addHrCandidateReputationRating: (id, rating) =>
        set((state) => ({
          hrCandidates: state.hrCandidates.map((c) => {
            if (c.id !== id) return c

            const hasInitial = !!c.reputationRatedAt
            const hasModified = c.reputationModified

            if (!hasInitial) {
              const newRatings = [...c.reputationRatings, rating]
              return {
                ...c,
                reputationRatings: newRatings,
                reputationRatedAt: new Date().toISOString(),
                reputationScore: Math.round(
                  (newRatings.reduce((a, b) => a + b, 0) / newRatings.length) * 20
                ),
              }
            }

            if (hasInitial && !hasModified) {
              const newRatings = [...c.reputationRatings.slice(0, -1), rating]
              return {
                ...c,
                reputationRatings: newRatings,
                reputationModifiedAt: new Date().toISOString(),
                reputationModified: true,
                reputationScore: Math.round(
                  (newRatings.reduce((a, b) => a + b, 0) / newRatings.length) * 20
                ),
              }
            }

            return c
          }),
        })),
      addCandidateChatMessage: (id, role, text) =>
        set((state) => ({
          hrCandidates: state.hrCandidates.map((c) =>
            c.id === id
              ? {
                  ...c,
                  chatMessages: [
                    ...(c.chatMessages ?? []),
                    { role, text, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) },
                  ],
                }
              : c
          ),
        })),
      addJobseekerJobChatMessage: (id, role, text) =>
        set((state) => ({
          jobseekerJobs: state.jobseekerJobs.map((j) =>
            j.id === id
              ? {
                  ...j,
                  chatMessages: [
                    ...(j.chatMessages ?? []),
                    { role, text, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) },
                  ],
                }
              : j
          ),
        })),
      setApiKey: (key) => set({ apiKey: key }),
      setShowApiKeyModal: (show) => set({ showApiKeyModal: show }),

      setSyncStatus: (status, errorMessage = null) =>
        set({ syncStatus: status, syncErrorMessage: errorMessage }),

      setDemoAuth: (userId, isSharedAccount = false) =>
        set({ isDemoUser: true, demoUserId: userId, isSharedAccount }),
      clearDemoAuth: () =>
        set({ isDemoUser: false, demoUserId: null, isSharedAccount: false }),
      resetAuth: () =>
        set({ isAuthReady: false, isDemoUser: false, demoUserId: null, isSharedAccount: false }),
      setAuthReady: () => set({ isAuthReady: true }),
      addSavedProfileId: (id) =>
        set((state) => ({
          savedProfileIds: state.savedProfileIds.includes(id)
            ? state.savedProfileIds
            : [...state.savedProfileIds, id],
        })),
      resetAllData: () => {
        localStorage.removeItem('zhizhao_guest_user_id')
        if (getAuthMode() === 'demo') {
          localStorage.removeItem(DEMO_STORAGE_KEY)
        } else {
          localStorage.removeItem(GUEST_STORAGE_KEY)
        }
        set({
          selectedPosition: null,
          quizAnswers: [],
          currentQuestionIndex: 0,
          currentProfile: null,
          matchResults: [],
          profileHistory: [],
          growthRecords: [],
          hrJobs: [],
          jobseekerJobs: [],
          hrCandidates: [],
          savedProfileIds: [],
          apiKey: '',
          isDemoUser: false,
          demoUserId: null,
          isSharedAccount: false,
          syncStatus: 'idle',
          syncErrorMessage: null,
        })
      },
      logout: () => {
        if (getAuthMode() === 'demo') {
          setAuthMode('guest')
        }
        set({
          isDemoUser: false,
          demoUserId: null,
          isSharedAccount: false,
        })
      },

      resetQuiz: () =>
        set({ quizAnswers: [], currentQuestionIndex: 0, currentProfile: null }),
      resetAll: () =>
        set({
          selectedPosition: null,
          quizAnswers: [],
          currentQuestionIndex: 0,
          currentProfile: null,
          matchResults: [],
        }),
    }),
    {
      name: 'zhizhao-store',
      storage: routedStorage,
      skipHydration: true,
      version: 1,
      partialize: (state: AppState) => ({
        userMode: state.userMode,
        selectedPosition: state.selectedPosition,
        profileHistory: state.profileHistory,
        hrJobs: state.hrJobs,
        jobseekerJobs: state.jobseekerJobs,
        growthRecords: state.growthRecords,
        hrCandidates: state.hrCandidates,
        isDemoUser: state.isDemoUser,
        demoUserId: state.demoUserId,
        isSharedAccount: state.isSharedAccount,
        savedProfileIds: state.savedProfileIds,
        apiKey: state.apiKey,
      } as Partial<AppState>),
    }
  )
)

export const rehydrateStore = () => useAppStore.persist.rehydrate()
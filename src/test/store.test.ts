import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../store/useAppStore'

function createTestProfile(index: number) {
  return {
    name: `测试用户${index}`,
    position: 'ai_engineer' as const,
    mode: 'jobseeker' as const,
    dimensions: [
      { name: '基础理论层', score: 70 + index, maxScore: 100, starRating: 3 },
    ],
    totalScore: 70 + index,
    starRating: 3,
    textReport: `报告${index}`,
    date: new Date().toISOString(),
    curveNode: 'AI应用开发者',
  }
}

function createTestJob(id: string) {
  return {
    id,
    name: `岗位${id}`,
    position: 'ai_engineer' as const,
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    description: '',
    profileDoc: '',
    dimensions: [],
    totalScore: 0,
    starRating: 0,
    company: '',
    chatMessages: [],
  }
}

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      profileHistory: [],
      growthRecords: [],
      hrJobs: [],
      jobseekerJobs: [],
      syncStatus: 'idle',
      syncErrorMessage: null,
    })
  })

  describe('Profile History Management', () => {
    it('should add profile to history with addProfileToHistoryLocal', () => {
      const profile = createTestProfile(1)
      useAppStore.getState().addProfileToHistoryLocal(profile)

      const state = useAppStore.getState()
      expect(state.profileHistory).toHaveLength(1)
      expect(state.profileHistory[0].name).toBe('测试用户1')
    })

    it('should prepend profiles (newest first)', () => {
      useAppStore.getState().addProfileToHistoryLocal(createTestProfile(1))
      useAppStore.getState().addProfileToHistoryLocal(createTestProfile(2))
      useAppStore.getState().addProfileToHistoryLocal(createTestProfile(3))

      const state = useAppStore.getState()
      expect(state.profileHistory).toHaveLength(3)
      expect(state.profileHistory[0].name).toBe('测试用户3')
      expect(state.profileHistory[1].name).toBe('测试用户2')
      expect(state.profileHistory[2].name).toBe('测试用户1')
    })

    it('should remove profile by index with removeProfileFromHistoryLocal', () => {
      useAppStore.getState().addProfileToHistoryLocal(createTestProfile(1))
      useAppStore.getState().addProfileToHistoryLocal(createTestProfile(2))

      useAppStore.getState().removeProfileFromHistoryLocal(0)

      const state = useAppStore.getState()
      expect(state.profileHistory).toHaveLength(1)
      expect(state.profileHistory[0].name).toBe('测试用户1')
    })

    it('should set profile history from cloud data', () => {
      const profiles = [createTestProfile(1), createTestProfile(2), createTestProfile(3)]
      useAppStore.getState().setProfileHistory(profiles)

      const state = useAppStore.getState()
      expect(state.profileHistory).toHaveLength(3)
    })

    it('should handle optimistic rollback', () => {
      useAppStore.getState().addProfileToHistoryLocal(createTestProfile(1))
      useAppStore.getState().addProfileToHistoryLocal(createTestProfile(2))

      useAppStore.getState().removeProfileFromHistoryLocal(0)

      const state = useAppStore.getState()
      expect(state.profileHistory).toHaveLength(1)
      expect(state.profileHistory[0].name).toBe('测试用户1')
    })
  })

  describe('Growth Records Management', () => {
    it('should add growth record', () => {
      const record = { date: '2026-05-15', score: 80, curveNode: 'AI工程实践者', growthPlan: '计划' }
      useAppStore.getState().addGrowthRecordLocal(record)

      const state = useAppStore.getState()
      expect(state.growthRecords).toHaveLength(1)
      expect(state.growthRecords[0].score).toBe(80)
    })
  })

  describe('HR Jobs Management', () => {
    it('should add HR job', () => {
      const job = createTestJob('job_1')
      useAppStore.getState().addHrJobLocal(job)

      const state = useAppStore.getState()
      expect(state.hrJobs).toHaveLength(1)
    })

    it('should remove HR job by id', () => {
      useAppStore.getState().addHrJobLocal(createTestJob('job_1'))
      useAppStore.getState().addHrJobLocal(createTestJob('job_2'))

      useAppStore.getState().removeHrJobLocal('job_1')

      const state = useAppStore.getState()
      expect(state.hrJobs).toHaveLength(1)
      expect(state.hrJobs[0].id).toBe('job_2')
    })

    it('should set HR jobs from cloud', () => {
      const jobs = [createTestJob('1'), createTestJob('2')]
      useAppStore.getState().setHrJobs(jobs)

      const state = useAppStore.getState()
      expect(state.hrJobs).toHaveLength(2)
    })
  })

  describe('Jobseeker Jobs Management', () => {
    it('should add jobseeker job', () => {
      const job = createTestJob('jsjob_1')
      useAppStore.getState().addJobseekerJobLocal(job)

      const state = useAppStore.getState()
      expect(state.jobseekerJobs).toHaveLength(1)
    })

    it('should remove jobseeker job', () => {
      useAppStore.getState().addJobseekerJobLocal(createTestJob('jsjob_1'))
      useAppStore.getState().addJobseekerJobLocal(createTestJob('jsjob_2'))

      useAppStore.getState().removeJobseekerJobLocal('jsjob_1')

      const state = useAppStore.getState()
      expect(state.jobseekerJobs).toHaveLength(1)
    })
  })

  describe('Sync Status', () => {
    it('should update sync status', () => {
      useAppStore.getState().setSyncStatus('syncing')
      expect(useAppStore.getState().syncStatus).toBe('syncing')
    })

    it('should set error message with sync status', () => {
      useAppStore.getState().setSyncStatus('error', '连接失败')
      const state = useAppStore.getState()
      expect(state.syncStatus).toBe('error')
      expect(state.syncErrorMessage).toBe('连接失败')
    })

    it('should clear error message on connected status', () => {
      useAppStore.getState().setSyncStatus('error', '失败')
      useAppStore.getState().setSyncStatus('connected', null)
      const state = useAppStore.getState()
      expect(state.syncStatus).toBe('connected')
      expect(state.syncErrorMessage).toBeNull()
    })
  })

  describe('Quiz Answers Management', () => {
    it('should add quiz answer', () => {
      useAppStore.getState().addQuizAnswer({ questionIndex: 1, answer: 'A', skipped: false })
      expect(useAppStore.getState().quizAnswers).toHaveLength(1)
    })

    it('should replace answer for same question index', () => {
      useAppStore.getState().addQuizAnswer({ questionIndex: 1, answer: 'A', skipped: false })
      useAppStore.getState().addQuizAnswer({ questionIndex: 1, answer: 'B', skipped: false })

      const answers = useAppStore.getState().quizAnswers
      expect(answers).toHaveLength(1)
      expect(answers[0].answer).toBe('B')
    })

    it('should set quiz answers in bulk', () => {
      useAppStore.getState().setQuizAnswers([
        { questionIndex: 1, answer: 'A', skipped: false },
        { questionIndex: 2, answer: 'B,C', skipped: false },
        { questionIndex: 3, answer: '', skipped: true },
      ])

      expect(useAppStore.getState().quizAnswers).toHaveLength(3)
    })

    it('should reset quiz answers', () => {
      useAppStore.getState().addQuizAnswer({ questionIndex: 1, answer: 'A', skipped: false })
      useAppStore.getState().setCurrentProfile({
        name: 'test', position: 'ai_engineer', mode: 'jobseeker',
        dimensions: [], totalScore: 50, starRating: 3,
        textReport: '', date: '', curveNode: '',
      })

      useAppStore.getState().resetQuiz()

      const state = useAppStore.getState()
      expect(state.quizAnswers).toHaveLength(0)
      expect(state.currentProfile).toBeNull()
    })
  })

  describe('User Mode Switching', () => {
    it('should reset position and quiz on mode switch', () => {
      useAppStore.getState().setPosition('ai_engineer')
      useAppStore.getState().addQuizAnswer({ questionIndex: 1, answer: 'A', skipped: false })

      useAppStore.getState().setUserMode('hr')

      const state = useAppStore.getState()
      expect(state.userMode).toBe('hr')
      expect(state.selectedPosition).toBeNull()
      expect(state.quizAnswers).toHaveLength(0)
    })
  })
})
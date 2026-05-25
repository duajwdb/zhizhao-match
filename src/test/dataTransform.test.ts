import { describe, it, expect } from 'vitest'

function toProfileData(row: Record<string, unknown>) {
  return {
    name: row.name as string,
    position: row.position as string,
    mode: row.mode as string,
    dimensions: ((row.dimensions || []) as Array<Record<string, unknown>>).map((d) => ({
      name: d.name as string,
      score: d.score as number,
      maxScore: d.max_score as number,
      starRating: d.star_rating as number,
    })),
    totalScore: row.total_score as number,
    starRating: row.star_rating as number,
    textReport: row.text_report as string,
    date: row.date as string,
    curveNode: row.curve_node as string,
  }
}

function fromProfileData(profile: Record<string, unknown>): Record<string, unknown> {
  return {
    name: profile.name,
    position: profile.position,
    mode: profile.mode,
    dimensions: ((profile.dimensions as Array<Record<string, unknown>>) || []).map((d) => ({
      name: d.name,
      score: d.score,
      max_score: d.maxScore,
      star_rating: d.starRating,
    })),
    total_score: profile.totalScore,
    star_rating: profile.starRating,
    text_report: profile.textReport,
    date: profile.date,
    curve_node: profile.curveNode,
  }
}

function fromJobData(job: Record<string, unknown>): Record<string, unknown> {
  const id = String(job.id || '')
  const isLocal = id.startsWith('jsjob_') || id.startsWith('hrjob_')
  return {
    ...(!isLocal && id ? { id } : {}),
    name: job.name,
    position: job.position,
    status: job.status,
    created_at: job.createdAt,
    description: job.description,
    profile_doc: job.profileDoc,
  }
}

function toJobData(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    position: String(row.position || 'ai_engineer'),
    status: String(row.status || 'active'),
    createdAt: String(row.created_at || new Date().toISOString()),
    description: String(row.description || ''),
    profileDoc: String(row.profile_doc || ''),
  }
}

describe('Data Transformation Functions', () => {
  describe('toProfileData', () => {
    it('should convert Supabase row to ProfileData format', () => {
      const row = {
        name: '测试用户',
        position: 'ai_engineer',
        mode: 'jobseeker',
        dimensions: [
          { name: '基础理论层', score: 75, max_score: 100, star_rating: 4 },
          { name: '工程落地层', score: 60, max_score: 100, star_rating: 3 },
        ],
        total_score: 68,
        star_rating: 3,
        text_report: '报告内容',
        date: '2026-05-15',
        curve_node: 'AI应用开发者',
      }

      const result = toProfileData(row)

      expect(result.name).toBe('测试用户')
      expect(result.position).toBe('ai_engineer')
      expect(result.mode).toBe('jobseeker')
      expect(result.totalScore).toBe(68)
      expect(result.starRating).toBe(3)
      expect(result.curveNode).toBe('AI应用开发者')
      expect(result.dimensions).toHaveLength(2)
      expect(result.dimensions[0].name).toBe('基础理论层')
      expect(result.dimensions[0].score).toBe(75)
      expect(result.dimensions[0].maxScore).toBe(100)
      expect(result.dimensions[0].starRating).toBe(4)
    })

    it('should handle empty dimensions array', () => {
      const row = {
        name: '空用户',
        position: '3d_modeler',
        mode: 'student',
        dimensions: [],
        total_score: 0,
        star_rating: 0,
        text_report: '',
        date: '',
        curve_node: '',
      }

      const result = toProfileData(row)

      expect(result.dimensions).toEqual([])
      expect(result.totalScore).toBe(0)
    })
  })

  describe('fromProfileData', () => {
    it('should convert ProfileData to Supabase insert format', () => {
      const profile = {
        name: '求职者A',
        position: '3d_modeler',
        mode: 'jobseeker',
        dimensions: [
          { name: '建模技术能力', score: 80, maxScore: 100, starRating: 4 },
        ],
        totalScore: 80,
        starRating: 4,
        textReport: '报告',
        date: '2026-05-15',
        curveNode: '3D专业者',
      }

      const result = fromProfileData(profile)

      expect(result.name).toBe('求职者A')
      expect(result.position).toBe('3d_modeler')
      expect(result.mode).toBe('jobseeker')
      expect(result.total_score).toBe(80)
      expect(result.star_rating).toBe(4)
      expect(result.curve_node).toBe('3D专业者')
      expect((result.dimensions as Array<Record<string, unknown>>)[0].max_score).toBe(100)
      expect((result.dimensions as Array<Record<string, unknown>>)[0].star_rating).toBe(4)
    })
  })

  describe('fromJobData', () => {
    it('should exclude id when it starts with jsjob_', () => {
      const job = {
        id: 'jsjob_12345',
        name: 'AI工程师',
        position: 'ai_engineer',
        status: 'active',
        createdAt: '2026-05-15',
        description: '岗位描述',
        profileDoc: '',
      }

      const result = fromJobData(job)

      expect(result.id).toBeUndefined()
      expect(result.name).toBe('AI工程师')
      expect(result.position).toBe('ai_engineer')
    })

    it('should exclude id when it starts with hrjob_', () => {
      const job = {
        id: 'hrjob_67890',
        name: 'HR岗位',
        position: 'ai_engineer',
        status: 'active',
        createdAt: '2026-05-15',
        description: '',
        profileDoc: '',
      }

      const result = fromJobData(job)

      expect(result.id).toBeUndefined()
    })

    it('should include id when it is a UUID from Supabase', () => {
      const job = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '已有岗位',
        position: '3d_modeler',
        status: 'draft',
        createdAt: '2026-05-15',
        description: '',
        profileDoc: '',
      }

      const result = fromJobData(job)

      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000')
    })
  })

  describe('toJobData', () => {
    it('should convert Supabase row to JobData format', () => {
      const row = {
        id: 'abc123',
        name: '测试岗位',
        position: 'ai_engineer',
        status: 'active',
        created_at: '2026-01-01',
        description: '描述文本',
        profile_doc: 'profile文档',
      }

      const result = toJobData(row)

      expect(result.id).toBe('abc123')
      expect(result.name).toBe('测试岗位')
      expect(result.position).toBe('ai_engineer')
      expect(result.status).toBe('active')
      expect(result.createdAt).toBe('2026-01-01')
    })

    it('should provide defaults for missing fields', () => {
      const row = {} as Record<string, unknown>

      const result = toJobData(row)

      expect(result.id).toBe('')
      expect(result.name).toBe('')
      expect(result.position).toBe('ai_engineer')
      expect(result.status).toBe('active')
      expect(result.description).toBe('')
      expect(result.profileDoc).toBe('')
    })
  })

  describe('Round-trip transformations', () => {
    it('profileData -> row -> profileData should be lossless', () => {
      const original = {
        name: '完整性测试',
        position: 'ai_engineer',
        mode: 'jobseeker',
        dimensions: [
          { name: 'AI核心技术层', score: 90, maxScore: 100, starRating: 5 },
          { name: '场景转化层', score: 70, maxScore: 100, starRating: 3 },
        ],
        totalScore: 82,
        starRating: 4,
        textReport: '完整报告\n多行内容',
        date: '2026-05-16T10:00:00.000Z',
        curveNode: 'AI工程实践者',
      }

      const row = fromProfileData(original)
      const restored = toProfileData(row)

      expect(restored.name).toBe(original.name)
      expect(restored.totalScore).toBe(original.totalScore)
      expect(restored.starRating).toBe(original.starRating)
      expect(restored.dimensions).toHaveLength(2)
      expect(restored.dimensions[0].score).toBe(90)
      expect(restored.dimensions[1].starRating).toBe(3)
    })
  })
})
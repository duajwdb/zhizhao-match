export interface CandidateProfileRow {
  id?: string
  name: string
  position: string
  mode: string
  dimensions: DimensionScoreRow[]
  total_score: number
  star_rating: number
  text_report: string
  date: string
  curve_node: string
  user_id?: string
  created_at?: string
}

export interface DimensionScoreRow {
  name: string
  score: number
  max_score: number
  star_rating: number
}

export interface HrJobRow {
  id?: string
  name: string
  position: string
  status: string
  created_at: string
  description: string
  profile_doc: string
}

export interface JobseekerJobRow {
  id?: string
  name: string
  position: string
  status: string
  created_at: string
  description: string
  profile_doc: string
}

export interface GrowthRecordRow {
  id?: string
  date: string
  score: number
  curve_node: string
  growth_plan: string
  user_id?: string
  created_at?: string
}

export interface QuizResultRow {
  id?: string
  question_index: number
  answer: string
  skipped: boolean
  position: string
  mode: string
  user_id?: string
  created_at?: string
}

export interface EvaluationRow {
  id?: string
  candidate_id?: string
  honesty_score: number
  dimension_tags: string[]
  comment: string
  created_at?: string
}

export interface MatchResultRow {
  id?: string
  name: string
  match_score: number
  match_points: string[]
  gap_points: string[]
  reputation_score: number
  recent_tags: string[]
  created_at?: string
}

export interface Database {
  public: {
    Tables: {
      candidate_profiles: {
        Row: CandidateProfileRow
        Insert: Omit<CandidateProfileRow, 'id' | 'created_at'>
        Update: Partial<Omit<CandidateProfileRow, 'id'>>
      }
      hr_jobs: {
        Row: HrJobRow
        Insert: Omit<HrJobRow, 'id' | 'created_at'>
        Update: Partial<Omit<HrJobRow, 'id'>>
      }
      jobseeker_jobs: {
        Row: JobseekerJobRow
        Insert: Omit<JobseekerJobRow, 'id' | 'created_at'>
        Update: Partial<Omit<JobseekerJobRow, 'id'>>
      }
      growth_records: {
        Row: GrowthRecordRow
        Insert: Omit<GrowthRecordRow, 'id' | 'created_at'>
        Update: Partial<Omit<GrowthRecordRow, 'id'>>
      }
      quiz_results: {
        Row: QuizResultRow
        Insert: Omit<QuizResultRow, 'id' | 'created_at'>
        Update: Partial<Omit<QuizResultRow, 'id'>>
      }
      evaluations: {
        Row: EvaluationRow
        Insert: Omit<EvaluationRow, 'id' | 'created_at'>
        Update: Partial<Omit<EvaluationRow, 'id'>>
      }
      match_results: {
        Row: MatchResultRow
        Insert: Omit<MatchResultRow, 'id' | 'created_at'>
        Update: Partial<Omit<MatchResultRow, 'id'>>
      }
    }
  }
}
-- 智聘 · 完整数据库表结构
-- 请在 Supabase SQL Editor 中执行此脚本
-- 打开: https://hbzbnyvjkuqivcfbgumk.supabase.com → SQL Editor → 粘贴并运行

-- ============ 用户数据表 ============

CREATE TABLE IF NOT EXISTS candidate_profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  position VARCHAR(50) NOT NULL,
  mode VARCHAR(20) NOT NULL DEFAULT 'quiz',
  dimensions JSONB NOT NULL DEFAULT '[]',
  total_score INTEGER NOT NULL DEFAULT 0,
  star_rating DECIMAL(2,1) NOT NULL DEFAULT 3.0,
  text_report TEXT,
  date VARCHAR(20) NOT NULL,
  curve_node INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_jobs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  position VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT DEFAULT '',
  profile_doc TEXT DEFAULT '',
  dimensions JSONB NOT NULL DEFAULT '[]',
  total_score INTEGER NOT NULL DEFAULT 0,
  star_rating DECIMAL(2,1) NOT NULL DEFAULT 3.0,
  company VARCHAR(200) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS jobseeker_jobs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  position VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT DEFAULT '',
  profile_doc TEXT DEFAULT '',
  dimensions JSONB NOT NULL DEFAULT '[]',
  total_score INTEGER NOT NULL DEFAULT 0,
  star_rating DECIMAL(2,1) NOT NULL DEFAULT 3.0,
  company VARCHAR(200) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS growth_records (
  id SERIAL PRIMARY KEY,
  date VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  curve_node INTEGER NOT NULL DEFAULT 0,
  growth_plan TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id SERIAL PRIMARY KEY,
  question_id VARCHAR(100),
  answer VARCHAR(500),
  score INTEGER NOT NULL DEFAULT 0,
  position VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluations (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0,
  position VARCHAR(50),
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

-- ============ 种子数据表 ============

CREATE TABLE IF NOT EXISTS talent_pool (
  id SERIAL PRIMARY KEY,
  position VARCHAR(50) NOT NULL CHECK (position IN ('ai_engineer', '3d_modeler')),
  name VARCHAR(100) NOT NULL,
  dimension_scores JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  skill_profile TEXT,
  reputation DECIMAL(3,1) NOT NULL CHECK (reputation >= 0 AND reputation <= 5.0),
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

-- ============ 索引 ============

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_pos ON candidate_profiles (position);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_date ON candidate_profiles (date);
CREATE INDEX IF NOT EXISTS idx_hr_jobs_status ON hr_jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobseeker_jobs_status ON jobseeker_jobs (status);
CREATE INDEX IF NOT EXISTS idx_growth_records_date ON growth_records (date);
CREATE INDEX IF NOT EXISTS idx_talent_pool_position ON talent_pool (position);
CREATE INDEX IF NOT EXISTS idx_talent_pool_total_score ON talent_pool (total_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_pool_position ON job_pool (position);
CREATE INDEX IF NOT EXISTS idx_job_pool_demand ON job_pool (demand_intensity DESC);
CREATE INDEX IF NOT EXISTS idx_match_results_score ON match_results (match_score DESC);

-- ============ Row Level Security (RLS) ============

ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobseeker_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to candidate_profiles" ON candidate_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to hr_jobs" ON hr_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to jobseeker_jobs" ON jobseeker_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to growth_records" ON growth_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to quiz_results" ON quiz_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to evaluations" ON evaluations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to match_results" ON match_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to talent_pool" ON talent_pool FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to job_pool" ON job_pool FOR ALL USING (true) WITH CHECK (true);
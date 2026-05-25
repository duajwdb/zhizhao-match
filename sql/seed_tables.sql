-- 智聘 · 种子数据表
-- 请在 Supabase SQL Editor 中执行此脚本
-- 人才库表：存储AI工程师和3D建模师的候选人数据
-- 岗位库表：存储AI工程师和3D建模师的岗位数据

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

CREATE INDEX IF NOT EXISTS idx_talent_pool_position ON talent_pool (position);
CREATE INDEX IF NOT EXISTS idx_talent_pool_total_score ON talent_pool (total_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_pool_position ON job_pool (position);
CREATE INDEX IF NOT EXISTS idx_job_pool_demand ON job_pool (demand_intensity DESC);

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

CREATE INDEX IF NOT EXISTS idx_match_results_score ON match_results (match_score DESC);

ALTER TABLE talent_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to talent_pool" ON talent_pool FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to job_pool" ON job_pool FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to match_results" ON match_results FOR ALL USING (true) WITH CHECK (true);
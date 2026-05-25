## 1. 架构设计

```mermaid
graph TB
    subgraph "前端展示层"
        A["React + TypeScript + Vite"]
        A1["求职者模式页面组"]
        A2["大学生模式页面组"]
        A3["HR模式页面组"]
        A4["共享组件库"]
    end
    
    subgraph "状态管理层"
        B["React Context / Zustand"]
        B1["用户模式状态"]
        B2["答题进度状态"]
        B3["画像数据状态"]
    end
    
    subgraph "数据层"
        C["本地存储 LocalStorage"]
        D["Supabase PostgreSQL"]
        E["pgvector 向量存储"]
    end
    
    subgraph "外部服务"
        F["DeepSeek API"]
    end
    
    A --> A1
    A --> A2
    A --> A3
    A1 --> A4
    A2 --> A4
    A3 --> A4
    A1 --> B
    A2 --> B
    A3 --> B
    B --> B1
    B --> B2
    B --> B3
    B --> C
    B --> D
    D --> E
    B --> F
```

## 2. 技术说明

- **前端框架**：React 18 + TypeScript + Vite
- **样式方案**：Tailwind CSS 3 + CSS Modules（自定义动画和复杂样式）
- **状态管理**：Zustand（全局状态）+ React Context（模式切换）+ LocalStorage（答题进度持久化）
- **路由**：React Router v6
- **图表渲染**：Recharts（柱状图、成长曲线）
- **动画**：Framer Motion（页面过渡、微交互）
- **HTTP客户端**：Axios / Fetch API
- **数据库**：Supabase (PostgreSQL + pgvector)
- **AI服务**：DeepSeek API (`deepseek-v4-flash`)，通过后端服务调用
- **项目初始化**：npm create vite@latest

## 3. 路由定义

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页工作台 | 根据当前模式显示对应工作台 |
| `/select-position` | 岗位选择页 | 选择AI工程师或3D建模师 |
| `/quiz` | 题库测评页 | 标准答题流程 |
| `/quiz/hr-ai` | HR-AI代答页 | AI代答+四阶段引导 |
| `/result` | 画像结果页 | 评分柱状图+文字报告 |
| `/growth` | 成长模式页 | 成长曲线+AI规划 |
| `/hr/jobs` | 岗位库管理 | 岗位列表管理 |
| `/hr/jobs/:id` | 岗位详情 | 单个岗位画像详情 |
| `/match` | 双向匹配页 | 匹配结果展示 |
| `/match/anonymous` | 匿名互动页 | 双向匿名沟通 |
| `/evaluate` | 信誉评价页 | 面试后双向评价 |

## 4. API 定义（后续后端实现）

```typescript
// 评分与画像生成
interface GradeRequest {
  answers: Answer[];
  position: 'ai_engineer' | '3d_modeler';
  evaluationRef: string; // 评价标准文件引用
  profileTemplateRef: string; // 画像模板文件引用
}

interface ProfileResult {
  dimensions: DimensionScore[];
  totalScore: number;
  starRating: number;
  textReport: string;
}

interface DimensionScore {
  name: string;
  score: number; // 0-100
  maxScore: number;
}

// 岗位画像（HR端）
interface HrPositionRequest {
  type: 'self_answer' | 'ai_assist';
  rawDescription?: string;
  answers?: Answer[];
  position: 'ai_engineer' | '3d_modeler';
}

// 匹配请求
interface MatchRequest {
  positionId: string;
  positionType: 'ai_engineer' | '3d_modeler';
  stage: 'vector_screening' | 'ai_ranking';
  candidates?: CandidateProfile[];
}

interface MatchResult {
  candidateId: string;
  matchScore: number;
  matchPoints: string[];
  gapPoints: string[];
  reputationScore: number;
}
```

## 5. 数据模型

### 5.1 数据模型定义

```mermaid
erDiagram
    CANDIDATE_PROFILES ||--o{ GROWTH_RECORDS : has
    CANDIDATE_PROFILES ||--o{ REPUTATION_RECORDS : receives
    HR_JOBS ||--o{ MATCH_RESULTS : generates
    CANDIDATE_PROFILES ||--o{ MATCH_RESULTS : appears_in
    
    CANDIDATE_PROFILES {
        uuid id PK
        string user_type
        string position_type
        jsonb dimension_scores
        int total_score
        int star_rating
        text profile_report
        timestamp created_at
        timestamp updated_at
    }
    
    HR_JOBS {
        uuid id PK
        string position_type
        jsonb dimension_requirements
        int priority_score
        text job_description
        text candidate_profile_doc
        string status
        timestamp created_at
    }
    
    GROWTH_RECORDS {
        uuid id PK
        uuid candidate_id FK
        int score
        string curve_node
        text growth_plan
        timestamp test_date
    }
    
    REPUTATION_RECORDS {
        uuid id PK
        uuid candidate_id FK
        int honesty_stars
        string evaluation_text
        jsonb evaluation_tags
        timestamp created_at
    }
    
    MATCH_RESULTS {
        uuid id PK
        uuid job_id FK
        uuid candidate_id FK
        float match_score
        jsonb match_points
        jsonb gap_points
        float reputation_weight
        timestamp created_at
    }
```

### 5.2 本地存储结构

```typescript
// LocalStorage 答题进度
interface QuizProgress {
  mode: 'jobseeker' | 'student' | 'hr';
  position: 'ai_engineer' | '3d_modeler';
  currentQuestionIndex: number;
  answers: Record<number, string>;
  skippedQuestions: number[];
  timestamp: number;
}
```

## 6. 组件树

```
App
├── Layout
│   ├── Header (模式切换标签栏 + Logo)
│   └── MainContent
├── Pages
│   ├── DashboardPage (首页工作台)
│   │   ├── JobseekerDashboard
│   │   │   ├── CTACard (生成技能画像)
│   │   │   ├── MatchButton (岗位库匹配)
│   │   │   └── HistoryTimeline (历史画像列表)
│   │   ├── StudentDashboard
│   │   │   ├── CTACard
│   │   │   ├── HistoryTimeline
│   │   │   └── GrowthEntry (成长模式入口)
│   │   └── HRDashboard
│   │       ├── ProfileGenCard (生成岗位画像)
│   │       ├── JobManageCard (岗位库管理)
│   │       └── MatchCard (匹配人才库)
│   ├── PositionSelectPage
│   │   └── PositionCard (x2)
│   ├── QuizPage
│   │   ├── ProgressBar
│   │   ├── QuestionCard
│   │   ├── OptionGroup
│   │   └── SkipButton
│   ├── HRAssistPage
│   │   ├── DescriptionInput (多行文本框)
│   │   └── DialogueBubble (四阶段对话)
│   ├── ResultPage
│   │   ├── ScoreBarChart (横向柱状图)
│   │   ├── ProfileReport (文字画像报告)
│   │   └── ActionBar (录入/成长/匹配)
│   ├── GrowthPage
│   │   ├── GrowthCurve (SVG成长曲线)
│   │   ├── CurrentMarker (当前位置标记)
│   │   └── GrowthPlanCards (AI规划卡片)
│   ├── HRJobManagePage
│   │   ├── JobTable (岗位表格)
│   │   └── DeleteConfirmModal
│   ├── MatchPage
│   │   ├── MatchFilterBar
│   │   ├── CandidateRankList
│   │   │   └── MatchCard (匹配度环形图+契合点)
│   │   └── ReputationBadge (信誉标签)
│   └── EvaluatePage
│       ├── StarRating
│       ├── TagSelector
│       └── TextReviewInput
└── Shared Components
    ├── Modal
    ├── Toast
    ├── LoadingSpinner
    ├── EmptyState
    └── ConfirmDialog
```
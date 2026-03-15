// 五维度计分规则
export interface DimensionScores {
  extraversion: number;  // E-I: 外向-内向
  stability: number;     // S-N: 稳定-敏感
  trainability: number;  // T-F: 服从-独立
  activity: number;      // A-C: 活跃-安静
  friendliness: number;  // F-G: 亲和-警戒
}

// 题目数据结构
export interface Question {
  id: number;
  dimension: keyof DimensionScores;
  text: string;
  scenario?: string;
  options: {
    label: string;
    score: number; // -2, -1, 0, 1, 2
  }[];
}

// 性格类型定义
export interface PersonalityType {
  code: string;           // 四字母代码，如 "ESTA"
  name: string;           // 类型名称，如 "社交小太阳"
  emoji: string;          // 代表emoji
  slogan: string;         // 一句话描述
  description: string;    // 详细描述（150-200字）
  traits: string[];       // 性格特点（4个）
  tips: string[];         // 饲养建议（5条）
  activities: string[];   // 适合的活动（3个）
  quirks: string[];       // 小缺点（2个）
  color: string;          // 主题色
}

// 用户答案
export interface Answer {
  questionId: number;
  optionIndex: number;
  score: number;
}

// 计算结果
export interface QuizResult {
  scores: DimensionScores;
  primaryType: string;    // 主类型代码
  secondaryType?: string; // 次类型代码（可选）
  personality: PersonalityType;
}

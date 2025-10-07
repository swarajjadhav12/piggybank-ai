export interface MatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  totalSkills: number;
  resumeWordCount: number;
  jdWordCount: number;
}

export interface SkillCategory {
  category: string;
  skills: string[];
  matched: number;
  total: number;
}
import { MatchResult } from '../types';

// Common technical skills and keywords
const SKILL_CATEGORIES = {
  'Programming Languages': [
    'javascript', 'python', 'java', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab'
  ],
  'Web Technologies': [
    'react', 'angular', 'vue', 'nodejs', 'express', 'nextjs', 'html', 'css', 'sass', 'bootstrap', 'tailwind'
  ],
  'Databases': [
    'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'dynamodb', 'elasticsearch', 'neo4j'
  ],
  'Cloud & DevOps': [
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab', 'github', 'cicd'
  ],
  'Data Science & ML': [
    'tensorflow', 'pytorch', 'sklearn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'keras', 'opencv'
  ],
  'Tools & Frameworks': [
    'git', 'jira', 'confluence', 'slack', 'figma', 'postman', 'webpack', 'vite', 'jest', 'cypress'
  ]
};

export const preprocessText = (text: string): string[] => {
  // Convert to lowercase and remove special characters
  const cleaned = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Split into words and filter out common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);
  
  const words = cleaned.split(/\s+/).filter(word => 
    word.length > 2 && !stopWords.has(word) && !/^\d+$/.test(word)
  );
  
  return words;
};

export const extractSkills = (text: string): string[] => {
  const words = preprocessText(text);
  const allSkills = Object.values(SKILL_CATEGORIES).flat();
  
  const foundSkills = new Set<string>();
  
  // Direct skill matching
  allSkills.forEach(skill => {
    if (words.some(word => word.includes(skill) || skill.includes(word))) {
      foundSkills.add(skill);
    }
  });
  
  // Multi-word skill matching
  const originalText = text.toLowerCase();
  allSkills.forEach(skill => {
    if (originalText.includes(skill)) {
      foundSkills.add(skill);
    }
  });
  
  return Array.from(foundSkills);
};

export const calculateTFIDF = (words: string[]): Map<string, number> => {
  const termFreq = new Map<string, number>();
  const totalWords = words.length;
  
  // Calculate term frequency
  words.forEach(word => {
    termFreq.set(word, (termFreq.get(word) || 0) + 1);
  });
  
  // Convert to TF-IDF (simplified - just using TF for MVP)
  const tfidf = new Map<string, number>();
  termFreq.forEach((freq, term) => {
    tfidf.set(term, freq / totalWords);
  });
  
  return tfidf;
};

export const matchResumeToJD = (resumeText: string, jdText: string): MatchResult => {
  const resumeWords = preprocessText(resumeText);
  const jdWords = preprocessText(jdText);
  
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jdText);
  
  const resumeTFIDF = calculateTFIDF(resumeWords);
  const jdTFIDF = calculateTFIDF(jdWords);
  
  // Find matched and missing skills
  const matchedSkills = jdSkills.filter(skill => resumeSkills.includes(skill));
  const missingSkills = jdSkills.filter(skill => !resumeSkills.includes(skill));
  
  // Calculate match score based on skills overlap and word similarity
  const skillsScore = jdSkills.length > 0 ? (matchedSkills.length / jdSkills.length) * 100 : 0;
  
  // Word overlap score
  const commonWords = resumeWords.filter(word => jdWords.includes(word));
  const wordScore = jdWords.length > 0 ? (commonWords.length / jdWords.length) * 100 : 0;
  
  // Weighted final score (70% skills, 30% word overlap)
  const matchScore = Math.round((skillsScore * 0.7 + wordScore * 0.3));
  
  return {
    matchScore: Math.min(matchScore, 100),
    matchedSkills,
    missingSkills,
    totalSkills: jdSkills.length,
    resumeWordCount: resumeWords.length,
    jdWordCount: jdWords.length
  };
};
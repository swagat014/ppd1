import nlp from 'compromise';
import { WordTokenizer } from 'natural';

export interface ResumeAnalysisInput {
  resumeText: string;
  jobDescription?: string;
}

export interface ResumeAnalysisResult {
  atsScore: number;
  jdMatchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  weakSections: string[];
  strongSections: string[];
  suggestions: string[];
  warnings: string[];
  scoreBreakdown: {
    sectionsScore: number;
    lengthScore: number;
    jdMatchScore: number;
    formattingScore: number;
    keywordDensityPenalty: number;
    techSkillMatchScore: number;
    criticalSkillPenalty: number;
    actionVerbScore: number;
  };
}

const tokenizer = new WordTokenizer();

const CORE_SECTIONS = ['skills', 'projects', 'experience', 'education'];

const ACTION_VERBS = [
  'led',
  'managed',
  'implemented',
  'developed',
  'designed',
  'created',
  'optimized',
  'improved',
  'built',
  'collaborated',
  'increased',
  'reduced',
  'launched',
  'delivered',
];

const TECH_SKILLS_DICTIONARY = [
  'javascript',
  'typescript',
  'react',
  'react.js',
  'node',
  'node.js',
  'express',
  'mongodb',
  'sql',
  'mysql',
  'postgresql',
  'python',
  'java',
  'c++',
  'c#',
  'docker',
  'kubernetes',
  'aws',
  'azure',
  'gcp',
  'git',
  'github',
  'rest',
  'restful',
  'graphql',
  'html',
  'css',
  'redux',
  'next.js',
  'jest',
  'cypress',
  'ci/cd',
  'linux',
  'agile',
  'scrum',
  'tailwind',
];

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function safeTokenize(text: string): string[] {
  const tokens = tokenizer.tokenize(text || '');
  return (tokens || []) as string[];
}

function wordCount(text: string): number {
  return safeTokenize(text).filter((t) => /\w/.test(t)).length;
}

function detectSections(text: string): { found: string[]; missing: string[] } {
  const lower = text.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];

  CORE_SECTIONS.forEach((section) => {
    const regex = new RegExp(`\\b${section}\\b`, 'i');
    if (regex.test(lower)) {
      found.push(section);
    } else {
      missing.push(section);
    }
  });

  return { found, missing };
}

function detectFormattingSignals(text: string) {
  const lines = text.split(/\r?\n/);
  const bulletLines = lines.filter((l) => /^\s*[-*•]/.test(l)).length;
  const tableLikeLines = lines.filter((l) => /\|.+\|/.test(l) || /┌|┬|┐|└|┴|┘|│/.test(l)).length;

  const iconMatches = (text.match(/●|■|★|▪|➤|▶|✓|✗|✘|✅|❌/g) || []).length;

  return {
    bulletLines,
    tableLikeLines,
    iconMatches,
  };
}

function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const tokens = safeTokenize(lower);
  const tokenSet = new Set(tokens);

  const skills = new Set<string>();

  TECH_SKILLS_DICTIONARY.forEach((skill) => {
    const normalizedSkill = skill.toLowerCase();
    if (normalizedSkill.includes('.')) {
      if (lower.includes(normalizedSkill)) {
        skills.add(skill);
      }
    } else if (tokenSet.has(normalizedSkill)) {
      skills.add(skill);
    }
  });

  const doc = nlp(text);
  const nouns = doc.nouns().out('array') as string[];
  nouns.forEach((noun) => {
    const n = noun.toLowerCase();
    if (n.length > 2 && /[a-z]/.test(n)) {
      skills.add(noun);
    }
  });

  return Array.from(skills);
}

function extractJDKeywords(jd?: string): string[] {
  if (!jd) return [];
  const doc = nlp(jd);
  const keyNouns = doc.nouns().out('array') as string[];
  const keyVerbs = doc.verbs().out('array') as string[];

  const all = [...keyNouns, ...keyVerbs].map((w) => w.toLowerCase());
  const filtered = all.filter(
    (w) =>
      w.length > 2 &&
      !['and', 'the', 'for', 'with', 'this', 'that', 'your', 'will', 'have', 'are', 'our'].includes(w)
  );

  return Array.from(new Set(filtered));
}

function keywordFrequencies(tokens: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  tokens.forEach((t) => {
    const token = t.toLowerCase();
    if (!/\w/.test(token)) return;
    freq[token] = (freq[token] || 0) + 1;
  });
  return freq;
}

export function analyzeResumeText(input: ResumeAnalysisInput): ResumeAnalysisResult {
  const resumeText = normalizeText(input.resumeText || '');
  const jobDescription = normalizeText(input.jobDescription || '');

  const totalWords = wordCount(resumeText);

  const sections = detectSections(resumeText);
  const sectionScorePer = 25 / CORE_SECTIONS.length;
  const sectionsScore = sections.found.length * sectionScorePer;

  let lengthScore = 0;
  if (totalWords >= 300 && totalWords <= 700) {
    lengthScore = 15;
  } else if (totalWords >= 200 && totalWords <= 900) {
    lengthScore = 10;
  } else if (totalWords >= 150 && totalWords <= 1000) {
    lengthScore = 5;
  }

  const resumeSkills = extractSkillsFromText(resumeText);
  const jdKeywords = extractJDKeywords(jobDescription);

  const resumeTokens = safeTokenize(resumeText.toLowerCase());
  const resumeFreq = keywordFrequencies(resumeTokens);

  const matchedKeywords: string[] = [];
  const strongKeywords: string[] = [];
  const weakKeywords: string[] = [];

  jdKeywords.forEach((kw) => {
    const count = resumeFreq[kw] || 0;
    if (count >= 2) {
      matchedKeywords.push(kw);
      strongKeywords.push(kw);
    } else if (count === 1) {
      matchedKeywords.push(kw);
      weakKeywords.push(kw);
    }
  });

  const uniqueJDKeywords = jdKeywords.length || 1;
  const jdMatchRatio = matchedKeywords.length / uniqueJDKeywords;
  const jdMatchPercentage = Math.round(jdMatchRatio * 100);
  const jdMatchScore = jdMatchRatio * 40;

  // Tech-role specific weighting: focus on tech keywords present in the JD
  const jdTechKeywords = jdKeywords.filter((kw) =>
    TECH_SKILLS_DICTIONARY.includes(kw.toLowerCase())
  );
  const techMatched = jdTechKeywords.filter((kw) => (resumeFreq[kw] || 0) > 0);
  const techCoverageRatio =
    jdTechKeywords.length > 0 ? techMatched.length / jdTechKeywords.length : 0;
  const techSkillMatchScore = techCoverageRatio * 20; // up to +20 for strong tech alignment

  const formatting = detectFormattingSignals(resumeText);
  let formattingScore = 0;
  if (formatting.bulletLines >= 5) {
    formattingScore += 10;
  } else if (formatting.bulletLines >= 2) {
    formattingScore += 5;
  }

  if (formatting.tableLikeLines > 3) {
    formattingScore -= 7;
  } else if (formatting.tableLikeLines > 0) {
    formattingScore -= 3;
  }

  if (formatting.iconMatches > 5) {
    formattingScore -= 5;
  } else if (formatting.iconMatches > 0) {
    formattingScore -= 2;
  }

  const totalTokens = resumeTokens.length || 1;
  let keywordDensityPenalty = 0;
  Object.entries(resumeFreq).forEach(([token, count]) => {
    if (jdKeywords.includes(token) || TECH_SKILLS_DICTIONARY.includes(token)) {
      const density = count / totalTokens;
      if (density > 0.05 && density <= 0.1) {
        keywordDensityPenalty -= 3;
      } else if (density > 0.1) {
        keywordDensityPenalty -= 7;
      }
    }
  });

  const strongSections: string[] = [];
  const weakSections: string[] = [];

  sections.found.forEach((section) => {
    const regex = new RegExp(`${section}[:\\n]([\\s\\S]*?)(\\n[A-Z][A-Za-z ]+:|$)`, 'i');
    const match = resumeText.match(regex);
    const block = match ? match[1] : '';
    const blockWords = wordCount(block);
    if (blockWords >= 80) {
      strongSections.push(section);
    } else {
      weakSections.push(section);
    }
  });

  sections.missing.forEach((section) => {
    weakSections.push(section);
  });

  // Penalize missing "critical" skills that appear in the JD for tech roles
  const CRITICAL_TECH_SKILLS = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'git'];
  let criticalSkillPenalty = 0;
  CRITICAL_TECH_SKILLS.forEach((skill) => {
    if (jdKeywords.includes(skill) && !resumeSkills.map((s) => s.toLowerCase()).includes(skill)) {
      criticalSkillPenalty -= 5; // up to -35 if all are missing, clamped later
    }
  });

  // Reward resumes whose bullet points start with strong action verbs
  const lines = resumeText.split(/\r?\n/);
  const bulletLines = lines.filter((l) => /^\s*[-*•]/.test(l));
  let actionVerbScore = 0;
  if (bulletLines.length > 0) {
    let actionVerbBullets = 0;
    bulletLines.forEach((line) => {
      const cleaned = line.replace(/^\s*[-*•]\s*/, '').trim();
      const firstWord = cleaned.split(/\s+/)[0]?.toLowerCase();
      if (firstWord && ACTION_VERBS.includes(firstWord)) {
        actionVerbBullets += 1;
      }
    });
    const ratio = actionVerbBullets / bulletLines.length;
    if (ratio >= 0.7) {
      actionVerbScore = 5;
    } else if (ratio >= 0.4) {
      actionVerbScore = 3;
    } else if (ratio >= 0.2) {
      actionVerbScore = 1;
    }
  }

  let atsScore =
    sectionsScore +
    lengthScore +
    jdMatchScore +
    formattingScore +
    keywordDensityPenalty +
    techSkillMatchScore +
    criticalSkillPenalty +
    actionVerbScore;

  if (atsScore < 0) atsScore = 0;
  if (atsScore > 100) atsScore = 100;

  const missingSkills: string[] = [];
  const resumeSkillSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
  jdKeywords.forEach((kw) => {
    if (!resumeSkillSet.has(kw)) {
      missingSkills.push(kw);
    }
  });

  const suggestions: string[] = [];
  const warnings: string[] = [];

  if (totalWords < 300) {
    suggestions.push(
      'Your resume looks a bit short for most tech roles. Try expanding your experience and projects so the document is at least 300 words.'
    );
  } else if (totalWords > 700) {
    suggestions.push(
      'Your resume is quite long. Aim for a focused 1–2 page document (roughly 300–700 words) by trimming older or less relevant details.'
    );
  }

  if (sections.missing.length > 0) {
    suggestions.push(
      `Consider adding clear sections for: ${sections.missing
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(', ')} so recruiters and ATS can quickly find your information.`
    );
  }

  if (formatting.tableLikeLines > 0) {
    warnings.push(
      'I can see table or multi-column formatting in your resume. Many ATS tools struggle with this, so a simple single-column layout is safer.'
    );
  }

  if (formatting.iconMatches > 0) {
    warnings.push(
      'Your resume uses icons or fancy bullets. Replace them with plain characters like "-" or "*" to avoid ATS parsing issues.'
    );
  }

  if (weakSections.includes('experience')) {
    suggestions.push(
      'Your Experience section feels light. Add 3–6 bullet points per role that start with action verbs and include measurable impact (numbers, percentages, timelines).'
    );
  }

  if (strongSections.includes('experience')) {
    suggestions.push(
      'Your Experience section is reasonably detailed. Double-check that most bullets start with strong verbs like "Developed" or "Optimized" and mention concrete results.'
    );
  }

  if (missingSkills.length > 0) {
    suggestions.push(
      `Based on this job description, you may want to highlight skills you actually have that match it, such as: ${missingSkills
        .slice(0, 10)
        .join(', ')}.`
    );
  }

  suggestions.push(
    'Use very clear section headings like "SKILLS", "PROJECTS", "EXPERIENCE", and "EDUCATION" (in caps or bold) so both ATS and humans can skim easily.'
  );
  suggestions.push('Avoid complex multi-column layouts, text boxes, and images; they often cause ATS parsing issues.');
  suggestions.push(
    'Wherever possible, start bullet points with verbs (for example, "Developed", "Implemented", "Optimized") and follow them with specific, numeric outcomes.'
  );

  // Basic contact-info checks for ATS realism
  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(resumeText);
  const hasPhone = /\b\d{10}\b/.test(resumeText.replace(/[\s-]/g, ''));
  const hasProfileLink = /(linkedin\.com|github\.com)/i.test(resumeText);
  if (!hasEmail || !hasPhone) {
    warnings.push(
      'Make sure your email address and a reachable phone number are clearly visible at the top of your resume.'
    );
  }
  if (!hasProfileLink) {
    suggestions.push(
      'For tech roles, it helps to add links to your GitHub and/or LinkedIn profile in the header section.'
    );
  }

  return {
    atsScore: Math.round(atsScore),
    jdMatchPercentage,
    matchedSkills: Array.from(new Set([...resumeSkills, ...matchedKeywords])),
    missingSkills: Array.from(new Set(missingSkills)),
    weakSections: Array.from(new Set(weakSections)),
    strongSections: Array.from(new Set(strongSections)),
    suggestions,
    warnings,
    scoreBreakdown: {
      sectionsScore: Math.round(sectionsScore),
      lengthScore: Math.round(lengthScore),
      jdMatchScore: Math.round(jdMatchScore),
      formattingScore: Math.round(formattingScore),
      keywordDensityPenalty: Math.round(keywordDensityPenalty),
      techSkillMatchScore: Math.round(techSkillMatchScore),
      criticalSkillPenalty: Math.round(criticalSkillPenalty),
      actionVerbScore: Math.round(actionVerbScore),
    },
  };
}


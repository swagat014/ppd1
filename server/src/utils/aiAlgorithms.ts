/**
 * Local AI Algorithms for Resume Analysis and Student Recommendations
 * No external AI APIs required - uses rule-based algorithms and scoring systems
 */

// Industry-specific keywords for ATS scoring
const INDUSTRY_KEYWORDS = {
  technical: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'opencv',
    'html', 'css', 'sass', 'bootstrap', 'tailwind', 'material-ui',
    'rest api', 'graphql', 'websocket', 'microservices', 'serverless',
    'linux', 'bash', 'powershell', 'nginx', 'apache'
  ],
  softSkills: [
    'leadership', 'communication', 'teamwork', 'problem solving',
    'critical thinking', 'time management', 'adaptability', 'creativity',
    'collaboration', 'project management', 'agile', 'scrum'
  ],
  education: [
    'bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.e', 'm.e',
    'computer science', 'information technology', 'software engineering',
    'data science', 'artificial intelligence'
  ],
  experience: [
    'internship', 'full-time', 'part-time', 'freelance', 'contract',
    'remote', 'on-site', 'hybrid', 'startup', 'enterprise'
  ]
};

// Project recommendations database
const PROJECT_DATABASE = [
  {
    name: 'E-Commerce Platform',
    description: 'Full-stack e-commerce application with user authentication, product catalog, shopping cart, and payment integration',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe API'],
    difficulty: 'intermediate',
    category: 'web',
    skillsGained: ['Full-stack development', 'Payment integration', 'Authentication', 'Database design'],
    whyRelevant: 'Shows full-stack development skills and e-commerce domain knowledge'
  },
  {
    name: 'Task Management System',
    description: 'Collaborative task management tool with real-time updates, drag-and-drop interface, and team collaboration features',
    technologies: ['React', 'TypeScript', 'Firebase', 'Material-UI'],
    difficulty: 'beginner',
    category: 'web',
    skillsGained: ['Real-time databases', 'UI/UX design', 'State management', 'Authentication'],
    whyRelevant: 'Great for learning modern frontend patterns and real-time data'
  },
  {
    name: 'Machine Learning Image Classifier',
    description: 'CNN-based image classification system with data preprocessing, model training, and web interface',
    technologies: ['Python', 'TensorFlow', 'Keras', 'Flask', 'OpenCV'],
    difficulty: 'advanced',
    category: 'ai',
    skillsGained: ['Machine learning', 'Deep learning', 'Computer vision', 'Model deployment'],
    whyRelevant: 'Demonstrates AI/ML skills highly valued in the industry'
  },
  {
    name: 'Social Media Dashboard',
    description: 'Analytics dashboard for social media metrics with data visualization and automated reporting',
    technologies: ['Vue.js', 'D3.js', 'Python', 'FastAPI', 'PostgreSQL'],
    difficulty: 'intermediate',
    category: 'data',
    skillsGained: ['Data visualization', 'API integration', 'Analytics', 'Chart libraries'],
    whyRelevant: 'Shows data handling and visualization capabilities'
  },
  {
    name: 'Chat Application',
    description: 'Real-time messaging app with group chats, file sharing, and end-to-end encryption',
    technologies: ['React Native', 'Socket.io', 'Node.js', 'MongoDB', 'Redis'],
    difficulty: 'intermediate',
    category: 'mobile',
    skillsGained: ['Mobile development', 'Real-time communication', 'Security', 'Caching'],
    whyRelevant: 'Demonstrates real-time communication and mobile development skills'
  },
  {
    name: 'Portfolio Website Generator',
    description: 'Dynamic portfolio generator with customizable templates, markdown support, and deployment automation',
    technologies: ['Next.js', 'Tailwind CSS', 'Vercel API', 'GitHub API'],
    difficulty: 'beginner',
    category: 'web',
    skillsGained: ['Static site generation', 'APIs', 'Deployment', 'CSS frameworks'],
    whyRelevant: 'Perfect for learning modern web development and deployment'
  },
  {
    name: 'Code Review Automation Tool',
    description: 'Automated code review system with static analysis, style checking, and pull request integration',
    technologies: ['Python', 'GitHub Actions', 'Docker', 'AST parsing'],
    difficulty: 'advanced',
    category: 'devops',
    skillsGained: ['DevOps', 'CI/CD', 'Code analysis', 'Automation'],
    whyRelevant: 'Shows advanced programming and DevOps expertise'
  },
  {
    name: 'Personal Finance Tracker',
    description: 'Expense tracking application with budget planning, bill reminders, and financial insights',
    technologies: ['React', 'Chart.js', 'Node.js', 'MySQL', 'Plaid API'],
    difficulty: 'beginner',
    category: 'web',
    skillsGained: ['Financial APIs', 'Data visualization', 'CRUD operations', 'Form handling'],
    whyRelevant: 'Good for learning full-stack with practical use case'
  },
  {
    name: 'Distributed Key-Value Store',
    description: 'Scalable distributed database with replication, sharding, and consensus algorithm',
    technologies: ['Go', 'gRPC', 'Raft consensus', 'LevelDB'],
    difficulty: 'advanced',
    category: 'systems',
    skillsGained: ['Distributed systems', 'Consensus algorithms', 'Networking', 'Performance optimization'],
    whyRelevant: 'Demonstrates system design and distributed computing knowledge'
  },
  {
    name: 'Video Streaming Platform',
    description: 'Video hosting and streaming service with adaptive bitrate streaming and content recommendation',
    technologies: ['React', 'Node.js', 'FFmpeg', 'AWS S3', 'HLS'],
    difficulty: 'advanced',
    category: 'web',
    skillsGained: ['Video processing', 'Streaming protocols', 'Cloud storage', 'Content delivery'],
    whyRelevant: 'Shows multimedia handling and cloud infrastructure skills'
  }
];

// Skill recommendations database
const SKILL_RECOMMENDATIONS = {
  technical: [
    { name: 'React.js', priority: 'high', reason: 'Most in-demand frontend framework', resources: ['React docs', 'Scrimba React course'] },
    { name: 'TypeScript', priority: 'high', reason: 'Industry standard for type safety', resources: ['TypeScript Handbook', 'Total TypeScript'] },
    { name: 'Node.js', priority: 'high', reason: 'Essential for full-stack development', resources: ['Node.js docs', 'NodeSchool'] },
    { name: 'Git & GitHub', priority: 'high', reason: 'Version control is mandatory', resources: ['Git docs', 'GitHub Skills'] },
    { name: 'SQL', priority: 'medium', reason: 'Database knowledge is crucial', resources: ['SQLZoo', 'Mode Analytics'] },
    { name: 'Docker', priority: 'medium', reason: 'Containerization skill in demand', resources: ['Docker docs', 'Docker Mastery course'] },
    { name: 'AWS/GCP/Azure', priority: 'medium', reason: 'Cloud skills are essential', resources: ['AWS Free Tier', 'Google Cloud Skills'] },
    { name: 'System Design', priority: 'medium', reason: 'Important for senior roles', resources: ['System Design Primer', 'Designing Data-Intensive Apps'] },
    { name: 'GraphQL', priority: 'low', reason: 'Modern API alternative to REST', resources: ['GraphQL docs', 'How to GraphQL'] },
    { name: 'Kubernetes', priority: 'low', reason: 'Container orchestration at scale', resources: ['Kubernetes docs', 'KodeKloud'] }
  ],
  soft: [
    { name: 'Communication', priority: 'high', reason: 'Essential for teamwork', resources: ['Toastmasters', 'Technical Writing courses'] },
    { name: 'Problem Solving', priority: 'high', reason: 'Core developer skill', resources: ['LeetCode', 'HackerRank'] },
    { name: 'Agile/Scrum', priority: 'medium', reason: 'Standard project methodology', resources: ['Scrum Guide', 'Agile Manifesto'] },
    { name: 'Time Management', priority: 'medium', reason: 'Improves productivity', resources: ['Pomodoro Technique', 'Getting Things Done'] }
  ]
};

/**
 * Calculate ATS Score based on resume content
 * Algorithm: Keyword matching + Section detection + Format scoring
 */
export function calculateATSScore(resumeText: string): {
  atsScore: number;
  keywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  readabilityScore: number;
} {
  const text = resumeText.toLowerCase();
  const words = text.split(/\s+/);
  
  // Keyword matching
  const foundKeywords: string[] = [];
  const allKeywords = [
    ...INDUSTRY_KEYWORDS.technical,
    ...INDUSTRY_KEYWORDS.softSkills,
    ...INDUSTRY_KEYWORDS.education
  ];
  
  allKeywords.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  });
  
  // Calculate keyword score (40% of total)
  const keywordScore = Math.min(40, (foundKeywords.length / 15) * 40);
  
  // Section detection (30% of total)
  const sections = {
    education: /education|academic|qualification|degree/i.test(text),
    experience: /experience|work|employment|internship/i.test(text),
    skills: /skills|technologies|tools/i.test(text),
    projects: /projects|portfolio/i.test(text),
    contact: /email|phone|linkedin|github/i.test(text)
  };
  const sectionScore = (Object.values(sections).filter(Boolean).length / 5) * 30;
  
  // Format scoring (20% of total)
  const hasBulletPoints = text.includes('•') || text.includes('-');
  const hasNumbers = /\d+/.test(text);
  const reasonableLength = words.length >= 200 && words.length <= 1000;
  const formatScore = (hasBulletPoints ? 7 : 0) + (hasNumbers ? 7 : 0) + (reasonableLength ? 6 : 0);
  
  // Readability (10% of total)
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  const readabilityScore = avgWordLength < 6 ? 10 : avgWordLength < 8 ? 7 : 5;
  
  // Total ATS Score
  const atsScore = Math.round(keywordScore + sectionScore + formatScore + readabilityScore);
  
  // Missing keywords (top important ones not found)
  const missingKeywords = INDUSTRY_KEYWORDS.technical
    .filter(kw => !text.includes(kw.toLowerCase()))
    .slice(0, 10);
  
  // Generate suggestions
  const suggestions: string[] = [];
  if (!sections.education) suggestions.push('Add an Education section with your degree details');
  if (!sections.experience) suggestions.push('Include Work Experience or Internship details');
  if (!sections.projects) suggestions.push('Add a Projects section to showcase your work');
  if (!hasBulletPoints) suggestions.push('Use bullet points for better readability');
  if (!hasNumbers) suggestions.push('Quantify achievements with numbers (e.g., "Improved performance by 50%")');
  if (foundKeywords.length < 10) suggestions.push('Add more relevant technical keywords from job descriptions');
  if (words.length < 200) suggestions.push('Your resume seems short. Add more details about your experience.');
  if (words.length > 1000) suggestions.push('Your resume is quite long. Consider condensing to 1-2 pages.');
  
  return {
    atsScore: Math.min(100, Math.max(0, atsScore)),
    keywords: foundKeywords.slice(0, 15),
    missingKeywords: missingKeywords.slice(0, 8),
    suggestions: suggestions.slice(0, 6),
    readabilityScore
  };
}

/**
 * Calculate Readiness Score based on student data
 * Algorithm: Weighted scoring across multiple dimensions
 */
export function calculateReadinessScore(student: any): {
  overallScore: number;
  technicalScore: number;
  aptitudeScore: number;
  communicationScore: number;
  projectsScore: number;
  skillsScore: number;
  recommendations: string[];
} {
  // Technical Score (0-100) - based on DSA problems solved
  const dsaSolved = student.practice?.dsa?.solvedProblems || 0;
  const technicalScore = Math.min(100, (dsaSolved / 100) * 100);
  
  // Aptitude Score (0-100) - based on test performance
  const aptTests = student.practice?.aptitude?.completedTests || 0;
  const aptAvg = student.practice?.aptitude?.averageScore || 0;
  const aptitudeScore = Math.min(100, (aptTests > 0 ? aptAvg : 0) * 0.7 + Math.min(aptTests * 5, 30));
  
  // Communication Score (0-100) - based on soft skills
  const softSkills = student.skills?.soft || [];
  const communicationScore = Math.min(100, softSkills.length * 15 + 20);
  
  // Projects Score (0-100) - based on project count and complexity
  const projects = student.projects || [];
  const projectsScore = Math.min(100, projects.length * 20 + (projects.length > 2 ? 20 : 0));
  
  // Skills Score (0-100) - based on technical skills diversity
  const techSkills = student.skills?.technical || [];
  const skillsScore = Math.min(100, techSkills.length * 8 + 20);
  
  // Weighted Overall Score
  const overallScore = Math.round(
    technicalScore * 0.30 +
    aptitudeScore * 0.25 +
    communicationScore * 0.20 +
    projectsScore * 0.15 +
    skillsScore * 0.10
  );
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (dsaSolved < 50) {
    recommendations.push('Solve more DSA problems - aim for at least 50+ problems across different categories');
  }
  if (aptTests < 5) {
    recommendations.push('Take more aptitude tests to improve your problem-solving speed');
  }
  if (projects.length < 3) {
    recommendations.push('Build more projects to showcase your practical skills');
  }
  if (techSkills.length < 5) {
    recommendations.push('Learn more technologies - focus on in-demand skills like React, Node.js, or Python');
  }
  if (softSkills.length < 3) {
    recommendations.push('Develop soft skills like communication and teamwork');
  }
  if (overallScore < 50) {
    recommendations.push('Focus on fundamentals: strengthen DSA, build projects, and practice aptitude');
  }
  if (!student.resume?.fileUrl) {
    recommendations.push('Upload your resume for ATS analysis and improvement suggestions');
  }
  
  return {
    overallScore,
    technicalScore: Math.round(technicalScore),
    aptitudeScore: Math.round(aptitudeScore),
    communicationScore: Math.round(communicationScore),
    projectsScore: Math.round(projectsScore),
    skillsScore: Math.round(skillsScore),
    recommendations
  };
}

/**
 * Recommend projects based on student profile
 * Algorithm: Skill gap analysis + Difficulty matching
 */
export function recommendProjects(student: any): any[] {
  const techSkills = (student.skills?.technical || []).map((s: string) => s.toLowerCase());
  const currentProjects = student.projects || [];
  const readinessScore = student.readiness?.overallScore || 0;
  
  // Determine difficulty level based on readiness
  let targetDifficulty: string[];
  if (readinessScore < 40) {
    targetDifficulty = ['beginner'];
  } else if (readinessScore < 70) {
    targetDifficulty = ['beginner', 'intermediate'];
  } else {
    targetDifficulty = ['intermediate', 'advanced'];
  }
  
  // Score each project based on skill match
  const scoredProjects = PROJECT_DATABASE.map(project => {
    const projectTechs = project.technologies.map((t: string) => t.toLowerCase());
    const matchingSkills = projectTechs.filter((tech: string) => 
      techSkills.some((skill: string) => tech.includes(skill) || skill.includes(tech))
    );
    
    // Calculate match score
    const skillMatchScore = matchingSkills.length / projectTechs.length;
    const difficultyMatch = targetDifficulty.includes(project.difficulty) ? 1 : 0.5;
    const notAlreadyBuilt = !currentProjects.some((p: any) => 
      p.name.toLowerCase().includes(project.name.toLowerCase())
    ) ? 1 : 0;
    
    const totalScore = (skillMatchScore * 0.4) + (difficultyMatch * 0.3) + (notAlreadyBuilt * 0.3);
    
    return {
      ...project,
      matchScore: totalScore,
      matchingSkills,
      whyRelevant: `Matches ${matchingSkills.length} of your skills. ${project.whyRelevant}`
    };
  });
  
  // Sort by score and return top 5
  return scoredProjects
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
    .map(({ matchScore, ...project }) => project);
}

/**
 * Recommend skills based on student profile
 * Algorithm: Gap analysis + Priority ranking
 */
export function recommendSkills(student: any): any[] {
  const currentTechSkills = (student.skills?.technical || []).map((s: string) => s.toLowerCase());
  const currentSoftSkills = (student.skills?.soft || []).map((s: string) => s.toLowerCase());
  const readinessScore = student.readiness?.overallScore || 0;
  
  const recommendations: any[] = [];
  
  // Filter and rank technical skills
  SKILL_RECOMMENDATIONS.technical.forEach(skill => {
    if (!currentTechSkills.some((s: string) => s.includes(skill.name.toLowerCase()))) {
      recommendations.push({
        ...skill,
        type: 'technical'
      });
    }
  });
  
  // Filter and rank soft skills
  SKILL_RECOMMENDATIONS.soft.forEach(skill => {
    if (!currentSoftSkills.some((s: string) => s.includes(skill.name.toLowerCase()))) {
      recommendations.push({
        ...skill,
        type: 'soft'
      });
    }
  });
  
  // Sort by priority and readiness
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  
  return recommendations
    .sort((a, b) => {
      // For beginners, prioritize high-priority skills
      if (readinessScore < 50) {
        return priorityOrder[b.priority as keyof typeof priorityOrder] - 
               priorityOrder[a.priority as keyof typeof priorityOrder];
      }
      // For advanced students, mix of priorities
      return 0;
    })
    .slice(0, 7);
}

/**
 * Analyze resume and provide feedback
 * Main entry point for resume analysis
 */
export function analyzeResume(resumeText: string): {
  atsScore: number;
  keywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  readabilityScore: number;
} {
  return calculateATSScore(resumeText);
}

/**
 * Generate personalized learning path
 * Algorithm: Skill gap analysis + Progressive difficulty
 */
export function generateLearningPath(student: any): {
  currentLevel: string;
  targetSkills: string[];
  suggestedProjects: string[];
  timeline: string;
} {
  const score = student.readiness?.overallScore || 0;
  const techSkills = student.skills?.technical || [];
  
  let currentLevel: string;
  let timeline: string;
  
  if (score < 40) {
    currentLevel = 'Beginner';
    timeline = '6-12 months';
  } else if (score < 70) {
    currentLevel = 'Intermediate';
    timeline = '3-6 months';
  } else {
    currentLevel = 'Advanced';
    timeline = '1-3 months';
  }
  
  const recommendedSkillsList = recommendSkills(student);
  const targetSkills = recommendedSkillsList.slice(0, 5).map((s: any) => s.name);
  
  const recommendedProjectsList = recommendProjects(student);
  const suggestedProjects = recommendedProjectsList.slice(0, 3).map((p: any) => p.name);
  
  return {
    currentLevel,
    targetSkills,
    suggestedProjects,
    timeline
  };
}

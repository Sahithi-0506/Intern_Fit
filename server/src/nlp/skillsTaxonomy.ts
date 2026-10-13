export interface SkillDefinition {
  canonicalName: string;
  category: 'programming' | 'frontend' | 'backend' | 'database' | 'cloud_devops' | 'ai_ml' | 'data' | 'core_cs' | 'tools';
  aliases: string[];
}

export const SKILLS_TAXONOMY: SkillDefinition[] = [
  // Programming Languages
  { canonicalName: 'Java', category: 'programming', aliases: ['java', 'core java', 'j2se'] },
  { canonicalName: 'Python', category: 'programming', aliases: ['python', 'python3', 'py'] },
  { canonicalName: 'JavaScript', category: 'programming', aliases: ['javascript', 'js', 'es6', 'ecmascript'] },
  { canonicalName: 'TypeScript', category: 'programming', aliases: ['typescript', 'ts'] },
  { canonicalName: 'C++', category: 'programming', aliases: ['c++', 'cpp'] },
  { canonicalName: 'C', category: 'programming', aliases: ['c language', 'ansi c'] },
  { canonicalName: 'C#', category: 'programming', aliases: ['c#', 'csharp', 'c sharp'] },
  { canonicalName: 'Go', category: 'programming', aliases: ['golang', 'go language'] },
  { canonicalName: 'Rust', category: 'programming', aliases: ['rust', 'rustlang'] },
  { canonicalName: 'PHP', category: 'programming', aliases: ['php', 'php7', 'php8'] },
  { canonicalName: 'Ruby', category: 'programming', aliases: ['ruby', 'ruby on rails'] },
  { canonicalName: 'Kotlin', category: 'programming', aliases: ['kotlin'] },
  { canonicalName: 'Swift', category: 'programming', aliases: ['swift', 'swiftui'] },

  // Frontend
  { canonicalName: 'React', category: 'frontend', aliases: ['react', 'react.js', 'reactjs'] },
  { canonicalName: 'Next.js', category: 'frontend', aliases: ['next.js', 'nextjs', 'next'] },
  { canonicalName: 'Vue.js', category: 'frontend', aliases: ['vue', 'vue.js', 'vuejs'] },
  { canonicalName: 'Angular', category: 'frontend', aliases: ['angular', 'angularjs', 'angular 2+'] },
  { canonicalName: 'HTML', category: 'frontend', aliases: ['html', 'html5'] },
  { canonicalName: 'CSS', category: 'frontend', aliases: ['css', 'css3'] },
  { canonicalName: 'Tailwind CSS', category: 'frontend', aliases: ['tailwind', 'tailwind css', 'tailwindcss'] },
  { canonicalName: 'Bootstrap', category: 'frontend', aliases: ['bootstrap', 'bootstrap 5'] },
  { canonicalName: 'Redux', category: 'frontend', aliases: ['redux', 'redux toolkit', 'rtk'] },

  // Backend
  { canonicalName: 'Node.js', category: 'backend', aliases: ['node', 'node.js', 'nodejs'] },
  { canonicalName: 'Express', category: 'backend', aliases: ['express', 'express.js', 'expressjs'] },
  { canonicalName: 'Spring Boot', category: 'backend', aliases: ['spring boot', 'springboot', 'spring framework'] },
  { canonicalName: 'Django', category: 'backend', aliases: ['django', 'django rest framework', 'drf'] },
  { canonicalName: 'Flask', category: 'backend', aliases: ['flask'] },
  { canonicalName: 'FastAPI', category: 'backend', aliases: ['fastapi', 'fast api'] },
  { canonicalName: 'ASP.NET', category: 'backend', aliases: ['asp.net', '.net core', 'dotnet'] },
  { canonicalName: 'REST API', category: 'backend', aliases: ['rest', 'restful', 'rest api', 'rest apis', 'web api'] },
  { canonicalName: 'GraphQL', category: 'backend', aliases: ['graphql', 'apollo graphql'] },

  // Database
  { canonicalName: 'SQL', category: 'database', aliases: ['sql', 'relational database', 'rdbms'] },
  { canonicalName: 'MySQL', category: 'database', aliases: ['mysql', 'mysql 8'] },
  { canonicalName: 'PostgreSQL', category: 'database', aliases: ['postgres', 'postgresql'] },
  { canonicalName: 'MongoDB', category: 'database', aliases: ['mongodb', 'mongo'] },
  { canonicalName: 'Redis', category: 'database', aliases: ['redis'] },
  { canonicalName: 'SQLite', category: 'database', aliases: ['sqlite'] },
  { canonicalName: 'Oracle SQL', category: 'database', aliases: ['oracle', 'oracle sql', 'pl/sql'] },

  // Cloud & DevOps
  { canonicalName: 'Docker', category: 'cloud_devops', aliases: ['docker', 'containerization'] },
  { canonicalName: 'Kubernetes', category: 'cloud_devops', aliases: ['kubernetes', 'k8s'] },
  { canonicalName: 'AWS', category: 'cloud_devops', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
  { canonicalName: 'Azure', category: 'cloud_devops', aliases: ['azure', 'microsoft azure'] },
  { canonicalName: 'Google Cloud (GCP)', category: 'cloud_devops', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
  { canonicalName: 'CI/CD', category: 'cloud_devops', aliases: ['ci/cd', 'github actions', 'jenkins', 'gitlab ci'] },
  { canonicalName: 'Linux', category: 'cloud_devops', aliases: ['linux', 'ubuntu', 'bash', 'shell scripting'] },

  // AI / ML / Data Science
  { canonicalName: 'Machine Learning', category: 'ai_ml', aliases: ['machine learning', 'ml', 'scikit-learn', 'sklearn'] },
  { canonicalName: 'Deep Learning', category: 'ai_ml', aliases: ['deep learning', 'neural networks', 'ann', 'cnn', 'rnn'] },
  { canonicalName: 'PyTorch', category: 'ai_ml', aliases: ['pytorch', 'torch'] },
  { canonicalName: 'TensorFlow', category: 'ai_ml', aliases: ['tensorflow', 'tf', 'keras'] },
  { canonicalName: 'Natural Language Processing', category: 'ai_ml', aliases: ['nlp', 'natural language processing', 'transformers', 'bert', 'llm'] },
  { canonicalName: 'Data Analysis', category: 'data', aliases: ['data analysis', 'pandas', 'numpy', 'data visualization', 'matplotlib'] },
  { canonicalName: 'Data Science', category: 'data', aliases: ['data science'] },

  // Core CS Concepts
  { canonicalName: 'Data Structures', category: 'core_cs', aliases: ['data structures', 'dsa', 'linked list', 'trees', 'graphs'] },
  { canonicalName: 'Algorithms', category: 'core_cs', aliases: ['algorithms', 'algorithmic problem solving', 'dynamic programming'] },
  { canonicalName: 'Operating Systems', category: 'core_cs', aliases: ['operating systems', 'os concepts', 'concurrency', 'multithreading'] },
  { canonicalName: 'Computer Networks', category: 'core_cs', aliases: ['computer networks', 'networking', 'tcp/ip', 'http'] },
  { canonicalName: 'Database Management Systems', category: 'core_cs', aliases: ['dbms', 'database management'] },
  { canonicalName: 'Object Oriented Programming', category: 'core_cs', aliases: ['oops', 'oop', 'object oriented', 'object oriented programming'] },
  { canonicalName: 'System Design', category: 'core_cs', aliases: ['system design', 'high level design', 'low level design', 'scalability'] },

  // Tools & Testing
  { canonicalName: 'Git', category: 'tools', aliases: ['git', 'github', 'version control', 'gitlab'] },
  { canonicalName: 'Unit Testing', category: 'tools', aliases: ['unit testing', 'jest', 'mocha', 'junit', 'pytest', 'testing'] },
  { canonicalName: 'Postman', category: 'tools', aliases: ['postman', 'api testing'] },
];

/**
 * Normalizes any skill string to its canonical name if present in taxonomy.
 */
export function normalizeSkill(rawSkill: string): string {
  const trimmed = rawSkill.trim().toLowerCase();
  for (const def of SKILLS_TAXONOMY) {
    if (def.canonicalName.toLowerCase() === trimmed) {
      return def.canonicalName;
    }
    for (const alias of def.aliases) {
      if (alias.toLowerCase() === trimmed) {
        return def.canonicalName;
      }
    }
  }
  return rawSkill.trim();
}

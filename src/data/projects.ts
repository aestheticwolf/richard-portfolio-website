
export type Project = {
  slug: string
  number: string
  name: string
  category: string
  description: string
  stack: string[]
  color: string
  github: string
  liveUrl: string
  demoVideo: string
  features: string[]
}

export const projects: Project[] = [
  {
    slug: 'crm-system-integration',
    number: '01',
    name: 'CRM System Integration',
    category: 'WEB APPLICATION · AI',
    description:
      'A customer management platform with order tracking, communication history, and AI-powered customer summaries.',
    stack: ['React', 'Express', 'TypeScript', 'Prisma', 'SQLite', 'Gemini'],
    color: 'from-violet-500/20 to-blue-500/5',
    github: 'https://github.com/aestheticwolf/crm-system-integration',
    liveUrl: '',
    demoVideo: '',
    features: [
      'Customer management',
      'Order tracking',
      'Communication history',
      'AI-powered customer summaries',
      'Mock WooCommerce synchronization',
    ],
  },
  {
    slug: 'skillpath',
    number: '02',
    name: 'SkillPath',
    category: 'MOBILE APPLICATION',
    description:
      'A learning companion designed to help students and interns organize learning goals, tasks, and progress.',
    stack: ['React Native', 'Expo', 'TypeScript', 'Firebase'],
    color: 'from-blue-500/20 to-cyan-500/5',
    github: 'https://github.com/aestheticwolf',
    liveUrl: '',
    demoVideo: '',
    features: [
      'Learning goals and task tracking',
      'Learning progress management',
      'Learning organization',
      'Firebase integration',
    ],
  },
  {
    slug: 'sentinel-grid',
    number: '03',
    name: 'Sentinel Grid',
    category: 'WEB APPLICATION · SECURITY',
    description:
      'A security guard tracking system designed to support tracking workflows and authenticated access.',
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    color: 'from-indigo-500/20 to-violet-500/5',
    github: 'https://github.com/aestheticwolf',
    liveUrl: '',
    demoVideo: '',
    features: [
      'Security guard tracking',
      'Authenticated access',
      'Backend API integration',
      'MongoDB data management',
    ],
  },
  {
    slug: 'art-by-heaven',
    number: '04',
    name: 'Art by Heaven',
    category: 'MOBILE · E-COMMERCE',
    description:
      'An e-commerce mobile application built with Flutter and Firebase, with a payment workflow.',
    stack: ['Flutter', 'Firebase', 'Cloud Firestore', 'Razorpay'],
    color: 'from-fuchsia-500/15 to-purple-500/5',
    github: 'https://github.com/aestheticwolf',
    liveUrl: '',
    demoVideo: '',
    features: [
      'Product browsing',
      'Shopping cart',
      'Cloud Firestore integration',
      'Razorpay payment integration',
    ],
  },
]

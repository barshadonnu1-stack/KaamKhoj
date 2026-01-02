
import React from 'react';
import { 
  Palette, Code, PenTool, Megaphone, Video, Briefcase, GraduationCap, 
  Sparkles, Smartphone, ShieldCheck, TrendingUp, Music, Camera, 
  MapPin, Clock, Star, DollarSign, Users, Scale, FileText, Globe, Building2,
  BookOpen, MessageCircle
} from 'lucide-react';
import { UserRole, VerificationStatus, User, Gig, Achievement, JobPost, Order, Course, ForumPost } from './types';

export const CATEGORIES = [
  { id: 'design', name: 'Graphic Design', icon: <Palette className="w-5 h-5" />, color: 'bg-pink-100 text-pink-600' },
  { id: 'dev', name: 'Programming', icon: <Code className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
  { id: 'writing', name: 'Writing/Translation', icon: <PenTool className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600' },
  { id: 'marketing', name: 'Digital Marketing', icon: <Megaphone className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
  { id: 'video', name: 'Video & Animation', icon: <Video className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
  { id: 'business', name: 'Business', icon: <Briefcase className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' },
  { id: 'ai', name: 'AI Services', icon: <Sparkles className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'mobile', name: 'Mobile Apps', icon: <Smartphone className="w-5 h-5" />, color: 'bg-red-100 text-red-600' },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'NPR 1 Lakh Club', icon: '💰', description: 'Total earnings exceeded 100,000 NPR.', rarity: 'ELITE' },
  { id: 'a2', title: 'Speed Demon', icon: '⚡', description: 'Avg. response time under 30 mins.', rarity: 'RARE' },
  { id: 'a3', title: 'Top 1% Expert', icon: '🛡️', description: 'Ranked in top 1% by client reviews.', rarity: 'ELITE' },
  { id: 'a4', title: 'Identity Pioneer', icon: '🆔', description: 'One of the first 100 verified users.', rarity: 'RARE' }
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sanjeev Sharma',
    email: 'sanjeev@kaamkhoj.np',
    phone: '9841234567',
    role: UserRole.FREELANCER,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    skills: ['UI/UX Design', 'React', 'Figma', 'Nepali Copywriting', 'Next.js'],
    verificationStatus: VerificationStatus.VERIFIED,
    badges: [
      { type: 'TOP_RATED', label: 'Top Rated' }, 
      { type: 'VERIFIED', label: 'Verified ID' }, 
      { type: 'LEVEL_2', label: 'Level 2 Seller' },
      { type: 'TAX_COMPLIANT', label: 'PAN Registered' }
    ],
    achievements: MOCK_ACHIEVEMENTS,
    rating: 4.9,
    reviewCount: 245,
    completionRate: 100,
    isVacationMode: false,
    isAgency: false,
    referralCode: 'KK_PRO_SANJEEV',
    panVatNumber: '601234567',
    location: 'Lalitpur, Nepal',
    bio: 'Premium Digital Product Designer. Specialized in high-performance UIs for the Himalayan tech ecosystem.',
    portfolio: [
      { id: 'p1', title: 'E-Sewa Redesign Concept', imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60', category: 'design', tags: ['Fintech', 'Mobile'], isFeatured: true },
      { id: 'p2', title: 'Kathmandu Post UI', imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60', category: 'design', tags: ['Media', 'Web'], isFeatured: true }
    ],
    availability: 'AVAILABLE',
    memberSince: 'Sep 2022',
    responseTimeMins: 38,
    totalEarnedNPR: 825000,
    profileStrength: 98,
    lastActive: 'Just now'
  },
  {
    id: 'u2',
    name: 'Anjali Gurung',
    email: 'anjali@dev.np',
    phone: '9812345678',
    role: UserRole.FREELANCER,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    skills: ['Python', 'Django', 'Data Science'],
    verificationStatus: VerificationStatus.VERIFIED,
    badges: [{ type: 'LEVEL_1', label: 'Rising Star' }],
    achievements: [],
    rating: 4.7,
    reviewCount: 42,
    completionRate: 95,
    isVacationMode: false,
    isAgency: false,
    referralCode: 'KK_ANJALI',
    location: 'Pokhara, Nepal',
    bio: 'Backend developer obsessed with clean code and scalable architectures.',
    portfolio: [],
    availability: 'AVAILABLE',
    memberSince: 'Jan 2024',
    responseTimeMins: 15,
    totalEarnedNPR: 150000,
    profileStrength: 80,
    lastActive: '5m ago'
  },
  {
    id: 'c1',
    name: 'Arun Bhattarai',
    email: 'arun@techpeak.com',
    phone: '9801122334',
    role: UserRole.CLIENT,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    skills: [],
    verificationStatus: VerificationStatus.VERIFIED,
    badges: [{ type: 'VERIFIED', label: 'Verified Business' }],
    achievements: [],
    rating: 5.0,
    reviewCount: 12,
    completionRate: 100,
    isVacationMode: false,
    isAgency: false,
    referralCode: 'TP_CLIENT_ARUN',
    location: 'Kathmandu, Nepal',
    bio: 'Founder of TechPeak Solutions. Looking for top-tier design talent.',
    portfolio: [],
    availability: 'AVAILABLE',
    memberSince: 'Jan 2023',
    responseTimeMins: 120,
    totalEarnedNPR: 0,
    profileStrength: 85,
    lastActive: '2h ago'
  }
];

export const MOCK_GIGS: Gig[] = [
  {
    id: 'g1',
    freelancerId: 'u1',
    title: 'I will create a world-class UI/UX for your Nepali Tech Venture',
    description: 'Expert design services focusing on user retention and local market psychology. Full high-fidelity prototypes included.',
    category: 'design',
    thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=800&auto=format&fit=crop&q=60',
    rating: 4.9,
    reviewCount: 124,
    packages: {
      basic: { id: 'b1', name: 'Spark', description: 'Single Page UI', price: 8000, deliveryDays: 2, revisions: 2, features: ['Source File', 'Prototype'] },
      standard: { id: 's1', name: 'Grow', description: 'Full Web UI (6 Pages)', price: 25000, deliveryDays: 7, revisions: 5, features: ['Source File', 'Prototype', 'Responsive Design', 'Style Guide'] },
      premium: { id: 'p1', name: 'Ascend', description: 'Full Mobile + Web UI', price: 65000, deliveryDays: 18, revisions: 99, features: ['Source File', 'Prototype', 'Responsive Design', 'Style Guide', 'Icon Set', 'Documentation'] }
    },
    faq: [{ q: 'Do you provide Nepali font support?', a: 'Yes, I work with Unicode and custom Nepali typography.' }],
    deliveryHistory: ['d1', 'd2', 'd3', 'd4'],
    viewsCount: 4500,
    clicksCount: 820
  },
  {
    id: 'g2',
    freelancerId: 'u2',
    title: 'I will build a secure Python Django backend for your E-commerce',
    description: 'Scalable backend development using Django REST Framework. Perfect for local e-commerce sites needing eSewa integration.',
    category: 'dev',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    reviewCount: 35,
    packages: {
      basic: { id: 'b2', name: 'API Setup', description: 'Basic CRUD API', price: 15000, deliveryDays: 4, revisions: 2, features: ['Database Design', '5 Endpoints'] },
      standard: { id: 's2', name: 'E-commerce Core', description: 'Full Cart & Auth', price: 40000, deliveryDays: 10, revisions: 4, features: ['Auth', 'Cart', 'Product Management', 'Admin Panel'] },
      premium: { id: 'p2', name: 'Full Scale', description: 'Complete Backend + Payment', price: 90000, deliveryDays: 25, revisions: 10, features: ['Payment Integration', 'Deployment', 'Redis Caching', 'Security Audit'] }
    },
    faq: [],
    deliveryHistory: [],
    viewsCount: 1200,
    clicksCount: 150
  },
  {
    id: 'g3',
    freelancerId: 'u1',
    title: 'I will design a modern Logo for your Startup',
    description: 'Minimalist and memorable logos that stand out in the Nepali market.',
    category: 'design',
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799312c95d?q=80&w=800&auto=format&fit=crop',
    rating: 5.0,
    reviewCount: 12,
    packages: {
      basic: { id: 'b3', name: 'Starter', description: '2 Concepts', price: 5000, deliveryDays: 2, revisions: 1, features: ['Transparent PNG'] },
      standard: { id: 's3', name: 'Pro', description: '4 Concepts + Vector', price: 12000, deliveryDays: 4, revisions: 3, features: ['Source Files', 'Social Media Kit'] },
      premium: { id: 'p3', name: 'Brand Identity', description: 'Full Branding', price: 30000, deliveryDays: 10, revisions: 99, features: ['Stationery', 'Guidelines', '3D Mockups'] }
    },
    faq: [],
    deliveryHistory: [],
    viewsCount: 800,
    clicksCount: 90
  },
  {
    id: 'g4',
    freelancerId: 'u2',
    title: 'I will write SEO optimized content in Nepali and English',
    description: 'High ranking content for blogs, websites, and social media.',
    category: 'writing',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop',
    rating: 4.6,
    reviewCount: 88,
    packages: {
      basic: { id: 'b4', name: 'Blog Post', description: '500 words', price: 2000, deliveryDays: 1, revisions: 1, features: ['SEO Keywords'] },
      standard: { id: 's4', name: 'Website Copy', description: '3 Pages', price: 8000, deliveryDays: 3, revisions: 2, features: ['Competitor Research', 'Meta Tags'] },
      premium: { id: 'p4', name: 'Monthly Pack', description: '10 Articles', price: 25000, deliveryDays: 30, revisions: 5, features: ['Content Strategy', 'Social Shares'] }
    },
    faq: [],
    deliveryHistory: [],
    viewsCount: 2000,
    clicksCount: 300
  },
  {
    id: 'g5',
    freelancerId: 'u1',
    title: 'I will develop a Flutter Mobile App (Android & iOS)',
    description: 'Cross-platform mobile applications with smooth performance.',
    category: 'mobile',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviewCount: 56,
    packages: {
      basic: { id: 'b5', name: 'UI Only', description: '5 Screens', price: 20000, deliveryDays: 5, revisions: 2, features: ['Source Code'] },
      standard: { id: 's5', name: 'Functional App', description: 'API Integration', price: 60000, deliveryDays: 15, revisions: 5, features: ['Firebase', 'State Management'] },
      premium: { id: 'p5', name: 'Full Product', description: 'Store Submission', price: 150000, deliveryDays: 40, revisions: 10, features: ['Admin Panel', 'Push Notifications', 'Support'] }
    },
    faq: [],
    deliveryHistory: [],
    viewsCount: 5000,
    clicksCount: 450
  }
];

export const MOCK_JOBS: JobPost[] = [
  {
    id: 'j1',
    clientId: 'c1',
    clientName: 'TechPeak Solutions',
    clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop',
    title: 'Senior React Developer for Fintech App',
    description: 'We need an expert to build a high-security wallet interface. Must have experience with Nepali banking APIs (Fonepay/NCHL).',
    budget: { min: 50000, max: 120000 },
    type: 'Full-Time',
    category: 'dev',
    skills: ['React', 'TypeScript', 'Node.js', 'Redux'],
    postedAt: '1h ago',
    proposalsCount: 12,
    status: 'OPEN',
    location: 'Kathmandu (Hybrid)'
  },
  {
    id: 'j2',
    clientId: 'c2',
    clientName: 'Himalayan Java',
    clientAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656ec?q=80&w=100&auto=format&fit=crop',
    title: 'Social Media Manager for Coffee Chain',
    description: 'Looking for a creative soul to handle our Instagram and TikTok. Must know how to create viral reels featuring our outlets.',
    budget: { min: 25000, max: 40000 },
    type: 'Retainer',
    category: 'marketing',
    skills: ['Instagram', 'TikTok', 'Video Editing', 'Copywriting'],
    postedAt: '3h ago',
    proposalsCount: 45,
    status: 'OPEN',
    location: 'Thamel, Kathmandu'
  },
  {
    id: 'j3',
    clientId: 'c3',
    clientName: 'Yeti Airlines',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    title: 'UI Redesign for Booking Portal',
    description: 'We are revamping our flight booking engine. Need a modern, clean, and fast UI designer who understands travel UX.',
    budget: { min: 80000, max: 150000 },
    type: 'Project',
    category: 'design',
    skills: ['Figma', 'UX Research', 'Prototyping'],
    postedAt: '5h ago',
    proposalsCount: 8,
    status: 'OPEN',
    location: 'Remote'
  },
  {
    id: 'j4',
    clientId: 'c4',
    clientName: 'Daraz Seller',
    clientAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop',
    title: 'Product Photographer & Editor',
    description: 'Need high-quality shots for 50+ clothing items. White background + lifestyle shots required.',
    budget: { min: 15000, max: 25000 },
    type: 'One-time',
    category: 'video',
    skills: ['Photography', 'Photoshop', 'Lightroom'],
    postedAt: '1d ago',
    proposalsCount: 22,
    status: 'OPEN',
    location: 'Pokhara'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    gigId: 'g1',
    gigTitle: 'I will create a world-class UI/UX for your Nepali Tech Venture',
    gigThumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=800&auto=format&fit=crop&q=60',
    clientId: 'c1',
    clientName: 'TechPeak',
    amount: 25000,
    status: 'ACTIVE',
    dueDate: '2024-05-25',
    progress: 65
  },
  {
    id: 'o2',
    gigId: 'g2',
    gigTitle: 'I will build a secure Python Django backend',
    gigThumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    clientId: 'c2',
    clientName: 'Himalayan Java',
    amount: 40000,
    status: 'DELIVERED',
    dueDate: '2024-05-20',
    progress: 100
  },
  {
    id: 'o3',
    gigId: 'g3',
    gigTitle: 'I will design a modern Logo',
    gigThumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799312c95d?q=80&w=800&auto=format&fit=crop',
    clientId: 'c3',
    clientName: 'Yeti Airlines',
    amount: 30000,
    status: 'COMPLETED',
    dueDate: '2024-05-10',
    progress: 100
  }
];

export const MOCK_COURSES: Course[] = [
  { 
    id: 'c1', 
    title: 'Freelancing 101: Succeeding in Nepal', 
    instructor: 'Sanjeev S.', 
    students: 1200, 
    rating: 4.8, 
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400', 
    price: 0,
    description: 'A complete guide to navigating the freelance market in Nepal, handling taxes (PAN), and receiving payments.',
    lessons: [
      { title: 'Welcome to the Gig Economy', duration: '10:00' },
      { title: 'Setting up your PAN', duration: '15:30' },
      { title: 'Receiving International Payments', duration: '20:00' }
    ]
  },
  { 
    id: 'c2', 
    title: 'Advanced React Patterns', 
    instructor: 'TechPeak Academy', 
    students: 850, 
    rating: 4.9, 
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', 
    price: 2500,
    description: 'Master higher-order components, hooks, and performance optimization.',
    lessons: [
      { title: 'Hooks Deep Dive', duration: '45:00' },
      { title: 'Custom Hooks', duration: '30:00' },
      { title: 'Performance Tuning', duration: '50:00' }
    ]
  },
  { 
    id: 'c3', 
    title: 'Digital Marketing Mastery', 
    instructor: 'Priya K.', 
    students: 2300, 
    rating: 4.7, 
    image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=400', 
    price: 1500,
    description: 'Learn SEO, SEM, and Social Media strategies tailored for South Asia.',
    lessons: [
      { title: 'SEO Basics', duration: '20:00' },
      { title: 'Facebook Ads', duration: '40:00' }
    ]
  }
];

export const MOCK_FORUM: ForumPost[] = [
  { 
    id: 'f1', 
    user: 'Ramesh G.', 
    avatar: 'https://i.pravatar.cc/150?u=ramesh', 
    title: 'Best payment gateway for international clients?', 
    content: "I've been using Wise but some clients prefer PayPal. Since PayPal isn't fully supported in Nepal for receiving, what are you guys using?",
    replies: 45, 
    views: 1200, 
    tag: 'Finance',
    timestamp: '2h ago',
    comments: [
      { user: 'Sita M.', text: 'Try Payoneer, it works well with local banks.', time: '1h ago' },
      { user: 'Hari K.', text: 'Crypto is risky, stick to SWIFT if possible.', time: '30m ago' }
    ]
  },
  { 
    id: 'f2', 
    user: 'Sita M.', 
    avatar: 'https://i.pravatar.cc/150?u=sita', 
    title: 'How to handle scope creep politely?', 
    content: "My current client keeps asking for 'small tweaks' that are actually big features. How do I say no without losing the contract?",
    replies: 23, 
    views: 890, 
    tag: 'Client Relations',
    timestamp: '5h ago',
    comments: []
  },
  { 
    id: 'f3', 
    user: 'John D.', 
    avatar: 'https://i.pravatar.cc/150?u=john', 
    title: 'Looking for a co-founder for a SaaS', 
    content: "Building a tourism app for Pokhara. Need a technical co-founder with Flutter experience.",
    replies: 12, 
    views: 560, 
    tag: 'Networking',
    timestamp: '1d ago',
    comments: []
  }
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'New Job Match', message: 'A new React job matches your profile.', time: '2m ago', read: false },
  { id: 'n2', title: 'Payment Received', message: 'Escrow released for Project X.', time: '1h ago', read: false },
  { id: 'n3', title: 'Review', message: 'TechPeak left a 5-star review!', time: '1d ago', read: true }
];

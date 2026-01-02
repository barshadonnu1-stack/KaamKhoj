
export enum UserRole {
  CLIENT = 'CLIENT',
  FREELANCER = 'FREELANCER',
  ADMIN = 'ADMIN',
  AGENCY = 'AGENCY'
}

export enum ProjectStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'ELITE';
  dateEarned?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  clientName?: string;
  year?: string;
  tags: string[];
  isFeatured: boolean;
}

export interface Badge {
  type: 'VERIFIED' | 'TOP_RATED' | 'ON_TIME' | 'EXPERT' | 'FAST_RESPONDER' | 'LEVEL_1' | 'LEVEL_2' | 'RISING_STAR' | 'TAX_COMPLIANT' | 'AGENCY_CERTIFIED';
  label: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  skills: string[];
  verificationStatus: VerificationStatus;
  badges: Badge[];
  achievements: Achievement[];
  rating: number;
  reviewCount: number;
  completionRate: number;
  isVacationMode: boolean;
  isAgency: boolean;
  agencyName?: string;
  teamMembers?: string[];
  referralCode: string;
  panVatNumber?: string;
  location: string;
  bio: string;
  portfolio: PortfolioItem[];
  availability: 'AVAILABLE' | 'BUSY' | 'AWAY';
  memberSince: string;
  responseTimeMins: number;
  totalEarnedNPR: number;
  profileStrength: number;
  lastActive: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  features: string[];
  addOns?: { title: string; price: number }[];
}

export interface Gig {
  id: string;
  freelancerId: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  videoIntroUrl?: string;
  packages: {
    basic: Package;
    standard: Package;
    premium: Package;
  };
  rating: number;
  reviewCount: number;
  faq: { q: string; a: string }[];
  deliveryHistory: string[];
  isFlashGig?: boolean;
  flashExpiresAt?: string;
  viewsCount: number;
  clicksCount: number;
}

export interface JobPost {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  title: string;
  description: string;
  budget: { min: number; max: number };
  category: string;
  skills: string[];
  postedAt: string;
  proposalsCount: number;
  status: 'OPEN' | 'CLOSED';
  location: string;
  type: string;
}

export interface Order {
  id: string;
  gigId: string;
  gigTitle: string;
  gigThumbnail: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: 'ACTIVE' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  dueDate: string;
  progress: number;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  students: number;
  rating: number;
  image: string;
  price: number;
  description: string;
  lessons: { title: string; duration: string }[];
}

export interface ForumPost {
  id: string;
  user: string;
  avatar: string;
  title: string;
  content: string;
  replies: number;
  views: number;
  tag: string;
  timestamp: string;
  comments: { user: string; text: string; time: string }[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

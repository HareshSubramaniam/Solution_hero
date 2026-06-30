export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details?: string;
  createdAt: string;
}
export interface AuthResponse {
  user: User;
  token: string;
}
export interface CategorizeInput {
  description: string;
}
export interface CategorizeResult {
  category?: string;
  confidence?: number;
  severity?: string;
  tags?: string[];
  descriptionSuggestion?: string;
  error?: string | null;
  priority?: string;
  department?: string;
  estimatedUrgency?: string;
  reasoning?: string;
}
export interface ChatInput {
  message: string;
  history?: {role: string, content: string}[];
  userId?: number;
}
export interface ChatResult {
  response: string;
}
export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
export interface CommentInput {
  content: string;
}
export interface DashboardStats {
  totalIssues: number;
  resolvedIssues: number;
  activeReporters: number;
  resolutionRate: number;
  avgResolutionDays: number;
}
export interface DuplicateCheckInput {
  title: string;
  description: string;
}
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateId?: string;
  matchedIssueId?: string;
  confidence?: number;
  reasoning?: string;
}
export interface ErrorResponse {
  message: string;
}
export interface GeocodeResult {
  address: string;
}
export interface HealthStatus {
  status: string;
}
export interface InsightsResult {
  insights: string[];
}
export const IssueStatus = {
  Pending: 'pending',
  InProgress: 'in_progress',
  Resolved: 'resolved',
  Rejected: 'rejected'
} as const;
export type IssueStatus = typeof IssueStatus[keyof typeof IssueStatus];

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  category: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reporterId: string;
  imageUrl?: string;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
}
export interface IssueDetail extends Issue {
  reporterName: string;
  comments: Comment[];
}
export interface IssueInput {
  title: string;
  description: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  imageUrl?: string;
  severity?: string;
}

export const IssueInputCategory = {
  Pothole: 'pothole',
  Graffiti: 'graffiti',
  Litter: 'litter',
  Streetlight: 'streetlight',
  Other: 'other'
} as const;
export type IssueInputCategory = typeof IssueInputCategory[keyof typeof IssueInputCategory];

export const IssueInputSeverity = {
  Low: 'low',
  Medium: 'medium',
  High: 'high'
} as const;
export type IssueInputSeverity = typeof IssueInputSeverity[keyof typeof IssueInputSeverity];

export interface IssueUpdate {
  status?: 'pending' | 'in_progress' | 'resolved' | 'rejected';
}
export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
}
export interface ListIssuesParams {
  status?: string;
  category?: string;
}
export interface LoginInput {
  email: string;
  password?: string;
}
export interface MessageResponse {
  message: string;
}
export interface ReverseGeocodeParams {
  lat: number;
  lng: number;
}
export interface SignupInput {
  email: string;
  name: string;
  password?: string;
}
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}
export interface UserProfile extends User {
  points: number;
  issuesReported: number;
  issuesResolved: number;
}
export interface VerifyResponse {
  success: boolean;
}

import React from 'react';
 
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CubLevel {
  ACCEPTANCE = 'مرحلة القبول',
  BEGINNER = 'شبل مبتدئ',
  SECOND = 'شبل ثاني',
  FIRST = 'شبل أول'
}

export interface Sextet {
  id: string;
  name: string;
  color: string;
  points: number;
  totalPoints?: number;
  motto?: string;
  specialization?: string; // e.g. 'رياضية', 'تقنية', etc.
  leaderId?: string; // ID of the cub who is the "Head" of the sextet
}

export interface EvaluationCriteria {
  religion: number;
  discovery: number;
  talents: number;
  health: number;
  family: number;
  nation: number;
  world: number;
  scouting: number;
  artistic: number;
}

export interface ConductCriteria {
  uniform: number;      // الالتزام بالزي
  punctuality: number;  // الالتزام بالمواعيد
  tasks: number;        // إنجاز المهام
  prayer: number;       // مواعيد الصلاة
  behavior: number;    // السلوك الكشفي
}

export interface Requirement {
  id: string;
  text: string;
  completed: boolean;
  category: 'mobtadi' | 'thani' | 'awal';
  isHome?: boolean;
  parentConfirmed?: boolean;
}

export interface EvaluationHistoryItem extends EvaluationCriteria {
  date: string;
  conduct?: ConductCriteria;
}

export interface Meeting {
  id: string;
  date: string;
  title: string;
  attendees: string[]; // List of cub IDs
  notes?: string;
  attendance?: Record<string, boolean>;
}

export enum UserRole {
  LEADER = 'leader',
  PARENT = 'parent',
  CUB = 'cub'
}

export interface Scenario {
  id: string;
  title: string;
  question: string;
  options: { text: string; isCorrect: boolean }[];
  feedback: string;
}

export interface WeeklyMeetingEvaluation {
  cooperation: boolean;
  conduct: boolean;
  scoutSpirit: boolean;
  date: string;
}

export interface MonthlyReport {
  month: string;
  attendanceContinuity: number; // e.g. 5-8 meetings
  technicalScoutingAspect: number; // evaluation by leader
  externalActivities: number; // camps/etc
  encouragementWord: string;
  isStarOfMonth: boolean;
  totalPoints: number;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
}

export interface Cub {
  id: string;
  name: string;
  age: number;
  email?: string;
  phone?: string;
  pin?: string;
  avatar?: string;
  temporaryPin?: string; // كلمة المرور الخاصة بالشبل لرؤيتها في دليل الأشبال لسهولة المساعدة
  level: CubLevel;
  sextetId?: string;
  evaluation: EvaluationCriteria;
  conduct: ConductCriteria;
  requirements: Requirement[];
  history: EvaluationHistoryItem[];
  weeklyEvaluations?: WeeklyMeetingEvaluation[];
  monthlyReports?: MonthlyReport[];
  notifications?: NotificationItem[]; // New notifications system
  lastChecked: string;
  points: number;
  gamesTotalPoints: number;
  unlockedStories: string[]; // IDs of unlocked treasure chest items
  currentStep: number;
  lastMapMessage?: string;
  pendingPromotionStep?: number | null; // 18, 37, or 57
  approvedPromotionSteps: number[]; // steps that leader has approved
  badges: string[]; // IDs of earned badges
  notificationMessage?: string;
  pendingHomeChallenge?: {
    id: string;
    title: string;
    submittedAt: string;
    parentConfirmed: boolean;
  };
  status?: string;
}

export interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type GameType = 'quiz' | 'memory' | 'challenge' | 'knots' | 'backpack' | 'chess';

export interface GameState {
  type: GameType;
  currentQuestion: number;
  score: number;
  isGameOver: boolean;
  earnedBadges: string[];
  memoryCards?: MemoryCard[];
  flippedIndices?: number[];
}

export interface ScoutLaw {
  id: string;
  title: string;
  story: string;
  icon: React.ReactNode;
}

export interface GlobalTask {
  id: string;
  text: string;
  createdAt: string;
  active: boolean;
}

export interface PendingPointRequest {
  id: string;
  cubId: string;
  taskName: string;
  type: 'parent_task' | 'major_challenge' | 'requirement' | 'global_task' | 'activity';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  points: number;
  reason?: string;
  approvedAt?: string;
  parentUid?: string;
  parentEmail?: string;
}

export interface LeaderBadge {
  id: string;
  badgeId: string;
  title: string;
  icon: string;
  description: string;
  awardedAt: string;
  reason?: string;
  awardedBy?: string;
}

export interface Leader {
  id: string;
  name: string;
  roleTitle: string;
  avatar: string;
  experienceYears: number;
  badges: LeaderBadge[];
}

// ─── نظام ربط الأشبال بأولياء الأمور ─────────────────────────────────────────

export type RelationshipType = 'father' | 'mother' | 'guardian';
export type RelationshipStatus = 'pending' | 'approved' | 'rejected';

/** علاقة واحدة بين ولي أمر وشبل. معرّف المستند: `${parentUid}_${cubUid}` */
export interface ParentCubRelationship {
  id: string;
  parentUid: string;
  cubUid: string;
  relationship: RelationshipType;
  status: RelationshipStatus; // "منتهي" يُحسب من expiresAt ولا يُخزَّن
  createdBy: string;
  createdAt?: unknown;
  approvedAt?: unknown;
  approvedBy?: string;
  rejectedAt?: unknown;
  viaCode?: string;
  parentName: string;
  cubName: string;
  cubAvatar?: string;
  expiresAt?: unknown; // لطلبات الانتظار فقط
}

/** كود ربط مؤقت. معرّف المستند هو الكود نفسه. */
export interface LinkCode {
  code: string;
  cubUid: string;
  cubName: string;
  cubAvatar?: string;
  status: 'active' | 'used' | 'revoked'; // "منتهي" يُحسب من expiresAt
  createdBy: string; // الشبل نفسه أو القائد
  createdAt?: unknown;
  expiresAt?: unknown;
  requiresApproval: boolean;
  usedBy?: string;
  usedAt?: unknown;
}

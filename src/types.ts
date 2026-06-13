/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'beterjeszto' | 'velemenyezo' | 'jovahagyo';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  createdAt: string;
}

export type DocumentStatus = 'draft' | 'under_review' | 'reviewed' | 'approved';

export interface Suggestion {
  id: string;
  reviewer: string;
  type: 'insert' | 'delete' | 'modify' | 'comment';
  suggestedText?: string;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  highlightedText?: string; // the portion of text that is being touched
}

export interface Paragraph {
  id: string;
  originalText: string;
  currentText: string;
  suggestions: Suggestion[];
}

export interface DocumentHistory {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  timestamp: string;
}

export interface Document {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  status: DocumentStatus;
  paragraphs: Paragraph[];
  history: DocumentHistory[];
}

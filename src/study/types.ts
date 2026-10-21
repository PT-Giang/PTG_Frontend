import type { StudyContentResponse } from "./studyApi";

export interface StudyDocument {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  sourceType?: "upload" | "url" | "topic" | "text" | "mock";
  sourceUrl?: string;
}

export interface StudyImport {
  title: string;
  sourceType: "upload" | "topic" | "text";
  content?: string;
  file?: File;
}

export interface StudyTerm {
  id: string;
  term: string;
  definition: string;
  documentId?: string;
  level: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  answer: string;
  options: string[];
  type: "choice" | "short";
}

export interface QuizAttempt {
  id: string;
  createdAt: string;
  questions: QuizQuestion[];
  answers: Record<string, string>;
  score: number;
  durationSeconds: number;
}

export interface StudyWorkspace {
  documents: StudyDocument[];
  terms: StudyTerm[];
  attempts: QuizAttempt[];
  smartAnswered: number;
  smartCorrect: number;
  guide: string;
}

export interface StudyViewProps {
  materialId: string;
  title: string;
  workspace: StudyWorkspace;
  studyContent?: StudyContentResponse;
  onRefreshStudyContent?: () => Promise<void>;
  onReviewFlashcard?: (flashcardId: string, correct: boolean) => Promise<void>;
  onChange: (workspace: StudyWorkspace) => void;
}


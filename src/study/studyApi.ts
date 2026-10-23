import { apiRequest } from "@/services/api";
import type { StudyImport } from "./types";

export interface MaterialRecord {
  id: string;
  title: string;
  description: string | null;
  classId: string | null;
  className: string | null;
  createdAt: string;
}

export interface MaterialPage {
  data: MaterialRecord[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ClassRecord {
  id: string;
  name: string;
  color: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  sourceType: string;
  processingStatus: string;
  sourceUrl: string | null;
  extractedText?: string;
  createdAt: string;
}

export interface TermRecord {
  id: string;
  term: string;
  definition: string;
  documentId: string | null;
  level: number;
  createdAt: string;
}

export type GenerationType = "summary" | "guide" | "flashcards" | "study_questions" | "quiz" | "podcast";

export interface GenerationJob {
  id: string;
  materialId: string;
  type: GenerationType;
  status: string;
  outputId: string | null;
}

export interface GenerationSource {
  id: string;
  sourceType: string;
  title: string;
  url: string | null;
  excerpt: string | null;
  retrievedAt: string | null;
  isMock: boolean;
  documentId: string | null;
}

export interface GenerationResult {
  job: GenerationJob;
  output: Record<string, unknown> | null;
  sources: GenerationSource[];
}

export interface GuideContent {
  id: string;
  generationJobId: string | null;
  version: number;
  title: string;
  steps: string[];
  tips: string[];
  sources: GenerationSource[];
}

export interface StudyQuestion {
  type: "multiple_choice" | "matching";
  prompt: string;
  hint: string;
  coreKnowledge: string;
  options: string[] | null;
  correctAnswer: string | null;
  pairs: Array<{ term: string; definition: string }> | null;
}

export interface StudyQuestionSetContent {
  id: string;
  generationJobId: string | null;
  version: number;
  title: string;
  questions: StudyQuestion[];
  sources: GenerationSource[];
}

export interface FlashcardContent {
  id: string;
  documentId: string | null;
  front: string;
  back: string;
  sourcePage: string | null;
  level: number;
  reviewCount: number;
  correctCount: number;
}

export interface FlashcardProgress {
  id: string;
  level: number;
  reviewCount: number;
  correctCount: number;
}

export interface FlashcardSetContent {
  id: string;
  generationJobId: string | null;
  version: number;
  title: string;
  cards: FlashcardContent[];
}

export interface QuizQuestionContent {
  type: "multiple_choice" | "short_answer";
  prompt: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
}

export interface QuizContent {
  id: string;
  generationJobId: string | null;
  version: number;
  title: string;
  questions: QuizQuestionContent[];
  sources: GenerationSource[];
}

export interface StudyContentResponse {
  guides: GuideContent[];
  studyQuestionSets: StudyQuestionSetContent[];
  flashcardSets: FlashcardSetContent[];
  quizzes: QuizContent[];
  plus: boolean;
}

export type StudySessionMode = "smart" | "test" | "flashcards";

export interface StudySessionQuestion {
  id: string;
  position: number;
  type: "choice" | "short" | "matching";
  question: {
    type: "choice" | "short" | "matching";
    prompt: string;
    options: string[];
    pairs?: Array<{ term: string; definition: string }>;
  };
  response: unknown | null;
  result: "correct" | "incorrect" | "revealed" | "skipped" | null;
  durationMs: number | null;
  positiveFeedback: boolean;
  feedbackText: string | null;
  answeredAt: string | null;
}

export interface StudySession {
  id: string;
  materialId: string;
  mode: StudySessionMode;
  status: "in_progress" | "completed" | "abandoned";
  score: number | null;
  startedAt: string;
  endedAt: string | null;
  questions: StudySessionQuestion[];
}

export interface SessionAnswer {
  questionId: string;
  result: "correct" | "incorrect";
  correctAnswer: { correctAnswer?: string; pairs?: Array<{ term: string; definition: string }> };
  explanation: string;
}

export interface GenerationOptions {
  materialSource?: "document" | "requirement";
  documentId?: string;
  questionCount?: number;
  choiceCount?: number;
  shortAnswerCount?: number;
}

const emptyStudyContent: StudyContentResponse = {
  guides: [], studyQuestionSets: [], flashcardSets: [], quizzes: [], plus: false,
};

export interface MaterialPatch {
  title?: string;
  classId?: string | null;
  clearClass?: boolean;
}

export const studyApi = {
  listMaterials(): Promise<MaterialPage> {
    return apiRequest<MaterialPage>("/api/materials?page=0&pageSize=100", "GET");
  },

  getMaterial(materialId: string): Promise<MaterialRecord> {
    return apiRequest<MaterialRecord>(`/api/materials/${encodeURIComponent(materialId)}`, "GET");
  },

  createMaterial(title: string, classId: string | null = null): Promise<MaterialRecord> {
    return apiRequest<MaterialRecord>("/api/materials", "POST", { title, description: "", classId });
  },

  listClasses(): Promise<ClassRecord[]> {
    return apiRequest<ClassRecord[]>("/api/classes", "GET");
  },

  createClass(name: string): Promise<ClassRecord> {
    return apiRequest<ClassRecord>("/api/classes", "POST", { name });
  },

  updateMaterial(materialId: string, payload: MaterialPatch): Promise<MaterialRecord> {
    return apiRequest<MaterialRecord>(`/api/materials/${encodeURIComponent(materialId)}`, "PATCH", payload);
  },

  deleteMaterial(materialId: string): Promise<void> {
    return apiRequest<void>(`/api/materials/${encodeURIComponent(materialId)}`, "DELETE");
  },

  createDocument(materialId: string, title: string, extractedText: string, sourceType: string, sourceUrl?: string): Promise<DocumentRecord> {
    return apiRequest<DocumentRecord>(`/api/materials/${encodeURIComponent(materialId)}/documents`, "POST", {
      title,
      extractedText,
      sourceType,
      sourceUrl,
    });
  },

  listDocuments(materialId: string): Promise<DocumentRecord[]> {
    return apiRequest<DocumentRecord[]>(`/api/materials/${encodeURIComponent(materialId)}/documents`, "GET");
  },

  getDocument(materialId: string, documentId: string): Promise<DocumentRecord> {
    return apiRequest<DocumentRecord>(
      `/api/materials/${encodeURIComponent(materialId)}/documents/${encodeURIComponent(documentId)}`,
      "GET",
    );
  },

  listTerms(materialId: string): Promise<TermRecord[]> {
    return apiRequest<TermRecord[]>(`/api/materials/${encodeURIComponent(materialId)}/terms`, "GET");
  },

  indexDocument(materialId: string, documentId: string): Promise<DocumentRecord> {
    return apiRequest<DocumentRecord>(
      `/api/materials/${encodeURIComponent(materialId)}/documents/${encodeURIComponent(documentId)}/index`,
      "POST",
    );
  },

  createInitialStudyBundle(materialId: string, source: StudyImport): Promise<DocumentRecord> {
    const form = new FormData();
    form.append("sourceType", source.sourceType);
    form.append("title", source.title);
    if (source.file) form.append("file", source.file);
    if (source.content) form.append("content", source.content);
    return apiRequest<DocumentRecord>(
      `/api/materials/${encodeURIComponent(materialId)}/initial-study-bundle`,
      "POST",
      form,
    );
  },

  getStudyContent(materialId: string): Promise<StudyContentResponse> {
    return apiRequest<StudyContentResponse>(`/api/materials/${encodeURIComponent(materialId)}/study-content`, "GET");
  },

  recordFlashcardReview(materialId: string, flashcardId: string, correct: boolean): Promise<FlashcardProgress> {
    return apiRequest<FlashcardProgress>(
      `/api/materials/${encodeURIComponent(materialId)}/flashcards/${encodeURIComponent(flashcardId)}/progress`,
      "PUT",
      { correct },
    );
  },

  startSession(materialId: string, mode: StudySessionMode, sourceId?: string): Promise<StudySession> {
    return apiRequest<StudySession>(`/api/materials/${encodeURIComponent(materialId)}/study-sessions`, "POST", {
      mode,
      ...(sourceId ? { sourceId } : {}),
    });
  },

  submitSessionResponse(sessionId: string, questionId: string, response: unknown | null, durationMs?: number,
    outcome?: "revealed" | "skipped"): Promise<SessionAnswer> {
    return apiRequest<SessionAnswer>(`/api/study-sessions/${encodeURIComponent(sessionId)}/responses`, "POST", {
      questionId,
      response,
      ...(outcome ? { outcome } : {}),
      ...(durationMs !== undefined ? { durationMs } : {}),
    });
  },

  completeSession(sessionId: string): Promise<StudySession> {
    return apiRequest<StudySession>(`/api/study-sessions/${encodeURIComponent(sessionId)}/complete`, "POST");
  },

  sendSessionFeedback(sessionId: string, questionId: string, positive: boolean): Promise<void> {
    return apiRequest<void>(`/api/study-sessions/${encodeURIComponent(sessionId)}/questions/${encodeURIComponent(questionId)}/feedback`, "PUT", { positive });
  },

  generate(materialId: string, type: GenerationType, instruction: string, idempotencyKey: string, options: GenerationOptions = {}): Promise<GenerationJob> {
    return apiRequest<GenerationJob>(
      `/api/materials/${encodeURIComponent(materialId)}/generation-jobs`,
      "POST",
      {
        type, materialSource: options.materialSource ?? "requirement", instruction,
        ...(options.documentId ? { documentId: options.documentId } : {}),
        ...(options.questionCount !== undefined ? { questionCount: options.questionCount } : {}),
        ...(options.choiceCount !== undefined ? { choiceCount: options.choiceCount } : {}),
        ...(options.shortAnswerCount !== undefined ? { shortAnswerCount: options.shortAnswerCount } : {}),
      },
      { "Idempotency-Key": idempotencyKey },
    );
  },

  getGeneration(materialId: string, jobId: string): Promise<GenerationResult> {
    return apiRequest<GenerationResult>(
      `/api/materials/${encodeURIComponent(materialId)}/generation-jobs/${encodeURIComponent(jobId)}`,
      "GET",
    );
  },
};

export { emptyStudyContent };

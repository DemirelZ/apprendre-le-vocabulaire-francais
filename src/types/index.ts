export interface Word {
  id: string;
  french: string;
  turkish: string;
  pronunciation: string;
  example: string;
  exampleTranslation?: string;
  exampleTranslationTr?: string;
  exampleTranslationEn?: string;
  synonyms?: string[];
  image?: string;
  category: string;
  unit: string; // Yeni: ünite bilgisi
  difficulty: "beginner" | "intermediate" | "advanced";
  isLearned: boolean;
  isDifficult: boolean;
  createdAt: Date;
  lastReviewed?: Date;
  knowledgeLevel?: "dont-know" | "somewhat" | "learned"; // Yeni: bilgi seviyesi
  correctStreak?: number;
  conjugations?: {
    [tense: string]: {
      je?: string;
      tu?: string;
      il?: string;
      nous?: string;
      vous?: string;
      ils?: string;
    };
  };
  examples?: {
    form: string;
    tense?: string;
    sentence: string;
    translationTr?: string;
    translationEn?: string;
  }[];
  gender?: "masculine" | "feminine" | "both";
  plural?: string;
  forms?: {
    masculine?: string;
    feminine?: string;
    masculinePlural?: string;
    femininePlural?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  wordCount: number;
  unitCount: number; // Yeni: ünite sayısı
  color: string;
}

export interface Unit {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  wordCount: number;
  order: number; // Ünite sırası
  isCompleted: boolean;
  progress: number; // 0-100 arası ilerleme
}

export interface Activity {
  id: string;
  type: "multiple-choice" | "fill-blank" | "writing";
  question: string;
  correctAnswer: string;
  options?: string[]; // Çoktan seçmeli için
  wordId: string;
  unitId: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface UserProgress {
  totalWords: number;
  learnedWords: number;
  difficultWords: number;
  streak: number;
  completedUnits: number;
  totalUnits: number;
  lastStudyDate?: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  options: string[];
  wordId: string;
  type: "translation" | "pronunciation" | "example";
}

export interface Question {
  id: string;
  type: "multiple-choice" | "fill-blank" | "writing";
  question: string;
  correctAnswer: string;
  options?: string[];
  wordId: string;
  unitId: string;
  categoryId: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

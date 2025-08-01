export interface Word {
  id: string;
  french: string;
  turkish: string;
  english?: string;
  pronunciation: string;
  description?: string;
  example?: string;
  exampleTranslation?: string;
  exampleTranslationTr?: string;
  exampleTranslationEn?: string;
  synonyms?: string[];
  image?: string | null;
  audio?: string;
  category: string;
  unit: string; // Yeni: ünite bilgisi
  difficulty: "beginner" | "intermediate" | "advanced";
  isLearned: boolean;
  isDifficult: boolean;
  createdAt: string;
  lastReviewed?: string;
  knowledgeLevel?: "dont-know" | "somewhat" | "learned" | null; // Yeni: bilgi seviyesi
  correctStreak?: number;
  conjugations?: {
    [tense: string]: {
      [person: string]: string;
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
  image: string | number | null; // string: URL, number: require() sonucu
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
  difficulty?: "beginner" | "intermediate" | "advanced"; // Zorluk seviyesi (opsiyonel)
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
  lastStudyDate?: string;
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

export interface AdjectiveExample {
  form: string; // grand, grande, grands, grandes
  sentence: string;
  translationTr: string;
  translationEn: string;
}

export interface AdjectiveForms {
  masculine: string;
  feminine: string;
  masculinePlural: string;
  femininePlural: string;
}

export interface Adjective {
  id: string;
  french: string;
  turkish: string;
  english?: string;
  pronunciation: string;
  category: "adjectives";
  unit: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  isLearned: boolean;
  isDifficult: boolean;
  createdAt: string | Date;
  knowledgeLevel: "dont-know" | "somewhat" | "learned" | null;
  position: "before" | "after" | "both";
  irregular: boolean;
  synonyms: string[];
  antonyms: string[];
  image: string | null;
  audio: string | null;
  description: string;
  forms: AdjectiveForms;
  examples: AdjectiveExample[];
}

export interface ExampleNoun {
  form: string;
  sentence: string;
  translationTr: string;
  translationEn: string;
}

export interface INoun {
  id: string;
  french: string;
  turkish: string;
  english: string;
  pronunciation: string;
  gender: "masculine" | "feminine";
  plural: string;
  category: "nouns";
  unit: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  isLearned: boolean;
  isDifficult: boolean;
  image: string | null;
  audio: string | null;
  createdAt: string; // ISO date string
  knowledgeLevel: "dont-know" | "somewhat" | "learned" | null;
  synonyms: string[]; // örn: ["ouvrage", "manuel"]
  relatedWords: string[]; // örn: ["bibliothèque", "lecture"]
  examples: ExampleNoun[];
}

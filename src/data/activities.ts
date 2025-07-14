import { Activity } from "../types";

export const mockActivities: Activity[] = [
  // FİİLLER - ÜNİTE 1: Temel Fiiller - Çoktan Seçmeli
  {
    id: "act-1",
    type: "multiple-choice",
    question: '"Être" fiilinin Türkçe anlamı nedir?',
    correctAnswer: "Olmak",
    options: ["Olmak", "Sahip olmak", "Gitmek", "Yapmak"],
    wordId: "1",
    unitId: "verbs-unit-1",
    difficulty: "beginner",
  },
  {
    id: "act-2",
    type: "multiple-choice",
    question: 'Hangi cümlede "avoir" fiili kullanılmıştır?',
    correctAnswer: "J'ai un livre.",
    options: [
      "Je suis étudiant.",
      "J'ai un livre.",
      "Je vais à l'école.",
      "Je fais mes devoirs.",
    ],
    wordId: "2",
    unitId: "verbs-unit-1",
    difficulty: "beginner",
  },

  // FİİLLER - ÜNİTE 1: Temel Fiiller - Boşluk Doldurma
  {
    id: "act-3",
    type: "fill-blank",
    question: "Je _____ étudiant. (être)",
    correctAnswer: "suis",
    wordId: "1",
    unitId: "verbs-unit-1",
    difficulty: "beginner",
  },
  {
    id: "act-4",
    type: "fill-blank",
    question: "J'_____ un livre. (avoir)",
    correctAnswer: "ai",
    wordId: "2",
    unitId: "verbs-unit-1",
    difficulty: "beginner",
  },

  // FİİLLER - ÜNİTE 1: Temel Fiiller - Yazma
  {
    id: "act-5",
    type: "writing",
    question: '"Je vais à l\'école" cümlesini Türkçeye çevirin.',
    correctAnswer: "Okula gidiyorum",
    wordId: "3",
    unitId: "verbs-unit-1",
    difficulty: "beginner",
  },

  // SIFATLAR - ÜNİTE 1: Boyut Sıfatları - Çoktan Seçmeli
  {
    id: "act-6",
    type: "multiple-choice",
    question: '"Grand" sıfatının Türkçe anlamı nedir?',
    correctAnswer: "Büyük",
    options: ["Küçük", "Büyük", "İyi", "Kötü"],
    wordId: "9",
    unitId: "adjectives-unit-1",
    difficulty: "beginner",
  },

  // SIFATLAR - ÜNİTE 1: Boyut Sıfatları - Boşluk Doldurma
  {
    id: "act-7",
    type: "fill-blank",
    question: "C'est un _____ bâtiment. (grand)",
    correctAnswer: "grand",
    wordId: "9",
    unitId: "adjectives-unit-1",
    difficulty: "beginner",
  },

  // İSİMLER - ÜNİTE 2: Eğitim - Çoktan Seçmeli
  {
    id: "act-8",
    type: "multiple-choice",
    question: '"Livre" kelimesinin Türkçe anlamı nedir?',
    correctAnswer: "Kitap",
    options: ["Ev", "Kitap", "Okul", "İş"],
    wordId: "16",
    unitId: "nouns-unit-2",
    difficulty: "beginner",
  },

  // ZARFLAR - ÜNİTE 1: Miktar Zarfları - Çoktan Seçmeli
  {
    id: "act-9",
    type: "multiple-choice",
    question: '"Très" zarfının Türkçe anlamı nedir?',
    correctAnswer: "Çok",
    options: ["Az", "Çok", "İyi", "Kötü"],
    wordId: "21",
    unitId: "adverbs-unit-1",
    difficulty: "beginner",
  },

  // BAĞLAÇLAR - ÜNİTE 1: Temel Bağlaçlar - Çoktan Seçmeli
  {
    id: "act-10",
    type: "multiple-choice",
    question: '"Et" bağlacının Türkçe anlamı nedir?',
    correctAnswer: "Ve",
    options: ["Ve", "Veya", "Ama", "Çünkü"],
    wordId: "26",
    unitId: "conjunctions-unit-1",
    difficulty: "beginner",
  },
];

// Aktivite türlerine göre filtreleme fonksiyonları
export const getActivitiesByUnit = (unitId: string): Activity[] => {
  return mockActivities.filter((activity) => activity.unitId === unitId);
};

export const getActivitiesByType = (
  unitId: string,
  type: Activity["type"]
): Activity[] => {
  return mockActivities.filter(
    (activity) => activity.unitId === unitId && activity.type === type
  );
};

export const getActivitiesByWord = (wordId: string): Activity[] => {
  return mockActivities.filter((activity) => activity.wordId === wordId);
};

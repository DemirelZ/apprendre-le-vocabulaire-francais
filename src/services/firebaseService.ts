import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Category, Unit, UserProgress, Word } from "../types";

// Koleksiyon isimleri
const COLLECTIONS = {
  WORDS: "words",
  UNITS: "units",
  CATEGORIES: "categories",
  USER_PROGRESS: "userProgress",
};

// ===== KELİME İŞLEMLERİ =====
export const wordService = {
  // Tüm kelimeleri getir
  async getAllWords(): Promise<Word[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.WORDS));
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Word)
    );
  },

  // Kategoriye göre kelimeleri getir
  async getWordsByCategory(category: string): Promise<Word[]> {
    const q = query(
      collection(db, COLLECTIONS.WORDS),
      where("category", "==", category),
      orderBy("id")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Word)
    );
  },

  // Üniteye göre kelimeleri getir
  async getWordsByUnit(unitId: string): Promise<Word[]> {
    const q = query(
      collection(db, COLLECTIONS.WORDS),
      where("unit", "==", unitId),
      orderBy("id")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Word)
    );
  },

  // Tek kelime getir
  async getWord(wordId: string): Promise<Word | null> {
    const docRef = doc(db, COLLECTIONS.WORDS, wordId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Word;
    }
    return null;
  },

  // Kelime ekle
  async addWord(word: Omit<Word, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.WORDS), word);
    return docRef.id;
  },

  // Kelime güncelle
  async updateWord(wordId: string, updates: Partial<Word>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.WORDS, wordId);
    await updateDoc(docRef, updates);
  },

  // Kelime sil
  async deleteWord(wordId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.WORDS, wordId);
    await deleteDoc(docRef);
  },

  // Toplu kelime ekleme (1000 kelime için)
  async addWordsBatch(words: Omit<Word, "id">[]): Promise<void> {
    const batch = writeBatch(db);

    words.forEach((word) => {
      const docRef = doc(collection(db, COLLECTIONS.WORDS));
      batch.set(docRef, word);
    });

    await batch.commit();
  },
};

// ===== ÜNİTE İŞLEMLERİ =====
export const unitService = {
  async getAllUnits(): Promise<Unit[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.UNITS));
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Unit)
    );
  },

  async getUnitsByCategory(categoryId: string): Promise<Unit[]> {
    const q = query(
      collection(db, COLLECTIONS.UNITS),
      where("categoryId", "==", categoryId),
      orderBy("order")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Unit)
    );
  },

  async addUnit(unit: Omit<Unit, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.UNITS), unit);
    return docRef.id;
  },
};

// ===== KATEGORİ İŞLEMLERİ =====
export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Category)
    );
  },

  async addCategory(category: Omit<Category, "id">): Promise<string> {
    const docRef = await addDoc(
      collection(db, COLLECTIONS.CATEGORIES),
      category
    );
    return docRef.id;
  },
};

// ===== KULLANICI İLERLEME İŞLEMLERİ =====
export const userProgressService = {
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    const docRef = doc(db, COLLECTIONS.USER_PROGRESS, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        totalWords: data.totalWords || 0,
        learnedWords: data.learnedWords || 0,
        difficultWords: data.difficultWords || 0,
        streak: data.streak || 0,
        completedUnits: data.completedUnits || 0,
        totalUnits: data.totalUnits || 0,
      } as UserProgress;
    }
    return null;
  },

  async updateUserProgress(
    userId: string,
    progress: Partial<UserProgress>
  ): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USER_PROGRESS, userId);
    await setDoc(docRef, progress, { merge: true });
  },
};

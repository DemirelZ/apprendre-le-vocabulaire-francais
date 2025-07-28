import { useEffect, useState } from "react";
import {
  categoryService,
  unitService,
  userProgressService,
  wordService,
} from "../services/firebaseService";
import { Category, Unit, UserProgress, Word } from "../types";

// Firebase verilerini yönetmek için custom hook
export const useFirebase = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tüm verileri yükle
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [wordsData, unitsData, categoriesData] = await Promise.all([
        wordService.getAllWords(),
        unitService.getAllUnits(),
        categoryService.getAllCategories(),
      ]);

      setWords(wordsData);
      setUnits(unitsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Veri yükleme hatası");
    } finally {
      setLoading(false);
    }
  };

  // Kategoriye göre kelimeleri getir
  const getWordsByCategory = async (category: string) => {
    try {
      setLoading(true);
      const wordsData = await wordService.getWordsByCategory(category);
      setWords(wordsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kategori kelimeleri yükleme hatası"
      );
    } finally {
      setLoading(false);
    }
  };

  // Üniteye göre kelimeleri getir
  const getWordsByUnit = async (unitId: string) => {
    try {
      setLoading(true);
      const wordsData = await wordService.getWordsByUnit(unitId);
      setWords(wordsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ünite kelimeleri yükleme hatası"
      );
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı ilerlemesini yükle
  const loadUserProgress = async (userId: string) => {
    try {
      const progress = await userProgressService.getUserProgress(userId);
      setUserProgress(progress);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kullanıcı ilerlemesi yükleme hatası"
      );
    }
  };

  // Kullanıcı ilerlemesini güncelle
  const updateUserProgress = async (
    userId: string,
    progress: Partial<UserProgress>
  ) => {
    try {
      await userProgressService.updateUserProgress(userId, progress);
      setUserProgress((prev) => (prev ? { ...prev, ...progress } : null));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "İlerleme güncelleme hatası"
      );
    }
  };

  // Kelime öğrenildi olarak işaretle
  const markWordAsLearned = async (wordId: string, userId: string) => {
    try {
      await wordService.updateWord(wordId, { isLearned: true });
      setWords((prev) =>
        prev.map((word) =>
          word.id === wordId ? { ...word, isLearned: true } : word
        )
      );

      // Kullanıcı ilerlemesini güncelle
      if (userProgress) {
        const newProgress = {
          ...userProgress,
          learnedWords: userProgress.learnedWords + 1,
        };
        await updateUserProgress(userId, newProgress);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kelime güncelleme hatası");
    }
  };

  // Kelimeyi zor olarak işaretle
  const markWordAsDifficult = async (wordId: string, userId: string) => {
    try {
      await wordService.updateWord(wordId, { isDifficult: true });
      setWords((prev) =>
        prev.map((word) =>
          word.id === wordId ? { ...word, isDifficult: true } : word
        )
      );

      // Kullanıcı ilerlemesini güncelle
      if (userProgress) {
        const newProgress = {
          ...userProgress,
          difficultWords: userProgress.difficultWords + 1,
        };
        await updateUserProgress(userId, newProgress);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kelime güncelleme hatası");
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadAllData();
  }, []);

  return {
    // State
    words,
    units,
    categories,
    userProgress,
    loading,
    error,

    // Actions
    loadAllData,
    getWordsByCategory,
    getWordsByUnit,
    loadUserProgress,
    updateUserProgress,
    markWordAsLearned,
    markWordAsDifficult,
  };
};

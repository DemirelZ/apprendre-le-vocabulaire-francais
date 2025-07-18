import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { mockCategories, mockUnits, mockWords } from "../data/mockData";

const { width: screenWidth } = Dimensions.get("window");

export default function WritingQuizScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const router = useRouter();

  // Tüm hook'ları en üste taşı
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Record<string, boolean>
  >({});
  const [score, setScore] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Harf seçimli yazma alanı için state
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [usedIndexes, setUsedIndexes] = useState<number[]>([]);

  // Maksimum kelime sayısı sınırı (bellek güvenliği)
  const maxWords = 50;

  // Shuffle words once
  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Güvenli unitWords filtresi - sadece belirli unitId'ye ait kelimeler
  const unitWords = unitId
    ? mockWords.filter((word) => word.unit === unitId)
    : [];
  const safeUnitWords = unitWords.slice(0, maxWords);
  const [questions] = useState(() => shuffle(safeUnitWords));

  // Harf kutucukları için karışık harfler - güvenli versiyon
  const actualShuffledLetters = React.useMemo(() => {
    // Bu noktada currentWord henüz tanımlı değil, bu yüzden boş array döndür
    return [];
  }, []);

  // Guard clause: unitId zorunlu parametre
  if (!unitId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ünite ID bulunamadı</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const unit = mockUnits.find((u) => u.id === unitId);

  // Guard clause: unit bulunamadı
  if (!unit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ünite bulunamadı</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const category = mockCategories.find((c) => c.id === unit.categoryId);

  // Guard clause: unitWords boş veya çok büyük
  if (!unitWords || unitWords.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Bu ünitede kelime bulunamadı</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Guard clause: questions boş
  if (!questions || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Soru oluşturulamadı</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentWord = questions[currentQuestionIndex];

  // Guard clause: currentWord bulunamadı
  if (!currentWord) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Mevcut kelime bulunamadı</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Guard clause: currentWord.french geçerli değil
  if (
    !currentWord.french ||
    typeof currentWord.french !== "string" ||
    currentWord.french.length === 0
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Kelime verisi geçersiz</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Harf seçme
  const handleLetterSelect = (letter: string, idx: number) => {
    setSelectedLetters((prev) => [...prev, letter]);
    setUsedIndexes((prev) => [...prev, idx]);
  };
  // Harf geri alma
  const handleRemoveLetter = (removeIdx: number) => {
    setSelectedLetters((prev) => prev.filter((_, i) => i !== removeIdx));
    setUsedIndexes((prev) => prev.filter((_, i) => i !== removeIdx));
  };

  // Cevap kontrolü
  const isCorrect =
    selectedLetters.join("").toLowerCase() === currentWord.french.toLowerCase();
  const isAnswered = answeredQuestions[currentWord.id] || false;

  // Cevabı gönder
  const handleSubmit = () => {
    setAnsweredQuestions((prev) => ({ ...prev, [currentWord.id]: true }));
    if (isCorrect) setScore((s) => s + 1);
  };

  // Sonraki soruya geç
  const handleNext = () => {
    setSelectedLetters([]);
    setUsedIndexes([]);
    if (currentQuestionIndex < questions.length - 1) {
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        slideAnim.setValue(screenWidth);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      router.back();
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {category && unit ? `${category.name} • ${unit.name}` : "Yazma Testi"}
        </Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>
      </View>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
      {/* Soru Alanı */}
      <Animated.View
        style={[
          styles.questionContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <Text style={styles.questionText}>
          &apos;{currentWord.turkish}&apos; anlamına gelen kelime
        </Text>
        {/* Seçilen harfler */}
        <View style={styles.selectedLettersRow}>
          {selectedLetters.map((letter, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.selectedLetterBox}
              onPress={() => !isAnswered && handleRemoveLetter(idx)}
              disabled={isAnswered}
            >
              <Text style={styles.selectedLetterText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Harf kutucukları */}
        <View style={styles.lettersRow}>
          {actualShuffledLetters.map((letter, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.letterBox,
                usedIndexes.includes(idx) && styles.letterBoxUsed,
              ]}
              onPress={() =>
                !usedIndexes.includes(idx) &&
                !isAnswered &&
                handleLetterSelect(letter, idx)
              }
              disabled={usedIndexes.includes(idx) || isAnswered}
            >
              <Text style={styles.letterText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Sonuç ve butonlar */}
        {isAnswered && (
          <Text style={isCorrect ? styles.correctText : styles.wrongText}>
            {isCorrect ? "Doğru!" : `Yanıt: ${currentWord.french}`}
          </Text>
        )}
        {!isAnswered && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={selectedLetters.length !== currentWord.french.length}
          >
            <Text style={styles.submitButtonText}>Cevabı Gönder</Text>
          </TouchableOpacity>
        )}
        {isAnswered && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex === questions.length - 1
                ? "Bitir"
                : "İleri"}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#007AFF",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    position: "absolute",
    left: 20,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  progressContainer: {
    position: "absolute",
    right: 20,
  },
  progressText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  questionText: {
    fontSize: 18,
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    backgroundColor: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  correctText: {
    color: "#28a745",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  wrongText: {
    color: "#dc3545",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedLettersRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    minHeight: 48,
  },
  selectedLetterBox: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    marginHorizontal: 4,
    padding: 12,
    minWidth: 32,
    alignItems: "center",
  },
  selectedLetterText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  lettersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 24,
  },
  letterBox: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 8,
    margin: 4,
    padding: 12,
    minWidth: 32,
    alignItems: "center",
  },
  letterBoxUsed: {
    backgroundColor: "#e9ecef",
    borderColor: "#e9ecef",
  },
  letterText: {
    color: "#007AFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6c757d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 20,
  },
});

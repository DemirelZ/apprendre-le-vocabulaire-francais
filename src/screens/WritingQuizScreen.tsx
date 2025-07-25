import { Ionicons } from "@expo/vector-icons";
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
import Toast from "react-native-toast-message";
import { mockCategories, mockUnits, mockWords } from "../data/mockData";

const { width: screenWidth } = Dimensions.get("window");

// Knowledge Level Indicator (3 çizgi)
const getLineColor = (lineIndex: number, level?: string) => {
  if (!level) {
    return "#e9ecef"; // Açık gri - hiç seçim yapılmamış
  }
  switch (level) {
    case "dont-know":
      return lineIndex === 2 ? "#dc3545" : "#e9ecef"; // Sadece en alttaki çizgi kırmızı
    case "somewhat":
      return lineIndex >= 1 ? "#ffc107" : "#e9ecef"; // Alt 2 çizgi sarı
    case "learned":
      return "#28a745"; // Tüm çizgiler yeşil
    default:
      return "#e9ecef";
  }
};

// Knowledge level düşürme fonksiyonu
const decreaseKnowledgeLevel = (wordId: string) => {
  const wordIndex = mockWords.findIndex((word) => word.id === wordId);
  if (wordIndex === -1) return;

  const word = mockWords[wordIndex];
  const currentLevel = word.knowledgeLevel;

  // Eğer knowledge level yoksa veya zaten "dont-know" ise hiçbir şey yapma
  if (!currentLevel || currentLevel === "dont-know") {
    return;
  }

  let newLevel: "dont-know" | "somewhat" | "learned";
  let toastMessage = "";

  switch (currentLevel) {
    case "learned":
      newLevel = "somewhat";
      toastMessage = "Kelime seviyesi 'Biraz' olarak güncellendi";
      break;
    case "somewhat":
      newLevel = "dont-know";
      toastMessage = "Kelime seviyesi 'Bilmiyorum' olarak güncellendi";
      break;
    default:
      return;
  }

  // Knowledge level'ı güncelle
  mockWords[wordIndex].knowledgeLevel = newLevel;

  // Toast mesajı göster
  Toast.show({
    type: "info",
    text1: "Seviye Düşürüldü",
    text2: toastMessage,
    position: "top",
    visibilityTime: 3000,
    swipeable: true,
  });
};

// Knowledge level yükseltme fonksiyonu
const increaseKnowledgeLevel = (wordId: string) => {
  console.log("increaseKnowledgeLevel çağrıldı:", wordId);
  const wordIndex = mockWords.findIndex((word) => word.id === wordId);
  if (wordIndex === -1) return;
  const word = mockWords[wordIndex];
  const currentLevel = word.knowledgeLevel;
  let newLevel = currentLevel;
  let toastMessage = "";
  switch (currentLevel) {
    case "dont-know":
      newLevel = "somewhat";
      toastMessage = "Kelime seviyesi 'Biraz' olarak güncellendi";
      break;
    case "somewhat":
      newLevel = "learned";
      toastMessage = "Kelime seviyesi 'Öğrendim' olarak güncellendi";
      break;
    case "learned":
    default:
      return; // Zaten en üstte
  }
  mockWords[wordIndex].knowledgeLevel = newLevel;
  console.log("Knowledge level güncellendi:", wordId, "->", newLevel);
  Toast.show({
    type: "success",
    text1: "Seviye Yükseltildi",
    text2: toastMessage,
    position: "top",
    visibilityTime: 3000,
    swipeable: true,
  });
};

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
  const tickAnim = useRef(new Animated.Value(0)).current;
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  // Remove local correctStreaks state

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

  const currentWord = questions[currentQuestionIndex];
  // isDifficult state for immediate UI update
  const [isDifficult, setIsDifficult] = useState(false);
  React.useEffect(() => {
    if (currentWord && typeof currentWord.isDifficult === "boolean") {
      setIsDifficult(currentWord.isDifficult);
    }
  }, [currentWord && currentWord.id]);

  // Harf kutucukları için karışık harfler - güvenli versiyon
  const actualShuffledLetters = React.useMemo(() => {
    if (
      !questions ||
      questions.length === 0 ||
      currentQuestionIndex >= questions.length
    ) {
      return [];
    }

    const currentWord = questions[currentQuestionIndex];
    if (!currentWord || !currentWord.french) {
      return [];
    }

    // Mevcut kelimenin harflerini al ve karıştır
    const letters = currentWord.french.split("");
    return shuffle(letters);
  }, [questions, currentQuestionIndex]);

  // Tick animasyonu için useEffect
  React.useEffect(() => {
    const currentWord = questions[currentQuestionIndex];
    if (currentWord && answeredQuestions[currentWord.id]) {
      const isCorrect =
        selectedLetters.join("").toLowerCase() ===
        currentWord.french.toLowerCase();
      if (isCorrect) {
        Animated.spring(tickAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  }, [
    answeredQuestions,
    currentQuestionIndex,
    questions,
    selectedLetters,
    tickAnim,
  ]);

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
    const wordIndex = mockWords.findIndex((w) => w.id === currentWord.id);
    if (isCorrect) {
      setScore((s) => s + 1);
      // Streak logic
      if (wordIndex !== -1) {
        let streak = mockWords[wordIndex].correctStreak || 0;
        streak += 1;
        //console.log("Streak for", currentWord.id, ":", streak);
        if (streak >= 3) {
          console.log("Streak 3 oldu, knowledge level artırılıyor");
          increaseKnowledgeLevel(currentWord.id);
          streak = 0;
        }
        mockWords[wordIndex].correctStreak = streak;
      }
      // Doğru cevap ise otomatik olarak sonraki soruya geç
      setIsAutoAdvancing(true);
      setTimeout(() => {
        setIsAutoAdvancing(false);
        if (currentQuestionIndex < questions.length - 1) {
          handleNext();
        }
      }, 800); // 0.8 saniye gecikme
    } else {
      // Yanlış cevapta knowledge level düşür ve streak sıfırla
      if (wordIndex !== -1) {
        mockWords[wordIndex].correctStreak = 0;
      }
      decreaseKnowledgeLevel(currentWord.id);
    }
  };

  // Sonraki soruya geç
  const handleNext = () => {
    setSelectedLetters([]);
    setUsedIndexes([]);
    tickAnim.setValue(0); // Tick animasyonunu sıfırla

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

  // Çalışılacaklara ekle fonksiyonu
  const handleAddToDifficult = () => {
    const wordIndex = require("../data/mockData").mockWords.findIndex(
      (w) => w.id === currentWord.id
    );
    if (wordIndex !== -1) {
      const current =
        require("../data/mockData").mockWords[wordIndex].isDifficult;
      require("../data/mockData").mockWords[wordIndex].isDifficult = !current;
      setIsDifficult(!current);
      Toast.show({
        type: current ? "info" : "success",
        text1: current
          ? `${currentWord.french} kelimesi çalışılacaklar listesinden çıkarıldı`
          : `${currentWord.french} kelimesi çalışılacaklar listesine eklendi`,
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 80,
        swipeable: true,
      });
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
      {/* Question Card */}
      <Animated.View
        style={[
          styles.questionContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={styles.questionBox}>
          {/* Knowledge Level Indicator */}
          <View style={styles.qcTopRow}>
            <TouchableOpacity
              style={{
                width: 44,
                height: 44,
                borderRadius: 50,
                justifyContent: "center",
                backgroundColor: "#f8f9fa",
                borderWidth: 2,
                borderColor: "#e9ecef",
                alignItems: "center",
              }}
              onPress={handleAddToDifficult}
            >
              <View style={styles.knowledgeLevelIndicator}>
                <Ionicons
                  name={isDifficult ? "star" : "star-outline"}
                  size={24}
                  color={isDifficult ? "#FFD700" : "#e9ecef"}
                />
              </View>
            </TouchableOpacity>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 50,
                justifyContent: "center",
                backgroundColor: "#f8f9fa",
                borderWidth: 2,
                borderColor: "#e9ecef",
                alignItems: "center",
              }}
            >
              <View style={styles.knowledgeLevelIndicator}>
                {Array.from({ length: 3 }, (_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.knowledgeLevelLine,
                      {
                        backgroundColor: getLineColor(
                          index,
                          currentWord.knowledgeLevel
                        ),
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
          {/* Soru ve alt metin */}
          <View style={styles.questionWordContainer}>
            <Text style={styles.questionText}>
              &apos;{currentWord.turkish}&apos;
            </Text>
            <Text style={styles.questionSubtext}>anlamına gelen kelime</Text>
          </View>
          {/* Cevap ve animasyonlar */}
          <View style={styles.answerContainer}>
            {isAnswered && isCorrect && (
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [
                      {
                        scale: tickAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ],
                    opacity: tickAnim,
                  },
                ]}
              >
                <Ionicons name="checkmark-circle" size={40} color="#28a745" />
              </Animated.View>
            )}
            {isAnswered && !isCorrect && (
              <Text style={styles.wrongText}>Yanıt: {currentWord.french}</Text>
            )}
          </View>
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
        </View>
      </Animated.View>
      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {!isAnswered ? (
          <>
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextNavButton,
                selectedLetters.length !== currentWord.french.length &&
                  styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={selectedLetters.length !== currentWord.french.length}
            >
              <Text style={[styles.navButtonText, styles.nextButtonText]}>
                Cevabı Gönder
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, styles.backNavButton]}
              onPress={handleNext}
            >
              <Text style={styles.navButtonText}>Atla {">"}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.nextNavButton]}
            onPress={handleNext}
            disabled={isAutoAdvancing}
          >
            <Text style={[styles.navButtonText, styles.nextButtonText]}>
              {currentQuestionIndex === questions.length - 1
                ? "Bitir"
                : "İleri"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
    backgroundColor: "#4ECDC4",
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
    backgroundColor: "#4ECDC4",
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
  questionBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionWordContainer: {
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  questionText: {
    fontSize: 24,
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
  questionSubtext: {
    fontSize: 16,
    color: "#6c757d",
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
  },
  submitButton: {
    flex: 1,
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
  skipButton: {
    flex: 1,
    backgroundColor: "#6c757d",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  skipButtonText: {
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
  answerContainer: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  nextAndFinishButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  disabledButton: {
    backgroundColor: "#e9ecef",
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  // knowledgeLevelIndicator: { flexDirection: "column", alignItems: "flex-end", minHeight: 24, },
  // knowledgeLevelLine: { width: 24, height: 5, borderRadius: 2, marginVertical: 2, },
  qcTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 50,
  },
  knowledgeLevelIndicator: {
    flexDirection: "column",
    alignItems: "flex-end",
    minHeight: 24,
  },
  knowledgeLevelLine: {
    width: 24,
    height: 5,
    borderRadius: 2,
    marginVertical: 2,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  navButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 5,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  nextNavButton: {
    backgroundColor: "#4ECDC4",
  },
  backNavButton: {
    backgroundColor: "#6c757d",
  },
});

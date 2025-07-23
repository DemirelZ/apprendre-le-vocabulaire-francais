import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import useWordActionSheet from "../components/WordActionSheet";
import { mockWords } from "../data/mockData";
import { mockQuestions } from "../data/mockQuestions";

const { width: screenWidth } = Dimensions.get("window");

interface FillBlankQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  wordId: string;
  unitId: string;
  options: string[];
}

// Knowledge level düşürme fonksiyonu
const decreaseKnowledgeLevel = (wordId: string) => {
  const wordIndex = mockWords.findIndex((word) => word.id === wordId);
  if (wordIndex === -1) return;
  const word = mockWords[wordIndex];
  const currentLevel = word.knowledgeLevel;
  let newLevel = currentLevel;
  let toastMessage = "";
  switch (currentLevel) {
    case "learned":
      newLevel = "somewhat";
      toastMessage = "Kelime seviyesi 'Biraz' olarak düşürüldü";
      break;
    case "somewhat":
      newLevel = "dont-know";
      toastMessage = "Kelime seviyesi 'Bilmiyorum' olarak düşürüldü";
      break;
    case "dont-know":
    default:
      return; // Zaten en altta
  }
  mockWords[wordIndex].knowledgeLevel = newLevel;
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

export default function FillInTheBlankQuizScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Record<string, boolean>
  >({});
  const [score, setScore] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  // Remove local correctStreaks state

  // Filter fill-blank questions for this unit
  const questions: FillBlankQuestion[] = mockQuestions
    .filter((q) => q.type === "fill-blank" && q.unitId === unitId)
    .map((q, index, arr) => {
      // Use other words in the unit as options
      const unitWords = mockWords.filter((w) => w.unit === unitId);
      const correctWord = unitWords.find((w) => w.id === q.wordId);
      const otherWords = unitWords.filter((w) => w.id !== q.wordId);
      // Use Turkish meanings as options for more challenge, fallback to generic
      const wrongOptions = otherWords.map((w) => w.french).slice(0, 3);
      const genericOptions = ["Bilmiyorum", "Hatırlamıyorum", "Emin değilim"];
      const additionalOptions = genericOptions.slice(
        0,
        3 - wrongOptions.length
      );
      // Shuffle options and make first letter lowercase
      const options = shuffle(
        [q.correctAnswer, ...wrongOptions, ...additionalOptions].slice(0, 4)
      ).map((opt) => opt.charAt(0).toLowerCase() + opt.slice(1));
      return {
        ...q,
        options,
      };
    });

  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const currentQuestion = questions[currentQuestionIndex];

  // isDifficult state for immediate UI update
  const [isDifficult, setIsDifficult] = useState(false);
  React.useEffect(() => {
    const word = mockWords.find((w) => w.id === currentQuestion.wordId);
    setIsDifficult(word ? word.isDifficult : false);
  }, [currentQuestion.wordId]);

  const { showWordDetails, ActionSheetComponent } = useWordActionSheet();

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
    setAnsweredQuestions((prev) => ({ ...prev, [currentQuestion.id]: true }));
    const wordIndex = mockWords.findIndex(
      (w) => w.id === currentQuestion.wordId
    );
    if (answer === currentQuestion.correctAnswer) {
      // Streak logic
      if (wordIndex !== -1) {
        let streak = mockWords[wordIndex].correctStreak || 0;
        streak += 1;
        //console.log("Streak for", currentQuestion.wordId, ":", streak);
        if (streak >= 3) {
          console.log("Streak 3 oldu, knowledge level artırılıyor");
          increaseKnowledgeLevel(currentQuestion.wordId);
          streak = 0;
        }
        mockWords[wordIndex].correctStreak = streak;
      }
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          handleNext();
        }
      }, 800);
    } else {
      // Reset streak and decrease knowledge level
      if (wordIndex !== -1) {
        mockWords[wordIndex].correctStreak = 0;
      }
      decreaseKnowledgeLevel(currentQuestion.wordId);
    }
  };

  const animateToNext = () => {
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
  };

  const animateToPrevious = () => {
    Animated.timing(slideAnim, {
      toValue: screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(-screenWidth);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    const currentAnswer = selectedAnswers[currentQuestion.id];
    if (currentAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    if (currentQuestionIndex < questions.length - 1) {
      animateToNext();
    } else {
      // Quiz completed
      const finalScore =
        currentAnswer === currentQuestion.correctAnswer ? score + 1 : score;
      const percentage = Math.round((finalScore / questions.length) * 100);
      Toast.show({
        type: "success",
        text1: "Quiz tamamlandı!",
        text2: `Doğru: ${finalScore}/${questions.length} (%${percentage})`,
        position: "top",
        visibilityTime: 3000,
      });
      router.back();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      animateToPrevious();
    } else {
      router.back();
    }
  };

  // Add onViewWord handler
  const handleViewWord = () => {
    const word = mockWords.find((w) => w.id === currentQuestion.wordId);
    if (word) {
      showWordDetails(word);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          Bu üniteye ait boşluk doldurma sorusu yok.
        </Text>
      </SafeAreaView>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const isAnswered = answeredQuestions[currentQuestion.id] || false;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isNextButtonDisabled = !selectedAnswer;

  // Add getLineColor function for knowledge level indicator
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

  // Çalışılacaklara ekle fonksiyonu
  const handleAddToDifficult = () => {
    const wordIndex = require("../data/mockData").mockWords.findIndex(
      (w) => w.id === currentQuestion.wordId || w.id === currentQuestion.id
    );
    if (wordIndex !== -1) {
      const current =
        require("../data/mockData").mockWords[wordIndex].isDifficult;
      require("../data/mockData").mockWords[wordIndex].isDifficult = !current;
      setIsDifficult(!current);
      Toast.show({
        type: current ? "info" : "success",
        text1: current
          ? `${currentQuestion.correctAnswer} kelimesi çalışılacaklar listesinden çıkarıldı`
          : `${currentQuestion.correctAnswer} kelimesi çalışılacaklar listesine eklendi`,
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 80,
        swipeable: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Boşluk Doldurma</Text>
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
                          (
                            mockWords.find(
                              (w) => w.id === currentQuestion.wordId
                            ) || {}
                          ).knowledgeLevel
                        ),
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={
                    isAnswered
                      ? option === currentQuestion.correctAnswer
                        ? styles.correctOption
                        : selectedAnswer === option
                        ? styles.wrongOption
                        : styles.optionButton
                      : selectedAnswer === option
                      ? styles.selectedOption
                      : styles.optionButton
                  }
                  onPress={() => handleSelectAnswer(option)}
                  disabled={isAnswered}
                >
                  <Text
                    style={
                      isAnswered
                        ? option === currentQuestion.correctAnswer
                          ? styles.correctOptionText
                          : selectedAnswer === option
                          ? styles.wrongOptionText
                          : styles.optionText
                        : selectedAnswer === option
                        ? styles.selectedOptionText
                        : styles.optionText
                    }
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* View Word Button - appears when answer is wrong */}
            {isAnswered && selectedAnswer !== currentQuestion.correctAnswer && (
              <View style={styles.viewWordButtonContainer}>
                <TouchableOpacity
                  style={styles.viewWordButton}
                  onPress={handleViewWord}
                >
                  <Ionicons
                    name="book-outline"
                    size={16}
                    color="#fff"
                    style={styles.viewWordIcon}
                  />
                  <Text style={styles.viewWordButtonText}>Kelimeye Gözat</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Animated.View>
      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.backNavButton]}
          onPress={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>Geri</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextNavButton,
            isNextButtonDisabled && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={isNextButtonDisabled}
        >
          <Text style={[styles.navButtonText, styles.nextButtonText]}>
            {isLastQuestion ? "Bitir" : "İleri"}
          </Text>
        </TouchableOpacity>
      </View>
      {ActionSheetComponent}
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
    backgroundColor: "#45B7D1",
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
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: "#45B7D1",
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
    marginTop: 20,
    paddingHorizontal: 20,
  },
  questionBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  qcTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
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
  questionText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 24,
    textAlign: "justify",
    lineHeight: 24, // veya 1.3 * fontSize
  },
  optionsContainer: {
    gap: 16,
    width: "100%",
  },
  optionButton: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#45B7D1",
    borderColor: "#45B7D1",
  },
  correctOption: {
    backgroundColor: "#d4edda",
    borderColor: "#28a745",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  wrongOption: {
    backgroundColor: "#f8d7da",
    borderColor: "#dc3545",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  selectedOptionText: {
    color: "#fff",
  },
  correctOptionText: {
    color: "#155724",
    fontWeight: "600",
  },
  wrongOptionText: {
    color: "#721c24",
    fontWeight: "600",
  },
  navigationContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    gap: 15,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  backNavButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  nextNavButton: {
    backgroundColor: "#45B7D1",
  },
  disabledButton: {
    backgroundColor: "#e9ecef",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
  },
  nextButtonText: {
    color: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 50,
  },
  viewWordButtonContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  viewWordButton: {
    backgroundColor: "#6c757d",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewWordButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  viewWordIcon: {
    marginTop: 2,
  },
});

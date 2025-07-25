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
import useWordActionSheet from "../components/WordActionSheet";
import { mockUnits, mockWords } from "../data/mockData";
import { Word } from "../types";

const { width: screenWidth } = Dimensions.get("window");

interface QuizQuestion {
  id: string;
  word: Word;
  question: string;
  correctAnswer: string;
  options: string[];
}

interface QuestionCardProps {
  question: QuizQuestion;
  onSelectAnswer: (answer: string) => void;
  selectedAnswer?: string;
  isAnswered: boolean;
  slideAnim: Animated.Value;
  onViewWord?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onSelectAnswer,
  selectedAnswer,
  isAnswered,
  slideAnim,
  onViewWord,
}) => {
  const tickAnim = useRef(new Animated.Value(0)).current;

  // isDifficult state for immediate UI update
  const [isDifficult, setIsDifficult] = React.useState(
    question.word.isDifficult
  );
  React.useEffect(() => {
    setIsDifficult(question.word.isDifficult);
  }, [question.word.id]);

  React.useEffect(() => {
    if (isAnswered) {
      Animated.spring(tickAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [isAnswered]);

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

  const getOptionStyle = (option: string) => {
    if (!isAnswered) {
      return selectedAnswer === option
        ? styles.selectedOption
        : styles.optionButton;
    }

    if (option === question.correctAnswer) {
      return styles.correctOption;
    }

    if (selectedAnswer === option && option !== question.correctAnswer) {
      return styles.wrongOption;
    }

    return styles.optionButton;
  };

  const getOptionTextStyle = (option: string) => {
    if (!isAnswered) {
      return selectedAnswer === option
        ? styles.selectedOptionText
        : styles.optionText;
    }

    if (option === question.correctAnswer) {
      return styles.correctOptionText;
    }

    if (selectedAnswer === option && option !== question.correctAnswer) {
      return styles.wrongOptionText;
    }

    return styles.optionText;
  };

  // Çalışılacaklara ekle fonksiyonu
  const handleAddToDifficult = () => {
    const wordIndex = require("../data/mockData").mockWords.findIndex(
      (w) => w.id === question.word.id
    );
    if (wordIndex !== -1) {
      const current =
        require("../data/mockData").mockWords[wordIndex].isDifficult;
      require("../data/mockData").mockWords[wordIndex].isDifficult = !current;
      setIsDifficult(!current);
      Toast.show({
        type: current ? "info" : "success",
        text1: current
          ? `${question.word.french} kelimesi çalışılacaklar listesinden çıkarıldı`
          : `${question.word.french} kelimesi çalışılacaklar listesine eklendi`,
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 80,
        swipeable: true,
      });
    }
  };

  return (
    <Animated.View
      style={[
        styles.questionContainer,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <View
        style={{
          height: "80%",
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 10,
        }}
      >
        {/* Knowledge Level Indicator - sağ üst köşe */}
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
                        question.word.knowledgeLevel
                      ),
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* French Word - Large and Bold */}
        <View style={styles.wordContainer}>
          <Text style={styles.frenchWord}>{question.word.french}</Text>
          {isAnswered && (
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
              {selectedAnswer === question.correctAnswer ? (
                <Ionicons name="checkmark-circle" size={40} color="#28a745" />
              ) : (
                <Ionicons name="close-circle" size={40} color="#dc3545" />
              )}
            </Animated.View>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={getOptionStyle(option)}
              onPress={() => onSelectAnswer(option)}
              disabled={isAnswered}
            >
              <Text style={getOptionTextStyle(option)}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* View Word Button - appears when answer is wrong */}
        {isAnswered &&
          selectedAnswer !== question.correctAnswer &&
          onViewWord && (
            <Animated.View
              style={[
                styles.viewWordButtonContainer,
                {
                  opacity: tickAnim,
                  transform: [
                    {
                      translateY: tickAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.viewWordButton}
                onPress={onViewWord}
              >
                <Ionicons
                  name="book-outline"
                  size={16}
                  color="#fff"
                  style={styles.viewWordIcon}
                />
                <Text style={styles.viewWordButtonText}>Kelimeye Gözat</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
      </View>
    </Animated.View>
  );
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

  console.log(
    `Updated word ${wordId} knowledge level from ${currentLevel} to ${newLevel}`
  );
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

export default function MultipleChoiceQuizScreen() {
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
  const { showWordDetails, ActionSheetComponent } = useWordActionSheet();
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  // Remove local correctStreaks state

  const unit = mockUnits.find((u) => u.id === unitId);
  const unitWords = mockWords.filter((word) => word.unit === unitId);
  const category = unit
    ? require("../data/mockData").mockCategories.find(
        (c: any) => c.id === unit.categoryId
      )
    : undefined;

  // Helper to shuffle array
  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Generate quiz questions from unit words - only once on mount
  const [questions] = useState(() => {
    // Shuffle the words so the order of questions is random each time
    const shuffledWords = shuffle(unitWords);
    return shuffledWords.map((word, index) => {
      // Get other words from the same unit for wrong options
      const otherWords = shuffledWords.filter((w) => w.id !== word.id);
      const wrongOptions = otherWords.map((w) => w.turkish).slice(0, 3); // Take 3 wrong options

      // If we don't have enough wrong options, add some generic ones
      const genericOptions = ["Bilmiyorum", "Hatırlamıyorum", "Emin değilim"];
      const additionalOptions = genericOptions.slice(
        0,
        3 - wrongOptions.length
      );

      // Create options array and shuffle it
      const options = shuffle(
        [word.turkish, ...wrongOptions, ...additionalOptions].slice(0, 4)
      );

      return {
        id: `q${index + 1}`,
        word,
        question: word.french, // Just the French word
        correctAnswer: word.turkish,
        options,
      };
    });
  });

  const currentQuestion = questions[currentQuestionIndex];
  const currentKnowledgeLevel = currentQuestion.word.knowledgeLevel;

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

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
    setAnsweredQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: true,
    }));

    const wordIndex = mockWords.findIndex(
      (w) => w.id === currentQuestion.word.id
    );
    if (answer === currentQuestion.correctAnswer) {
      if (wordIndex !== -1) {
        let streak = mockWords[wordIndex].correctStreak || 0;
        streak += 1;
        console.log("Streak for", currentQuestion.word.id, ":", streak);
        if (streak >= 3) {
          console.log("Streak 3 oldu, knowledge level artırılıyor");
          increaseKnowledgeLevel(currentQuestion.word.id);
          streak = 0;
        }
        mockWords[wordIndex].correctStreak = streak;
      }
      setIsAutoAdvancing(true);
      setTimeout(() => {
        setIsAutoAdvancing(false);
        if (currentQuestionIndex < questions.length - 1) {
          handleNext();
        }
      }, 800); // 0.8 seconds delay
    } else {
      // Reset streak and decrease knowledge level
      if (wordIndex !== -1) {
        mockWords[wordIndex].correctStreak = 0;
      }
      decreaseKnowledgeLevel(currentQuestion.word.id);
    }
  };

  const handleViewWord = () => {
    const handleAddToDifficult = () => {
      console.log("Zor kelimelere eklendi:", currentQuestion.word.french);
    };
    showWordDetails(currentQuestion.word, handleAddToDifficult);
  };

  const animateToNext = () => {
    // Slide out to left
    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Reset position and slide in from right
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
    // Slide out to right
    Animated.timing(slideAnim, {
      toValue: screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Reset position and slide in from left
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
      // Quiz completed - show results
      const finalScore =
        currentAnswer === currentQuestion.correctAnswer ? score + 1 : score;
      const percentage = Math.round((finalScore / questions.length) * 100);

      console.log("Quiz completed:", {
        totalQuestions: questions.length,
        correctAnswers: finalScore,
        percentage,
      });

      // Navigate back or to results page
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

  const handleBackPress = () => {
    router.back();
  };

  if (!unit || !currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Ünite bulunamadı</Text>
      </SafeAreaView>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const isAnswered = answeredQuestions[currentQuestion.id] || false;

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isNextButtonDisabled =
    !selectedAnswer || (!isLastQuestion && isAutoAdvancing);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {unit && category ? `${category.name} • ${unit.name}` : "Quiz"}
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
      <QuestionCard
        question={currentQuestion}
        onSelectAnswer={handleSelectAnswer}
        selectedAnswer={selectedAnswer}
        isAnswered={isAnswered}
        slideAnim={slideAnim}
        onViewWord={handleViewWord}
      />

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.backNavButton]}
          onPress={handleBack}
          disabled={currentQuestionIndex === 0 || isAutoAdvancing}
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
    backgroundColor: "#FF6B35",
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
    backgroundColor: "#FF6B35",
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
  wordContainer: {
    alignItems: "center",
    marginBottom: 20,
    minHeight: 100,
  },
  frenchWord: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
  },
  iconContainer: {
    marginTop: 10,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  correctOption: {
    backgroundColor: "#d4edda",
    borderColor: "#28a745",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  wrongOption: {
    backgroundColor: "#f8d7da",
    borderColor: "#dc3545",
    paddingVertical: 16,
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
  viewWordButtonContainer: {
    alignItems: "center",
    marginTop: 20,
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
    backgroundColor: "#007AFF",
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
  knowledgeLevelCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  floatingKnowledgeLevelIndicator: {
    position: "absolute",
    top: 160,
    right: 24,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    alignItems: "center",
  },
  knowledgeLevelLine: {
    width: 24,
    height: 5,
    borderRadius: 2,
    marginVertical: 2,
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
  qcTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    justifyContent: "space-between",
  },
  knowledgeLevelIndicator: {
    flexDirection: "column",
    gap: 0.5,
    //marginRight: 2,
    //marginTop: 2,
    alignItems: "flex-end",
    minHeight: 24,
  },
});

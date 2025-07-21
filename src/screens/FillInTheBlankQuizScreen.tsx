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
      // Shuffle options
      const options = shuffle(
        [q.correctAnswer, ...wrongOptions, ...additionalOptions].slice(0, 4)
      );
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

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
    setAnsweredQuestions((prev) => ({ ...prev, [currentQuestion.id]: true }));
    if (answer === currentQuestion.correctAnswer) {
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          handleNext();
        }
      }, 800);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
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
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  questionBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 24,
    textAlign: "center",
  },
  optionsContainer: {
    gap: 16,
    width: "100%",
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
    backgroundColor: "#45B7D1",
    borderColor: "#45B7D1",
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
});

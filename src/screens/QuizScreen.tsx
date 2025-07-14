import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockWords } from "../data/mockData";
import { QuizQuestion } from "../types";
import { colors } from "../utils/colors";

export default function QuizScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = () => {
    const newQuestions: QuizQuestion[] = [];
    const shuffledWords = [...mockWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    shuffledWords.forEach((word, index) => {
      const questionTypes: ("translation" | "pronunciation" | "example")[] = [
        "translation",
        "pronunciation",
        "example",
      ];

      const questionType =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];

      let question: string;
      let correctAnswer: string;
      let options: string[];

      switch (questionType) {
        case "translation":
          question = `"${word.french}" kelimesinin Türkçe anlamı nedir?`;
          correctAnswer = word.turkish;
          options = [
            word.turkish,
            mockWords[Math.floor(Math.random() * mockWords.length)].turkish,
            mockWords[Math.floor(Math.random() * mockWords.length)].turkish,
            mockWords[Math.floor(Math.random() * mockWords.length)].turkish,
          ];
          break;
        case "pronunciation":
          question = `"${word.french}" kelimesinin okunuşu nedir?`;
          correctAnswer = word.pronunciation;
          options = [
            word.pronunciation,
            mockWords[Math.floor(Math.random() * mockWords.length)]
              .pronunciation,
            mockWords[Math.floor(Math.random() * mockWords.length)]
              .pronunciation,
            mockWords[Math.floor(Math.random() * mockWords.length)]
              .pronunciation,
          ];
          break;
        case "example":
          question = `"${word.french}" kelimesi hangi cümlede kullanılmıştır?`;
          correctAnswer = word.example;
          options = [
            word.example,
            mockWords[Math.floor(Math.random() * mockWords.length)].example,
            mockWords[Math.floor(Math.random() * mockWords.length)].example,
            mockWords[Math.floor(Math.random() * mockWords.length)].example,
          ];
          break;
      }

      // Remove duplicates and shuffle options
      options = [...new Set(options)]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

      newQuestions.push({
        id: index.toString(),
        question,
        correctAnswer,
        options,
        wordId: word.id,
        type: questionType,
      });
    });

    setQuestions(newQuestions);
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const currentQuestion = questions[currentQuestionIndex];
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      // Quiz completed
      const percentage = Math.round((score / questions.length) * 100);
      Alert.alert(
        "Quiz Tamamlandı!",
        `Skorunuz: ${score}/${questions.length} (${percentage}%)\n\n${
          percentage >= 80
            ? "Harika! Çok iyi gidiyorsunuz!"
            : percentage >= 60
            ? "İyi! Biraz daha çalışmanız gerekiyor."
            : "Daha fazla çalışmanız gerekiyor. Pes etmeyin!"
        }`,
        [
          {
            text: "Yeniden Başla",
            onPress: () => {
              setCurrentQuestionIndex(0);
              setScore(0);
              setSelectedAnswer(null);
              setIsAnswered(false);
              setIsCorrect(false);
              generateQuestions();
            },
          },
          { text: "Ana Sayfaya Dön", style: "cancel" },
        ]
      );
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Quiz hazırlanıyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quiz</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1} / {questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Skor: {score}</Text>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === option && styles.selectedOption,
                isAnswered &&
                  option === currentQuestion.correctAnswer &&
                  styles.correctOption,
                isAnswered &&
                  selectedAnswer === option &&
                  option !== currentQuestion.correctAnswer &&
                  styles.wrongOption,
              ]}
              onPress={() => handleAnswerSelect(option)}
              disabled={isAnswered}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedAnswer === option && styles.selectedOptionText,
                  isAnswered &&
                    option === currentQuestion.correctAnswer &&
                    styles.correctOptionText,
                  isAnswered &&
                    selectedAnswer === option &&
                    option !== currentQuestion.correctAnswer &&
                    styles.wrongOptionText,
                ]}
              >
                {option}
              </Text>
              {isAnswered && option === currentQuestion.correctAnswer && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                />
              )}
              {isAnswered &&
                selectedAnswer === option &&
                option !== currentQuestion.correctAnswer && (
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.error}
                  />
                )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback */}
        {isAnswered && (
          <View style={styles.feedbackContainer}>
            <View
              style={[
                styles.feedbackCard,
                isCorrect ? styles.correctFeedback : styles.wrongFeedback,
              ]}
            >
              <Ionicons
                name={isCorrect ? "checkmark-circle" : "close-circle"}
                size={24}
                color={isCorrect ? colors.success : colors.error}
              />
              <Text
                style={[
                  styles.feedbackText,
                  isCorrect
                    ? styles.correctFeedbackText
                    : styles.wrongFeedbackText,
                ]}
              >
                {isCorrect ? "Doğru!" : "Yanlış!"}
              </Text>
            </View>
          </View>
        )}

        {/* Next Button */}
        {isAnswered && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < questions.length - 1
                ? "Sonraki Soru"
                : "Quiz'i Bitir"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.surface} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  questionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    color: colors.text,
    textAlign: "center",
    lineHeight: 26,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  optionButton: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  correctOption: {
    borderColor: colors.success,
    backgroundColor: colors.success + "10",
  },
  wrongOption: {
    borderColor: colors.error,
    backgroundColor: colors.error + "10",
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: "500",
  },
  correctOptionText: {
    color: colors.success,
    fontWeight: "500",
  },
  wrongOptionText: {
    color: colors.error,
    fontWeight: "500",
  },
  feedbackContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  feedbackCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  correctFeedback: {
    backgroundColor: colors.success + "10",
    borderColor: colors.success,
    borderWidth: 1,
  },
  wrongFeedback: {
    backgroundColor: colors.error + "10",
    borderColor: colors.error,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "500",
  },
  correctFeedbackText: {
    color: colors.success,
  },
  wrongFeedbackText: {
    color: colors.error,
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.surface,
  },
});

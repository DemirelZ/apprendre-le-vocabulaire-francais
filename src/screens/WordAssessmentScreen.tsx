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
import { mockUnits, mockWords } from "../data/mockData";
import { Word } from "../types";

// Mock data güncelleme fonksiyonu (ileride Firebase ile değiştirilecek)
const updateWordKnowledgeLevel = (wordId: string, level: string) => {
  const wordIndex = mockWords.findIndex((word) => word.id === wordId);
  if (wordIndex !== -1) {
    mockWords[wordIndex].knowledgeLevel = level as
      | "dont-know"
      | "somewhat"
      | "learned";
    console.log(`Updated word ${wordId} knowledge level to: ${level}`);
  }
};

const { width: screenWidth } = Dimensions.get("window");

interface KnowledgeLevel {
  id: string;
  name: string;
  color: string;
  lines: number;
}

const knowledgeLevels: KnowledgeLevel[] = [
  { id: "dont-know", name: "Bilmiyorum", color: "#dc3545", lines: 1 },
  { id: "somewhat", name: "Biraz", color: "#ffc107", lines: 2 },
  { id: "learned", name: "Öğrendim", color: "#28a745", lines: 3 },
];

interface WordAssessmentProps {
  word: Word;
  onSelectLevel: (level: string) => void;
  selectedLevel?: string;
  slideAnim: Animated.Value;
}

const WordAssessment: React.FC<WordAssessmentProps> = ({
  word,
  onSelectLevel,
  selectedLevel,
  slideAnim,
}) => {
  return (
    <Animated.View
      style={[
        styles.wordContainer,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* French Word */}
        <Text style={styles.frenchWord}>{word.french}</Text>

        {/* Turkish Meaning */}
        <Text style={styles.turkishMeaning}>{word.turkish}</Text>

        {/* Image Placeholder */}
        <View style={styles.imageContainer}>
          <Text style={styles.imagePlaceholder}>🖼️</Text>
          <Text style={styles.imageText}>Kelime Resmi</Text>
        </View>

        {/* Example Sentence */}
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>Örnek Cümle:</Text>
          <Text style={styles.exampleSentence}>{word.example}</Text>
          <Text style={styles.exampleTranslation}>Türkçe: {word.turkish}</Text>
        </View>

        {/* Synonyms */}
        <View style={styles.synonymsContainer}>
          <Text style={styles.synonymsTitle}>Eş Anlamlılar:</Text>
          <Text style={styles.synonymsText}>{word.french} (aynı kelime)</Text>
        </View>

        {/* Knowledge Level Assessment */}
        <View style={styles.assessmentContainer}>
          <Text style={styles.assessmentTitle}>
            Bu kelimeyi ne seviyede biliyorsun?
          </Text>

          <View style={styles.levelOptions}>
            {knowledgeLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelOption,
                  selectedLevel === level.id && styles.selectedLevel,
                ]}
                onPress={() => onSelectLevel(level.id)}
              >
                <View style={styles.levelIndicator}>
                  {Array.from({ length: level.lines }, (_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.levelLine,
                        { backgroundColor: level.color },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.levelText}>{level.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

export default function WordAssessmentScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const router = useRouter();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordLevels, setWordLevels] = useState<Record<string, string>>({});
  const slideAnim = useRef(new Animated.Value(0)).current;

  const unit = mockUnits.find((u) => u.id === unitId);
  const unitWords = mockWords.filter((word) => word.unit === unitId);

  const currentWord = unitWords[currentWordIndex];

  const handleLevelSelect = (level: string) => {
    if (currentWord) {
      setWordLevels((prev) => ({
        ...prev,
        [currentWord.id]: level,
      }));
      updateWordKnowledgeLevel(currentWord.id, level);
    }
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
      setCurrentWordIndex(currentWordIndex + 1);

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
      setCurrentWordIndex(currentWordIndex - 1);

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (currentWordIndex < unitWords.length - 1) {
      animateToNext();
    } else {
      // Assessment completed - show summary
      const summary = {
        totalWords: unitWords.length,
        dontKnow: unitWords.filter(
          (word) => word.knowledgeLevel === "dont-know"
        ).length,
        somewhat: unitWords.filter((word) => word.knowledgeLevel === "somewhat")
          .length,
        learned: unitWords.filter((word) => word.knowledgeLevel === "learned")
          .length,
      };

      console.log("Assessment completed:", summary);
      console.log("All word levels:", wordLevels);

      router.back();
    }
  };

  const handleBack = () => {
    if (currentWordIndex > 0) {
      animateToPrevious();
    } else {
      router.back();
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  if (!unit || !currentWord) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Ünite bulunamadı</Text>
      </SafeAreaView>
    );
  }

  const progress = ((currentWordIndex + 1) / unitWords.length) * 100;
  const selectedLevel = wordLevels[currentWord.id];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kendini Değerlendir</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentWordIndex + 1}/{unitWords.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Word Assessment */}
      <WordAssessment
        word={currentWord}
        onSelectLevel={handleLevelSelect}
        selectedLevel={selectedLevel}
        slideAnim={slideAnim}
      />

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.backNavButton]}
          onPress={handleBack}
          disabled={currentWordIndex === 0}
        >
          <Text style={styles.navButtonText}>Geri</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextNavButton,
            !selectedLevel && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!selectedLevel}
        >
          <Text style={[styles.navButtonText, styles.nextButtonText]}>
            {currentWordIndex === unitWords.length - 1 ? "Bitir" : "İleri"}
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
    backgroundColor: "#fff",
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
    color: "#007AFF",
    fontWeight: "500",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    flex: 1,
    textAlign: "center",
  },
  progressContainer: {
    position: "absolute",
    right: 20,
  },
  progressText: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "600",
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e9ecef",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  wordContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  frenchWord: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "left",
    marginTop: 20,
    marginBottom: 10,
  },
  turkishMeaning: {
    fontSize: 20,
    color: "#6c757d",
    textAlign: "left",
    marginBottom: 25,
    fontWeight: "300",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  imagePlaceholder: {
    fontSize: 60,
    marginBottom: 10,
  },
  imageText: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
  },
  exampleContainer: {
    marginBottom: 25,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  exampleSentence: {
    fontSize: 16,
    color: "#1a1a1a",
    fontStyle: "italic",
    marginBottom: 8,
    lineHeight: 22,
  },
  exampleTranslation: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
  },
  synonymsContainer: {
    marginBottom: 30,
  },
  synonymsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  synonymsText: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
    lineHeight: 20,
  },
  assessmentContainer: {
    marginBottom: 30,
  },
  assessmentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "center",
  },
  levelOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  levelOption: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    minHeight: 80,
  },
  selectedLevel: {
    borderColor: "#007AFF",
    backgroundColor: "#f8f9ff",
  },
  levelIndicator: {
    marginBottom: 8,
    gap: 2,
  },
  levelLine: {
    height: 4,
    borderRadius: 2,
    marginBottom: 2,
    width: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
    textAlign: "center",
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
});

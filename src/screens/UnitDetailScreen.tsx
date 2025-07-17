import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QuizBottomButtons from "../components/QuizBottomButtons";
import useWordActionSheet from "../components/WordActionSheet";
import { mockUnits, mockWords } from "../data/mockData";
import { Word } from "../types";

interface WordListItemProps {
  word: Word;
  onPress: () => void;
}

const WordListItem: React.FC<WordListItemProps> = ({ word, onPress }) => {
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

  return (
    <TouchableOpacity style={styles.wordItem} onPress={onPress}>
      <View style={styles.wordContent}>
        {/* Knowledge Level Indicator - Left Side */}
        <View style={styles.knowledgeLevelIndicator}>
          {Array.from({ length: 3 }, (_, index) => (
            <View
              key={index}
              style={[
                styles.knowledgeLevelLine,
                {
                  backgroundColor: getLineColor(index, word.knowledgeLevel),
                },
              ]}
            />
          ))}
        </View>

        {/* Image container */}
        {word.image && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: word.image }}
              style={styles.wordImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.wordMainInfo}>
          <View style={styles.wordTextContainer}>
            <Text style={styles.wordFrench}>{word.french}</Text>
            <Text style={styles.wordTurkish}>{word.turkish}</Text>
            <Text style={styles.wordPronunciation}>[{word.pronunciation}]</Text>
          </View>

          <View style={styles.wordStatusContainer}>
            {word.isLearned && (
              <View style={styles.learnedBadge}>
                <Text style={styles.learnedText}>✓</Text>
              </View>
            )}
            {word.isDifficult && (
              <View style={styles.favoriteBadge}>
                <Text style={styles.favoriteText}>★</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function UnitDetailScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const router = useRouter();
  const [hideLearnedWords, setHideLearnedWords] = useState(false);
  const { showWordDetails, ActionSheetComponent } = useWordActionSheet();

  const unit = mockUnits.find((u) => u.id === unitId);
  const allUnitWords = mockWords.filter((word) => word.unit === unitId);

  // Filter words based on hideLearnedWords state
  const unitWords = hideLearnedWords
    ? allUnitWords.filter((word) => word.knowledgeLevel !== "learned")
    : allUnitWords;

  const handleWordPress = (word: Word) => {
    const handleAddToDifficult = () => {
      console.log("Zor kelimelere eklendi:", word.french);
    };
    showWordDetails(word, handleAddToDifficult);
  };

  const handleBackPress = () => {
    router.back();
  };

  const toggleHideLearnedWords = () => {
    setHideLearnedWords(!hideLearnedWords);
  };

  if (!unit) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Ünite bulunamadı</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{unit.name}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.unitInfo}>
          <Text style={styles.unitDescription}>{unit.description}</Text>
          <Text style={styles.wordCount}>
            {unitWords.length} kelime
            {hideLearnedWords &&
              allUnitWords.length !== unitWords.length &&
              ` (${allUnitWords.length - unitWords.length} gizli)`}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kelimeler</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() =>
              router.push({
                pathname: "/word-assessment",
                params: { unitId: unitId },
              })
            }
            activeOpacity={0.8}
          >
            <View style={styles.startButtonContent}>
              <View style={styles.startButtonIconContainer}>
                <Ionicons name="analytics" size={20} color="#fff" />
              </View>
              <View style={styles.startButtonTextContainer}>
                <Text style={styles.startButtonTitle}>
                  Ne Kadar Biliyorsun?
                </Text>
                <Text style={styles.startButtonSubtitle}>
                  Bilgi Seviyeni Test Et
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="rgba(255,255,255,0.8)"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Hide Learned Words Checkbox */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={toggleHideLearnedWords}
          >
            <View
              style={[
                styles.checkbox,
                hideLearnedWords && styles.checkboxChecked,
              ]}
            >
              {hideLearnedWords && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>Bildiğin kelimeleri gizle</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={unitWords}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WordListItem word={item} onPress={() => handleWordPress(item)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
      <QuizBottomButtons
        onMultipleChoice={() =>
          router.push({
            pathname: "/multiple-choice-quiz",
            params: { unitId: unitId },
          })
        }
        onFillInTheBlank={() => console.log("Boşluk Doldurma Testine Başla")}
        onWriting={() => console.log("Yazma Testine Başla")}
      />
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  unitInfo: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unitDescription: {
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 8,
    lineHeight: 22,
  },
  wordCount: {
    fontSize: 14,
    color: "#6c757d",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  startButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: "#1E40AF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  startButtonIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonTextContainer: {
    marginRight: 8,
    minWidth: 0,
  },
  startButtonTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  startButtonSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    fontWeight: "500",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 20,
  },
  wordItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f8f9fa",
  },
  wordContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    marginRight: 12,
  },
  wordImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "#f8f9fa",
  },
  wordMainInfo: {
    flex: 1,
  },
  wordTextContainer: {
    marginBottom: 8,
  },
  wordFrench: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  wordTurkish: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  wordPronunciation: {
    fontSize: 12,
    color: "#007AFF",
    fontStyle: "italic",
  },
  wordStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  learnedBadge: {
    backgroundColor: "#d4edda",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c3e6cb",
  },
  learnedText: {
    fontSize: 12,
    color: "#155724",
    fontWeight: "600",
  },
  favoriteBadge: {
    backgroundColor: "#f8d7da",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f5c6cb",
  },
  favoriteText: {
    fontSize: 12,
    color: "#721c24",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: "flex-end",
  },
  actionSheetContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  notch: {
    width: 40,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  contentSection: {
    marginBottom: 25,
  },
  frenchWord: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "left",
    marginBottom: 8,
  },
  turkishMeaning: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "left",
    marginBottom: 20,
    fontWeight: "300",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    height: 80,
    marginBottom: 20,
  },
  imagePlaceholderText: {
    fontSize: 40,
  },
  exampleSentence: {
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 8,
    fontStyle: "italic",
    textAlign: "left",
    lineHeight: 22,
  },
  exampleTranslation: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 15,
    textAlign: "left",
    lineHeight: 20,
  },
  synonyms: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
    textAlign: "left",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "column",
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  primaryButtonText: {
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e0e0e0",
  },
  cancelButtonText: {
    color: "#6c757d",
  },
  knowledgeLevelIndicator: {
    flexDirection: "column",
    gap: 2,
    marginRight: 15,
    justifyContent: "center",
    minHeight: 40,
  },
  knowledgeLevelLine: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkmark: {
    fontSize: 14,
    color: "#fff",
  },
  checkboxText: {
    fontSize: 14,
    color: "#6c757d",
  },
});

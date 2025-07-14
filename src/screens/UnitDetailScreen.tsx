import { useActionSheet } from "@expo/react-native-action-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { mockUnits, mockWords } from "../data/mockData";
import { Word } from "../types";

interface WordListItemProps {
  word: Word;
  onPress: () => void;
}

const WordListItem: React.FC<WordListItemProps> = ({ word, onPress }) => {
  const getKnowledgeLevelColor = (level?: string) => {
    switch (level) {
      case "dont-know":
        return "#dc3545";
      case "somewhat":
        return "#ffc107";
      case "learned":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  const getKnowledgeLevelLines = (level?: string) => {
    switch (level) {
      case "dont-know":
        return 1;
      case "somewhat":
        return 2;
      case "learned":
        return 3;
      default:
        return 0;
    }
  };

  return (
    <TouchableOpacity style={styles.wordItem} onPress={onPress}>
      <View style={styles.wordContent}>
        {/* Knowledge Level Indicator - Left Side */}
        {word.knowledgeLevel && (
          <View style={styles.knowledgeLevelIndicator}>
            {Array.from(
              { length: getKnowledgeLevelLines(word.knowledgeLevel) },
              (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.knowledgeLevelLine,
                    {
                      backgroundColor: getKnowledgeLevelColor(
                        word.knowledgeLevel
                      ),
                    },
                  ]}
                />
              )
            )}
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
            {word.isFavorite && (
              <View style={styles.favoriteBadge}>
                <Text style={styles.favoriteText}>♥</Text>
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
  const { showActionSheetWithOptions } = useActionSheet();

  const unit = mockUnits.find((u) => u.id === unitId);
  const allUnitWords = mockWords.filter((word) => word.unit === unitId);

  // Filter words based on hideLearnedWords state
  const unitWords = hideLearnedWords
    ? allUnitWords.filter((word) => word.knowledgeLevel !== "learned")
    : allUnitWords;

  const handleWordPress = (word: Word) => {
    const options = ["Favorilere Ekle", "Öğrenildi Olarak İşaretle", "İptal"];
    const cancelButtonIndex = 2;

    // Create a custom message with proper formatting for left alignment
    // Using spaces to create left alignment effect
    const message = `${word.turkish}\n\n${word.example}\n\nTürkçe çevirisi: ${word.turkish}\n\nEş anlamlılar: ${word.french} (aynı kelime)`;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: word.french,
        message: message,
        titleTextStyle: {
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "left",
        },
        messageTextStyle: {
          fontSize: 14,
          textAlign: "left",
          lineHeight: 20,
        },
        containerStyle: {
          paddingHorizontal: 20,
        },
      },
      (buttonIndex?: number) => {
        if (buttonIndex === 0) {
          // Favorilere Ekle
          console.log("Favorilere eklendi:", word.french);
        } else if (buttonIndex === 1) {
          // Öğrenildi Olarak İşaretle
          console.log("Öğrenildi olarak işaretlendi:", word.french);
        }
      }
    );
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
          >
            <Text style={styles.startButtonText}>Ne Kadar Biliyorsun?</Text>
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
            <Text style={styles.checkboxText}>Öğrenilen kelimeleri gizle</Text>
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
    padding: 20,
    marginTop: 15,
    marginBottom: 20,
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
    backgroundColor: "#28a745",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  wordMainInfo: {
    flex: 1,
  },
  wordTextContainer: {
    marginBottom: 8,
  },
  wordFrench: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  wordTurkish: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 4,
  },
  wordPronunciation: {
    fontSize: 14,
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

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { mockUnits, mockWords } from "../data/mockData";
import { Word } from "../types";

const { height: screenHeight } = Dimensions.get("window");

interface WordListItemProps {
  word: Word;
  onPress: () => void;
}

const WordListItem: React.FC<WordListItemProps> = ({ word, onPress }) => {
  return (
    <TouchableOpacity style={styles.wordItem} onPress={onPress}>
      <View style={styles.wordHeader}>
        <Text style={styles.wordFrench}>{word.french}</Text>
        <Text style={styles.wordTurkish}>{word.turkish}</Text>
      </View>

      <Text style={styles.wordPronunciation}>[{word.pronunciation}]</Text>

      <View style={styles.wordStatus}>
        {word.isLearned && (
          <View style={styles.learnedBadge}>
            <Text style={styles.learnedText}>Öğrenildi</Text>
          </View>
        )}
        {word.isFavorite && (
          <View style={styles.favoriteBadge}>
            <Text style={styles.favoriteText}>♥</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

interface CustomActionSheetProps {
  visible: boolean;
  word: Word | null;
  onClose: () => void;
  onAddToFavorites: () => void;
  onMarkAsLearned: () => void;
}

const CustomActionSheet: React.FC<CustomActionSheetProps> = ({
  visible,
  word,
  onClose,
  onAddToFavorites,
  onMarkAsLearned,
}) => {
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible && word) {
      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, word]);

  const handleOverlayPress = () => {
    onClose();
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;

      if (translationY > 100) {
        // Close if dragged down more than 100px
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onClose());
      } else {
        // Snap back to original position
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  if (!word) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity }]}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleOverlayPress}
        >
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.actionSheetContainer,
                {
                  transform: [{ translateY }],
                },
              ]}
            >
              {/* Notch */}
              <View style={styles.notch} />

              {/* Content Section */}
              <View style={styles.contentSection}>
                <Text style={styles.frenchWord}>{word.french}</Text>
                <Text style={styles.turkishMeaning}>{word.turkish}</Text>

                {/* Placeholder for image */}
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>📖</Text>
                </View>

                <Text style={styles.exampleSentence}>{word.example}</Text>
                <Text style={styles.exampleTranslation}>
                  Türkçe çevirisi: {word.turkish}
                </Text>
                <Text style={styles.synonyms}>
                  Eş anlamlılar: {word.french} (aynı kelime)
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onAddToFavorites}
                >
                  <Text style={styles.actionButtonText}>Favorilere Ekle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={onMarkAsLearned}
                >
                  <Text
                    style={[styles.actionButtonText, styles.primaryButtonText]}
                  >
                    Öğrenildi Olarak İşaretle
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text
                    style={[styles.actionButtonText, styles.cancelButtonText]}
                  >
                    İptal
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </PanGestureHandler>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

export default function UnitDetailScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const router = useRouter();
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const unit = mockUnits.find((u) => u.id === unitId);
  const unitWords = mockWords.filter((word) => word.unit === unitId);

  const handleWordPress = (word: Word) => {
    setSelectedWord(word);
    setActionSheetVisible(true);
  };

  const handleCloseActionSheet = () => {
    setActionSheetVisible(false);
    setSelectedWord(null);
  };

  const handleAddToFavorites = () => {
    if (selectedWord) {
      console.log("Favorilere eklendi:", selectedWord.french);
    }
    handleCloseActionSheet();
  };

  const handleMarkAsLearned = () => {
    if (selectedWord) {
      console.log("Öğrenildi olarak işaretlendi:", selectedWord.french);
    }
    handleCloseActionSheet();
  };

  const handleBackPress = () => {
    router.back();
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
          <Text style={styles.wordCount}>{unitWords.length} kelime</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kelimeler</Text>
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Alıştırma Başlat</Text>
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

      <CustomActionSheet
        visible={actionSheetVisible}
        word={selectedWord}
        onClose={handleCloseActionSheet}
        onAddToFavorites={handleAddToFavorites}
        onMarkAsLearned={handleMarkAsLearned}
      />
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
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  wordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  wordFrench: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  wordTurkish: {
    fontSize: 16,
    color: "#6c757d",
  },
  wordPronunciation: {
    fontSize: 14,
    color: "#007AFF",
    fontStyle: "italic",
    marginBottom: 8,
  },
  wordStatus: {
    flexDirection: "row",
    gap: 8,
  },
  learnedBadge: {
    backgroundColor: "#d4edda",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  learnedText: {
    fontSize: 10,
    color: "#155724",
    fontWeight: "600",
  },
  favoriteBadge: {
    backgroundColor: "#f8d7da",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  favoriteText: {
    fontSize: 10,
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
});

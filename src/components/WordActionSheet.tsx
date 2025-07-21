import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import Toast from "react-native-toast-message";
import { Word } from "../types";

interface WordActionSheetProps {
  word: Word | null;
  onAddToDifficult?: () => void;
  onMarkAsLearned?: () => void;
  onClose?: () => void;
}

export const WordActionSheetContent: React.FC<WordActionSheetProps> = ({
  word,
  onAddToDifficult,
  onMarkAsLearned,
  onClose,
}) => {
  // isDifficult state for immediate UI update
  const [isDifficult, setIsDifficult] = React.useState(
    word?.isDifficult ?? false
  );
  React.useEffect(() => {
    if (word && typeof word.isDifficult === "boolean") {
      setIsDifficult(word.isDifficult);
    }
  }, [word && word.id]);
  if (!word) return null;

  const handleToggleDifficult = () => {
    const wordIndex = require("../data/mockData").mockWords.findIndex(
      (w) => w.id === word.id
    );
    if (wordIndex !== -1) {
      const current =
        require("../data/mockData").mockWords[wordIndex].isDifficult;
      require("../data/mockData").mockWords[wordIndex].isDifficult = !current;
      setIsDifficult(!current);
      Toast.show({
        type: current ? "info" : "success",
        text1: current
          ? `${word.french} kelimesi çalışılacaklar listesinden çıkarıldı`
          : `${word.french} kelimesi çalışılacaklar listesine eklendi`,
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 80,
        swipeable: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.wordRow}>
        <Text style={styles.frenchWord}>{word.french}</Text>
        <TouchableOpacity
          onPress={handleToggleDifficult}
          style={styles.starButton}
        >
          <Ionicons
            name={isDifficult ? "star" : "star-outline"}
            size={24}
            color={isDifficult ? "#FFD700" : "#e9ecef"}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.turkishMeaning}>{word.turkish}</Text>
      {/* Görsel */}
      <View style={styles.imageContainer}>
        <Image
          source={
            word.image
              ? { uri: word.image }
              : require("../../assets/images/default-no-image.png")
          }
          style={styles.image}
          onError={() => {}}
        />
      </View>
      {/* Örnek cümle ve çeviri arka planlı kutu */}
      {(word.example || word.exampleTranslation) && (
        <View style={styles.exampleBox}>
          {word.example ? (
            <Text style={styles.example}>{word.example}</Text>
          ) : null}
          {word.exampleTranslation ? (
            <Text style={styles.exampleTranslation}>
              {word.exampleTranslation}
            </Text>
          ) : null}
        </View>
      )}
      {/* Eş anlamlılar */}
      {word.synonyms && word.synonyms.length > 0 ? (
        <View style={styles.exampleBox}>
          <Text style={styles.synonyms}>
            Eş anlamlılar: {word.synonyms.join(", ")}
          </Text>
        </View>
      ) : null}
      {/* Butonlar */}
      {/* Çalışılacaklara Ekle butonu kaldırıldı */}
    </View>
  );
};

const useWordActionSheet = () => {
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [word, setWord] = React.useState<Word | null>(null);
  const [onAddToDifficult, setOnAddToDifficult] = React.useState<
    (() => void) | undefined
  >();
  const [onMarkAsLearned, setOnMarkAsLearned] = React.useState<
    (() => void) | undefined
  >();

  const showWordDetails = useCallback(
    (
      word: Word,
      onAddToDifficultCb?: () => void,
      onMarkAsLearnedCb?: () => void
    ) => {
      setWord(word);
      setOnAddToDifficult(() => onAddToDifficultCb);
      setOnMarkAsLearned(() => onMarkAsLearnedCb);
      actionSheetRef.current?.show();
    },
    []
  );

  const handleClose = () => {
    actionSheetRef.current?.hide();
    setWord(null);
  };

  const ActionSheetComponent = (
    <ActionSheet ref={actionSheetRef} gestureEnabled>
      <WordActionSheetContent
        word={word}
        onAddToDifficult={() => {
          if (onAddToDifficult) onAddToDifficult();
          handleClose();
        }}
        onMarkAsLearned={() => {
          if (onMarkAsLearned) onMarkAsLearned();
          handleClose();
        }}
        onClose={handleClose}
      />
    </ActionSheet>
  );

  return { showWordDetails, ActionSheetComponent };
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
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
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholder: {
    fontSize: 48,
    marginBottom: 8,
  },
  exampleBox: {
    backgroundColor: "#f5f6fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  example: {
    fontSize: 16,
    color: "#333",
    textAlign: "left",
    marginBottom: 4,
    fontWeight: "500",
  },
  exampleTranslation: {
    fontSize: 15,
    color: "#888",
    textAlign: "left",
    marginBottom: 0,
    fontStyle: "italic",
  },
  synonyms: {
    fontSize: 14,
    color: "#555",
    textAlign: "left",
    marginBottom: 16,
  },
  fancyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  fancyButtonText: {
    color: "#fff",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  starButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default useWordActionSheet;

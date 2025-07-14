import { useActionSheet } from "@expo/react-native-action-sheet";
import { Word } from "../types";

const useWordActionSheet = () => {
  const { showActionSheetWithOptions } = useActionSheet();

  const showWordDetails = (
    word: Word,
    onAddToFavorites?: () => void,
    onMarkAsLearned?: () => void
  ) => {
    const options = ["Favorilere Ekle", "Öğrenildi Olarak İşaretle", "İptal"];
    const cancelButtonIndex = 2;

    // Build message with improved formatting
    let message = "";

    // Turkish meaning
    if (word.turkish) {
      message += `${word.turkish}\n\n`;
    }

    // Image placeholder (will be handled by custom component later)
    message += "🖼️\n\n";

    // French example sentence
    if (word.example) {
      message += `${word.example}\n\n`;
    }

    // Turkish translation of example
    if (word.exampleTranslation) {
      message += `${word.exampleTranslation}\n\n`;
    }

    // Synonyms
    if (word.synonyms && word.synonyms.length > 0) {
      message += `Eş anlamlılar: ${word.synonyms.join(", ")}`;
    }

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: word.french,
        message: message,
        titleTextStyle: {
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "left",
          color: "#1a1a1a",
        },
        messageTextStyle: {
          fontSize: 16,
          textAlign: "left",
          lineHeight: 24,
          color: "#333333",
        },
        containerStyle: {
          paddingHorizontal: 20,
          paddingVertical: 10,
        },
      },
      (buttonIndex?: number) => {
        if (buttonIndex === 0 && onAddToFavorites) {
          onAddToFavorites();
        } else if (buttonIndex === 1 && onMarkAsLearned) {
          onMarkAsLearned();
        }
      }
    );
  };

  return { showWordDetails };
};

export default useWordActionSheet;

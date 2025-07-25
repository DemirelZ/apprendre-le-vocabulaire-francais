import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContentContainer}
    >
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
              : require("../../assets/images/prochainement.png")
          }
          style={styles.image}
          onError={() => {}}
        />
      </View>
      {/* Tablo: forms/gender/plural/conjugations */}
      {(word.gender || word.plural || word.forms || word.conjugations) && (
        <View style={styles.tableBoxStyled}>
          {/* Sıfatlar için forms tablosu */}
          {word.forms && (
            <View style={styles.tableRowStyled}>
              <Text style={styles.tableLabelStyled}>Çekimler:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.conjTableHeaderRow}>
                    {word.forms.masculine && (
                      <Text style={styles.conjTableHeaderCell}>Eril</Text>
                    )}
                    {word.forms.feminine && (
                      <Text style={styles.conjTableHeaderCell}>Dişil</Text>
                    )}
                    {word.forms.masculinePlural && (
                      <Text style={styles.conjTableHeaderCell}>Eril Çoğul</Text>
                    )}
                    {word.forms.femininePlural && (
                      <Text style={styles.conjTableHeaderCell}>
                        Dişil Çoğul
                      </Text>
                    )}
                  </View>
                  <View style={styles.conjTableRow}>
                    {word.forms.masculine && (
                      <Text style={styles.conjTableCell}>
                        {word.forms.masculine}
                      </Text>
                    )}
                    {word.forms.feminine && (
                      <Text style={styles.conjTableCell}>
                        {word.forms.feminine}
                      </Text>
                    )}
                    {word.forms.masculinePlural && (
                      <Text style={styles.conjTableCell}>
                        {word.forms.masculinePlural}
                      </Text>
                    )}
                    {word.forms.femininePlural && (
                      <Text style={styles.conjTableCell}>
                        {word.forms.femininePlural}
                      </Text>
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
          {/* İsimler için gender/plural tablosu */}
          {(word.gender || word.plural) && (
            <View style={styles.tableRowStyled}>
              <Text style={styles.tableLabelStyled}>
                İsim{"\n"}Özellikleri:
              </Text>
              <View style={{ flex: 1 }}>
                <View style={styles.nounTableHeaderRow}>
                  {word.gender && (
                    <Text style={styles.nounTableHeaderCell}>Cinsiyet</Text>
                  )}
                  {word.plural && (
                    <Text style={styles.nounTableHeaderCell}>Çoğul</Text>
                  )}
                </View>
                <View style={styles.nounTableRow}>
                  {word.gender && (
                    <Text style={styles.nounTableCell}>
                      {word.gender === "masculine"
                        ? "Eril (masculin)"
                        : word.gender === "feminine"
                        ? "Dişil (féminin)"
                        : "Her ikisi"}
                    </Text>
                  )}
                  {word.plural && (
                    <Text style={styles.nounTableCell}>{word.plural}</Text>
                  )}
                </View>
              </View>
            </View>
          )}
          {word.conjugations && (
            <View style={styles.tableRowStyled}>
              <Text style={styles.tableLabelStyled}>Fiil Çekimleri:</Text>
              <View style={{ flex: 1 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    {/* Tablo başlığı: zamirler */}
                    <View style={styles.conjTableHeaderRow}>
                      <Text
                        style={[
                          styles.conjTableHeaderCell,
                          styles.conjTableTenseCell,
                        ]}
                      >
                        Zaman
                      </Text>
                      {["je", "tu", "il", "nous", "vous", "ils"].map(
                        (pronoun) => (
                          <Text
                            key={pronoun}
                            style={styles.conjTableHeaderCell}
                          >
                            {pronoun}
                          </Text>
                        )
                      )}
                    </View>
                    {/* Her zaman için bir satır */}
                    {Object.entries(word.conjugations).map(([tense, forms]) => (
                      <View key={tense} style={styles.conjTableRow}>
                        <Text
                          style={[
                            styles.conjTableCell,
                            styles.conjTableTenseCell,
                          ]}
                        >
                          {tense}
                        </Text>
                        {["je", "tu", "il", "nous", "vous", "ils"].map(
                          (pronoun) => (
                            <Text key={pronoun} style={styles.conjTableCell}>
                              {forms[pronoun] || "-"}
                            </Text>
                          )
                        )}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
        </View>
      )}
      {/* Örnek cümleler tablosu */}
      {word.examples && word.examples.length > 0 && (
        <View style={styles.exampleBoxStyled}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color="#6366F1"
              style={{ marginRight: 10, marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              {word.examples.map((ex, idx) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  <Text style={styles.exampleStyled}>{ex.sentence}</Text>
                  {ex.translationEn && (
                    <Text style={styles.exampleTranslationEnStyled}>
                      {ex.translationEn}
                    </Text>
                  )}
                  {ex.translationTr && (
                    <Text style={styles.exampleTranslationTrStyled}>
                      {ex.translationTr}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
      {/* Eş anlamlılar */}
      {word.synonyms && word.synonyms.length > 0 ? (
        <View style={styles.exampleBoxStyled}>
          <Text style={styles.synonyms}>
            Eş anlamlılar (synonymes): {word.synonyms.join(", ")}
          </Text>
        </View>
      ) : null}
      {/* Butonlar */}
      {/* Çalışılacaklara Ekle butonu kaldırıldı */}
    </ScrollView>
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
  scrollContentContainer: {
    paddingBottom: 32,
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
    width: 120,
    height: 120,
    borderRadius: 6,
    resizeMode: "contain",
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
  exampleTranslationEn: {
    fontSize: 15,
    color: "#007AFF",
    textAlign: "left",
    marginBottom: 0,
    fontStyle: "italic",
  },
  synonyms: {
    fontSize: 14,
    color: "#555",
    textAlign: "left",
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
  exampleBoxStyled: {
    backgroundColor: "#f5f6fa",
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e7ef",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  exampleStyled: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
    textAlign: "left",
  },
  exampleTranslationTrStyled: {
    fontSize: 15,
    color: "#6366F1",
    fontStyle: "italic",
    marginTop: 2,
    marginBottom: 0,
    textAlign: "left",
  },
  exampleTranslationEnStyled: {
    fontSize: 15,
    color: "#007AFF",
    fontStyle: "italic",
    marginTop: 2,
    textAlign: "left",
  },
  tableBoxStyled: {
    backgroundColor: "#f5f6fa",
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e7ef",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  tableRowStyled: {
    flexDirection: "column",
    justifyContent: "flex-start",
    marginBottom: 4,
  },
  tableLabelStyled: {
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
    marginBottom: 8,
  },
  tableValueStyled: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  tableTenseStyled: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "500",
    marginBottom: 2,
  },
  conjTableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e7ef",
    backgroundColor: "#f0f4fa",
    paddingVertical: 2,
    marginBottom: 2,
  },
  conjTableHeaderCell: {
    fontWeight: "700",
    fontSize: 13,
    color: "#6366F1",
    minWidth: 72,
    textAlign: "center",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  conjTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 2,
  },
  conjTableCell: {
    fontSize: 13,
    color: "#222",
    minWidth: 72,
    textAlign: "center",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  conjTableTenseCell: {
    fontWeight: "600",
    color: "#007AFF",
    minWidth: 120,
    textAlign: "left",
    paddingRight: 8,
  },
  nounTableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e7ef",
    backgroundColor: "#f0f4fa",
    paddingVertical: 2,
    marginBottom: 2,
  },
  nounTableHeaderCell: {
    fontWeight: "700",
    fontSize: 13,
    color: "#6366F1",
    minWidth: 110,
    textAlign: "left",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  nounTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 2,
  },
  nounTableCell: {
    fontSize: 13,
    color: "#222",
    minWidth: 110,
    textAlign: "left",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});

export default useWordActionSheet;

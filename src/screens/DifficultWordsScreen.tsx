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
import { WordCard } from "../components/WordCard";
import { mockWords } from "../data/mockData";
import { Word } from "../types";
import { colors } from "../utils/colors";

export default function DifficultWordsScreen() {
  const [words, setWords] = useState<Word[]>(mockWords);
  const [difficultWords, setDifficultWords] = useState<Word[]>([]);

  useEffect(() => {
    updateDifficultWords();
  }, [words]);

  const updateDifficultWords = () => {
    const difficults = words.filter((word) => word.isDifficult);
    setDifficultWords(difficults);
  };

  const handleToggleDifficult = (wordId: string) => {
    setWords((prevWords) =>
      prevWords.map((word) =>
        word.id === wordId ? { ...word, isDifficult: !word.isDifficult } : word
      )
    );
  };

  const handleWordPress = (word: Word) => {
    Alert.alert(word.french, `${word.turkish}\n\nÖrnek: ${word.example}`, [
      { text: "Tamam", style: "default" },
      {
        text: difficultWords.some((w) => w.id === word.id)
          ? "Çalışılacaklardan Çıkar"
          : "Çalışılacaklara Ekle",
        onPress: () => handleToggleDifficult(word.id),
        style: difficultWords.some((w) => w.id === word.id)
          ? "destructive"
          : "default",
      },
    ]);
  };

  const handleRemoveAllDifficult = () => {
    Alert.alert(
      "Tüm Çalışılacakları Kaldır",
      "Tüm çalışılacak kelimeleri kaldırmak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Kaldır",
          style: "destructive",
          onPress: () => {
            setWords((prevWords) =>
              prevWords.map((word) => ({ ...word, isDifficult: false }))
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Çalışılacak Kelimeler</Text>
          {difficultWords.length > 0 && (
            <TouchableOpacity
              style={styles.removeAllButton}
              onPress={handleRemoveAllDifficult}
            >
              <Ionicons name="list-outline" size={20} color={colors.error} />
              <Text style={styles.removeAllText}>Tümünü Kaldır</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Empty State */}
        {difficultWords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>
              Henüz çalışılacak kelimeniz yok
            </Text>
            <Text style={styles.emptyDescription}>
              Kelimeleri çalışılacaklara eklemek için ana sayfaya gidin ve
              &quot;Çalışılacaklara Ekle&quot; butonunu kullanın.
            </Text>
          </View>
        ) : (
          /* Difficult Words List */
          <View style={styles.content}>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {difficultWords.length} çalışılacak kelime
              </Text>
            </View>

            {difficultWords.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onPress={handleWordPress}
                onToggleDifficult={handleToggleDifficult}
                onToggleLearned={() => {}}
              />
            ))}
          </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  removeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
  },
  removeAllText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

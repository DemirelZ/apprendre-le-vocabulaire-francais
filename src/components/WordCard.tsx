import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Word } from "../types";
import { colors } from "../utils/colors";

interface WordCardProps {
  word: Word;
  onPress: (word: Word) => void;
  onToggleDifficult: (wordId: string) => void;
  onToggleLearned: (wordId: string) => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  onPress,
  onToggleDifficult,
  onToggleLearned,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, word.isLearned && styles.learnedCard]}
      onPress={() => onPress(word)}
    >
      <View style={styles.header}>
        <View style={styles.wordInfo}>
          <Text style={styles.frenchWord}>{word.french}</Text>
          <Text style={styles.pronunciation}>[{word.pronunciation}]</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onToggleLearned(word.id)}
          >
            <Ionicons
              name={
                word.isLearned ? "checkmark-circle" : "checkmark-circle-outline"
              }
              size={24}
              color={word.isLearned ? colors.learned : colors.textLight}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onToggleDifficult(word.id)}
          >
            <Ionicons
              name={word.isDifficult ? "star" : "star-outline"}
              size={24}
              color={word.isDifficult ? colors.favorite : colors.textLight}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.turkishWord}>{word.turkish}</Text>

      <Text style={styles.example} numberOfLines={2}>
        {word.example}
      </Text>

      <View style={styles.footer}>
        <View
          style={[
            styles.difficultyBadge,
            styles[`difficulty${word.difficulty}`],
          ]}
        >
          <Text style={styles.difficultyText}>
            {word.difficulty === "beginner"
              ? "Başlangıç"
              : word.difficulty === "intermediate"
              ? "Orta"
              : "İleri"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  learnedCard: {
    opacity: 0.7,
    backgroundColor: colors.borderLight,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  wordInfo: {
    flex: 1,
  },
  frenchWord: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  pronunciation: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  turkishWord: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  example: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultybeginner: {
    backgroundColor: colors.beginner + "20",
  },
  difficultyintermediate: {
    backgroundColor: colors.intermediate + "20",
  },
  difficultyadvanced: {
    backgroundColor: colors.advanced + "20",
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

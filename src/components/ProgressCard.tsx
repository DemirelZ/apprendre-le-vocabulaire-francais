import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { UserProgress } from "../types";
import { colors } from "../utils/colors";

interface ProgressCardProps {
  progress: UserProgress;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ progress }) => {
  const progressPercentage =
    progress.totalWords > 0
      ? Math.round((progress.learnedWords / progress.totalWords) * 100)
      : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>İlerlemeniz</Text>
        <Ionicons name="trophy-outline" size={24} color={colors.secondary} />
      </View>

      <View style={styles.progressBar}>
        <View style={styles.progressBackground}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{progressPercentage}%</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="book-outline" size={20} color={colors.primary} />
          <Text style={styles.statNumber}>{progress.totalWords}</Text>
          <Text style={styles.statLabel}>Toplam</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={colors.learned}
          />
          <Text style={styles.statNumber}>{progress.learnedWords}</Text>
          <Text style={styles.statLabel}>Öğrenilen</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="heart-outline" size={20} color={colors.favorite} />
          <Text style={styles.statNumber}>{progress.favoriteWords}</Text>
          <Text style={styles.statLabel}>Favori</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="flame-outline" size={20} color={colors.warning} />
          <Text style={styles.statNumber}>{progress.streak}</Text>
          <Text style={styles.statLabel}>Seri</Text>
        </View>
      </View>
    </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
    minWidth: 40,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

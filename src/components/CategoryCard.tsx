import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Category } from "../types";
import { colors } from "../utils/colors";

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: category.color }]}
      onPress={() => onPress(category)}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{category.name}</Text>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: category.color + "20" },
            ]}
          >
            <Ionicons name="book-outline" size={20} color={category.color} />
          </View>
        </View>

        <Text style={styles.description}>{category.description}</Text>

        <View style={styles.footer}>
          <View style={styles.wordCount}>
            <Ionicons
              name="document-text-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.wordCountText}>
              {category.wordCount} kelime
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  wordCountText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

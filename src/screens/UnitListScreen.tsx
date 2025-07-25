import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { mockUnits, mockWords } from "../data/mockData";
import { Unit } from "../types";

interface UnitListItemProps {
  unit: Unit;
  onPress: () => void;
}

const UnitListItem: React.FC<UnitListItemProps> = ({ unit, onPress }) => {
  // Calculate learned word count
  const unitWords = mockWords.filter((w) => w.unit === unit.id);
  const learnedCount = unitWords.filter(
    (w) => w.knowledgeLevel === "learned"
  ).length;
  const totalCount = unitWords.length;
  // Get color from mockCategories
  const category = require("../data/mockData").mockCategories.find(
    (cat: any) => cat.id === unit.categoryId
  );
  const color = category?.color || "#4ECDC4";
  const percent = totalCount
    ? Math.round((learnedCount / totalCount) * 100)
    : 0;
  const allLearned = totalCount > 0 && learnedCount === totalCount;
  const learnedBg = allLearned
    ? { backgroundColor: "#e6fae6" }
    : { backgroundColor: "#fff" };
  return (
    <TouchableOpacity
      style={[styles.unitItem, { borderLeftColor: color }, learnedBg]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.unitContent}>
        <View style={styles.unitHeader}>
          <View style={styles.circularProgressContainer}>
            <Svg width={54} height={54}>
              <Circle
                cx={27}
                cy={27}
                r={24}
                stroke="#e9ecef"
                strokeWidth={5}
                fill="none"
              />
              <Circle
                cx={27}
                cy={27}
                r={24}
                stroke={color}
                strokeWidth={5}
                fill="none"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (1 - percent / 100)}
                strokeLinecap="round"
                rotation="-90"
                origin="27,27"
              />
            </Svg>
            <View style={styles.circularProgressTextContainer}>
              <Text style={styles.circularProgressPercent}>{percent}%</Text>
              <Ionicons
                name="book"
                size={18}
                color={color}
                style={{ marginTop: 2 }}
              />
            </View>
          </View>
          <View style={styles.unitInfo}>
            <Text style={styles.unitName}>{unit.name}</Text>
            <Text
              style={[
                styles.learnedCountText,
                allLearned
                  ? { color: "#fff", backgroundColor: "#4CAF50" }
                  : { color: "#6c757d", backgroundColor: "#f1f3f4" },
              ]}
            >
              {learnedCount}/{totalCount} öğrenildi
            </Text>
          </View>
          {allLearned ? (
            <View
              style={[styles.arrowContainer, { backgroundColor: "#4CAF50" }]}
            >
              <Ionicons name="checkmark" size={22} color="#fff" />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function UnitListScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();

  const categoryUnits = mockUnits.filter(
    (unit) => unit.categoryId === categoryId
  );
  const category = mockUnits.find(
    (unit) => unit.categoryId === categoryId
  )?.categoryId;
  // Get color from mockCategories
  const categoryObj = require("../data/mockData").mockCategories.find(
    (cat: any) => cat.id === categoryId
  );
  const color = categoryObj?.color || "#4ECDC4";

  const handleUnitPress = (unit: Unit) => {
    router.push({
      pathname: "/unit-detail",
      params: { unitId: unit.id },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: color }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            minHeight: 70,
          }}
        >
          <Text style={[styles.title, { color: "#fff" }]}>
            {categoryObj?.name || ""}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {categoryUnits.length} ünite •
          {categoryUnits.reduce((acc, unit) => acc + unit.wordCount, 0)} kelime
        </Text>

        <FlatList
          data={categoryUnits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UnitListItem unit={item} onPress={() => handleUnitPress(item)} />
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
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
    borderBottomWidth: 0,
    position: "relative",
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
  subtitle: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 15,
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  unitItem: {
    borderRadius: 14,
    marginVertical: 6,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
    flexDirection: "row",
    borderLeftWidth: 6,
    borderLeftColor: "#4ECDC4",
    position: "relative",
  },
  unitContent: {
    padding: 22,
    flex: 1,
    zIndex: 1,
  },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  circularProgressContainer: {
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    position: "relative",
  },
  circularProgressTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  circularProgressPercent: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 0,
  },
  unitIcon: {
    fontSize: 26,
  },
  unitInfo: {
    flex: 1,
    marginRight: 15,
    gap: 2,
  },
  unitName: {
    fontSize: 20,
    fontWeight: "400",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  unitDescription: {
    fontSize: 15,
    color: "#6c757d",
    lineHeight: 20,
    marginBottom: 4,
  },
  learnedCountText: {
    fontSize: 13,
    fontWeight: "300",
    marginTop: 2,
    backgroundColor: "#f1f3f4",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4ECDC4",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
});

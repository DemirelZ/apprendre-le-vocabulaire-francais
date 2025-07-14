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
import { mockUnits } from "../data/mockData";
import { Unit } from "../types";

interface UnitListItemProps {
  unit: Unit;
  onPress: () => void;
}

const UnitListItem: React.FC<UnitListItemProps> = ({ unit, onPress }) => {
  return (
    <TouchableOpacity style={styles.unitItem} onPress={onPress}>
      <View style={styles.unitContent}>
        <View style={styles.unitHeader}>
          <View style={styles.unitIconContainer}>
            <Text style={styles.unitIcon}>📚</Text>
          </View>
          <View style={styles.unitInfo}>
            <Text style={styles.unitName}>{unit.name}</Text>
            <Text style={styles.unitDescription}>{unit.description}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <Text style={styles.arrowIcon}>→</Text>
          </View>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {category === "verbs" && "Fiiller"}
          {category === "adjectives" && "Sıfatlar"}
          {category === "nouns" && "İsimler"}
          {category === "adverbs" && "Zarflar"}
          {category === "conjunctions" && "Bağlaçlar"}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {categoryUnits.length} ünite •{" "}
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
    backgroundColor: "#fff",
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  unitContent: {
    padding: 20,
  },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unitIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  unitIcon: {
    fontSize: 24,
  },
  unitInfo: {
    flex: 1,
    marginRight: 15,
  },
  unitName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  unitDescription: {
    fontSize: 15,
    color: "#6c757d",
    lineHeight: 22,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#009dff",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});

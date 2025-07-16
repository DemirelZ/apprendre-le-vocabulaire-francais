import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface QuizBottomButtonsProps {
  onMultipleChoice: () => void;
  onFillInTheBlank: () => void;
  onWriting: () => void;
}

const QuizBottomButtons: React.FC<QuizBottomButtonsProps> = ({
  onMultipleChoice,
  onFillInTheBlank,
  onWriting,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bottomButtonBar,
        {
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.bottomButton, styles.leftButton]}
        onPress={onMultipleChoice}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="help-circle" size={24} color="#fff" />
        </View>
        <Text style={styles.buttonTitle}>Çoktan Seçmeli</Text>
        <Text style={styles.buttonSubtitle}>Test</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.bottomButton, styles.middleButton]}
        onPress={onFillInTheBlank}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </View>
        <Text style={styles.buttonTitle}>Boşluk Doldurma</Text>
        <Text style={styles.buttonSubtitle}>Test</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.bottomButton, styles.rightButton]}
        onPress={onWriting}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="create" size={24} color="#fff" />
        </View>
        <Text style={styles.buttonTitle}>Yazma</Text>
        <Text style={styles.buttonSubtitle}>Test</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomButtonBar: {
    flexDirection: "row",
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingTop: 16,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 100,
  },
  bottomButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 16,
  },
  leftButton: {
    backgroundColor: "#FF6B35",
    marginLeft: 8,
  },
  middleButton: {
    backgroundColor: "#4ECDC4",
  },
  rightButton: {
    backgroundColor: "#45B7D1",
    marginRight: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  buttonTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 2,
  },
  buttonSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    fontSize: 12,
    textAlign: "center",
  },
});

export default QuizBottomButtons;

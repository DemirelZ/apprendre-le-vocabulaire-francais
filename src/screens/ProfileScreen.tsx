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
import { ProgressCard } from "../components/ProgressCard";
import { mockUserProgress, mockWords } from "../data/mockData";
import { UserProgress, Word } from "../types";
import { colors } from "../utils/colors";

export default function ProfileScreen() {
  const [words, setWords] = useState<Word[]>(mockWords);
  const [progress, setProgress] = useState<UserProgress>(mockUserProgress);

  useEffect(() => {
    updateProgress();
  }, [words]);

  const updateProgress = () => {
    const learnedWords = words.filter((word) => word.isLearned).length;
    const favoriteWords = words.filter((word) => word.isFavorite).length;

    setProgress({
      ...progress,
      learnedWords,
      favoriteWords,
    });
  };

  const handleResetProgress = () => {
    Alert.alert(
      "İlerlemeyi Sıfırla",
      "Tüm öğrenme ilerlemenizi sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sıfırla",
          style: "destructive",
          onPress: () => {
            setWords((prevWords) =>
              prevWords.map((word) => ({
                ...word,
                isLearned: false,
                isFavorite: false,
              }))
            );
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Veri Dışa Aktar",
      "Bu özellik yakında eklenecek. Firebase entegrasyonu ile birlikte verilerinizi dışa aktarabileceksiniz.",
      [{ text: "Tamam", style: "default" }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "Hakkında",
      "Fransızca Kelime Uygulaması\n\nVersiyon: 1.0.0\n\nBu uygulama Fransızca öğrenmek isteyenler için tasarlanmıştır. Kelimeleri öğrenin, favorilere ekleyin ve quiz ile kendinizi test edin.\n\nGeliştirici: AI Assistant",
      [{ text: "Tamam", style: "default" }]
    );
  };

  const getDifficultyStats = () => {
    const beginner = words.filter(
      (word) => word.difficulty === "beginner"
    ).length;
    const intermediate = words.filter(
      (word) => word.difficulty === "intermediate"
    ).length;
    const advanced = words.filter(
      (word) => word.difficulty === "advanced"
    ).length;

    return { beginner, intermediate, advanced };
  };

  const difficultyStats = getDifficultyStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        {/* Progress Card */}
        <ProgressCard progress={progress} />

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İstatistikler</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: colors.beginner + "20" },
                ]}
              >
                <Ionicons
                  name="leaf-outline"
                  size={24}
                  color={colors.beginner}
                />
              </View>
              <Text style={styles.statNumber}>{difficultyStats.beginner}</Text>
              <Text style={styles.statLabel}>Başlangıç</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: colors.intermediate + "20" },
                ]}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={24}
                  color={colors.intermediate}
                />
              </View>
              <Text style={styles.statNumber}>
                {difficultyStats.intermediate}
              </Text>
              <Text style={styles.statLabel}>Orta</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: colors.advanced + "20" },
                ]}
              >
                <Ionicons
                  name="star-outline"
                  size={24}
                  color={colors.advanced}
                />
              </View>
              <Text style={styles.statNumber}>{difficultyStats.advanced}</Text>
              <Text style={styles.statLabel}>İleri</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleResetProgress}
            >
              <View style={styles.actionContent}>
                <Ionicons
                  name="refresh-outline"
                  size={24}
                  color={colors.error}
                />
                <Text style={styles.actionText}>İlerlemeyi Sıfırla</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textLight}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleExportData}
            >
              <View style={styles.actionContent}>
                <Ionicons
                  name="download-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.actionText}>Veri Dışa Aktar</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textLight}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleAbout}>
              <View style={styles.actionContent}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={colors.info}
                />
                <Text style={styles.actionText}>Hakkında</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textLight}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Firebase Notice */}
        <View style={styles.noticeContainer}>
          <View style={styles.noticeCard}>
            <Ionicons name="cloud-outline" size={24} color={colors.secondary} />
            <Text style={styles.noticeTitle}>Firebase Entegrasyonu</Text>
            <Text style={styles.noticeText}>
              Yakında Firebase entegrasyonu ile verilerinizi bulutta
              saklayabilecek ve cihazlar arasında senkronize edebileceksiniz.
            </Text>
          </View>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionsContainer: {
    paddingHorizontal: 16,
  },
  actionButton: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    color: colors.text,
  },
  noticeContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 20,
  },
  noticeCard: {
    backgroundColor: colors.secondary + "10",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary + "30",
    alignItems: "center",
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

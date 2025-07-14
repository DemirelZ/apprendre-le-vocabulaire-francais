import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../src/utils/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={colors.error}
          style={{ marginBottom: 24 }}
        />
        <Text style={styles.title}>Bu ekran mevcut değil.</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Ana sayfaya dön</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  linkButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  linkText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "bold",
  },
});

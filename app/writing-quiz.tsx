import { Stack } from "expo-router";
import WritingQuizScreen from "../src/screens/WritingQuizScreen";

export default function WritingQuizLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WritingQuizScreen />
    </>
  );
}

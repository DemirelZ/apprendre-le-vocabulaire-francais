import { Stack } from "expo-router";
import FillInTheBlankQuizScreen from "../src/screens/FillInTheBlankQuizScreen";

export default function FillInTheBlankQuizScreenLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FillInTheBlankQuizScreen />
    </>
  );
}

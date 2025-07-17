import { Stack } from "expo-router";
import MultipleChoiceQuizScreen from "../src/screens/MultipleChoiceQuizScreen";

export default function MultipleChoiceQuizLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MultipleChoiceQuizScreen />
    </>
  );
}

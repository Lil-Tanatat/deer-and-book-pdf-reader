import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import PdfRead from "./src";

export default function App() {
  return (
    <View style={styles.container}>
      <PdfRead />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Button,
  TouchableOpacity,
} from "react-native";
import Pdf from "react-native-pdf";
import { usePreventScreenCapture } from "expo-screen-capture";

const PdfReader = ({ pdfUri, onBack }) => {
  usePreventScreenCapture();
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [isPagingEnabled, setIsPagingEnabled] = useState(true);

  const handleSwitchView = () => {
    setIsHorizontal(!isHorizontal);
    setIsPagingEnabled(!isPagingEnabled);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Deer and Book Reader</Text>
      <Text style={styles.debugText}>
        Current PDF URI: {pdfUri || "Not Set"}
      </Text>
      <Button
        title={`Switch to ${isHorizontal ? "Vertical" : "Horizontal"} View`}
        onPress={handleSwitchView}
      />
      <Pdf
        trustAllCerts={false}
        source={{ uri: pdfUri, cache: true }}
        style={styles.pdf}
        horizontal={isHorizontal}
        enablePaging={isPagingEnabled}
        onLoadComplete={(numberOfPages) => {
          console.log(`PDF Loaded - Number of pages: ${numberOfPages}`);
        }}
        onError={(error) => {
          console.error("PDF Load Error:", error);
          alert("Failed to load PDF. Please check the URL and try again.");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: "#000",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 40,
  },
  debugText: {
    fontSize: 14,
    textAlign: "center",
    color: "gray",
    marginBottom: 10,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default PdfReader;

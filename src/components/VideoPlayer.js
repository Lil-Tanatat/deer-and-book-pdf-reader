import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  useWindowDimensions, // Import hook for dynamic dimensions
  StatusBar,
} from "react-native";
import { WebView } from "react-native-webview";
import { usePreventScreenCapture } from "expo-screen-capture"; // Added import

const VideoPlayer = ({ videoUri, onBack }) => {
  usePreventScreenCapture(); // Added screen capture prevention
  const [isLoading, setIsLoading] = useState(true);
  const { width, height } = useWindowDimensions(); // Dynamically adjust dimensions

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="light-content"
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
      <WebView
        source={{ uri: videoUri }}
        style={[styles.webview, { width, height }]} // Adjust size dynamically
        onLoadEnd={() => setIsLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView error: ", nativeEvent);
        }}
      />
      <Text onPress={onBack} style={styles.backButtonText}>
        {"<"} Back to Home
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: StatusBar.currentHeight,
  },
  webview: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default VideoPlayer;

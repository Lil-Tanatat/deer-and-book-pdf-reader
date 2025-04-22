import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";

const VideoPlayer = ({ videoUri, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
      <WebView
        source={{ uri: videoUri }}
        style={styles.webview}
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
  },
  webview: {
    flex: 1,
    width: Dimensions.get("window").width,
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

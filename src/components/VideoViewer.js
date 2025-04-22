import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Video from "react-native-video";
import { usePreventScreenCapture } from "expo-screen-capture";

const VideoViewer = ({ videoUri, onBack }) => {
  usePreventScreenCapture();
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const handleVideoLoad = () => {
    setLoading(false);
  };

  const handleVideoError = (error) => {
    console.error("Video Error:", error);
    setError("Failed to load video");
    setLoading(false);
  };

  const togglePlayPause = () => {
    setPaused(!paused);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>

      <View style={styles.videoContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            paused={paused}
            onLoad={handleVideoLoad}
            onError={handleVideoError}
            resizeMode="contain"
            controls={true}
            repeat={true}
          />
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={togglePlayPause}
        >
          <Text style={styles.controlButtonText}>
            {paused ? "Play" : "Pause"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 20,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 5,
    zIndex: 1,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.7,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
  },
  controls: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    padding: 20,
  },
  controlButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default VideoViewer;

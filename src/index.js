import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Button,
  Linking,
  BackHandler,
  TouchableOpacity,
} from "react-native";
import Pdf from "react-native-pdf";
import * as ScreenCapture from "expo-screen-capture";
import { usePreventScreenCapture } from "expo-screen-capture";
import PdfReader from "./components/PdfReader";
import { WebView } from "react-native-webview";
import VideoPlayer from "./components/VideoPlayer"; // Import the new VideoPlayer component

const App = () => {
  const [pdfUri, setPdfUri] = useState("");
  const [videoUri, setVideoUri] = useState("");
  const [slug, setSlug] = useState("");
  const pdfUriRef = useRef("");

  const handleBackButtonPress = () => {
    if (pdfUri || videoUri) {
      setPdfUri("");
      setVideoUri("");
    } else {
      BackHandler.exitApp();
    }
  };

  const handleReadBook = () => {
    Linking.openURL("https://read.deerandbook.com/home").catch((err) => {
      console.error("Error opening URL:", err);
      alert("Failed to open the website. Please try again.");
    });
  };

  const handleBuyBook = () => {
    Linking.openURL("https://deerandbook.com").catch((err) => {
      console.error("Error opening URL:", err);
      alert("Failed to open the website. Please try again.");
    });
  };

  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync();

    const handleDeepLink = (event) => {
      console.log("Deep link event received:", event);

      if (!event?.url) {
        console.warn("No URL received in deep link event");
        return;
      }

      try {
        const decodedUrl = decodeURIComponent(event.url);
        console.log("Decoded URL:", decodedUrl);

        // Extract parameters from the URL
        const urlParams = new URLSearchParams(decodedUrl.split("?")[1]);
        const slug = urlParams.get("slug");
        const video = urlParams.get("video");

        console.log("Extracted Parameters:", { slug, video });

        if (slug) {
          setSlug(slug);
          const uri = `https://deerandbook.com/protected/storage/app/book/pdf/${slug}`;
          console.log("Setting PDF URI:", uri);
          if (pdfUriRef.current !== uri) {
            pdfUriRef.current = uri;
            setPdfUri(uri);
            setVideoUri(""); // Clear video URI if PDF is being loaded
          }
        } else if (video) {
          console.log("Setting Video URI:", video);
          setVideoUri(video);
          setPdfUri(""); // Clear PDF URI if video is being loaded
        } else {
          console.warn("No valid content parameter found in URL.");
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
      }
    };

    // Listen for deep link events
    const linkingEventListener = Linking.addEventListener(
      "url",
      handleDeepLink
    );

    // Check if the app was opened with a deep link initially
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("Initial URL detected:", url);
        handleDeepLink({ url });
      }
    });

    return () => {
      linkingEventListener.remove();
      setPdfUri("");
      setVideoUri("");
      setSlug("");
    };
  }, []);

  if (pdfUri) {
    return <PdfReader pdfUri={pdfUri} onBack={() => setPdfUri("")} />;
  }

  if (videoUri) {
    return <VideoPlayer videoUri={videoUri} onBack={() => setVideoUri("")} />;
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo-deer.png")}
        style={{ width: 150, height: 120, objectFit: "contain" }}
      />
      <Text style={styles.title}>Deer and Book PDF Reader</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleReadBook}>
          <Text style={styles.buttonText}>Read a Book</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleBuyBook}>
          <Text style={styles.buttonText}>Buy a Book</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            setPdfUri(
              `https://deerandbook.com/protected/storage/app/book/pdf/${slug}`
            )
          }
        >
          <Text style={styles.floatingButtonText}>Read you lastest book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  button: {
    backgroundColor: "#9c60f5",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    minWidth: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default App;

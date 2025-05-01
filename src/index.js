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
  StatusBar,
} from "react-native";
import Pdf from "react-native-pdf";
import * as ScreenCapture from "expo-screen-capture";
import { usePreventScreenCapture } from "expo-screen-capture";
import PdfReader from "./components/PdfReader";
import { WebView } from "react-native-webview";
import VideoPlayer from "./components/VideoPlayer";
import LinearGradient from "react-native-linear-gradient";

const App = () => {
  usePreventScreenCapture();
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
            setVideoUri("");
          }
        } else if (video) {
          console.log("Setting Video URI:", video);
          setVideoUri(video);
          setPdfUri("");
        } else {
          console.warn("No valid content parameter found in URL.");
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
      }
    };

    const linkingEventListener = Linking.addEventListener(
      "url",
      handleDeepLink
    );

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
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="dark-content"
      />
      <LinearGradient colors={["#B347FD", "#7B77F2"]} style={styles.header}>
        <Image
          source={require("../assets/logo-white.png")}
          style={styles.logo}
        />
      </LinearGradient>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={handleReadBook}>
            <LinearGradient
              colors={["#B347FD", "#7B77F2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Image
                source={require("../assets/icon/read.png")}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Read a Book</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBuyBook}>
            <LinearGradient
              colors={["#B347FD", "#7B77F2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Image
                source={require("../assets/icon/cart.png")}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Buy a Book</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.imageContainer}>
        <LinearGradient
          colors={["#7B77F2", "transparent"]}
          style={styles.imageBackground}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
        />
        <Image
          source={require("../assets/image/main.png")}
          style={styles.mainImage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  header: {
    width: "100%",
    height: "40vh",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: StatusBar.currentHeight,
  },
  logo: {
    width: 200,
    height: 150,
    objectFit: "contain",
    padding: 10,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
    position: "absolute",
    top: "45%",
    transform: [{ translateY: -75 }],
    zIndex: 2,
  },
  buttonRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  buttonIcon: {
    width: 40,
    height: 40,
    marginBottom: 12,
    tintColor: "white",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 10,
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
  imageContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 300,
    alignItems: "center",
    zIndex: 1,
  },
  imageBackground: {
    position: "absolute",
    bottom: 0,
    width: "200%",
    height: "200%",
    borderRadius: 0,
    transform: [{ scaleX: 1.5 }],
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});

export default App;

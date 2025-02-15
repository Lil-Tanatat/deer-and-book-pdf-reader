import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Button,
  Modal,
  Linking,
} from "react-native";
import Pdf from "react-native-pdf";
import * as ScreenCapture from "expo-screen-capture";

const PdfRead = () => {
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [isPagingEnabled, setIsPagingEnabled] = useState(true);
  const [isSwitchingView, setIsSwitchingView] = useState(false);
  const [pdfUri, setPdfUri] = useState("");

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

        const parsedUrl = new URL(decodedUrl);
        console.log("Parsed URL object:", parsedUrl);

        const slug = parsedUrl.searchParams.get("slug");
        console.log("Extracted Slug:", slug);

        if (slug) {
          const uri = `https://deerandbook.com/protected/storage/app/book/pdf/${slug}`;
          console.log("Setting PDF URI:", uri);
          setPdfUri(uri);
        } else {
          console.warn("No slug found in URL.");
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
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deer and Book Reader</Text>
      <Text style={styles.debugText}>
        Current PDF URI: {pdfUri || "Not Set"}
      </Text>
      {pdfUri ? (
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
          }}
        />
      ) : (
        <Text style={styles.loadingText}>Waiting for PDF URL...</Text>
      )}
    </View>
  );
};

export default PdfRead;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
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
  loadingText: {
    textAlign: "center",
    margin: 10,
  },
});

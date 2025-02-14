import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Pdf from "react-native-pdf";
import * as ScreenCapture from "expo-screen-capture";

const PdfRead = () => {
  // Disable screen capture when the component mounts
  useEffect(() => {
    // Prevent screenshots and screen recordings
    ScreenCapture.preventScreenCaptureAsync();

    // Optionally, you can release the prevention when the component unmounts
    // return () => {
    //   ScreenCapture.releaseScreenCaptureAsync(); // Reset capture settings on unmount
    // };
  }, []);

  const PdfResource = {
    uri: "https://deerandbook.com/protected/storage/app/book/pdf/USA WEST.pdf",
    cache: true,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deer and Book Reader</Text>
      <Pdf
        trustAllCerts={false}
        source={PdfResource}
        style={styles.pdf}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`number of pages: ${numberOfPages}`);
        }}
      />
    </View>
  );
};

export default PdfRead;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold", // Corrected "fontweight" to "fontWeight"
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

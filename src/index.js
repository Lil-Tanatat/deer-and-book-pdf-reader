import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Button,
  Modal,
} from "react-native";
import Pdf from "react-native-pdf";
import * as ScreenCapture from "expo-screen-capture";

const PdfRead = () => {
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [isPagingEnabled, setIsPagingEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchingView, setIsSwitchingView] = useState(false);

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

  const handleSwitchView = () => {
    setIsSwitchingView(true);
    setIsHorizontal(!isHorizontal);
    setIsPagingEnabled(!isPagingEnabled);
    setTimeout(() => {
      setIsSwitchingView(false);
    }, 10000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deer and Book Reader</Text>
      {/* {isLoading && <Text style={styles.loadingText}>Loading PDF...</Text>} */}
      <Button title="Switch View" onPress={handleSwitchView} />
      <Pdf
        trustAllCerts={false}
        source={PdfResource}
        style={styles.pdf}
        horizontal={isHorizontal}
        enablePaging={isPagingEnabled}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`number of pages: ${numberOfPages}`);
          setIsLoading(false);
        }}
        onError={(error) => {
          console.log(error);
          setIsLoading(false);
        }}
      />
      <Modal
        transparent={true}
        animationType="fade"
        visible={isSwitchingView}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text>Switching view...</Text>
          </View>
        </View>
      </Modal>
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
  loadingText: {
    textAlign: "center",
    margin: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
});

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import Pdf from "react-native-pdf";
import { usePreventScreenCapture } from "expo-screen-capture";

// Move these options arrays outside of components
const viewOptions = [
  { label: "Horizontal", value: "horizontal" },
  { label: "Vertical", value: "vertical" },
];

const pageDisplayOptions = [
  { label: "Single Page", value: "single" },
  { label: "Double Page", value: "double" },
];

const readingStyleOptions = [
  { label: "Page by Page", value: "page" },
  { label: "Continuous", value: "continuous" },
];

const CustomDropdown = ({ label, value, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.dropdownButtonText}>
          {options.find((opt) => opt.value === value)?.label || value}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  value === option.value && styles.selectedOption,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const Header = ({
  onBack,
  isHorizontal,
  readingStyle,
  handleViewChange,
  handleReadingStyleChange,
}) => (
  <View style={styles.header}>
    <Text onPress={onBack} style={styles.backButtonText}>
      {"<"} Back to Home
    </Text>

    <View style={styles.controlsContainer}>
      <CustomDropdown
        label="View Mode"
        value={isHorizontal ? "horizontal" : "vertical"}
        options={viewOptions}
        onSelect={handleViewChange}
      />

      <CustomDropdown
        label="Reading Style"
        value={readingStyle}
        options={readingStyleOptions}
        onSelect={handleReadingStyleChange}
      />
    </View>
  </View>
);

const PdfReader = ({ pdfUri, onBack }) => {
  usePreventScreenCapture();
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [isPagingEnabled, setIsPagingEnabled] = useState(true);
  const [pageDisplayMode, setPageDisplayMode] = useState("single");
  const [readingStyle, setReadingStyle] = useState("page");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [isOrientationChanging, setIsOrientationChanging] = useState(false);
  const { width, height } = useWindowDimensions();
  const pdfRef = React.useRef(null);
  const orientationTimeout = React.useRef(null);
  const unmountingRef = React.useRef(false);

  const unloadPdf = useCallback(async () => {
    if (pdfRef.current && !unmountingRef.current) {
      try {
        await pdfRef.current.unloadAsync?.();
      } catch (error) {
        console.warn("Error unloading PDF:", error);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      unmountingRef.current = true;
      if (orientationTimeout.current) {
        clearTimeout(orientationTimeout.current);
      }
      unloadPdf();
    };
  }, [unloadPdf]);

  useEffect(() => {
    setIsOrientationChanging(true);
    if (orientationTimeout.current) {
      clearTimeout(orientationTimeout.current);
    }

    orientationTimeout.current = setTimeout(async () => {
      await unloadPdf();
      if (!unmountingRef.current) {
        setIsHorizontal(width > height);
        setIsOrientationChanging(false);
      }
    }, 500);
  }, [width, height, unloadPdf]);

  useEffect(() => {
    if (!isOrientationChanging && !unmountingRef.current) {
      unloadPdf();
    }
  }, [pdfUri, isOrientationChanging, unloadPdf]);

  const handleViewChange = (value) => {
    setIsHorizontal(value === "horizontal");
  };

  const handlePageDisplayChange = (value) => {
    setPageDisplayMode(value);
  };

  const handleReadingStyleChange = (value) => {
    setReadingStyle(value);
    setIsPagingEnabled(value === "page");
  };

  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
  };

  const handleTouchStart = (event) => {
    setTouchStartTime(Date.now());
    setTouchStartY(event.nativeEvent.pageY);
  };

  const handleTouchEnd = (event) => {
    const touchEndTime = Date.now();
    const touchEndY = event.nativeEvent.pageY;
    const touchDuration = touchEndTime - touchStartTime;
    const touchDistance = Math.abs(touchEndY - touchStartY);

    const timeBetweenTaps = touchEndTime - lastTapTime;
    const isDoubleTap = timeBetweenTaps < 50;

    setLastTapTime(touchEndTime);

    if (!isDoubleTap && touchDuration >= 100 && touchDistance < 10) {
      toggleHeader();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#9c60f5" }]}>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="light-content"
      />
      {!isOrientationChanging && (
        <Pdf
          ref={pdfRef}
          trustAllCerts={false}
          source={{ uri: pdfUri, cache: true }}
          style={[
            styles.pdf,
            {
              width,
              height,
              backgroundColor: "#9c60f5",
            },
          ]}
          horizontal={isHorizontal}
          enablePaging={isPagingEnabled}
          spacing={pageDisplayMode === "double" ? 10 : 0}
          onLoadComplete={(numberOfPages) => {
            if (!unmountingRef.current) {
              console.log(`PDF Loaded - Number of pages: ${numberOfPages}`);
            }
          }}
          onError={(error) => {
            if (!unmountingRef.current) {
              console.error("PDF Load Error:", error);
              alert("Failed to load PDF. Please check the URL and try again.");
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          enableAntialiasing={true}
          onPageChanged={(page) => {
            if (!unmountingRef.current) {
              console.log(`Current page: ${page}`);
            }
          }}
        />
      )}
      {isHeaderVisible && (
        <View style={styles.headerOverlay}>
          <Header
            onBack={onBack}
            isHorizontal={isHorizontal}
            readingStyle={readingStyle}
            handleViewChange={handleViewChange}
            handleReadingStyleChange={handleReadingStyleChange}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#9c60f5",
    paddingTop: StatusBar.currentHeight,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 20,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: "white",
    textAlign: "left",
    marginBottom: 10,
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
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 5,
    marginBottom: 10,
    width: "100%",
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  dropdownButton: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "white",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  optionButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedOption: {
    backgroundColor: "#e3f2fd",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
  selectedOptionText: {
    color: "#1976d2",
    fontWeight: "bold",
  },
  pdf: {
    flex: 1,
    backgroundColor: "#9c60f5",
    zIndex: 0,
  },
  header: {
    width: "100vw",
    backgroundColor: "#9c60f5",
    paddingHorizontal: 20,
    paddingTop: 20 + StatusBar.currentHeight,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#9c60f5",
    zIndex: 1,
  },
});

export default PdfReader;

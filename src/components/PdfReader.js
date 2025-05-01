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

const CustomDropdown = ({
  isOpen,
  onToggle,
  isHorizontal,
  readingStyle,
  onViewChange,
  onReadingStyleChange,
}) => {
  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdownButton} onPress={onToggle}>
        <Text style={styles.dropdownButtonText}>
          {isHorizontal ? "Horizontal" : "Vertical"} -{" "}
          {readingStyle === "page" ? "Page by Page" : "Continuous"}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownMenu}>
          <Text style={styles.dropdownTitle}>View Mode:</Text>
          <TouchableOpacity
            style={[
              styles.dropdownOption,
              isHorizontal && styles.selectedOption,
            ]}
            onPress={() => onViewChange(true)}
          >
            <Text
              style={[
                styles.optionText,
                isHorizontal && styles.selectedOptionText,
              ]}
            >
              Horizontal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dropdownOption,
              !isHorizontal && styles.selectedOption,
            ]}
            onPress={() => onViewChange(false)}
          >
            <Text
              style={[
                styles.optionText,
                !isHorizontal && styles.selectedOptionText,
              ]}
            >
              Vertical
            </Text>
          </TouchableOpacity>

          <Text style={styles.dropdownTitle}>Reading Style:</Text>
          <TouchableOpacity
            style={[
              styles.dropdownOption,
              readingStyle === "page" && styles.selectedOption,
            ]}
            onPress={() => onReadingStyleChange("page")}
          >
            <Text
              style={[
                styles.optionText,
                readingStyle === "page" && styles.selectedOptionText,
              ]}
            >
              Page by Page
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dropdownOption,
              readingStyle === "continuous" && styles.selectedOption,
            ]}
            onPress={() => onReadingStyleChange("continuous")}
          >
            <Text
              style={[
                styles.optionText,
                readingStyle === "continuous" && styles.selectedOptionText,
              ]}
            >
              Continuous
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const Header = ({
  onBack,
  isHorizontal,
  readingStyle,
  handleViewChange,
  handleReadingStyleChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <View style={styles.header}>
      <Text onPress={onBack} style={styles.backButtonText}>
        {"<"} Back to Home
      </Text>

      <CustomDropdown
        isOpen={isDropdownOpen}
        onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
        isHorizontal={isHorizontal}
        readingStyle={readingStyle}
        onViewChange={handleViewChange}
        onReadingStyleChange={handleReadingStyleChange}
      />
    </View>
  );
};

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
        setIsOrientationChanging(false);
      }
    }, 500);
  }, [width, height, unloadPdf]);

  const handleViewChange = (value) => {
    setIsHorizontal(value);
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
  dropdownContainer: {
    position: "relative",
    zIndex: 2,
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginTop: 10,
    marginBottom: 5,
  },
  dropdownOption: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedOption: {
    backgroundColor: "#9c60f5",
  },
  optionText: {
    color: "#000",
    fontSize: 16,
  },
  selectedOptionText: {
    color: "white",
  },
});

export default PdfReader;

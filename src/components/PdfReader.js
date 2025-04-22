import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import Pdf from "react-native-pdf";
import { usePreventScreenCapture } from "expo-screen-capture";

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

const PdfReader = ({ pdfUri, onBack }) => {
  usePreventScreenCapture();
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [isPagingEnabled, setIsPagingEnabled] = useState(true);
  const [pageDisplayMode, setPageDisplayMode] = useState("single");
  const [readingStyle, setReadingStyle] = useState("page");

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

  const handleViewChange = (value) => {
    setIsHorizontal(value === "horizontal");
    // setIsPagingEnabled(value === "horizontal");
  };

  const handlePageDisplayChange = (value) => {
    setPageDisplayMode(value);
  };

  const handleReadingStyleChange = (value) => {
    setReadingStyle(value);
    setIsPagingEnabled(value === "page");
  };

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity style={styles.backButton}> */}
      <Text onPress={onBack} style={styles.backButtonText}>
        {"<"} Back to Home
      </Text>
      {/* </TouchableOpacity> */}

      {/* <Text style={styles.title}>Deer and Book Reader</Text> */}
      {/* <Text style={styles.debugText}>
        Current PDF URI: {pdfUri || "Not Set"}
      </Text> */}
      <View style={styles.controlsContainer}>
        <CustomDropdown
          label="View Mode"
          value={isHorizontal ? "horizontal" : "vertical"}
          options={viewOptions}
          onSelect={handleViewChange}
        />

        {/* <CustomDropdown
          label="Page Display"
          value={pageDisplayMode}
          options={pageDisplayOptions}
          onSelect={handlePageDisplayChange}
        /> */}

        <CustomDropdown
          label="Reading Style"
          value={readingStyle}
          options={readingStyleOptions}
          onSelect={handleReadingStyleChange}
        />
      </View>
      <Pdf
        trustAllCerts={false}
        source={{ uri: pdfUri, cache: true }}
        style={styles.pdf}
        horizontal={isHorizontal}
        enablePaging={isPagingEnabled}
        spacing={pageDisplayMode === "double" ? 10 : 0}
        onLoadComplete={(numberOfPages) => {
          console.log(`PDF Loaded - Number of pages: ${numberOfPages}`);
        }}
        onError={(error) => {
          console.error("PDF Load Error:", error);
          alert("Failed to load PDF. Please check the URL and try again.");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    color: "#000",

    textAlign: "center",
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
    marginTop: 60,
    marginBottom: 10,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
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
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default PdfReader;

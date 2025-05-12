import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

const NotFoundScreen = ({
  onBack,
  message = "Download unsuccessful. Please kindly contact the administrator",
}) => {
  // Optional: Track whether the image fails to load
  const [imageError, setImageError] = React.useState(false);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="light-content"
      />
      <LinearGradient colors={["#B347FD", "#7B77F2"]} style={styles.gradient}>
        <View style={styles.content}>
          {imageError ? (
            <Text style={styles.errorCode}>404</Text>
          ) : (
            <Image
              source={require("../../assets/image/404.png")}
              style={styles.errorImage}
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
          )}
          <Text style={styles.errorTitle}>Video Not Found</Text>
          <Text style={styles.errorMessage}>{message}</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9c60f5",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  errorImage: {
    width: 200,
    height: 150,
    marginBottom: 10,
  },
  errorCode: {
    fontSize: 80,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  backButtonText: {
    color: "#9c60f5",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default NotFoundScreen;

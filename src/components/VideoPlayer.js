import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  useWindowDimensions, // Import hook for dynamic dimensions
  StatusBar,
} from "react-native";
import { WebView } from "react-native-webview";
import { usePreventScreenCapture } from "expo-screen-capture"; // Added import
import NotFoundScreen from "./NotFoundScreen";

const VideoPlayer = ({ videoUri, onBack }) => {
  usePreventScreenCapture(); // Added screen capture prevention
  const [isLoading, setIsLoading] = useState(true);
  const { width, height } = useWindowDimensions(); // Dynamically adjust dimensions
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "Download unsuccessful. Please kindly contact the administrator"
  );

  useEffect(() => {
    // Create HTML content with a video player that can handle direct streams
    const isOneDrive = videoUri.includes("onedrive.live.com");

    // Process OneDrive URL if needed
    let processedUri = videoUri;
    if (isOneDrive) {
      // Make sure the URL uses https instead of http
      if (processedUri.startsWith("http://")) {
        processedUri = processedUri.replace("http://", "https://");
      }

      // Handle case where URL might not have https:// prefix
      if (!processedUri.startsWith("https://")) {
        processedUri = "https://" + processedUri;
      }
    }

    // HTML5 video player that can handle direct video streams better
    const videoHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            body, html {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background-color: black;
              overflow: hidden;
            }
            .video-container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            video {
              max-width: 100%;
              max-height: 100%;
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .error-message {
              color: white;
              font-size: 16px;
              text-align: center;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="video-container">
            <video id="videoPlayer" controls autoplay>
              <source src="${processedUri}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </div>
          <script>
            const video = document.getElementById('videoPlayer');
            
            video.addEventListener('error', function(e) {
              console.error('Video error:', e);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: 'Download unsuccessful. Please kindly contact the administrator'
              }));
            });
            
            video.addEventListener('loadeddata', function() {
              console.log('Video loaded successfully');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'success'
              }));
            });

            // Handle 404/403 errors that might not trigger the video error event
            window.addEventListener('error', function(e) {
              console.error('Window error:', e);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: 'Download unsuccessful. Please kindly contact the administrator'
              }));
              return true;
            });
            
            // Timeout to detect if video doesn't load
            setTimeout(function() {
              if (video.readyState === 0) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'error',
                  message: 'Download unsuccessful. Please kindly contact the administrator'
                }));
              }
            }, 8000);
          </script>
        </body>
      </html>
    `;

    setHtmlContent(videoHtml);
  }, [videoUri]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "error") {
        setError(true);
        if (data.message) {
          setErrorMessage(data.message);
        }
      } else if (data.type === "success") {
        setError(false);
      }
    } catch (e) {
      console.error("Error parsing message from WebView:", e);
    }
  };

  if (error) {
    return <NotFoundScreen onBack={onBack} message={errorMessage} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="light-content"
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
      {htmlContent ? (
        <WebView
          source={{ html: htmlContent }}
          style={[styles.webview, { width, height }]} // Adjust size dynamically
          onLoadEnd={() => setIsLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView error: ", nativeEvent);
            setError(true);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            if (
              nativeEvent.statusCode === 404 ||
              nativeEvent.statusCode === 403
            ) {
              console.error("HTTP error: ", nativeEvent.statusCode);
              setError(true);
            }
          }}
          onMessage={handleMessage}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      ) : (
        <WebView
          source={{ uri: videoUri }}
          style={[styles.webview, { width, height }]} // Adjust size dynamically
          onLoadEnd={() => setIsLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView error: ", nativeEvent);
            setError(true);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            if (
              nativeEvent.statusCode === 404 ||
              nativeEvent.statusCode === 403
            ) {
              console.error("HTTP error: ", nativeEvent.statusCode);
              setError(true);
            }
          }}
        />
      )}
      {!error && (
        <View style={styles.backButtonContainer}>
          <Text onPress={onBack} style={styles.backButtonText}>
            {"<"} Back to Home
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: StatusBar.currentHeight,
  },
  webview: {
    flex: 1,
  },
  backButtonContainer: {
    position: "absolute",
    top: 20 + StatusBar.currentHeight,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    borderRadius: 5,
    zIndex: 2,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default VideoPlayer;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

const CompatibilityTest = () => {
  const [videoTestPassed, setVideoTestPassed] = useState(false);
  const [voiceTestPassed, setVoiceTestPassed] = useState(false);
  const [currentTest, setCurrentTest] = useState("video"); // "video" or "voice"
  const navigate = useNavigate();
  const { commandId } = useParams(); // Fetch the commandId from URL params
  const videoRef = useRef(null); // Ref for displaying video
  const [userResponse, setUserResponse] = useState(""); // To store user's voice input
  const [isRecording, setIsRecording] = useState(false); // Recording state
  const { command_id } = useParams();

  // Handle video test  
  const handleVideoTest = async () => {
    try {
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream; // Display the video feed
        videoRef.current.play();
      }
      // Simulate a 5-second video test
      setTimeout(() => {
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach((track) => track.stop()); // Stop the video stream
        setVideoTestPassed(true);
        setCurrentTest("voice");
      }, 5000);
    } catch (error) {
      alert("Video test failed. Please enable your webcam and try again.");
    }
  };

  // Handle voice test
  const handleVoiceTest = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);

      // Set up Speech Recognition API (WebkitSpeechRecognition for simplicity)
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserResponse(transcript); // Capture user's spoken input
        setIsRecording(false);
        setVoiceTestPassed(true); // Mark the voice test as passed
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach((track) => track.stop()); // Stop the audio stream
      };

      recognition.onerror = () => {
        alert("Voice recognition failed. Please try again.");
        setIsRecording(false);
      };

      recognition.start(); // Start recording
    } catch (error) {
      alert("Voice test failed. Please enable your microphone and try again.");
    }
  };

  // Check if both tests are passed and navigate to InterviewPage
  useEffect(() => {
    if (videoTestPassed && voiceTestPassed) {
      alert("All tests passed! Redirecting to the interview page.");
      console.log("Command ID:", commandId);
      navigate(`/InterviewPage/${command_id}`); // Adjust the path as per your routing setup
    }
  }, [videoTestPassed, voiceTestPassed, navigate, commandId]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Compatibility Test</h1>
      <p>Please ensure your webcam and microphone are functioning correctly.</p>

      {currentTest === "video" && (
        <div>
          <h2>Step 1: Video Test</h2>
          <p>Your webcam feed will appear below. The test will complete in 5 seconds.</p>
          <video
            ref={videoRef}
            style={{ width: "300px", height: "200px", marginTop: "10px", border: "1px solid black" }}
            autoPlay
            playsInline
          ></video>
          <br />
          <button onClick={handleVideoTest} style={{ padding: "10px 20px", marginTop: "20px" }}>
            Start Video Test
          </button>
        </div>
      )}

      {currentTest === "voice" && (
        <div>
          <h2>Step 2: Voice Test</h2>
          <p>Please say something when prompted. Your voice input will be displayed below.</p>
          {isRecording && <span style={{ color: "red" }}>Recording...</span>}
          <button onClick={handleVoiceTest} style={{ padding: "10px 20px", marginTop: "20px" }}>
            Start Voice Test
          </button>
          {userResponse && (
            <div style={{ marginTop: "20px" }}>
              <h3>Your Response:</h3>
              <p>{userResponse}</p>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <h3>Test Status:</h3>
        <p>Video Test: {videoTestPassed ? "Passed ✅" : "Pending ❌"}</p>
        <p>Voice Test: {voiceTestPassed ? "Passed ✅" : "Pending ❌"}</p>
      </div>
    </div>
  );
};

export default CompatibilityTest;

import React, { useState, useEffect, useRef,useCallback } from "react";
import { useParams,useNavigate } from "react-router-dom"; // Import useParams
import axios from "axios";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";


const enterFullScreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

function InterviewPage() {
    const { command_id } = useParams(); // Get command_id from URL params
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAnswer, setUserAnswer] = useState("");
    const [submitMessage, setSubmitMessage] = useState("");
    const [currentQuestionId, setCurrentQuestionId] = useState(null);
    const [answerTimer, setAnswerTimer] = useState(30); // 30 seconds for "Answer the Question"
    const [submitTimer, setSubmitTimer] = useState(60); // 1 minute to submit after clicking "Answer the Question"
    const [isAnswering, setIsAnswering] = useState(false);
    const [score, setScore] = useState(0);
    const webcamRef = useRef(null);
    const [phoneDetected, setPhoneDetected] = useState(false); // New state for phone detection
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isTabFocused, setIsTabFocused] = useState(true);
    const [isTabSwitched, setIsTabSwitched] = useState(false);

    const [alertCount, setAlertCount] = useState(0);

    const mediaRecorderRef = useRef(null);
    const recordedChunks = useRef([]);
    const navigate = useNavigate();
    
    const [model, setModel] = useState(null);
    const modelLoadingRef = useRef(false);

    const answerTimerRef = useRef(null);
    const submitTimerRef = useRef(null);


    useEffect(() => {
      // Example of alert logic
      const handleAlert = () => {
          setAlertCount(prevCount => prevCount + 1);
        //   if (alertCount >= 3) {
        //       // Redirect to feedback page
        //       navigate('/feedback', { 
        //         state: { 
        //             interviewCompleted: false,
        //         } 
        //     });
        //   }
        
      };

      // Simulate alerts for demonstration
      const alertInterval = setInterval(handleAlert, 5000); // Simulate an alert every 5 seconds

      return () => clearInterval(alertInterval); // Cleanup interval on unmount
  }, [alertCount, navigate]);

  

    const toggleFullScreen = () => {
        if (!isFullScreen) {
          enterFullScreen();
        } else {
          exitFullScreen();
        }
        setIsFullScreen(!isFullScreen);
      };
    

      // useEffect(() => {
      //   let model;
      //   const loadModel = async () => {
      //     model = await cocoSsd.load();
      //     console.log("Coco-SSD model loaded.");
      //   };
      useEffect(() => {
        const loadModel = async () => {
            // Prevent multiple simultaneous model loading attempts
            if (modelLoadingRef.current) return;
            modelLoadingRef.current = true;

            try {
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                console.log("Coco-SSD model loaded successfully.");
            } catch (error) {
                console.error("Error loading COCO-SSD model:", error);
            } finally {
                modelLoadingRef.current = false;
            }
        };

        loadModel();
    }, []);
    
      //   const detectObjects = async () => {
      //     if (
      //       webcamRef.current &&
      //       webcamRef.current.video.readyState === 4 // Video is ready
      //     ) {
      //       const video = webcamRef.current.video;
      //       const predictions = await model.detect(video);
    
      //       const phoneFound = predictions.some((prediction) =>
      //         ["cell phone", "laptop", "electronics"].includes(prediction.class)
      //       );
    
      //       setPhoneDetected(phoneFound);
    
      //       if (phoneFound) {
      //         alert("Phone detected! Please focus on the interview.");
      //       }
      //     }
      //   };
    
      //   loadModel();
    
      //   const interval = setInterval(() => {
      //     detectObjects();
      //   }, 10); // Check every 2 seconds
    
      //   return () => clearInterval(interval);
      // }, []);

      // Create a memoized detection function
    const detectObjects = useCallback(async () => {
      if (
          model && 
          webcamRef.current && 
          webcamRef.current.video && 
          webcamRef.current.video.readyState === 4
      ) {
          try {
              const video = webcamRef.current.video;
              const predictions = await model.detect(video);

              const phoneFound = predictions.some((prediction) =>
                  ["cell phone", "laptop", "electronics"].includes(prediction.class)
              );

              setPhoneDetected(phoneFound);

              if (phoneFound) {
                  alert("Phone detected! Please focus on the interview.");
              }
          } catch (error) {
              console.error("Error during object detection:", error);
          }
      }
  }, [model]);

  // Modify the detection interval useEffect
  useEffect(() => {
      // Only set up interval if model is loaded
      if (!model) return;

      const interval = setInterval(detectObjects, 10); // Check every 2 seconds

      return () => clearInterval(interval);
  }, [model, detectObjects]);
    
      // Start webcam recording
      const startRecording = () => {
        const stream = webcamRef.current.video.srcObject;
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });
    
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.current.push(event.data);
          }
        };
    
        mediaRecorderRef.current.start();
      };

      const stopRecording = () => {
        mediaRecorderRef.current.stop();
    
        const videoBlob = new Blob(recordedChunks.current, {
          type: "video/webm",
        });
    
        const formData = new FormData();
        formData.append("video", videoBlob, "interview_video.webm");
    
        // Send video to the backend
        axios
          .post("http://127.0.0.1:8000/api/upload-video/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .catch((err) => console.error("Error uploading video:", err));
      };
    
      // Fullscreen and Escape Key Handling
      useEffect(() => {
        const enableFullScreen = async () => {
          const elem = document.documentElement;
          try {
            if (elem.requestFullscreen) await elem.requestFullscreen();
            else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
            else if (elem.msRequestFullscreen) await elem.msRequestFullscreen();
          } catch (err) {
            console.error("Fullscreen activation error:", err);
          }
        };
    
        const handleEscapeKey = (event) => {
          if (event.key === "Escape") {
            console.log("Escape key pressed, redirecting to feedback page...");
            navigate("/feedback");
          }
        };
    
        enableFullScreen();
        window.addEventListener("keydown", handleEscapeKey);
    
        return () => {
          window.removeEventListener("keydown", handleEscapeKey);
        };
      }, [navigate]);


      useEffect(() => {
        const handleTabSwitch = () => {
            if (!document.hasFocus()) {
                setIsTabFocused(false);
                setIsTabSwitched(true);
            } else {
                setIsTabFocused(true);
                setIsTabSwitched(false);
            }
        };

        document.addEventListener("visibilitychange", handleTabSwitch);
        window.addEventListener("blur", handleTabSwitch);
        window.addEventListener("focus", handleTabSwitch);

        return () => {
            document.removeEventListener("visibilitychange", handleTabSwitch);
            window.removeEventListener("blur", handleTabSwitch);
            window.removeEventListener("focus", handleTabSwitch);
        };
    }, []);

    useEffect(() => {
      if (!isTabFocused && isTabSwitched) {
          alert("You have switched tabs. Please focus on the interview page to continue.");
          setIsTabSwitched(false);
      }
  }, [isTabFocused, isTabSwitched]);

    
    // Fetch the first question or the next question
    const fetchQuestion = async (id = null) => {
      try {
          setLoading(true);
          setQuestion(null); // Clear the current question while fetching the new one
          const url = id
          ? `http://127.0.0.1:8000/api/fetch-next-question/?current_question_id=${id}&command_id=${command_id}`
          : `http://127.0.0.1:8000/api/fetch-next-question/?&command_id=${command_id}`;
          const response = await axios.get(url);
          const data = response.data;
  
          if (data.message === "No more questions available.") {
              setQuestion(null);
              navigate('/feedback', { 
                state: { 
                    interviewCompleted: true 
                } 
              });
          } else {
              setQuestion(data);
              setCurrentQuestionId(data.id);
              resetTimers();
              speakText(data.question);
          }
      } catch (err) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };
  

    useEffect(() => {
        fetchQuestion();

        // Timer for answering the question
        answerTimerRef.current = setInterval(() => {
            setAnswerTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(answerTimerRef.current);
                    handleSkipQuestion(); // Skip to next question if not answered within 30 seconds
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(answerTimerRef.current);
    }, []);

    const resetTimers = () => {
      if (answerTimerRef.current) clearInterval(answerTimerRef.current);
      if (submitTimerRef.current) clearInterval(submitTimerRef.current);
  
      setAnswerTimer(30);
      setSubmitTimer(30);
      setIsAnswering(false);
  
      // Restart answer timer
      answerTimerRef.current = setInterval(() => {
          setAnswerTimer((prev) => {
              if (prev <= 1) {
                  clearInterval(answerTimerRef.current);
                  handleSkipQuestion(); // Skip question if timer runs out
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
  };
  

    const startAnswering = () => {
        setIsAnswering(true);
        if (answerTimerRef.current) clearInterval(answerTimerRef.current);

        // Start submit timer
        submitTimerRef.current = setInterval(() => {
            setSubmitTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(submitTimerRef.current);
                    handleSkipQuestion(); // Skip question if not submitted within 1 minute
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleVoiceInput = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setUserAnswer(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };

        recognition.start();
    };


const handleSubmit = async () => {
    if (!userAnswer.trim()) {
        alert("Please provide an answer before submitting.");
        return;
    }

    try {
        const response = await axios.post(
            "http://127.0.0.1:8000/api/submit-response/",
            {
                question_id: currentQuestionId,
                user_answer: userAnswer,
            }
        );

        if (response.status === 200) {
            const data = response.data;
            setSubmitMessage(data.message || "Answer submitted successfully!");
            setScore(data.score); // Set score from the response
            setUserAnswer("");
            fetchQuestion(currentQuestionId); // Fetch the next question
        } else {
            setSubmitMessage("An error occurred. Please try again.");
        }
    } catch (err) {
        console.error("Error submitting response:", err); // Log the error for debugging
        setSubmitMessage(
            err.response?.data?.error || "A network error occurred. Please check your connection."
        );
    } finally {
        if (submitTimerRef.current) clearInterval(submitTimerRef.current);
    }
};




const speakText = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1; // Adjust rate as needed
    synth.speak(utterance);
};
  
  
  const handleSkipQuestion = () => {
      setUserAnswer("");
      setSubmitMessage("");
      setScore(0);
      fetchQuestion(currentQuestionId); // Fetch the next question
  };
  

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    if (loading) return <h1>Loading...</h1>;
    if (error) return <h1>Error: {error}</h1>;

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Interview Question</h1>
            <h2>{isAnswering ? `Submit Time Left: ${formatTime(submitTimer)}` : `Answer Time Left: ${formatTime(answerTimer)}`}</h2>
            
            {/* <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: "user",
                    }}
                    style={{
                        width: "300px",
                        border: "2px solid black",
                        borderRadius: "10px",
                        marginRight: "10px",
                    }}
                />
            </div> */}

                    {/* Webcam Display */}
                    <div style={{ marginBottom: "20px" }}>
                    <h3>Live Webcam Feed</h3>
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        width={320}
                        height={240}
                        videoConstraints={{ facingMode: "user" }}
                    />
                    </div>

        

                {/* Phone Detection Alert */}
            {phoneDetected ? (
                <p style={{ color: "red" }}>⚠ Phone detected! Please focus.</p>
            ) : (
                <p style={{ color: "green" }}>✔ No phone detected. You're good!</p>
            )}

            {question && (
                <div>
                    <h2>{question.question}</h2>
                    <p><strong>Difficulty:</strong> {question.difficulty}</p>
                    <div>
                        <h3>Your Answer:</h3>
                        <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            rows="4"
                            cols="50"
                        />
                        <p>{userAnswer}</p>
                    </div>
                    <button onClick={startAnswering} disabled={isAnswering}>
                        Answer the Question
                    </button>
                    <button onClick={handleVoiceInput} disabled={!isAnswering}>
                        Use Voice Input
                    </button>
                    <button onClick={handleSubmit} disabled={!isAnswering}>
                        Submit Answer
                    </button>
                    <button onClick={handleSkipQuestion}>
                        Skip Question
                    </button>
                </div>
            )}

            {isTabSwitched && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1000 }}>
                <h1 style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>You have switched tabs. Please focus on the interview page to continue.</h1>
            </div>
            )}

            {submitMessage && <p>{submitMessage}</p>}
            {score && <p>{score}</p>}
                    {/* Fullscreen Button */}
             <button onClick={toggleFullScreen}>
               {isFullScreen ? "Exit Fullscreen" : "Go Fullscreen"}
            </button>
        </div>
    );
}

export default InterviewPage;













// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import Webcam from "react-webcam";
// import styles from "./InterviewPage.module.css";

// function InterviewPage() {
//     const { command_id } = useParams();
//     const [question, setQuestion] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [userAnswer, setUserAnswer] = useState("");
//     const [submitMessage, setSubmitMessage] = useState("");
//     const [currentQuestionId, setCurrentQuestionId] = useState(null);
//     const [isAnswering, setIsAnswering] = useState(false);
//     const [isQuestionRead, setIsQuestionRead] = useState(false);
//     const [questionAnimation, setQuestionAnimation] = useState(false); // State for question animation

//     const fetchQuestion = async (id = null) => {
//         try {
//             setLoading(true);
//             setQuestion(null);
//             const url = id
//                 ? `http://127.0.0.1:8000/api/fetch-next-question/?current_question_id=${id}&command_id=${command_id}`
//                 : `http://127.0.0.1:8000/api/fetch-next-question/?&command_id=${command_id}`;
//             const response = await axios.get(url);
//             const data = response.data;

//             if (data.message === "No more questions available.") {
//                 setQuestion(null);
//                 setSubmitMessage("Interview completed! Thank you.");
//             } else {
//                 setQuestionAnimation(true); // Trigger animation
//                 setTimeout(() => {
//                     setQuestion(data);
//                     setCurrentQuestionId(data.id);
//                     speakText(data.question);
//                     setQuestionAnimation(false); // Reset animation state after speaking
//                 }, 500); // Pause before reading question
//             }
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const speakText = (text) => {
//         const synth = window.speechSynthesis;
//         const utterance = new SpeechSynthesisUtterance(text);
//         utterance.lang = "en-US";
//         utterance.rate = 1;

//         utterance.onend = () => {
//             setIsQuestionRead(true);
//         };

//         synth.speak(utterance);
//     };

//     const handleVoiceInput = () => {
//         const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//         recognition.lang = "en-US";
//         recognition.interimResults = false;

//         recognition.onresult = (event) => {
//             const transcript = event.results[0][0].transcript;
//             setUserAnswer(transcript);
//         };

//         recognition.onerror = (event) => {
//             console.error("Speech recognition error:", event.error);
//         };

//         recognition.start();
//     };

//     const startAnswering = () => {
//         setIsAnswering(true);
//         handleVoiceInput();
//     };

//     const endAnswering = async () => {
//         if (!userAnswer.trim()) {
//             const userConfirmed = window.confirm(
//                 "You haven't entered an answer. Do you want to skip this question?"
//             );
//             if (userConfirmed) {
//                 setIsAnswering(false);
//                 setIsQuestionRead(false);
//                 setUserAnswer(""); // Clear the answer input
//                 fetchQuestion(currentQuestionId); // Fetch the next question
//             } else {
//                 alert("Please provide an answer to proceed.");
//             }
//         } else {
//             await handleSubmit(); // Submit the current answer
//             setIsAnswering(false);
//             setIsQuestionRead(false);
//             setUserAnswer(""); // Clear the answer input
//             fetchQuestion(currentQuestionId); // Fetch the next question
//         }
//     };
    
//     const handleSubmit = async () => {
//         if (!userAnswer.trim()) {
//             alert("Please provide an answer before submitting.");
//             return;
//         }

//         try {
//             const response = await axios.post(
//                 "http://127.0.0.1:8000/api/submit-response/",
//                 {
//                     question_id: currentQuestionId,
//                     user_answer: userAnswer,
//                 }
//             );

//             if (response.status === 200) {
//                 const data = response.data;
//                 setSubmitMessage(data.message || "Answer submitted successfully!");
//                 setUserAnswer(""); // Clear user answer after submission
//             } else {
//                 setSubmitMessage("An error occurred. Please try again.");
//             }
//         } catch (err) {
//             console.error("Error submitting response:", err);
//             setSubmitMessage(
//                 err.response?.data?.error || "A network error occurred. Please check your connection."
//             );
//         }
//     };

//     useEffect(() => {
//         fetchQuestion();
//     }, []);

//     if (loading) return <div className={styles.loading}>Loading...</div>;
//     if (error) return <div className={styles.error}>Error: {error}</div>;

//     return (
//         <div className={styles.mainContainer}>
//             <div className={styles.leftContainer}>
//                 <div className={styles.videoContainer}>
//                     {/* Question animation class added */}
//                     <div className={styles.controlButtons}>
//                         {isAnswering ? (
//                             <button className={styles.endAnsweringButton} onClick={endAnswering}>
//                                 End Answering
//                             </button>
//                         ) : (
//                             <button
//                                 className={styles.startAnsweringButton}
//                                 onClick={startAnswering}
//                                 disabled={!isQuestionRead}
//                             >
//                                 Start Answering
//                             </button>
//                         )}
//                     </div>
//                 </div>
//                 <div className={styles.questionContainer}>
//                     <p>{question?.question || "No question available"}</p>
//                     {question && (
//                     <button
//                         className={styles.repeatButton}
//                         onClick={() => speakText(question?.question)}
//                         // title="Repeat"
//                         disabled={!question}
//                     >
//                         🔁 {/* Repeat Icon */} 
//                     </button>
//                 )}
//                 {question && (
//             <button
//                 className={styles.skipButton}
//                 onClick={() => fetchQuestion(currentQuestionId)}
//             >
//                 Skip
//             </button>
//         )}
//                 </div>
//                 <div className={styles.answerInputContainer}>
//                     <textarea
//                         className={styles.answerInput}
//                         rows="3"
//                         value={userAnswer}
//                         onChange={(e) => setUserAnswer(e.target.value)}
//                         placeholder="Type your answer here..."
//                     ></textarea>
//                 </div>
//             </div>
//             <div className={styles.rightContainer}>
//                 {/* Timer functionality can be added here */}
//                 {/* <div className={styles.timerContainer}>
//                     // Timer component or logic here
//                 </div> */}
//                 <div className={styles.webcamContainer}>
//                     <Webcam
//                         audio={false}
//                         videoConstraints={{
//                             width: 1280,
//                             height: 720,
//                             facingMode: "user",
//                         }}
//                         style={{
//                             width: "95%",
//                             height: "150px",
//                             objectFit: "cover",
//                             borderRadius: "10px",
//                             backgroundColor: "black",
//                         }}
//                     />
//                 </div>
//                 <button className={styles.exitButton}>Exit Interview</button>
//             </div>
//         </div>
//     );
// }

// export default InterviewPage;

import React, { useState } from 'react';
import axios from 'axios';
import { useParams,useNavigate } from 'react-router-dom';

const ResumeUploadPage = () => {
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState("");
    const [interviewQuestions, setInterviewQuestions] = useState([]);
    const [resumeData, setResumeData] = useState(null);
    const navigate = useNavigate();
    const { command_id } = useParams();

    const handleFileChange = (event) => {
        setResumeFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!resumeFile) {
            alert("Please upload a resume.");
            return;
        }
    
        const formData = new FormData();
        formData.append("resume", resumeFile);
        formData.append("command_id", command_id);
    
        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/upload-resume/${command_id}/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
    
            if (response.status === 200) {
                setUploadMessage("Resume uploaded successfully!");
                
                // Set resume data and interview questions
                setResumeData(response.data.resume_data);
                setInterviewQuestions(response.data.interview_questions);
                navigate(`/InterviewPage/${command_id}`);
            } else {
                setUploadMessage("Failed to upload resume.");
                console.error("Error response:", response.data);
            }
        } catch (error) {
            console.error("Error uploading resume:", error);
            setUploadMessage(error.message || "An error occurred while uploading the resume.");
        }
    };

    return (
        <div className="resume-upload-page">
            {!resumeData ? (
                <>
                    <h2>Upload Your Resume</h2>
                    <form onSubmit={handleSubmit}>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                        <button type="submit">Upload Resume</button>
                    </form>
                    {uploadMessage && <p>{uploadMessage}</p>}
                </>
            ) : (
                <div className="interview-preparation">
                    <h2>Resume Data</h2>
                    <div className="resume-details">
                        <h3>Skills</h3>
                        <ul>
                            {resumeData.skills && resumeData.skills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                            ))}
                        </ul>

                        <h3>Education</h3>
                        <ul>
                            {resumeData.education && resumeData.education.map((edu, index) => (
                                <li key={index}>{edu}</li>
                            ))}
                        </ul>

                        <h3>Experience</h3>
                        <ul>
                            {resumeData.experience && resumeData.experience.map((exp, index) => (
                                <li key={index}>{exp}</li>
                            ))}
                        </ul>
                    </div>

                    <h2>Interview Questions</h2>
                    <div className="interview-questions">
                        <ol>
                            {interviewQuestions.map((question, index) => (
                                <li key={index}>{question}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeUploadPage;
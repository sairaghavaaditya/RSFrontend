
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom"; // For navigation
// import axios from "axios";
// import './UserDashboard.css'

// const UserDashboard = () => {
//     const [jobs, setJobs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const navigate = useNavigate(); // React Router hook for navigation

//     useEffect(() => {
//         const fetchJobs = async () => {
//             try {
//                 const response = await axios.get("http://localhost:8000/api/jobs/");
//                 setJobs(response.data);
//             } catch (error) {
//                 console.error("Error fetching job posts:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchJobs();
//     }, []);

//     const handleTakeInterview = (commandId) => {
//         // Redirect to the Interview page with the job ID
//         // navigate(`/Interviewpage/${jobId}`);
//         console.log("Command ID:", commandId);
//         navigate(`/upload-resume/${commandId}`);
//     };

//     return (
//         <div className="dashboard-container">
//             <div className="sidebar">
//                 <h2>User Dashboard</h2>
//                 <ul>
//                     <li><a href="#">Dashboard</a></li>
//                     <li><a href="#">Profile</a></li>
//                     <li><a href="userlogin">Logout</a></li>
//                 </ul>
//             </div>
//             <div className="main-content">
//                 <div className="header">
//                     <h1>Welcome to the Job Portal</h1>
//                 </div>
//                 <div className="jobs">
//                     <h3>Available Jobs</h3>
//                     {loading ? (
//                         <p>Loading jobs...</p>
//                     ) : jobs.length === 0 ? (
//                         <p>No jobs available at the moment.</p>
//                     ) : (
//                         <ul>
//                             {jobs.map((job) => (
//                                 <li key={job.id} className="job-card">
//                                     <h4>{job.title}</h4>
//                                     <p>{job.description}</p>
//                                     <span>Posted on: {new Date(job.created_at).toLocaleDateString()}</span>
//                                     <br />
//                                     <button
//                                         className="take-interview-btn"
//                                         onClick={() => handleTakeInterview(job.command_id)}
//                                     >
//                                         Take Interview
//                                     </button>
//                                 </li>
//                             ))}
//                         </ul>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UserDashboard;





import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from './UserDashboard.module.css';

const UserDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/jobs/");
                setJobs(response.data);
            } catch (error) {
                console.error("Error fetching job posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleTakeInterview = (commandId) => {
        navigate(`/upload-resume/${commandId}`);
    };

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>User Dashboard</h2>
                <ul className={styles.sidebarNav}>
                    <li className={styles.sidebarItem}>
                        <a href="#" className={styles.sidebarLink}>Dashboard</a>
                    </li>
                    <li className={styles.sidebarItem}>
                        <a href="#" className={styles.sidebarLink}>Profile</a>
                    </li>
                    <li className={styles.sidebarItem}>
                        <a href="/userlogin" className={styles.sidebarLink}>Logout</a>
                    </li>
                </ul>
            </div>
            
            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <h1 className={styles.headerTitle}>Welcome to the Job Portal</h1>
                </div>
                
                <div className={styles.jobsSection}>
                    <h3 className={styles.jobsSectionTitle}>Available Jobs</h3>
                    
                    {loading ? (
                        <p className={styles.loadingMessage}>Loading jobs...</p>
                    ) : jobs.length === 0 ? (
                        <div className={styles.noJobsMessage}>
                            No jobs available at the moment.
                        </div>
                    ) : (
                        <ul className={styles.jobList}>
                            {jobs.map((job) => (
                                <li key={job.id} className={styles.jobCard}>
                                    <h4 className={styles.jobTitle}>{job.title}</h4>
                                    <p className={styles.jobDescription}>{job.description}</p>
                                    <span className={styles.jobDate}>
                                        Posted on: {new Date(job.created_at).toLocaleDateString()}
                                    </span>
                                    <br />
                                    <button
                                        className={styles.takeInterviewBtn}
                                        onClick={() => handleTakeInterview(job.command_id)}
                                    >
                                        Take Interview
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
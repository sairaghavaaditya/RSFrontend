import React, { useState, useEffect } from "react";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [jobPosts, setJobPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [endDate, setEndDate] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [message, setMessage] = useState("");
  const [showAvailableJobs, setShowAvailableJobs] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin-dashboard/list-job-posts/")
      .then((response) => response.json())
      .then((data) => setJobPosts(data))
      .catch((error) => console.error("Error fetching job posts:", error));
  }, []);

  const handleCreateJobPost = async (e) => {
    e.preventDefault();

    if (!csvFile) {
      setMessage("Please upload a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("end_date", endDate);
    formData.append("questions_csv", csvFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/admin-dashboard/create-job-post/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job post.");
      }

      const data = await response.json();
      setMessage(data.message || "Job post created successfully!");
      setJobPosts([
        ...jobPosts,
        {
          id: data.job_post_id,
          title,
          description,
          location,
          end_date: endDate,
        },
      ]);
      setTitle("");
      setDescription("");
      setLocation("");
      setEndDate("");
      setCsvFile(null);
    } catch (error) {
      console.error("Error creating job post:", error);
      setMessage(error.message || "Failed to create job post.");
    }
  };

  const handleDeleteJobPost = async (jobId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/admin-dashboard/delete-job-post/${jobId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete job post.");
      }

      // Remove the deleted job post from the state
      setJobPosts(jobPosts.filter((job) => job.id !== jobId));
      setMessage("Job post deleted successfully!");
    } catch (error) {
      console.error("Error deleting job post:", error);
      setMessage(error.message || "Failed to delete job post.");
    }
  };

  const fetchAvailableJobs = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/admin-dashboard/list-job-posts/");
      const data = await response.json();
      setJobPosts(data);
      setShowAvailableJobs(true);
    } catch (error) {
      console.error("Error fetching available jobs:", error);
    }
  };

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <h2>Admin Dashboard</h2>
        <hr />
        <ul>
          <li onClick={handleCreateJobPost}>Create Jobs</li>
          <li onClick={fetchAvailableJobs}>Available Jobs</li>
          <li>Users</li>
          <li>Logout</li>
        </ul>
      </aside>

      <div className={styles.mainContent}>
        <h1>Create Job Post</h1>
        <form onSubmit={handleCreateJobPost} className={styles.jobForm}>
          <div className={styles.formGroup}>
            <label>Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Job Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className={styles.formGroup}>
            <label>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Upload CSV</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
            />
          </div>
          <button type="submit">Create Job Post</button>
        </form>

        {message && <p>{message}</p>}

        {showAvailableJobs && (
          <div>
            <h2>Available Job Posts</h2>
            <ul>
              {jobPosts.map((job) => (
                <li key={job.id}>
                  <h3>{job.title}</h3>
                  <p>{job.description}</p>
                  <p>Location: {job.location}</p>
                  <p>End Date: {job.end_date}</p>
                  <button onClick={() => handleDeleteJobPost(job.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
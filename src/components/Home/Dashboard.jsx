// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const Dashboard = () => {
//     const navigate = useNavigate();

//     const goToAdmin = () => navigate('/adminlogin');
//     const goToUserLogin = () => navigate('/userlogin/');

//     return (
//         <div style={{ textAlign: 'center', padding: '50px' }}>
//             <h1>Main Dashboard</h1>
//             <button onClick={goToAdmin} style={{ margin: '10px', padding: '10px 20px' }}>
//                 Admin
//             </button>
//             <button onClick={goToUserLogin} style={{ margin: '10px', padding: '10px 20px' }}>
//                 User
//             </button>
//         </div>
//     );
// };

// export default Dashboard;
    



import React from 'react';
import styles from "./Dashboard.module.css";
import { useNavigate } from 'react-router-dom';



function Dashboard() {
    const navigate = useNavigate();

    const goToAdmin = () => navigate('/adminlogin');
    const goToUserLogin = () => navigate('/userlogin/');

    return (
        <div className={styles.page}>
            {/* Left Container */}
            <div className={styles.leftContainer}>
                <h2>Welcome to <br />Recruitsmart!</h2>
                <p> "Elevate Your Expertise,<br /> Enhance Your Career"</p>
            </div>

            {/* Right Container */}
            <div className={styles.rightContainer}>
                <div className={styles.child}>
                    <h3>I am </h3>

                    {/* Dashboard Image Buttons */}
                    <div className={styles.imageButtonContainer}>
                        <div className={`${styles.imageButton} ${styles.adminButton}`} onClick={goToAdmin}>
                        {/* <img src="/adminimg.jpg" alt="Admin" /> */}
                        </div>
                        <div className={`${styles.imageButton} ${styles.userButton}`} onClick={goToUserLogin}>
                        {/* <img src="/user.jpg" alt="User" /> */}
                        </div>
                    </div>
                        <div className={styles.imgname}>
                            <h3>Admin</h3>
                            <h3>User</h3>

                        </div>

                </div>
            </div>
        </div>
    );
}

export default Dashboard;

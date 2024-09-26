import React from 'react';

const Dashboard = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.welcomeMessage}>Welcome to ITI Cafe!</h1>
            <h2 style={styles.welcomeMessage}>LooooooooooooooooooooooooL!</h2>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
    },
    welcomeMessage: {
        fontSize: '2rem',
        color: '#343a40',
        margin: '10px 0', // Adding some margin for spacing
    },
};

export default Dashboard;

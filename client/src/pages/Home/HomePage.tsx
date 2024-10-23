import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from "../../UserContext";
import { getAll, search } from '../../services/FoodService';
import Search from '../../components/Search/Search';
import { Thumbnails } from '../../components/Thumbnails/Thumbnails';
import styles from './HomePage.module.css';

const HomePage = () => {
  // User and food data state
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTerm } = useParams();
  const { user } = useUser();

  // Typing animation state
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    'Welcome to ITIFoods',
    'مرحبا بكم في ITIFoods',
    'Bienvenue à ITIFoods',
    'Bienvenidos a ITIFoods'
  ];

  // Animation timing constants
  const typingSpeed = 150;
  const deletingSpeed = 200;
  const pauseDuration = 2000;

  // Typing animation effect
  useEffect(() => {
    if (!user) {  // Only run animation when user is not logged in
      const currentMessage = messages[messageIndex];

      const timeout = setTimeout(() => {
        if (!isDeleting) {
          setDisplayText(currentMessage.slice(0, displayText.length + 1));

          if (displayText.length === currentMessage.length) {
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else {
          setDisplayText(currentMessage.slice(0, displayText.length - 1));

          if (displayText.length === 0) {
            setIsDeleting(false);
            setMessageIndex((prev) => (prev + 1) % messages.length);
          }
        }
      }, isDeleting ? deletingSpeed : typingSpeed);

      return () => clearTimeout(timeout);
    }
  }, [displayText, isDeleting, messageIndex, messages, user]);

  // Food loading effect
  useEffect(() => {
    const loadFoods = async () => {
      try {
        setLoading(true);
        const result = searchTerm ? await search(searchTerm) : await getAll();
        console.log('Received data:', result);

        let foodsArray = [];
        if (Array.isArray(result)) {
          foodsArray = result;
        } else if (typeof result === 'object' && result !== null) {
          if (Array.isArray(result.data)) {
            foodsArray = result.data;
          } else if (Array.isArray(result.results)) {
            foodsArray = result.results;
          } else if (Array.isArray(result.items)) {
            foodsArray = result.items;
          } else {
            throw new Error('Unexpected data structure');
          }
        } else {
          throw new Error('Invalid data received from API');
        }

        setFoods(foodsArray);
        setError(null);
      } catch (err) {
        setError('Failed to load menu items. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadFoods();
    }
  }, [searchTerm, user]);

  if (!user) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.overlay}></div>
        <div className={styles.loginContent}>
          <h1 className={`${styles.title} ${styles.animatedTitle}`}>
            {displayText}
            <span className={styles.cursor}>|</span>
          </h1>
          <p className={styles.subtitle}>We develop People and Food too!</p>
          <div className={styles.messageBox}>
            <p>Please login or register to order your favorite food from the branch nearest to you.</p>
            <div className={styles.buttonContainer}>
              <button onClick={() => window.location.href = '/login'} className={styles.loginButton}>Log In</button>
              <button onClick={() => window.location.href = '/signup'} className={styles.registerButton}>Register</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Search />
      {foods.length > 0 ? (
        <Thumbnails foods={foods} />
      ) : (
        <div>No food items available</div>
      )}
    </>
  );
};

export default HomePage;
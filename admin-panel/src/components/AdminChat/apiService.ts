export const getLoggedInUsers = async (token: string) => {
  try {
    const response = await fetch("http://localhost:8000/api-auth/logged-in-users/", {
      method: 'GET', // Use the appropriate method
      headers: {
        'Authorization': `Bearer ${token}`, // Include the token in the headers
        'Content-Type': 'application/json', // Set content type if necessary
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`); // Handle errors
    }

    const data = await response.json(); // Parse JSON response
    return data.logged_in_users; // Adjust according to your API response
  } catch (error) {
    console.error('Error fetching logged-in users:', error);
    throw error; // Re-throw the error if needed
  }
};

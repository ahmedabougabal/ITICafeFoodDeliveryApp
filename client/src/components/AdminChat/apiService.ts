import AxiosInstance from "../../utils/AxiosInstance";

export const getLoggedInUsers = async (token: string) => {
  const response = await AxiosInstance.get('/logged-in-users/', {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the headers
    },
  });
  return response.data.logged_in_users; // Adjust according to your API response
};

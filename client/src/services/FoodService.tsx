import AxiosInstance from '../utils/AxiosInstance';

const BASE_URL = 'http://localhost:8000';
const API_URL = `${BASE_URL}/api/menu/items/`;

export const getAll = async (params = {}) => {
    try {
        const response = await AxiosInstance.get(API_URL, { params });
        console.log('getAll - API Response:', response.data);

        // Check if the response has a 'results' property and if it is an array
        if (!response.data.results || !Array.isArray(response.data.results)) {
            console.error('getAll - Invalid data structure:', response.data);
            throw new Error('Invalid data received from API');
        }

        return response.data.results;
    } catch (error) {
        console.error('getAll - Error fetching menu items:', error);
        throw error;
    }
};


export const search = async (searchTerm: string) => {
    try {
        const response = await AxiosInstance.get(`${API_URL}?search=${searchTerm}`);
        console.log('search - Search API Response:', response.data);

        // Check if the response has a 'results' property and if it is an array
        if (!response.data.results || !Array.isArray(response.data.results)) {
            console.error('search - Invalid search data structure:', response.data);
            throw new Error('Invalid data received from API');
        }

        return response.data.results;
    } catch (error) {
        console.error('search - Error searching menu items:', error);
        throw error;
    }
};

export const getById = async (foodId: string) => {
    try {
        const response = await AxiosInstance.get(`${API_URL}${foodId}/`);
        console.log('getById - API Response for item by ID:', response.data);
        return response.data;
    } catch (error) {
        console.error('getById - Error fetching menu item by ID:', error);
        throw error;
    }
};

export const checkAuthStatus = async () => {
    try {
        const response = await AxiosInstance.get(`${BASE_URL}/api-auth/profile`);
        console.log('checkAuthStatus - API Response for auth status:', response.data);
        return response.data;
    } catch (error) {
        console.error('checkAuthStatus - Error checking auth status:', error);
        throw error;
    }
};

export const getFavoriteItems = async (ids: number[]) => {
    try {
        const response = await AxiosInstance.post(`${BASE_URL}/api/menu/items-by-ids/`, { ids });
        console.log('getFavoriteItems - API Response:', response.data);

        if (!Array.isArray(response.data)) {
            console.error('getFavoriteItems - Invalid data structure:', response.data);
            throw new Error('Invalid data received from API');
        }

        return response.data;
    } catch (error) {
        console.error('getFavoriteItems - Error fetching favorite items:', error);
        throw error;
    }
};
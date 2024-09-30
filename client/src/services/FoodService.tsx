import axios from 'axios';

const BASE_URL = 'http://localhost:8000';
const API_URL = `${BASE_URL}/api/menu/items/`;

export const getAll = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching menu items:', error);
        throw error;
    }
};

export const search = async (searchTerm: string) => {
    try {
        const response = await axios.get(`${API_URL}?search=${searchTerm}`);
        return response.data;
    } catch (error) {
        console.error('Error searching menu items:', error);
        throw error;
    }
};

export const getById = async (foodId: string) => {
    try {
        const response = await axios.get(`${API_URL}${foodId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching menu item by ID:', error);
        throw error;
    }
};
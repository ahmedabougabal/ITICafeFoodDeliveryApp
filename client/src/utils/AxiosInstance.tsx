import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

const baseURL = 'http://localhost:8000';

const getAccessToken = (): string => {
    const token = localStorage.getItem('token');
    if (!token) return "";
    try {
        return JSON.parse(token);
    } catch (error) {
        console.error("Error parsing access token:", error);
        localStorage.removeItem('token');
        return "";
    }
};

const getRefreshToken = (): string => {
    const token = localStorage.getItem('refresh_token');
    if (!token) return "";
    try {
        return JSON.parse(token);
    } catch (error) {
        console.error("Error parsing refresh token:", error);
        localStorage.removeItem('refresh_token');
        return "";
    }
};

const AxiosInstance = axios.create({
    baseURL: baseURL,
    headers: { 'Content-Type': 'application/json' },
});

AxiosInstance.interceptors.request.use(async (req) => {
    const accessToken = getAccessToken();
    if (!accessToken) return req;

    req.headers.Authorization = `Bearer ${accessToken}`;

    try {
        const user: any = jwtDecode(accessToken);
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        if (!isExpired) return req;

        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token available");

        const resp = await axios.post(`${baseURL}/token/refresh/`, {
            refresh: refreshToken,
        });

        localStorage.setItem('token', JSON.stringify(resp.data.access));
        req.headers.Authorization = `Bearer ${resp.data.access}`;
    } catch (error) {
        console.error("Token refresh failed", error);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        // Optionally, redirect to login page or dispatch a logout action
    }

    return req;
});

AxiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            // Optionally, redirect to login page or dispatch a logout action
        }
        return Promise.reject(error);
    }
);

export default AxiosInstance;
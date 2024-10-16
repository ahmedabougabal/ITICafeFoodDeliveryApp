import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Updated import
import dayjs from "dayjs";

const getAccessToken = () => {
    const token = localStorage.getItem('token');
    return token ? JSON.parse(token) : "";
};
const getRefreshToken = () => {
    const token = localStorage.getItem('refresh_token');
    return token ? JSON.parse(token) : "";
};

const baseURL = 'http://localhost:8000/api-auth';

const AxiosInstance = axios.create({
    baseURL: baseURL,
    headers: { 'Content-Type': 'application/json' },
});

AxiosInstance.interceptors.request.use(async req => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    
    if (accessToken) {
        req.headers.Authorization = `Bearer ${accessToken}`;
        const user = jwtDecode(accessToken);
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        if (isExpired) {
            try {
                const resp = await axios.post(`${baseURL}/token/refresh`, {
                    refresh: refreshToken,
                });
                localStorage.setItem('token', JSON.stringify(resp.data.access));
                req.headers.Authorization = `Bearer ${resp.data.access}`;
            } catch (error) {
                console.error("Token refresh failed", error);
            }
        }
    }

    return req;
});

export default AxiosInstance;
import AxiosInstance from "./AxiosInstance";

interface LoginCredentials {
  username: string;
  password: string;
}

const AuthService = {
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await AxiosInstance.post("/login", credentials);
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await AxiosInstance.post("/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return response;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default AuthService;
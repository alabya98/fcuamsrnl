import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import AuthService from "../services/AuthService";

interface User {
  user_id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix_name?: string;
  username: string;
  role: "Admin" | "Coach" | "Athlete";
  gender: any;
  birth_date: string;
  age: number;
  profile_picture_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUserProfilePicture: (url: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await AuthService.login({ username, password });
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const updateUserProfilePicture = (url: string | null) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, profile_picture_url: url };
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, profile_picture_url: url })
      );
      return updated;
    });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    updateUserProfilePicture,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
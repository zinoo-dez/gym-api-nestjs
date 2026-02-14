import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  email: string;
  name: string;
  role: "admin" | "member" | "trainer" | "staff";
  id: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("gym-user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string): boolean => {
    let authUser: User | null = null;

    if (email === "member@gym.com" && password === "member123") {
      authUser = { email, name: "Member User", role: "member", id: "m1" };
    } else if (email === "trainer@gym.com" && password === "trainer123") {
      authUser = { email, name: "Trainer User", role: "trainer", id: "t1" };
    } else if (email === "staff@gym.com" && password === "staff123") {
      authUser = { email, name: "Staff User", role: "staff", id: "s1" };
    }

    if (authUser) {
      setUser(authUser);
      localStorage.setItem("gym-user", JSON.stringify(authUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("gym-user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

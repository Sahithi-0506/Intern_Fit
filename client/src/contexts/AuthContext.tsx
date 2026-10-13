import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, AlumniProfile, LoginInput, RegisterInput, UpdateStudentProfileInput } from '@internfit/shared';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfile | null;
  alumniProfile: AlumniProfile | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<{ message: string; verificationToken?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (input: UpdateStudentProfileInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [alumniProfile, setAlumniProfile] = useState<AlumniProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setStudentProfile(res.data.studentProfile);
        setAlumniProfile(res.data.alumniProfile);
      }
    } catch {
      setUser(null);
      setStudentProfile(null);
      setAlumniProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (input: LoginInput) => {
    const res = await api.post('/auth/login', input);
    if (res.data.success) {
      await refreshUser();
    }
  };

  const register = async (input: RegisterInput) => {
    const res = await api.post('/auth/register', input);
    return {
      message: res.data.message,
      verificationToken: res.data.verificationToken,
    };
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setStudentProfile(null);
    setAlumniProfile(null);
  };

  const updateProfile = async (input: UpdateStudentProfileInput) => {
    const res = await api.put('/auth/profile', input);
    if (res.data.success) {
      setStudentProfile(res.data.profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        alumniProfile,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

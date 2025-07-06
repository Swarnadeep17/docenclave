"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole =
  | "anonymous"
  | "free"
  | "premium"
  | "admin"
  | "superadmin";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  lastLogin: Date;
  fileProcessingUsage: {
    currentSession: number;
    monthlyTotal: number;
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  canAccessFeature: (feature: string) => boolean;
  getFileSizeLimit: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        const profileDoc = await getDoc(doc(db, "users", user.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data() as UserProfile);
        } else {
          // Create new user profile
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            role: "free",
            createdAt: new Date(),
            lastLogin: new Date(),
            fileProcessingUsage: {
              currentSession: 0,
              monthlyTotal: 0,
            },
          };
          await setDoc(doc(db, "users", user.uid), newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin =
    userProfile?.role === "admin" || userProfile?.role === "superadmin";

  const canAccessFeature = (feature: string): boolean => {
    if (!userProfile) return false; // Anonymous users

    const role = userProfile.role;

    // Define feature access based on roles
    const featureAccess: Record<string, UserRole[]> = {
      "basic-pdf": ["free", "premium", "admin", "superadmin"],
      "advanced-pdf": ["premium", "admin", "superadmin"],
      "batch-processing": ["premium", "admin", "superadmin"],
      "priority-processing": ["premium", "admin", "superadmin"],
      "api-access": ["admin", "superadmin"],
      "admin-dashboard": ["admin", "superadmin"],
    };

    return featureAccess[feature]?.includes(role) || false;
  };

  const getFileSizeLimit = (): number => {
    if (!userProfile) return 20; // Anonymous: 20MB

    switch (userProfile.role) {
      case "free":
        return 20; // 20MB
      case "premium":
      case "admin":
      case "superadmin":
        return 200; // 200MB
      default:
        return 20;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    isAdmin,
    canAccessFeature,
    getFileSizeLimit,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

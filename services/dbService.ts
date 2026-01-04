import { db } from "./firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { AIProvider } from "../types";

export interface UserSettings {
  apiKeys: Record<AIProvider, string>;
  defaultPlatform: string;
  activeProvider: AIProvider;
}

// Save User Settings (API Keys, etc)
export const saveUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { settings }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving settings:", error);
    return false;
  }
};

// Get User Settings
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return docSnap.data().settings as UserSettings;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting settings:", error);
    return null;
  }
};

// Initialize User Doc (on Register)
export const initializeUser = async (userId: string, email: string) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      email,
      createdAt: Date.now(),
      settings: {
        apiKeys: {},
        activeProvider: 'GOOGLE',
        defaultPlatform: 'TIKTOK'
      }
    });
  } catch (error) {
    console.error("Error initializing user:", error);
  }
};
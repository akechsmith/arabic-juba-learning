import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  const signUp = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName,
      createdAt: new Date(),
      streak: 0,
      totalXP: 0,
      level: 1,
      badges: [],
      lastLoginDate: new Date()
    });
    
    return userCredential;
  };

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if user document exists, if not create it
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date(),
        streak: 0,
        totalXP: 0,
        level: 1,
        badges: [],
        lastLoginDate: new Date()
      });
    }
    
    return userCredential;
  };

  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      // Add additional scopes for better user data
      provider.addScope('email');
      provider.addScope('public_profile');
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(),
          streak: 0,
          totalXP: 0,
          level: 1,
          badges: [],
          lastLoginDate: new Date()
        });
      }
      
      return userCredential;
    } catch (error) {
      console.error('Facebook sign in error:', error);
      
      // Handle specific Facebook auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups and try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account with this email already exists. Try signing in with a different method.');
      } else if (error.code === 'auth/auth-domain-config-required') {
        throw new Error('Facebook authentication is not properly configured.');
      } else {
        throw new Error(error.message || 'Facebook sign-in failed');
      }
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setCurrentUser({
          ...user,
          userData: userDoc.data()
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
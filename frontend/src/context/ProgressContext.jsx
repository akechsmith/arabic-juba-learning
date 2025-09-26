import React, { createContext, useContext, useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db } from "../services/firebase";

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};

export const ProgressProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState({
    totalXp: 0,
    streak: 0,
    level: 1,
    badges: [],
    completedLessons: [],
    currentLesson: "L1_01",
    lastLoginDate: null,
    lastCompletedAt: null,
    displayName: null,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Improved display name extraction
  const getDisplayName = (user) => {
    if (!user) return null;
    
    // Priority order for display names
    if (user.displayName && !user.displayName.startsWith('User ')) {
      return user.displayName;
    }
    
    if (user.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize and clean up email username
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return `Learner ${user.uid.slice(0, 6)}`;
  };

  // Load progress when component mounts or user changes
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounted
    
    const loadUserProgress = async () => {
      if (!isMounted) return;
      
      if (currentUser) {
        await loadFirestoreProgress(isMounted);
      } else {
        if (isMounted) {
          // Reset to default when no user (logged out)
          const defaultProgress = {
            totalXp: 0,
            streak: 0,
            level: 1,
            badges: [],
            completedLessons: [],
            currentLesson: "L1_01",
            lastLoginDate: null,
            lastCompletedAt: null,
            displayName: null,
          };
          setProgress(defaultProgress);
          setLoading(false);
        }
      }
    };

    loadUserProgress();
    
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Firestore operations with better error handling
  const loadFirestoreProgress = async (isMounted = true) => {
    if (!currentUser || !isMounted) return;

    try {
      setSyncing(true);
      const progressRef = doc(db, "userProgress", currentUser.uid);
      const progressSnap = await getDoc(progressRef);

      if (!isMounted) return; // Component unmounted during async operation

      if (progressSnap.exists()) {
        const firestoreData = progressSnap.data();
        
        // Ensure data integrity
        const normalizedProgress = {
          totalXp: Math.max(0, firestoreData.totalXp || 0),
          streak: Math.max(0, firestoreData.streak || 0),
          level: Math.max(1, firestoreData.level || 1),
          badges: Array.isArray(firestoreData.badges) ? firestoreData.badges : [],
          completedLessons: Array.isArray(firestoreData.completedLessons) 
            ? firestoreData.completedLessons 
            : [],
          currentLesson: firestoreData.currentLesson || "L1_01",
          lastLoginDate: firestoreData.lastLoginDate?.toDate() || null,
          lastCompletedAt: firestoreData.lastCompletedAt || null,
          displayName: firestoreData.displayName || getDisplayName(currentUser),
        };

        // Update display name if needed
        const currentDisplayName = getDisplayName(currentUser);
        if (currentDisplayName !== normalizedProgress.displayName) {
          normalizedProgress.displayName = currentDisplayName;
          // Update in Firestore asynchronously
          updateDoc(progressRef, { displayName: currentDisplayName }).catch(console.error);
        }

        setProgress(normalizedProgress);
        console.log("✅ Loaded progress from Firestore:", normalizedProgress);

        // Backup to localStorage
        saveLocalProgress(normalizedProgress);
      } else {
        // No Firestore data - check for local data to migrate
        await migrateLocalToFirestore(isMounted);
      }
    } catch (error) {
      console.error("❌ Error loading Firestore progress:", error);
      
      if (isMounted) {
        // Fallback to localStorage with user's display name
        loadLocalProgressWithUser();
      }
    } finally {
      if (isMounted) {
        setSyncing(false);
        setLoading(false);
      }
    }
  };

  const loadLocalProgressWithUser = () => {
    try {
      const savedProgress = localStorage.getItem("arabicJubaProgress");
      let localProgress;
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        localProgress = {
          totalXp: Math.max(0, parsed.totalXp || 0),
          streak: Math.max(0, parsed.streak || 0),
          level: Math.max(1, parsed.level || 1),
          badges: Array.isArray(parsed.badges) ? parsed.badges : [],
          completedLessons: Array.isArray(parsed.completedLessons) 
            ? parsed.completedLessons 
            : [],
          currentLesson: parsed.currentLesson || "L1_01",
          lastLoginDate: parsed.lastLoginDate ? new Date(parsed.lastLoginDate) : null,
          lastCompletedAt: parsed.lastCompletedAt || null,
          displayName: getDisplayName(currentUser), // Always use current user's name
        };
      } else {
        // Fresh start with proper display name
        localProgress = {
          totalXp: 0,
          streak: 0,
          level: 1,
          badges: [],
          completedLessons: [],
          currentLesson: "L1_01",
          lastLoginDate: null,
          lastCompletedAt: null,
          displayName: getDisplayName(currentUser),
        };
      }

      setProgress(localProgress);
      console.log("📱 Loaded progress from localStorage with user:", localProgress);
      
      // Try to sync to Firestore in background
      if (currentUser) {
        saveFirestoreProgress(localProgress).catch(console.error);
      }
    } catch (error) {
      console.error("❌ Error loading local progress:", error);
      // Set safe defaults
      setProgress({
        totalXp: 0,
        streak: 0,
        level: 1,
        badges: [],
        completedLessons: [],
        currentLesson: "L1_01",
        lastLoginDate: null,
        lastCompletedAt: null,
        displayName: getDisplayName(currentUser),
      });
    }
  };

  const saveFirestoreProgress = async (progressData) => {
    if (!currentUser) return false;

    try {
      setSyncing(true);
      const progressRef = doc(db, "userProgress", currentUser.uid);

      const dataToSave = {
        ...progressData,
        displayName: progressData.displayName || getDisplayName(currentUser),
        lastLoginDate: progressData.lastLoginDate ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
        // Ensure arrays are never null
        badges: Array.isArray(progressData.badges) ? progressData.badges : [],
        completedLessons: Array.isArray(progressData.completedLessons) 
          ? progressData.completedLessons 
          : [],
      };

      await setDoc(progressRef, dataToSave, { merge: true });
      console.log("✅ Progress saved to Firestore");
      return true;
    } catch (error) {
      console.error("❌ Error saving to Firestore:", error);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const migrateLocalToFirestore = async (isMounted = true) => {
    if (!isMounted || !currentUser) return;

    try {
      const localData = localStorage.getItem("arabicJubaProgress");
      let migrationData;
      
      if (localData) {
        const parsed = JSON.parse(localData);
        migrationData = {
          totalXp: Math.max(0, parsed.totalXp || 0),
          streak: Math.max(0, parsed.streak || 0),
          level: Math.max(1, parsed.level || 1),
          badges: Array.isArray(parsed.badges) ? parsed.badges : [],
          completedLessons: Array.isArray(parsed.completedLessons) 
            ? parsed.completedLessons 
            : [],
          currentLesson: parsed.currentLesson || "L1_01",
          lastLoginDate: parsed.lastLoginDate ? new Date(parsed.lastLoginDate) : null,
          lastCompletedAt: parsed.lastCompletedAt || null,
          displayName: getDisplayName(currentUser), // Use current user's name
        };
        console.log("🔄 Migrating local progress to Firestore");
      } else {
        // Fresh start for new user
        migrationData = {
          totalXp: 0,
          streak: 0,
          level: 1,
          badges: [],
          completedLessons: [],
          currentLesson: "L1_01",
          lastLoginDate: new Date(),
          lastCompletedAt: null,
          displayName: getDisplayName(currentUser),
        };
        console.log("🆕 Creating fresh progress for new user");
      }

      if (isMounted) {
        setProgress(migrationData);
        await saveFirestoreProgress(migrationData);
        console.log("✅ Migration completed successfully");
      }
    } catch (error) {
      console.error("❌ Error during migration:", error);
      if (isMounted) {
        loadLocalProgressWithUser();
      }
    }
  };

  const saveLocalProgress = (newProgress) => {
    try {
      // Always save the most up-to-date display name
      const progressToSave = {
        ...newProgress,
        displayName: newProgress.displayName || getDisplayName(currentUser),
      };
      localStorage.setItem("arabicJubaProgress", JSON.stringify(progressToSave));
      console.log("💾 Progress saved locally");
    } catch (error) {
      console.error("❌ Error saving local progress:", error);
    }
  };

  const updateProgress = async (updates) => {
    try {
      const newProgress = { 
        ...progress, 
        ...updates,
        // Always ensure proper display name
        displayName: updates.displayName || progress.displayName || getDisplayName(currentUser),
        // Ensure arrays are always arrays
        badges: Array.isArray(updates.badges || progress.badges) 
          ? (updates.badges || progress.badges) 
          : [],
        completedLessons: Array.isArray(updates.completedLessons || progress.completedLessons)
          ? (updates.completedLessons || progress.completedLessons)
          : [],
      };

      // Update state immediately for instant feedback
      setProgress(newProgress);

      // Save locally first (instant backup)
      saveLocalProgress(newProgress);

      // Try to sync with Firestore if user is authenticated
      if (currentUser) {
        const success = await saveFirestoreProgress(newProgress);
        if (!success) {
          console.warn("⚠️ Firestore sync failed, but local save succeeded");
        }
      }

      return newProgress;
    } catch (error) {
      console.error("❌ Error updating progress:", error);
      throw error;
    }
  };

  // Get next lesson in sequence
  const getNextLessonId = (currentLessonId, allLessons) => {
    const currentIndex = allLessons.findIndex(
      (lesson) => lesson.id === currentLessonId
    );
    if (currentIndex === -1 || currentIndex === allLessons.length - 1) {
      return null;
    }
    return allLessons[currentIndex + 1].id;
  };

  // Award badges based on milestones
  const checkAndAwardBadges = (newProgress) => {
    const currentBadges = Array.isArray(newProgress.badges) ? newProgress.badges : [];
    const newBadges = [...currentBadges];
    let badgesAwarded = [];

    // LEVEL COMPLETION BADGES
    const levelCompletionBadges = [
      {
        id: "level_1_complete",
        name: "Level 1 Master",
        description: "Completed Level 1 - Basic Arabic",
        icon: "🏆",
        levelRequired: 2,
      },
      {
        id: "level_2_complete",
        name: "Level 2 Master",
        description: "Completed Level 2 - Greetings & Social Skills",
        icon: "🎓",
        levelRequired: 3,
      },
      {
        id: "level_3_complete",
        name: "Level 3 Master",
        description: "Completed Level 3 - Comprehensive Vocabulary",
        icon: "📚",
        levelRequired: 4,
      },
      {
        id: "level_4_complete",
        name: "Level 4 Master",
        description: "Completed Level 4 - Everyday Conversations",
        icon: "💬",
        levelRequired: 5,
      },
    ];

    levelCompletionBadges.forEach((badge) => {
      const hasEarnedBadge = newProgress.level >= badge.levelRequired;
      const alreadyHasBadge = newBadges.some((b) => b.id === badge.id);

      if (hasEarnedBadge && !alreadyHasBadge) {
        const newBadge = {
          ...badge,
          earnedAt: new Date().toISOString(),
        };
        newBadges.push(newBadge);
        badgesAwarded.push(newBadge);
      }
    });

    // STREAK BADGES
    const streakBadges = [
      {
        id: "streak_3",
        name: "3-Day Streak",
        description: "Maintained a 3-day learning streak",
        icon: "🔥",
        streakRequired: 3,
      },
      {
        id: "streak_7",
        name: "Week Warrior",
        description: "Maintained a 7-day learning streak",
        icon: "⚡",
        streakRequired: 7,
      },
      {
        id: "streak_14",
        name: "Two Week Champion",
        description: "Maintained a 14-day learning streak",
        icon: "💪",
        streakRequired: 14,
      },
      {
        id: "streak_30",
        name: "Month Master",
        description: "Maintained a 30-day learning streak",
        icon: "🌟",
        streakRequired: 30,
      },
      {
        id: "streak_60",
        name: "Dedication Legend",
        description: "Maintained a 60-day learning streak",
        icon: "👑",
        streakRequired: 60,
      },
    ];

    streakBadges.forEach((badge) => {
      const hasEarnedBadge = newProgress.streak >= badge.streakRequired;
      const alreadyHasBadge = newBadges.some((b) => b.id === badge.id);

      if (hasEarnedBadge && !alreadyHasBadge) {
        const newBadge = {
          ...badge,
          earnedAt: new Date().toISOString(),
        };
        newBadges.push(newBadge);
        badgesAwarded.push(newBadge);
      }
    });

    // LESSON COMPLETION BADGES
    const lessonBadges = [
      {
        id: "lessons_5",
        name: "First Steps",
        description: "Completed your first 5 lessons",
        icon: "🌱",
        lessonsRequired: 5,
      },
      {
        id: "lessons_10",
        name: "Getting Started",
        description: "Completed 10 lessons",
        icon: "🎯",
        lessonsRequired: 10,
      },
      {
        id: "lessons_20",
        name: "Making Progress",
        description: "Completed 20 lessons",
        icon: "📈",
        lessonsRequired: 20,
      },
      {
        id: "lessons_30",
        name: "Committed Learner",
        description: "Completed 30 lessons",
        icon: "🎖️",
        lessonsRequired: 30,
      },
      {
        id: "lessons_40",
        name: "Advanced Student",
        description: "Completed 40 lessons",
        icon: "🏅",
        lessonsRequired: 40,
      },
      {
        id: "lessons_50",
        name: "Arabic Scholar",
        description: "Completed 50 lessons",
        icon: "🎓",
        lessonsRequired: 50,
      },
    ];

    lessonBadges.forEach((badge) => {
      const hasEarnedBadge = newProgress.completedLessons.length >= badge.lessonsRequired;
      const alreadyHasBadge = newBadges.some((b) => b.id === badge.id);

      if (hasEarnedBadge && !alreadyHasBadge) {
        const newBadge = {
          ...badge,
          earnedAt: new Date().toISOString(),
        };
        newBadges.push(newBadge);
        badgesAwarded.push(newBadge);
      }
    });

    // XP MILESTONE BADGES
    const xpBadges = [
      {
        id: "xp_500",
        name: "Rising Star",
        description: "Earned 500 XP",
        icon: "⭐",
        xpRequired: 500,
      },
      {
        id: "xp_1000",
        name: "Knowledge Seeker",
        description: "Earned 1,000 XP",
        icon: "🔍",
        xpRequired: 1000,
      },
      {
        id: "xp_2000",
        name: "Fluency Builder",
        description: "Earned 2,000 XP",
        icon: "🏗️",
        xpRequired: 2000,
      },
      {
        id: "xp_3000",
        name: "Language Master",
        description: "Earned 3,000 XP",
        icon: "🧠",
        xpRequired: 3000,
      },
    ];

    xpBadges.forEach((badge) => {
      const hasEarnedBadge = newProgress.totalXp >= badge.xpRequired;
      const alreadyHasBadge = newBadges.some((b) => b.id === badge.id);

      if (hasEarnedBadge && !alreadyHasBadge) {
        const newBadge = {
          ...badge,
          earnedAt: new Date().toISOString(),
        };
        newBadges.push(newBadge);
        badgesAwarded.push(newBadge);
      }
    });

    return { newBadges, badgesAwarded };
  };

  const completeLesson = async (lessonId, xpGained = 10, allLessons = []) => {
    try {
      // Prevent duplicate completion
      if (progress.completedLessons.includes(lessonId)) {
        console.log("⚠️ Lesson already completed:", lessonId);
        return progress;
      }

      console.log(`🎯 Completing lesson ${lessonId} with ${xpGained} XP`);

      const newTotalXp = progress.totalXp + xpGained;
      const newCompletedLessons = [...progress.completedLessons, lessonId];
      const newLevel = Math.floor(newTotalXp / 100) + 1;
      const leveledUp = newLevel > progress.level;
      const nextLessonId = getNextLessonId(lessonId, allLessons);

      const baseUpdates = {
        totalXp: newTotalXp,
        completedLessons: newCompletedLessons,
        level: newLevel,
        lastCompletedAt: new Date().toISOString(),
        currentLesson: nextLessonId || progress.currentLesson,
        badges: progress.badges || [],
        displayName: progress.displayName || getDisplayName(currentUser),
      };

      // Update streak (once per day)
      const todayString = new Date().toDateString();
      const lastCompletedDate = progress.lastCompletedAt
        ? new Date(progress.lastCompletedAt).toDateString()
        : null;

      let streakUpdates = {};
      if (lastCompletedDate !== todayString) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();

        if (lastCompletedDate === yesterdayString) {
          streakUpdates.streak = progress.streak + 1;
        } else if (!lastCompletedDate) {
          streakUpdates.streak = 1;
        } else {
          streakUpdates.streak = 1;
        }
        streakUpdates.lastLoginDate = new Date();
      }

      const preliminaryUpdates = { ...baseUpdates, ...streakUpdates };
      const { newBadges, badgesAwarded } = checkAndAwardBadges(preliminaryUpdates);
      const finalUpdates = {
        ...preliminaryUpdates,
        badges: newBadges,
      };

      const updatedProgress = await updateProgress(finalUpdates);

      if (leveledUp) {
        console.log(`🆙 Level up! Now level ${newLevel}`);
      }
      if (streakUpdates.streak && streakUpdates.streak > progress.streak) {
        console.log(`🔥 Streak updated! Now ${streakUpdates.streak} days`);
      }
      if (badgesAwarded.length > 0) {
        console.log(`🏆 Badges awarded:`, badgesAwarded.map((b) => b.name));
      }

      return updatedProgress;
    } catch (error) {
      console.error("❌ Error completing lesson:", error);
      throw error;
    }
  };

  const updateStreakOnLogin = async () => {
    try {
      const today = new Date().toDateString();
      const lastLogin = progress.lastLoginDate?.toDateString();

      if (lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        let newStreak = progress.streak;
        if (lastLogin === yesterday.toDateString()) {
          newStreak = progress.streak;
        } else if (lastLogin && lastLogin !== today) {
          newStreak = 0;
        }

        await updateProgress({
          streak: newStreak,
          lastLoginDate: new Date(),
          displayName: progress.displayName || getDisplayName(currentUser),
        });
      }
    } catch (error) {
      console.error("❌ Error updating streak on login:", error);
    }
  };

  const resetProgress = async () => {
    try {
      const resetData = {
        totalXp: 0,
        streak: 0,
        level: 1,
        badges: [],
        completedLessons: [],
        currentLesson: "L1_01",
        lastLoginDate: null,
        lastCompletedAt: null,
        displayName: getDisplayName(currentUser), // Preserve user's name
      };

      await updateProgress(resetData);
      console.log("🔄 Progress reset successfully");
    } catch (error) {
      console.error("❌ Error resetting progress:", error);
      throw error;
    }
  };

  const getNextUnlockedLesson = (allLessons) => {
    return allLessons.find((lesson) => {
      if (progress.completedLessons.includes(lesson.id)) return false;
      if (lesson.required_xp && lesson.required_xp > progress.totalXp) return false;
      if (lesson.prerequisites && lesson.prerequisites.length > 0) {
        return lesson.prerequisites.every((prereqId) =>
          progress.completedLessons.includes(prereqId)
        );
      }
      return true;
    });
  };

  const getPracticeLessons = (allLessons) => {
    return allLessons.filter((lesson) =>
      progress.completedLessons.includes(lesson.id)
    );
  };

  const syncWithFirestore = async () => {
    if (!currentUser) {
      console.warn("⚠️ Cannot sync: user not authenticated");
      return false;
    }

    try {
      setSyncing(true);
      const success = await saveFirestoreProgress(progress);
      if (success) {
        console.log("✅ Manual sync completed successfully");
        return true;
      } else {
        console.error("❌ Manual sync failed");
        return false;
      }
    } catch (error) {
      console.error("❌ Error during manual sync:", error);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const value = {
    progress,
    loading,
    syncing,
    updateProgress,
    completeLesson,
    updateStreak: updateStreakOnLogin,
    loadProgress: currentUser ? loadFirestoreProgress : loadLocalProgressWithUser,
    resetProgress,
    getNextUnlockedLesson,
    getPracticeLessons,
    syncWithFirestore,
    // Expose display name getter
    getDisplayName: () => getDisplayName(currentUser),
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
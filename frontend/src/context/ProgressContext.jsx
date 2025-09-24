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
    currentLesson: "L1_01", // Start with first lesson
    lastLoginDate: null,
    lastCompletedAt: null,
    displayName: null, // Add display name to progress
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load progress when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      loadFirestoreProgress();
    } else {
      loadLocalProgress();
    }
  }, [currentUser]);

  // Firestore operations
  const loadFirestoreProgress = async () => {
    try {
      setSyncing(true);
      const progressRef = doc(db, "userProgress", currentUser.uid);
      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        const firestoreData = progressSnap.data();

        // Convert Firestore timestamps back to JavaScript dates
        const normalizedProgress = {
          totalXp: firestoreData.totalXp || 0,
          streak: firestoreData.streak || 0,
          level: firestoreData.level || 1,
          badges: Array.isArray(firestoreData.badges)
            ? firestoreData.badges
            : [],
          completedLessons: Array.isArray(firestoreData.completedLessons)
            ? firestoreData.completedLessons
            : [],
          currentLesson: firestoreData.currentLesson || "L1_01",
          lastLoginDate: firestoreData.lastLoginDate?.toDate() || null,
          lastCompletedAt: firestoreData.lastCompletedAt || null,
          displayName: firestoreData.displayName || currentUser.displayName || null,
        };

        setProgress(normalizedProgress);
        console.log("Loaded progress from Firestore:", normalizedProgress);

        // Update display name if it's missing or needs improvement
        if (currentUser && (!normalizedProgress.displayName || normalizedProgress.displayName.startsWith('User '))) {
          const betterDisplayName = currentUser.displayName || 
                                   currentUser.email?.split('@')[0] || 
                                   `Learner ${currentUser.uid.slice(0, 6)}`;
          
          await updateProgress({ displayName: betterDisplayName });
          normalizedProgress.displayName = betterDisplayName;
        } else if (currentUser?.displayName && currentUser.displayName !== normalizedProgress.displayName) {
          // Update if Auth display name has changed
          await updateProgress({ displayName: currentUser.displayName });
          normalizedProgress.displayName = currentUser.displayName;
        }

        // Also save locally as backup
        saveLocalProgress(normalizedProgress);
      } else {
        // No Firestore data - check for local data to migrate
        await migrateLocalToFirestore();
      }
    } catch (error) {
      console.error(
        "Error loading Firestore progress, falling back to local:",
        error
      );
      loadLocalProgress();
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  const saveFirestoreProgress = async (progressData) => {
    if (!currentUser) return false;

    try {
      setSyncing(true);
      const progressRef = doc(db, "userProgress", currentUser.uid);

      // Ensure display name is always set when saving to Firestore
      const dataToSave = {
        ...progressData,
        displayName: progressData.displayName || 
                    currentUser.displayName || 
                    currentUser.email?.split('@')[0] || 
                    `User ${currentUser.uid.slice(0, 8)}`,
        lastLoginDate: progressData.lastLoginDate ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      };

      await setDoc(progressRef, dataToSave, { merge: true });
      console.log("Progress saved to Firestore");
      return true;
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const migrateLocalToFirestore = async () => {
    try {
      const localData = localStorage.getItem("arabicJubaProgress");
      if (localData && currentUser) {
        const parsed = JSON.parse(localData);
        console.log("Migrating local progress to Firestore:", parsed);

        const normalizedProgress = {
          totalXp: parsed.totalXp || 0,
          streak: parsed.streak || 0,
          level: parsed.level || 1,
          badges: Array.isArray(parsed.badges) ? parsed.badges : [],
          completedLessons: Array.isArray(parsed.completedLessons)
            ? parsed.completedLessons
            : [],
          currentLesson: parsed.currentLesson || "L1_01",
          lastLoginDate: parsed.lastLoginDate
            ? new Date(parsed.lastLoginDate)
            : null,
          lastCompletedAt: parsed.lastCompletedAt || null,
          displayName: parsed.displayName || currentUser.displayName || null,
        };

        setProgress(normalizedProgress);
        await saveFirestoreProgress(normalizedProgress);
        console.log("Migration completed successfully");
      } else {
        // No local data either - use defaults with current user info
        console.log("No local data found, using defaults");
        const defaultProgress = {
          totalXp: 0,
          streak: 0,
          level: 1,
          badges: [],
          completedLessons: [],
          currentLesson: "L1_01",
          lastLoginDate: null,
          lastCompletedAt: null,
          displayName: currentUser?.displayName || null,
        };
        setProgress(defaultProgress);
        updateStreakOnLogin();
        // Save initial progress to Firestore
        if (currentUser) {
          await saveFirestoreProgress(defaultProgress);
        }
      }
    } catch (error) {
      console.error("Error during migration:", error);
      loadLocalProgress();
    }
  };

  // Local storage operations (fallback when offline or not authenticated)
  const loadLocalProgress = () => {
    try {
      const savedProgress = localStorage.getItem("arabicJubaProgress");
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);

        // Ensure all required fields exist with proper defaults
        const normalizedProgress = {
          totalXp: parsed.totalXp || 0,
          streak: parsed.streak || 0,
          level: parsed.level || 1,
          badges: Array.isArray(parsed.badges) ? parsed.badges : [],
          completedLessons: Array.isArray(parsed.completedLessons)
            ? parsed.completedLessons
            : [],
          currentLesson: parsed.currentLesson || "L1_01",
          lastLoginDate: parsed.lastLoginDate
            ? new Date(parsed.lastLoginDate)
            : null,
          lastCompletedAt: parsed.lastCompletedAt || null,
          displayName: parsed.displayName || currentUser?.displayName || null,
        };

        setProgress(normalizedProgress);
        console.log("Loaded progress from localStorage:", normalizedProgress);
      } else {
        console.log("No saved progress found, using defaults");
        // Update streak on first load
        updateStreakOnLogin();
      }
    } catch (error) {
      console.error("Error loading local progress:", error);
      // Set safe defaults on error
      setProgress({
        totalXp: 0,
        streak: 0,
        level: 1,
        badges: [],
        completedLessons: [],
        currentLesson: "L1_01",
        lastLoginDate: null,
        lastCompletedAt: null,
        displayName: currentUser?.displayName || null,
      });
    }
    setLoading(false);
  };

  const saveLocalProgress = (newProgress) => {
    try {
      localStorage.setItem("arabicJubaProgress", JSON.stringify(newProgress));
      console.log("Progress saved locally as backup");
    } catch (error) {
      console.error("Error saving local progress:", error);
    }
  };

  const updateProgress = async (updates) => {
    try {
      const newProgress = { ...progress, ...updates };

      // Ensure badges is always an array
      if (!Array.isArray(newProgress.badges)) {
        newProgress.badges = [];
      }

      // Ensure completedLessons is always an array
      if (!Array.isArray(newProgress.completedLessons)) {
        newProgress.completedLessons = [];
      }

      // Ensure display name is set
      if (!newProgress.displayName && currentUser) {
        newProgress.displayName = currentUser.displayName || 
                                 currentUser.email?.split('@')[0] || 
                                 `User ${currentUser.uid.slice(0, 8)}`;
      }

      // Update state immediately for instant feedback
      setProgress(newProgress);

      // Save locally first (instant backup)
      saveLocalProgress(newProgress);

      // Try to sync with Firestore if user is authenticated
      if (currentUser) {
        const success = await saveFirestoreProgress(newProgress);
        if (!success) {
          console.warn("Firestore sync failed, but local save succeeded");
        }
      }

      return newProgress;
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  };

  // Get next lesson in sequence
  const getNextLessonId = (currentLessonId, allLessons) => {
    const currentIndex = allLessons.findIndex(
      (lesson) => lesson.id === currentLessonId
    );
    if (currentIndex === -1 || currentIndex === allLessons.length - 1) {
      return null; // No next lesson
    }
    return allLessons[currentIndex + 1].id;
  };

  // Award badges based on milestones
  const checkAndAwardBadges = (newProgress) => {
    // Ensure badges is an array
    const currentBadges = Array.isArray(newProgress.badges)
      ? newProgress.badges
      : [];
    const newBadges = [...currentBadges];
    let badgesAwarded = [];

    // LEVEL COMPLETION BADGES (All 4 Levels)
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

    // STREAK BADGES (Extended Range)
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

    // LESSON COMPLETION BADGES (Progressive Milestones)
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
      const hasEarnedBadge =
        newProgress.completedLessons.length >= badge.lessonsRequired;
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

    // SPECIAL CURRICULUM BADGES
    const specialBadges = [
      {
        id: "curriculum_master",
        name: "Curriculum Master",
        description: "Completed the entire Arabic Juba curriculum",
        icon: "👑",
        specialRequirement: () => newProgress.completedLessons.length >= 56,
      }, // Total curriculum lessons
      {
        id: "cultural_explorer",
        name: "Cultural Explorer",
        description: "Deep understanding of South Sudanese culture",
        icon: "🌍",
        specialRequirement: () =>
          newProgress.level >= 4 && newProgress.completedLessons.length >= 45,
      },
    ];

    specialBadges.forEach((badge) => {
      const hasEarnedBadge = badge.specialRequirement();
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
        console.log("Lesson already completed:", lessonId);
        return progress;
      }

      console.log(`Completing lesson ${lessonId} with ${xpGained} XP`);

      const newTotalXp = progress.totalXp + xpGained;
      const newCompletedLessons = [...progress.completedLessons, lessonId];

      // Level up logic - every 100 XP = new level
      const newLevel = Math.floor(newTotalXp / 100) + 1;
      const leveledUp = newLevel > progress.level;

      // Get next lesson
      const nextLessonId = getNextLessonId(lessonId, allLessons);

      const baseUpdates = {
        totalXp: newTotalXp,
        completedLessons: newCompletedLessons,
        level: newLevel,
        lastCompletedAt: new Date().toISOString(),
        currentLesson: nextLessonId || progress.currentLesson, // Keep current if no next lesson
        badges: Array.isArray(progress.badges) ? progress.badges : [], // Ensure badges array exists
        displayName: progress.displayName || currentUser?.displayName || null, // Ensure display name is preserved
      };

      // Update streak (once per day)
      const todayString = new Date().toDateString();
      const lastCompletedDate = progress.lastCompletedAt
        ? new Date(progress.lastCompletedAt).toDateString()
        : null;

      let streakUpdates = {};
      if (lastCompletedDate !== todayString) {
        // First lesson of the day
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();

        if (lastCompletedDate === yesterdayString) {
          // Consecutive day - increase streak
          streakUpdates.streak = progress.streak + 1;
        } else if (!lastCompletedDate) {
          // First ever lesson
          streakUpdates.streak = 1;
        } else {
          // Gap in days - reset streak
          streakUpdates.streak = 1;
        }
        streakUpdates.lastLoginDate = new Date();
      }

      const preliminaryUpdates = { ...baseUpdates, ...streakUpdates };

      // Check for badges
      const { newBadges, badgesAwarded } =
        checkAndAwardBadges(preliminaryUpdates);
      const finalUpdates = {
        ...preliminaryUpdates,
        badges: newBadges,
      };

      const updatedProgress = await updateProgress(finalUpdates);

      // Log achievements
      if (leveledUp) {
        console.log(`Level up! Now level ${newLevel}`);
      }
      if (streakUpdates.streak && streakUpdates.streak > progress.streak) {
        console.log(`Streak updated! Now ${streakUpdates.streak} days`);
      }
      if (badgesAwarded.length > 0) {
        console.log(
          `Badges awarded:`,
          badgesAwarded.map((b) => b.name)
        );
      }

      console.log(
        "Lesson completed successfully:",
        lessonId,
        "New XP:",
        updatedProgress.totalXp
      );

      return updatedProgress;
    } catch (error) {
      console.error("Error completing lesson:", error);
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
          // Don't auto-increment on login, only on lesson completion
          newStreak = progress.streak;
        } else if (lastLogin && lastLogin !== today) {
          // Gap detected - reset streak to 0 (will become 1 when first lesson completed)
          newStreak = 0;
        }

        await updateProgress({
          streak: newStreak,
          lastLoginDate: new Date(),
          displayName: progress.displayName || currentUser?.displayName || null,
        });
      }
    } catch (error) {
      console.error("Error updating streak on login:", error);
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
        displayName: currentUser?.displayName || null,
      };

      await updateProgress(resetData);
      console.log("Progress reset successfully");
    } catch (error) {
      console.error("Error resetting progress:", error);
      throw error;
    }
  };

  const getNextUnlockedLesson = (allLessons) => {
    // Find the first lesson that isn't completed and meets requirements
    return allLessons.find((lesson) => {
      if (progress.completedLessons.includes(lesson.id)) return false;
      if (lesson.required_xp && lesson.required_xp > progress.totalXp)
        return false;
      if (lesson.prerequisites && lesson.prerequisites.length > 0) {
        return lesson.prerequisites.every((prereqId) =>
          progress.completedLessons.includes(prereqId)
        );
      }
      return true;
    });
  };

  // Get lessons available for practice (completed lessons)
  const getPracticeLessons = (allLessons) => {
    return allLessons.filter((lesson) =>
      progress.completedLessons.includes(lesson.id)
    );
  };

  // Manual sync function for when users want to force sync
  const syncWithFirestore = async () => {
    if (!currentUser) {
      console.warn("Cannot sync: user not authenticated");
      return false;
    }

    try {
      setSyncing(true);
      const success = await saveFirestoreProgress(progress);
      if (success) {
        console.log("Manual sync completed successfully");
        return true;
      } else {
        console.error("Manual sync failed");
        return false;
      }
    } catch (error) {
      console.error("Error during manual sync:", error);
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
    loadProgress: currentUser ? loadFirestoreProgress : loadLocalProgress,
    resetProgress,
    getNextUnlockedLesson,
    getPracticeLessons,
    syncWithFirestore,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
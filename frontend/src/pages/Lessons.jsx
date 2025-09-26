import React, { useState, useEffect, useSearchParams } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Play, Lock, CheckCircle, Clock, Star, BookOpen } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import {
  LEVEL_1_BASICS,
  LEVEL_2_GREETINGS,
  LEVEL_3_DICTIONARY,
  LEVEL_4_EVERYDAY_PHRASES,
  CURRICULUM_STRUCTURE,
} from "../data/curriculumData";

const Lessons = () => {
  const { progress } = useProgress();
  const location = useLocation();
  const [lessons, setLessons] = useState([]);
  const urlParams = new URLSearchParams(location.search);
  const levelFromUrl = urlParams.get("level");

  const [selectedLevel, setSelectedLevel] = useState(
    parseInt(levelFromUrl) || location.state?.selectedLevel || 1
  );

  // Combine all lessons from curriculum data
  useEffect(() => {
    const allLessons = [
      ...LEVEL_1_BASICS,
      ...LEVEL_2_GREETINGS,
      ...LEVEL_3_DICTIONARY,
      ...LEVEL_4_EVERYDAY_PHRASES,
    ];

    // Filter lessons by selected level and sort by order
    const levelLessons = allLessons
      .filter((lesson) => lesson.level === selectedLevel)
      .sort((a, b) => a.order - b.order);

    // Add lock status based on prerequisites and XP requirements
    const lessonsWithLocks = levelLessons.map((lesson, index) => {
      let isLocked = false;

      // Check XP requirements
      if (lesson.required_xp > progress.totalXp) {
        isLocked = true;
      }

      // Check prerequisites
      if (lesson.prerequisites && lesson.prerequisites.length > 0) {
        const hasAllPrereqs = lesson.prerequisites.every((prereqId) =>
          progress.completedLessons.includes(prereqId)
        );
        if (!hasAllPrereqs) {
          isLocked = true;
        }
      }

      // First lesson of each level is always unlocked if XP requirement is met
      if (index === 0 && lesson.required_xp <= progress.totalXp) {
        isLocked = false;
      }

      return {
        ...lesson,
        is_locked: isLocked,
      };
    });

    setLessons(lessonsWithLocks);
  }, [progress.completedLessons, progress.totalXp, selectedLevel]);

  useEffect(() => {
    if (location.state?.selectedLevel) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.selectedLevel]);

  const getLessonIcon = (lesson) => {
    if (progress.completedLessons.includes(lesson.id)) {
      return CheckCircle;
    } else if (lesson.is_locked) {
      return Lock;
    } else {
      return Play;
    }
  };

  const getLessonStatus = (lesson) => {
    if (progress.completedLessons.includes(lesson.id)) {
      return { text: "Completed", color: "text-green-600 dark:text-green-400" };
    } else if (lesson.is_locked) {
      return { text: "Locked", color: "text-gray-500 dark:text-gray-400" };
    } else {
      return { text: "Start", color: "text-blue-600 dark:text-blue-400" };
    }
  };

  const getLessonTypeIcon = (type) => {
    switch (type) {
      case "vocabulary":
        return "📚";
      case "conversation":
        return "💬";
      case "slang":
        return "🗣️";
      case "grammar":
        return "📝";
      case "dictionary":
        return "📖";
      case "phrases":
        return "💭";
      default:
        return "📖";
    }
  };

  const currentLevelInfo = CURRICULUM_STRUCTURE.levels.find(
    (level) => level.id === selectedLevel
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 sm:pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Arabic Juba Lessons
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Master Arabic Juba through structured lessons focused on South
          Sudanese culture
        </p>
      </motion.div>

      {/* Level Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          {CURRICULUM_STRUCTURE.levels.map((level) => {
            const isUnlocked =
              progress.totalXp >=
              CURRICULUM_STRUCTURE.xp_thresholds[`level_${level.id}`];
            return (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedLevel === level.id
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
                } ${
                  !isUnlocked
                    ? "opacity-60 relative"
                    : ""
                }`}
              >
                <div className="text-left">
                  <div className="font-bold text-sm sm:text-base">Level {level.id}</div>
                  <div className="text-xs opacity-90">{level.title}</div>
                  {!isUnlocked && (
                    <>
                      <div className="text-xs text-red-400 mt-1">
                        Requires{" "}
                        {CURRICULUM_STRUCTURE.xp_thresholds[`level_${level.id}`]}{" "}
                        XP
                      </div>
                      <Lock className="absolute -top-1 -right-1 h-3 w-3 text-red-400 bg-white dark:bg-gray-800 rounded-full p-0.5" />
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Level Info */}
        {currentLevelInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                  {currentLevelInfo.title}
                  <span className="text-xs sm:text-sm font-normal text-blue-600 dark:text-blue-400 ml-2 block sm:inline">
                    ({currentLevelInfo.transliteration})
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-blue-700 dark:text-blue-300 mb-3">
                  {currentLevelInfo.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                  <span>📚 {currentLevelInfo.lessons} lessons</span>
                  <span>⭐ {currentLevelInfo.total_xp} total XP</span>
                  <span>🎯 {currentLevelInfo.focus}</span>
                </div>
              </div>
              <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-blue-500 self-center sm:self-auto" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Lessons Grid */}
      <div className="grid gap-4 sm:gap-6">
        {lessons.map((lesson, index) => {
          const Icon = getLessonIcon(lesson);
          const status = getLessonStatus(lesson);
          const isCompleted = progress.completedLessons.includes(lesson.id);

          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
                lesson.is_locked
                  ? "opacity-60"
                  : "hover:shadow-xl hover:scale-[1.02]"
              } transition-all duration-300`}
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div
                      className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                        isCompleted
                          ? "bg-green-100 dark:bg-green-900"
                          : lesson.is_locked
                          ? "bg-gray-100 dark:bg-gray-700"
                          : "bg-blue-100 dark:bg-blue-900"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 sm:h-6 sm:w-6 ${
                          isCompleted
                            ? "text-green-600 dark:text-green-400"
                            : lesson.is_locked
                            ? "text-gray-500 dark:text-gray-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                        <span className="text-lg sm:text-2xl flex-shrink-0">
                          {getLessonTypeIcon(lesson.lesson_type)}
                        </span>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white truncate">
                          {lesson.title}
                        </h3>
                      </div>

                      {lesson.transliteration_title && (
                        <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mb-1 italic truncate">
                          {lesson.transliteration_title}
                        </p>
                      )}

                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                        {lesson.description}
                      </p>

                      {/* Cultural Context Preview */}
                      {lesson.cultural_context && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                          <p className="text-xs text-amber-800 dark:text-amber-200 line-clamp-2">
                            <span className="font-semibold">
                              Cultural Note:
                            </span>{" "}
                            {lesson.cultural_context.cultural_note}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{lesson.estimated_duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Star className="h-3 w-3" />
                          <span>{lesson.reward_xp} XP</span>
                        </div>
                        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {lesson.lesson_type}
                        </span>
                        {lesson.required_xp > 0 && (
                          <span className="text-xs text-gray-500">
                            Requires {lesson.required_xp} XP
                          </span>
                        )}
                      </div>

                      {/* Prerequisites */}
                      {lesson.prerequisites &&
                        lesson.prerequisites.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 truncate">
                              Prerequisites: {lesson.prerequisites.join(", ")}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto">
                    {!lesson.is_locked ? (
                      <Link
                        to={`/lessons/${lesson.id}`}
                        className={`block w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-center transition-all duration-300 hover:scale-105 ${
                          isCompleted
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                            : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                        }`}
                      >
                        {status.text}
                      </Link>
                    ) : (
                      <div className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium text-center">
                        {status.text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 sm:mt-8 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-6"
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
          Your Progress
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {progress.completedLessons.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Lessons Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {progress.totalXp}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Total XP Earned
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.max(1, Math.floor(progress.totalXp / 100))}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Current Level
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Lessons;
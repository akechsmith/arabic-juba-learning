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

console.log("Level from URL:", levelFromUrl);
console.log("Final selectedLevel:", parseInt(levelFromUrl) || location.state?.selectedLevel || 1);

  console.log("🔍 Level from URL:", levelFromUrl);
  console.log(
    "🔍 Final selectedLevel:",
    parseInt(levelFromUrl) || location.state?.selectedLevel || 1
  );

  console.log(
    "🔍 Initial selectedLevel set to:",
    location.state?.selectedLevel || 1
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
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Arabic Juba Lessons
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Master Arabic Juba through structured lessons focused on South
          Sudanese culture
        </p>
      </motion.div>

      {/* Level Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {CURRICULUM_STRUCTURE.levels.map((level) => {
            const isUnlocked =
              progress.totalXp >=
              CURRICULUM_STRUCTURE.xp_thresholds[`level_${level.id}`];
            return (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                disabled={!isUnlocked}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedLevel === level.id
                    ? "bg-blue-500 text-white shadow-lg"
                    : isUnlocked
                    ? "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="text-left">
                  <div className="font-bold">Level {level.id}</div>
                  <div className="text-xs opacity-90">{level.title}</div>
                  {!isUnlocked && (
                    <div className="text-xs text-red-400 mt-1">
                      Requires{" "}
                      {CURRICULUM_STRUCTURE.xp_thresholds[`level_${level.id}`]}{" "}
                      XP
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Level Info */}
        {currentLevelInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                  {currentLevelInfo.title}
                  <span className="text-sm font-normal text-blue-600 dark:text-blue-400 ml-2">
                    ({currentLevelInfo.transliteration})
                  </span>
                </h2>
                <p className="text-blue-700 dark:text-blue-300 mb-2">
                  {currentLevelInfo.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-blue-600 dark:text-blue-400">
                  <span>📚 {currentLevelInfo.lessons} lessons</span>
                  <span>⭐ {currentLevelInfo.total_xp} total XP</span>
                  <span>🎯 {currentLevelInfo.focus}</span>
                </div>
              </div>
              <BookOpen className="h-12 w-12 text-blue-500" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Lessons Grid */}
      <div className="grid gap-6">
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
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div
                      className={`p-3 rounded-full ${
                        isCompleted
                          ? "bg-green-100 dark:bg-green-900"
                          : lesson.is_locked
                          ? "bg-gray-100 dark:bg-gray-700"
                          : "bg-blue-100 dark:bg-blue-900"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          isCompleted
                            ? "text-green-600 dark:text-green-400"
                            : lesson.is_locked
                            ? "text-gray-500 dark:text-gray-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">
                          {getLessonTypeIcon(lesson.lesson_type)}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          {lesson.title}
                        </h3>
                      </div>

                      {lesson.transliteration_title && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1 italic">
                          {lesson.transliteration_title}
                        </p>
                      )}

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {lesson.description}
                      </p>

                      {/* Cultural Context Preview */}
                      {lesson.cultural_context && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3">
                          <p className="text-xs text-amber-800 dark:text-amber-200">
                            <span className="font-semibold">
                              Cultural Note:
                            </span>{" "}
                            {lesson.cultural_context.cultural_note}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-4">
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
                            <p className="text-xs text-gray-500">
                              Prerequisites: {lesson.prerequisites.join(", ")}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="ml-4">
                    {!lesson.is_locked ? (
                      <Link
                        to={`/lessons/${lesson.id}`}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                          isCompleted
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                            : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                        }`}
                      >
                        {status.text}
                      </Link>
                    ) : (
                      <div className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
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
        className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Your Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {progress.completedLessons.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Lessons Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {progress.totalXp}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total XP Earned
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.max(1, Math.floor(progress.totalXp / 100))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current Level
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Lessons;

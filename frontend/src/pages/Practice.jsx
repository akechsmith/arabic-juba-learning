import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Star,
  Clock,
  ArrowLeft,
  Play,
  CheckCircle,
  Book,
  MessageSquare,
  List,
  Lightbulb,
} from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import {
  LEVEL_1_BASICS,
  LEVEL_2_GREETINGS,
  LEVEL_3_DICTIONARY,
  LEVEL_4_EVERYDAY_PHRASES,
} from "../data/curriculumData";

const Practice = () => {
  const navigate = useNavigate();
  const { progress, getPracticeLessons } = useProgress();
  const [practiceLessons, setPracticeLessons] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("all");

  useEffect(() => {
    const allLessons = [
      ...LEVEL_1_BASICS,
      ...LEVEL_2_GREETINGS,
      ...LEVEL_3_DICTIONARY,
      ...LEVEL_4_EVERYDAY_PHRASES,
    ];
    const availablePracticeLessons = getPracticeLessons(allLessons);
    setPracticeLessons(availablePracticeLessons);
  }, [progress.completedLessons, getPracticeLessons]);

  const filteredLessons =
    selectedLevel === "all"
      ? practiceLessons
      : practiceLessons.filter(
          (lesson) => lesson.level === parseInt(selectedLevel)
        );

  const getLevelProgress = (level) => {
    const levelLessons = practiceLessons.filter(
      (lesson) => lesson.level === level
    );
    return levelLessons.length;
  };

  const getLevelIcon = (lessonType) => {
    switch (lessonType) {
      case "vocabulary":
        return <Book className="h-4 w-4" />;
      case "conversation":
        return <MessageSquare className="h-4 w-4" />;
      case "dictionary":
        return <List className="h-4 w-4" />;
      case "phrases":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 1:
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          badge:
            "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
          button:
            "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
        };
      case 2:
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          badge:
            "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
          button:
            "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
        };
      case 3:
        return {
          bg: "bg-purple-50 dark:bg-purple-900/20",
          badge:
            "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
          button:
            "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
        };
      case 4:
        return {
          bg: "bg-orange-50 dark:bg-orange-900/20",
          badge:
            "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
          button:
            "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-900/20",
          badge:
            "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400",
          button:
            "from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
        };
    }
  };

  const getLevelName = (level) => {
    switch (level) {
      case 1:
        return "Basics";
      case 2:
        return "Greetings";
      case 3:
        return "Dictionary";
      case 4:
        return "Everyday Phrases";
      default:
        return "Unknown";
    }
  };

  if (practiceLessons.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </motion.div>

        <div className="text-center py-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            No Completed Lessons Yet
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Complete some lessons first, then return here to practice and review
            your learning!
          </p>

          <button
            onClick={() => navigate("/lessons")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Start Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Practice Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Review and practice completed lessons
          </p>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-8"
      >
        {[
          { value: "all", label: "All Lessons" },
          { value: "1", label: "Level 1 • Basics" },
          { value: "2", label: "Level 2 • Greetings" },
          { value: "3", label: "Level 3 • Dictionary" },
          { value: "4", label: "Level 4 • Phrases" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedLevel(tab.value)}
            className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
              selectedLevel === tab.value
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Lessons Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredLessons.map((lesson, index) => {
          const colors = getLevelColor(lesson.level);
          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Lesson Header */}
              <div className={`p-4 ${colors.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}
                    >
                      Level {lesson.level} • {getLevelName(lesson.level)}
                    </span>
                    {lesson.lesson_type && (
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        {getLevelIcon(lesson.lesson_type)}
                        <span className="text-xs capitalize">
                          {lesson.lesson_type}
                        </span>
                      </div>
                    )}
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>

                <h3 className="font-bold text-gray-800 dark:text-white mb-1">
                  {lesson.title}
                </h3>
                {lesson.transliteration_title && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {lesson.transliteration_title}
                  </p>
                )}
              </div>

              {/* Lesson Content */}
              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {lesson.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{lesson.estimated_duration} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{lesson.reward_xp} XP</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                  className={`w-full px-4 py-2 bg-gradient-to-r ${colors.button} text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2`}
                >
                  <Play className="h-4 w-4" />
                  <span>Practice Again</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredLessons.length === 0 && selectedLevel !== "all" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            {selectedLevel === "1" && (
              <Book className="h-8 w-8 text-blue-500" />
            )}
            {selectedLevel === "2" && (
              <MessageSquare className="h-8 w-8 text-green-500" />
            )}
            {selectedLevel === "3" && (
              <List className="h-8 w-8 text-purple-500" />
            )}
            {selectedLevel === "4" && (
              <Lightbulb className="h-8 w-8 text-orange-500" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No Level {selectedLevel} Lessons Completed
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Complete some Level {selectedLevel} •{" "}
            {getLevelName(parseInt(selectedLevel))} lessons to practice them
            here.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Practice;

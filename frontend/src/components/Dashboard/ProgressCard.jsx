import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Target } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { LEVEL_1_BASICS, LEVEL_2_GREETINGS, LEVEL_3_DICTIONARY, LEVEL_4_EVERYDAY_PHRASES } from '../../data/curriculumData';

const ProgressCard = () => {
  const { progress, getNextUnlockedLesson } = useProgress();
  
  // Get all lessons from all levels
  const allLessons = [
    ...LEVEL_1_BASICS, 
    ...LEVEL_2_GREETINGS, 
    ...LEVEL_3_DICTIONARY, 
    ...LEVEL_4_EVERYDAY_PHRASES
  ];
  
  const nextUnlockedLesson = getNextUnlockedLesson(allLessons);
  const currentLessonTitle = nextUnlockedLesson 
    ? nextUnlockedLesson.title.split('(')[0].trim() 
    : 'All Complete!';
  
  const currentLevelXP = (progress.level - 1) * 100;
  const nextLevelXP = progress.level * 100;
  const progressToNext = ((progress.totalXp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Learning Progress
        </h3>
        <BookOpen className="h-6 w-6 text-blue-500" />
      </div>

      <div className="space-y-6">
        {/* Level Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Level {progress.level}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {progress.totalXp} / {nextLevelXP} XP
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max(progressToNext, 0), 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {progress.completedLessons.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Lessons Completed
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {currentLessonTitle}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current Lesson
            </div>
          </div>
        </div>

        {/* Next Goal */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Next Goal
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {Math.max(0, nextLevelXP - progress.totalXp)} XP to reach Level {progress.level + 1}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressCard;
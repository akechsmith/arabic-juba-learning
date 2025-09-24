import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Flame, Target } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';

const StreakCard = () => {
  const { progress } = useProgress();
  
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (new Date().getDay() - 6 + i + 7) % 7;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const isCompleted = i < progress.streak;
    const isToday = i === 6;
    
    return {
      day: dayNames[dayIndex],
      completed: isCompleted,
      isToday
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Learning Streak
        </h3>
        <Flame className="h-6 w-6 text-orange-500" />
      </div>
      
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-orange-500 mb-1">
          {progress.streak}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          day{progress.streak !== 1 ? 's' : ''} in a row
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {streakDays.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {day.day}
            </div>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: day.completed ? 1.1 : 1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                day.completed
                  ? 'bg-orange-500 text-white'
                  : day.isToday
                  ? 'bg-orange-100 dark:bg-orange-900 border-2 border-orange-500'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              {day.completed && <Flame className="h-4 w-4" />}
              {day.isToday && !day.completed && <Target className="h-4 w-4 text-orange-500" />}
            </motion.div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Keep it up! Complete today's lesson to continue your streak.
        </p>
      </div>
    </motion.div>
  );
};

export default StreakCard;
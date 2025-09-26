import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { Flame, Star, Trophy, Book, Target } from 'lucide-react';
import StreakCard from '../components/Dashboard/StreakCard';
import ProgressCard from '../components/Dashboard/ProgressCard';
import BadgesCard from '../components/Dashboard/BadgesCard';
import QuickActions from '../components/Dashboard/QuickActions';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { progress, updateStreak } = useProgress();

  useEffect(() => {
    updateStreak();
  }, []);

  const stats = [
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${progress.streak} days`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900'
    },
    {
      icon: Star,
      label: 'Total XP',
      value: progress.totalXp, 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    },
    {
      icon: Trophy,
      label: 'Level',
      value: progress.level,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      icon: Book,
      label: 'Lessons Completed',
      value: progress.completedLessons.length,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4 sm:py-8"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
          Welcome back, {currentUser?.displayName || 'Learner'}! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Ready to continue your Arabic Juba journey?
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <ProgressCard />
          <QuickActions />
        </div>
        <div className="space-y-4 sm:space-y-6">
          <StreakCard />
          <BadgesCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
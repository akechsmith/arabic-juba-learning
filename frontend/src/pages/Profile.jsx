import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Star, Trophy, Calendar, Settings, LogOut, Moon, Sun, Mail, Award, Flame, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { progress, resetProgress } = useProgress();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [isResettingProgress, setIsResettingProgress] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // FIXED: Use totalXp instead of totalXP
  const stats = [
    { label: 'Total XP', value: progress.totalXp || 0, icon: Star, color: 'text-yellow-500' },
    { label: 'Current Level', value: progress.level || 1, icon: Trophy, color: 'text-purple-500' },
    { label: 'Lessons Completed', value: progress.completedLessons?.length || 0, icon: User, color: 'text-blue-500' },
    { label: 'Current Streak', value: `${progress.streak || 0} days`, icon: Calendar, color: 'text-orange-500' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleResetProgress = async () => {
    if (window.confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
      try {
        setIsResettingProgress(true);
        await resetProgress();
        alert('Progress reset successfully!');
      } catch (error) {
        console.error('Failed to reset progress:', error);
        alert('Failed to reset progress. Please try again.');
      } finally {
        setIsResettingProgress(false);
      }
    }
  };

  // Helper function to get badge icon
  const getBadgeIcon = (badge) => {
    if (badge.icon) {
      return badge.icon;
    }
    // Fallback icons based on badge type
    if (badge.id.startsWith('level_')) return '🏆';
    if (badge.id.startsWith('streak_')) return '🔥';
    if (badge.id.startsWith('lessons_')) return '📚';
    if (badge.id.startsWith('xp_')) return '⭐';
    return '🎖️';
  };

  const getBadgeColor = (badge) => {
    if (badge.id.startsWith('level_')) return 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
    if (badge.id.startsWith('streak_')) return 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    if (badge.id.startsWith('lessons_')) return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (badge.id.startsWith('xp_')) return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-3xl">
              {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {currentUser?.displayName || 'Arabic Juba Learner'}
        </h1>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <p className="text-gray-600 dark:text-gray-300">
            {currentUser?.email}
          </p>
        </div>
        
        {/* Level Badge */}
        <div className="mt-4 inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/20 px-4 py-2 rounded-full">
          <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Level {progress.level || 1} Learner
          </span>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg border border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 lg:p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <stat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.color}`} />
                    <div>
                      <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <p className="text-lg lg:text-xl font-bold text-gray-800 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Achievements Preview */}
            {progress.badges && progress.badges.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Recent Achievements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {progress.badges.slice(-3).map((badge, index) => (
                    <div
                      key={badge.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${getBadgeColor(badge)}`}
                    >
                      <span className="text-2xl">{getBadgeIcon(badge)}</span>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white text-sm">
                          {badge.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {badge.earnedAt && new Date(badge.earnedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                >
                  View all achievements →
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Your Badges ({progress.badges?.length || 0})
            </h3>
            
            {progress.badges && progress.badges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {progress.badges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-3 p-4 rounded-lg border ${getBadgeColor(badge)}`}
                  >
                    <span className="text-3xl">{getBadgeIcon(badge)}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 dark:text-white">
                        {badge.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {badge.description}
                      </div>
                      {badge.earnedAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Earned {new Date(badge.earnedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No badges earned yet!
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Complete lessons and maintain streaks to earn your first badges
                </p>
                <div className="mt-4 space-y-2 text-xs text-gray-400 dark:text-gray-500">
                  <div className="flex items-center justify-center space-x-1">
                    <Target className="h-3 w-3" />
                    <span>Complete 5 lessons for your first badge</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Flame className="h-3 w-3" />
                    <span>Build a 3-day streak for another badge</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
              Settings
            </h3>
            
            <div className="space-y-6">
              {/* Theme Setting */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {isDark ? (
                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      Theme
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Switch between light and dark mode
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDark ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDark ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Account Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Mail className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      Account Email
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Reset */}
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-red-800 dark:text-red-200">
                      Reset Progress
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      This will delete all your progress, badges, and streak data permanently.
                    </p>
                  </div>
                  <button
                    onClick={handleResetProgress}
                    disabled={isResettingProgress}
                    className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                  >
                    {isResettingProgress ? 'Resetting...' : 'Reset'}
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
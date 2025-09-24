import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Trophy, Star, Flame, Medal, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  getDoc,
  where 
} from 'firebase/firestore';
import { db } from '../services/firebase';

const Leaderboard = () => {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setError('Please log in to view the leaderboard');
      return;
    }

    let unsubscribeLeaderboard;
    let unsubscribeCurrentUser;

    const setupLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query for top 100 users by totalXp only (no composite index needed)
        const leaderboardQuery = query(
          collection(db, 'userProgress'),
          orderBy('totalXp', 'desc'),
          limit(100)
        );

        // Real-time listener for top 100
        unsubscribeLeaderboard = onSnapshot(
          leaderboardQuery,
          async (snapshot) => {
            setUpdating(true);
            
            const leaderboardData = [];
            const userIds = [];
            let currentUserInTop100 = false;
            let currentUserData = null;

            snapshot.docs.forEach((doc, index) => {
              const data = doc.data();
              const userId = doc.id;
              userIds.push(userId);

              if (userId === currentUser.uid) {
                currentUserInTop100 = true;
                currentUserData = {
                  rank: index + 1,
                  user_id: userId,
                  display_name: data.displayName || currentUser.displayName || 'You',
                  total_xp: data.totalXp || 0,
                  level: data.level || 1,
                  streak: data.streak || 0,
                  badges_count: Array.isArray(data.badges) ? data.badges.length : 0,
                  is_current_user: true
                };
              }

              leaderboardData.push({
                rank: index + 1,
                user_id: userId,
                display_name: data.displayName || 
                            (userId === currentUser.uid ? (currentUser.displayName || 'You') : 'Anonymous User'),
                total_xp: data.totalXp || 0,
                level: data.level || 1,
                streak: data.streak || 0,
                badges_count: Array.isArray(data.badges) ? data.badges.length : 0,
                is_current_user: userId === currentUser.uid
              });
            });

            // If current user is not in top 100, fetch their data separately
            if (!currentUserInTop100) {
              try {
                const currentUserDoc = await getDoc(doc(db, 'userProgress', currentUser.uid));
                if (currentUserDoc.exists()) {
                  const userData = currentUserDoc.data();
                  
                  // Calculate current user's rank by counting users with higher XP
                  const rankQuery = query(
                    collection(db, 'userProgress'),
                    where('totalXp', '>', userData.totalXp || 0)
                  );
                  
                  const rankSnapshot = await getDoc(rankQuery);
                  const userRank = rankSnapshot.size + 1;

                  currentUserData = {
                    rank: userRank,
                    user_id: currentUser.uid,
                    display_name: userData.displayName || currentUser.displayName || 'You',
                    total_xp: userData.totalXp || 0,
                    level: userData.level || 1,
                    streak: userData.streak || 0,
                    badges_count: Array.isArray(userData.badges) ? userData.badges.length : 0,
                    is_current_user: true
                  };

                  // Add current user to the end of the list if not in top 100
                  leaderboardData.push(currentUserData);
                } else {
                  // User has no progress data yet
                  currentUserData = {
                    rank: '???',
                    user_id: currentUser.uid,
                    display_name: currentUser.displayName || 'You',
                    total_xp: 0,
                    level: 1,
                    streak: 0,
                    badges_count: 0,
                    is_current_user: true
                  };
                  leaderboardData.push(currentUserData);
                }
              } catch (error) {
                console.error('Error fetching current user data:', error);
              }
            }

            setLeaderboard(leaderboardData);
            setCurrentUserRank(currentUserData);
            setLoading(false);
            setUpdating(false);
          },
          (error) => {
            console.error('Error fetching leaderboard:', error);
            setError('Failed to load leaderboard. Please try again.');
            setLoading(false);
            setUpdating(false);
          }
        );

      } catch (error) {
        console.error('Error setting up leaderboard:', error);
        setError('Failed to load leaderboard. Please try again.');
        setLoading(false);
      }
    };

    setupLeaderboard();

    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeLeaderboard) {
        unsubscribeLeaderboard();
      }
      if (unsubscribeCurrentUser) {
        unsubscribeCurrentUser();
      }
    };
  }, [currentUser]);

  const getRankIcon = (rank) => {
    if (rank === '???') return <span className="text-lg font-bold text-gray-400">???</span>;
    
    switch (rank) {
      case 1:
        return <Medal className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
    }
  };

  const getRankColor = (rank, isCurrentUser) => {
    if (isCurrentUser) {
      return 'bg-blue-50 dark:bg-blue-900 border-2 border-blue-500';
    }
    
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900 border border-yellow-200 dark:border-yellow-700';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-700 border border-gray-200 dark:border-gray-600';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 border border-amber-200 dark:border-amber-700';
      default:
        return 'bg-gray-50 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No learners yet!
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Complete your first lesson to appear on the leaderboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Leaderboard 🏆
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          See how you rank among Arabic Juba learners worldwide
        </p>
        {updating && (
          <div className="flex items-center justify-center mt-2">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-blue-600 dark:text-blue-400">Updating...</span>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Global Rankings
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {leaderboard.filter(user => !user.is_current_user || leaderboard.indexOf(user) < 100).length} learners
            </div>
          </div>
          
          <div className="space-y-3">
            {leaderboard.map((user, index) => (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${getRankColor(user.rank, user.is_current_user)}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
                    {getRankIcon(user.rank)}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-800 dark:text-white truncate">
                      {user.display_name}
                      {user.is_current_user && (
                        <span className="ml-2 text-sm text-blue-600 dark:text-blue-400 font-normal">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Level {user.level} • {user.badges_count} badges
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.total_xp.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.streak}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {currentUserRank && currentUserRank.rank > 100 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your ranking:</p>
              <div className={`flex items-center justify-between p-4 rounded-lg ${getRankColor(currentUserRank.rank, true)}`}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(currentUserRank.rank)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {currentUserRank.display_name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Level {currentUserRank.level} • {currentUserRank.badges_count} badges
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {currentUserRank.total_xp.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {currentUserRank.streak}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
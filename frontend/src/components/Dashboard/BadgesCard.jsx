import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Award, Star, Flame, Trophy, Target } from "lucide-react";
import { useProgress } from "../../context/ProgressContext";

const BadgesCard = () => {
  const { progress } = useProgress();
  const badges = progress.badges || [];

  // Define badge icons
  const getBadgeIcon = (badge) => {
    // If badge has an icon property, use it
    if (badge.icon) {
      return () => <span className="text-white text-sm">{badge.icon}</span>;
    }

    // Fallback to original logic
    if (badge.id.startsWith("level_")) return Trophy;
    if (badge.id.startsWith("streak_")) return Flame;
    if (badge.id.startsWith("lessons_")) return Star;
    if (badge.id.startsWith("xp_")) return Award;
    return Star;
  };

  // Define badge colors
  const getBadgeColor = (badgeId) => {
    if (badgeId.startsWith("level_")) return "bg-purple-500";
    if (badgeId.startsWith("streak_")) return "bg-orange-500";
    return "bg-yellow-500";
  };

  const getBadgeTextColor = (badgeId) => {
    if (badgeId.startsWith("level_"))
      return "text-purple-600 dark:text-purple-400";
    if (badgeId.startsWith("streak_"))
      return "text-orange-600 dark:text-orange-400";
    return "text-yellow-600 dark:text-yellow-400";
  };

  const getBadgeBgColor = (badgeId) => {
    if (badgeId.startsWith("level_"))
      return "bg-purple-50 dark:bg-purple-900/20";
    if (badgeId.startsWith("streak_"))
      return "bg-orange-50 dark:bg-orange-900/20";
    return "bg-yellow-50 dark:bg-yellow-900/20";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Achievements
        </h3>
        <Award className="h-6 w-6 text-yellow-500" />
      </div>

      {badges.length > 0 ? (
        <div className="space-y-3">
          {badges.slice(0, 3).map((badge, index) => {
            const IconComponent = getBadgeIcon(badge);
            const badgeColor = getBadgeColor(badge.id);
            const textColor = getBadgeTextColor(badge.id);
            const bgColor = getBadgeBgColor(badge.id);

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-3 ${bgColor} rounded-lg border border-opacity-20`}
              >
                <div
                  className={`w-8 h-8 ${badgeColor} rounded-full flex items-center justify-center`}
                >
                  {badge.icon ? (
                    <span className="text-white text-lg">{badge.icon}</span>
                  ) : (
                    <IconComponent className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${textColor}`}>{badge.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {badge.description}
                  </div>
                  {badge.earnedAt && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {badges.length > 3 && (
            <div className="text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                +{badges.length - 3} more badge
                {badges.length - 3 > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Award className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Complete lessons to earn badges!
          </p>
          <div className="space-y-2 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center justify-center space-x-1">
              <Target className="h-3 w-3" />
              <span>Complete Level 1 for your first badge</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <Flame className="h-3 w-3" />
              <span>Build a 3-day streak</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress towards next badges */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Progress towards next badges:
        </div>
        <div className="space-y-2">
          {/* Next level badge */}
          {progress.level === 1 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-600 dark:text-purple-400">
                Level 2 Master
              </span>
              <span className="text-gray-500">Level {progress.level}/2</span>
            </div>
          )}

          {/* Next streak badge */}
          {progress.streak < 3 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600 dark:text-orange-400">
                3-Day Streak
              </span>
              <span className="text-gray-500">{progress.streak}/3 days</span>
            </div>
          )}
          {progress.streak >= 3 && progress.streak < 7 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600 dark:text-orange-400">
                Week Warrior
              </span>
              <span className="text-gray-500">{progress.streak}/7 days</span>
            </div>
          )}
          {progress.streak >= 7 && progress.streak < 30 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600 dark:text-orange-400">
                Month Master
              </span>
              <span className="text-gray-500">{progress.streak}/30 days</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BadgesCard;

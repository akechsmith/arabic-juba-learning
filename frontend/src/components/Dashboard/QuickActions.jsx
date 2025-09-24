import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen, Users, Brain, CheckCircle } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { LEVEL_1_BASICS, LEVEL_2_GREETINGS, LEVEL_3_DICTIONARY, LEVEL_4_EVERYDAY_PHRASES } from '../../data/curriculumData';

const QuickActions = () => {
  const navigate = useNavigate();
  const { progress, getNextUnlockedLesson, getPracticeLessons } = useProgress();

  // Get ALL lessons from all levels
  const allLessons = [
    ...LEVEL_1_BASICS, 
    ...LEVEL_2_GREETINGS, 
    ...LEVEL_3_DICTIONARY, 
    ...LEVEL_4_EVERYDAY_PHRASES
  ];

  // Find the actual next lesson to continue with
  const nextUnlockedLesson = getNextUnlockedLesson(allLessons);
  const currentLessonData = nextUnlockedLesson || allLessons.find(lesson => lesson.id === progress.currentLesson);
  
  const completedLessonsCount = progress.completedLessons.length;
  const practiceLessonsCount = getPracticeLessons ? getPracticeLessons(allLessons).length : completedLessonsCount;

  const actions = [
    {
      title: currentLessonData ? 'Continue Learning' : 'All Lessons Complete!',
      description: currentLessonData 
        ? `Resume: ${currentLessonData.title.split('(')[0].trim()}` 
        : 'Congratulations on finishing all lessons!',
      icon: currentLessonData ? Play : CheckCircle,
      color: currentLessonData ? 'bg-green-500' : 'bg-green-500',
      hoverColor: currentLessonData ? 'hover:bg-green-600' : 'hover:bg-green-600',
      onClick: () => currentLessonData 
        ? navigate(`/lessons/${currentLessonData.id}`) 
        : navigate('/lessons'),
      disabled: !currentLessonData
    },
    {
      title: 'Browse Lessons',
      description: `${allLessons.length} lessons available`, 
      icon: BookOpen,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => navigate('/lessons')
    },
    {
      title: 'View Leaderboard',
      description: 'See how you rank globally',
      icon: Users,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      onClick: () => navigate('/leaderboard')
    },
    {
      title: 'Practice Mode',
      description: practiceLessonsCount > 0 
        ? `${practiceLessonsCount} lessons to review`
        : 'Complete lessons to unlock',
      icon: Brain,
      color: practiceLessonsCount > 0 ? 'bg-orange-500' : 'bg-gray-400',
      hoverColor: practiceLessonsCount > 0 ? 'hover:bg-orange-600' : 'hover:bg-gray-500',
      onClick: () => navigate('/practice'),
      disabled: practiceLessonsCount === 0
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg font-semibold text-gray-800 dark:text-white mb-6"
      >
        Quick Actions
      </motion.h3>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {actions.map((action, index) => (
          <motion.button
            key={action.title}
            onClick={action.onClick}
            disabled={action.disabled}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={!action.disabled ? { scale: 1.02 } : {}}
            whileTap={!action.disabled ? { scale: 0.98 } : {}}
            className={`p-4 rounded-xl ${action.color} ${
              !action.disabled ? action.hoverColor : 'cursor-not-allowed opacity-60'
            } text-white transition-all duration-200 text-left`}
          >
            <div className="flex items-center space-x-3">
              <action.icon className="h-6 w-6" />
              <div>
                <div className="font-medium">{action.title}</div>
                <div className="text-sm opacity-90">{action.description}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default QuickActions;
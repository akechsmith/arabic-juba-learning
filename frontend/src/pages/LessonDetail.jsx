import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Volume2,
  CheckCircle,
  BookOpen,
  Globe,
  Info,
  Target,
  Clock,
  Star,
  Trophy,
} from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import MultipleChoice from "../components/Games/MultipleChoice";
import toast from "react-hot-toast";
import {
  LEVEL_1_BASICS,
  LEVEL_2_GREETINGS,
  LEVEL_3_DICTIONARY,
  LEVEL_4_EVERYDAY_PHRASES,
} from "../data/curriculumData";

const getDialogueTitle = (exerciseType) => {
  const titleMap = {
    vocabulary_identification: "Vocabulary Quiz:",
    pronunciation_rule: "Pronunciation Practice:",
    market_scenario: "Market Conversation:",
    business_scenario: "Business Discussion:",
    greeting_sequence: "Greeting Exchange:",
    context_matching: "Social Situation:",
    formality_level: "Conversation:",
    age_conversation: "Personal Chat:",
    seasonal_planning: "Planning Discussion:",
    agricultural_calendar: "Farmer's Wisdom:",
    multiple_choice: "Knowledge Check:",
    cultural_context: "Cultural Understanding:",
    practical_application: "Real-world Practice:",
  };

  return titleMap[exerciseType] || "Exercise:";
};

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { completeLesson, progress } = useProgress();

  const [lesson, setLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState("intro");
  const [currentExercise, setCurrentExercise] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVocabulary, setShowVocabulary] = useState(true);

  useEffect(() => {
    const allLessons = [
      ...LEVEL_1_BASICS,
      ...LEVEL_2_GREETINGS,
      ...LEVEL_3_DICTIONARY,
      ...LEVEL_4_EVERYDAY_PHRASES,
    ];
    const foundLesson = allLessons.find((l) => l.id === id);

    if (foundLesson) {
      setLesson(foundLesson);
      setCurrentSection("intro");
      setCurrentExercise(0);
      setScore(0);
      setCompleted(false);
      setShowVocabulary(true);
    } else {
      toast.error("Lesson not found");
      navigate("/lessons");
    }

    setLoading(false);
  }, [id, navigate]);

  const handleExerciseComplete = (isCorrect) => {
    if (!lesson.exercises || !lesson.exercises[currentExercise]) {
      console.error("No exercise data found");
      return;
    }

    const currentExerciseData = lesson.exercises[currentExercise];

    if (isCorrect) {
      const pointsEarned = currentExerciseData.points || 10;
      const newScore = score + pointsEarned;
      setScore(newScore);
      toast.success("Correct! Well done!");
    } else {
      toast.error("Try again next time!");
    }

    setTimeout(() => {
      if (currentExercise < lesson.exercises.length - 1) {
        setCurrentExercise(currentExercise + 1);
      } else {
        handleLessonComplete();
      }
    }, 2000);
  };

  const handleLessonComplete = async () => {
    try {
      const result = await completeLesson(lesson.id, lesson.reward_xp);
      setCompleted(true);
      toast.success(`Lesson completed! +${lesson.reward_xp} XP earned!`);
    } catch (error) {
      console.error("Failed to complete lesson:", error);
      toast.error(`Failed to save progress: ${error.message}`);
    }
  };

  const playAudio = (audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    } else {
      toast("Audio would play here", { icon: "🔊" });
    }
  };

  const getNextLessonId = (currentLessonId) => {
    const match = currentLessonId.match(/^(L\d+)_(\d+)$/);
    if (!match) return null;

    const [, levelPrefix, lessonNum] = match;
    const currentNum = parseInt(lessonNum);
    const nextLessonId = `${levelPrefix}_${String(currentNum + 1).padStart(2, "0")}`;

    const allLessons = [
      ...LEVEL_1_BASICS,
      ...LEVEL_2_GREETINGS,
      ...LEVEL_3_DICTIONARY,
      ...LEVEL_4_EVERYDAY_PHRASES,
    ];

    const nextLesson = allLessons.find((l) => l.id === nextLessonId);
    if (nextLesson) {
      return nextLessonId;
    }

    const levelNum = parseInt(levelPrefix.substring(1));
    const nextLevel = levelNum + 1;

    if (nextLevel <= 4) {
      const nextLevelFirstLesson = `L${nextLevel}_01`;
      const nextLevelLesson = allLessons.find((l) => l.id === nextLevelFirstLesson);
      if (nextLevelLesson) {
        return nextLevelFirstLesson;
      }
    }

    return null;
  };

  const handleNextLesson = async () => {
    const nextLessonId = getNextLessonId(lesson.id);

    if (!lesson.exercises || lesson.exercises.length === 0) {
      try {
        await completeLesson(lesson.id, lesson.reward_xp);
        toast.success(`Lesson completed! +${lesson.reward_xp} XP earned!`);
      } catch (error) {
        console.error("Failed to complete lesson:", error);
        toast.error(`Failed to save progress: ${error.message}`);
        return;
      }
    }

    if (nextLessonId) {
      setCurrentSection("intro");
      setCurrentExercise(0);
      setScore(0);
      setCompleted(false);
      setShowVocabulary(true);

      const nextLessonMatch = nextLessonId.match(/^L(\d+)_/);
      const nextLessonLevel = nextLessonMatch ? parseInt(nextLessonMatch[1]) : lesson.level;

      try {
        navigate(`/lessons/${nextLessonId}`, {
          state: { selectedLevel: nextLessonLevel },
        });
      } catch (error) {
        console.error(`Failed to navigate to lesson ${nextLessonId}:`, error);
        toast.error(`Lesson ${nextLessonId} is not available yet. Returning to lessons.`);
        navigate("/lessons", { state: { selectedLevel: lesson.level } });
      }
    } else {
      toast.success("Congratulations! You've completed all available lessons!");
      navigate("/lessons");
    }
  };

  const handleBackToLessons = () => {
    const currentLevel = lesson?.level || 1;
    navigate(`/lessons?level=${currentLevel}`);
  };

  const startExercises = () => {
    setCurrentSection("exercises");
    setCurrentExercise(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!lesson) {
    const levelMatch = id?.match(/^L(\d+)_/);
    const fallbackLevel = levelMatch ? parseInt(levelMatch[1]) : 1;
    
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Lesson Not Found
        </h2>
        <button
          onClick={() => navigate(`/lessons?level=${fallbackLevel}`)}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          Back to Lessons
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="pb-20 sm:pb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="h-12 w-12 text-white" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            أحسنت! Well Done!
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base">
            You earned{" "}
            <span className="font-bold text-blue-600">{lesson.reward_xp} XP</span>{" "}
            and scored{" "}
            <span className="font-bold text-green-600">{score} points</span>!
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 sm:p-6 mb-6 text-left">
            <h3 className="font-bold text-green-800 dark:text-green-200 mb-2 text-sm sm:text-base">
              What you learned:
            </h3>
            <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm">
              {lesson.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
            <button
              onClick={handleBackToLessons}
              className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Back to Lessons
            </button>
            <button
              onClick={handleNextLesson}
              className="w-full sm:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              Next Lesson
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 sm:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4"
      >
        <button
          onClick={() => navigate("/lessons")}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors self-start"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Lessons</span>
        </button>

        <div className="text-left sm:text-right">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            {lesson.title}
          </h1>
          <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 italic">
            {lesson.transliteration_title}
          </p>
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">
            <span className="flex items-center space-x-1">
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Level {lesson.level}</span>
            </span>
            <span className="flex items-center space-x-1">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="capitalize">{lesson.lesson_type}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{lesson.estimated_duration} min</span>
            </span>
            <span className="flex items-center space-x-1">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{lesson.reward_xp} XP</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Cultural Context Banner */}
      {lesson.cultural_context && currentSection !== "exercises" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-start space-x-3 sm:space-x-4">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2 text-sm sm:text-base">
                South Sudanese Cultural Context
              </h3>
              <p className="text-amber-700 dark:text-amber-300 mb-2 text-xs sm:text-sm">
                <span className="font-semibold">Background:</span>{" "}
                {lesson.cultural_context.background}
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm">
                <span className="font-semibold">Cultural Note:</span>{" "}
                {lesson.cultural_context.cultural_note}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Bar for Exercises */}
      {currentSection === "exercises" && lesson.exercises && (
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Exercise Progress
            </span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {currentExercise + 1} / {lesson.exercises.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((currentExercise + 1) / lesson.exercises.length) * 100}%`,
              }}
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      )}

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {currentSection === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">
                  Lesson Introduction
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-lg mb-4 sm:mb-6 leading-relaxed">
                {lesson.content?.introduction || lesson.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setCurrentSection("content")}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Start Learning</span>
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                {lesson.exercises && lesson.exercises.length > 0 && (
                  <button
                    onClick={startExercises}
                    className="w-full sm:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Skip to Exercises
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {currentSection === "content" && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {lesson.content?.vocabulary && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
                    <span>📚</span>
                    <span>Vocabulary</span>
                  </h3>
                  <button
                    onClick={() => setShowVocabulary(!showVocabulary)}
                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showVocabulary ? "Hide" : "Show"} Details
                  </button>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {lesson.content.vocabulary.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                        <div className="flex-1">
                          <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            {item.arabic}
                          </div>
                          <div className="text-blue-600 dark:text-blue-400 font-medium mb-1 text-sm sm:text-base">
                            {item.transliteration}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {item.pronunciation}
                          </div>
                          <div className="text-sm sm:text-lg text-gray-700 dark:text-gray-300">
                            {item.english}
                          </div>
                        </div>
                        <button
                          onClick={() => playAudio(item.audio_url)}
                          className="self-start sm:self-center p-2 sm:p-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-full transition-colors"
                        >
                          <Volume2 className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                        </button>
                      </div>

                      {showVocabulary && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200 dark:border-blue-700"
                        >
                          {item.example_sentence && (
                            <div className="mb-3">
                              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                                📝 Example:
                              </div>
                              <div className="text-xs sm:text-sm">
                                <div className="font-semibold text-gray-800 dark:text-gray-200">
                                  {item.example_sentence.arabic}
                                </div>
                                <div className="text-blue-600 dark:text-blue-400 text-xs">
                                  {item.example_sentence.transliteration}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 text-xs">
                                  {item.example_sentence.english}
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={() => setCurrentSection("intro")}
                className="w-full sm:w-auto px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Back to Introduction
              </button>
              {lesson.exercises && lesson.exercises.length > 0 ? (
                <button
                  onClick={startExercises}
                  className="w-full sm:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  Start Exercises
                </button>
              ) : (
                <button
                  onClick={handleNextLesson}
                  className="w-full sm:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  Next Lesson
                </button>
              )}
            </div>
          </motion.div>
        )}

        {currentSection === "exercises" && lesson.exercises && (
          <motion.div
            key="exercises"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">
                    Exercise {currentExercise + 1}
                  </h2>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {getDialogueTitle(lesson.exercises[currentExercise]?.type)}
                </span>
              </div>

              {lesson.exercises[currentExercise] && (
                <div>
                  {lesson.exercises[currentExercise].scenario && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start space-x-3">
                        <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1 text-sm sm:text-base">
                            Scenario
                          </h3>
                          <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">
                            {lesson.exercises[currentExercise].scenario}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {lesson.exercises[currentExercise].cultural_context && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start space-x-3">
                        <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1 text-sm sm:text-base">
                            Cultural Context
                          </h3>
                          <p className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm">
                            {lesson.exercises[currentExercise].cultural_context}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4 sm:mb-6">
                    {lesson.exercises[currentExercise].question &&
                    lesson.exercises[currentExercise].options &&
                    lesson.exercises[currentExercise].options.length > 0 &&
                    lesson.exercises[currentExercise].correct_answer !== undefined ? (
                      <MultipleChoice
                        question={lesson.exercises[currentExercise].question}
                        options={lesson.exercises[currentExercise].options}
                        correctAnswer={lesson.exercises[currentExercise].correct_answer}
                        explanation={lesson.exercises[currentExercise].explanation || ""}
                        onComplete={handleExerciseComplete}
                        allowMultipleCorrect={false}
                      />
                    ) : (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                          Exercise data is incomplete. Please check the lesson configuration.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Exercise {currentExercise + 1} of {lesson.exercises.length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Points: {lesson.exercises[currentExercise].points || 10} XP
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {currentSection === "exercises" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 sm:mt-6 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white">
              Current Score:{" "}
              <span className="text-blue-600 dark:text-blue-400">{score}</span> points
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Potential XP: {lesson.reward_xp}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LessonDetail;
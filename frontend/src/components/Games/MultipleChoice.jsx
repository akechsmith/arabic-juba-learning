import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, Volume2 } from 'lucide-react';

const MultipleChoice = ({ 
  question, 
  options = [], 
  correctAnswer, 
  explanation,
  onComplete, 
  audioUrl = null,
  allowMultipleCorrect = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Reset component state when question changes (new exercise)
  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
  }, [question]);

  const handleAnswer = (optionIndex) => {
    if (showResult) return;
    
    setSelectedAnswer(optionIndex);
    
    // Handle both index-based and value-based correct answers
    let correct = false;
    if (typeof correctAnswer === 'number') {
      // Index-based comparison
      correct = optionIndex === correctAnswer;
    } else {
      // Value-based comparison
      const optionValue = typeof options[optionIndex] === 'object' 
        ? options[optionIndex].value 
        : options[optionIndex];
      correct = optionValue === correctAnswer;
    }
    
    // Override for allowMultipleCorrect scenarios
    if (allowMultipleCorrect) {
      correct = true;
    }
    
    setIsCorrect(correct);
    setShowResult(true);
    
    setTimeout(() => {
      if (typeof onComplete === 'function') {
        onComplete(correct);
      } else {
        console.warn('No onComplete handler provided to MultipleChoice');
      }
    }, 1500);
  };

  const playAudio = (audioUrl) => {
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audio.play().catch(console.error);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  // Enhanced prop validation
  if (!question) {
    console.error('MultipleChoice: Missing question prop');
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> Missing question prop
      </div>
    );
  }

  if (!options || !Array.isArray(options) || options.length === 0) {
    console.error('MultipleChoice: Missing or empty options array', { options });
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> Missing or empty options array
      </div>
    );
  }

  if (correctAnswer === undefined || correctAnswer === null) {
    console.error('MultipleChoice: Missing correctAnswer prop', { correctAnswer });
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> Missing correctAnswer prop
      </div>
    );
  }

  // Helper functions to handle both string and object options
  const getOptionValue = (option) => {
    return typeof option === 'object' ? option.value : option;
  };

  const getOptionText = (option) => {
    return typeof option === 'object' ? option.text : option;
  };

  // Get correct answer text for display
  const getCorrectAnswerText = () => {
    if (typeof correctAnswer === 'number') {
      return getOptionText(options[correctAnswer]);
    } else {
      const correctOption = options.find(opt => getOptionValue(opt) === correctAnswer);
      return correctOption ? getOptionText(correctOption) : correctAnswer;
    }
  };

  // Check if option is correct
  const isOptionCorrect = (optionIndex) => {
    if (typeof correctAnswer === 'number') {
      return optionIndex === correctAnswer;
    } else {
      const optionValue = getOptionValue(options[optionIndex]);
      return optionValue === correctAnswer;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Choose the correct answer
          </h3>
          {audioUrl && (
            <button
              onClick={() => playAudio(audioUrl)}
              className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-full transition-colors"
              title="Play audio"
            >
              <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </button>
          )}
        </div>
        <p className="text-xl font-bold text-center text-gray-800 dark:text-white mb-6">
          {question}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {options.map((option, index) => {
          const optionText = getOptionText(option);
          const isThisCorrect = isOptionCorrect(index);
          
          return (
            <motion.button
              key={`option-${index}-${optionText}`}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                showResult
                  ? isThisCorrect
                    ? 'border-green-500 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : index === selectedAnswer && !allowMultipleCorrect && !isCorrect
                    ? 'border-red-500 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer text-gray-800 dark:text-white'
              } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-lg font-medium block">
                    {optionText}
                  </span>
                </div>
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="ml-4 flex-shrink-0"
                    >
                      {isThisCorrect ? (
                        <Check className="h-6 w-6 text-green-500" />
                      ) : index === selectedAnswer && !allowMultipleCorrect && !isCorrect ? (
                        <X className="h-6 w-6 text-red-500" />
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mt-6 p-4 rounded-xl ${
              isCorrect
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}
          >
            <div className="flex items-start space-x-2">
              {isCorrect ? (
                <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <X className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-medium mb-2">
                  {isCorrect 
                    ? 'Correct! Well done!' 
                    : `Incorrect. The correct answer is: ${getCorrectAnswerText()}`
                  }
                </div>
                {explanation && (
                  <div className="text-sm opacity-90">
                    <strong>Explanation:</strong> {explanation}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultipleChoice;
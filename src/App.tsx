import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Star, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  Heart,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { GameMode, Question, ThemeConfig, ThemeName, WrongQuestion, NumberRange } from './types';
import { 
  playBubblePop, 
  playCorrectSound, 
  playWrongSound, 
  playStreakCelebration 
} from './utils/audio';
import Confetti from './components/Confetti';
import WrongBookModal from './components/WrongBookModal';

// Macaron-inspired themes designed for children's eyes and excitement
const THEMES: ThemeConfig[] = [
  {
    name: 'strawberry',
    label: '草莓冰淇淋',
    bgGradient: 'from-[#FFF0F2] via-[#FFE5EB] to-[#FFD1DA]',
    cardBg: 'bg-white/90 backdrop-blur-md border-4 border-[#FFB3C1]',
    textColor: 'text-[#D03B52]',
    buttonBg: 'bg-gradient-to-b from-[#FFA5B6] to-[#FF8FA3] text-white shadow-lg shadow-[#FF8FA3]/40 border-b-4 border-[#E26D82]',
    buttonHoverBg: 'hover:from-[#FFAEC0] hover:to-[#FFA0B2]',
    shadowColor: 'rgba(255, 143, 163, 0.4)',
    emoji: '🍓'
  },
  {
    name: 'mint',
    label: '薄荷苏打',
    bgGradient: 'from-[#F0FDF4] via-[#E8FDF0] to-[#CFFADE]',
    cardBg: 'bg-white/90 backdrop-blur-md border-4 border-[#86EFAC]',
    textColor: 'text-[#15803D]',
    buttonBg: 'bg-gradient-to-b from-[#34D399] to-[#10B981] text-white shadow-lg shadow-[#10B981]/40 border-b-4 border-[#049F6B]',
    buttonHoverBg: 'hover:from-[#4ade80] hover:to-[#22c55e]',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    emoji: '🍵'
  },
  {
    name: 'banana',
    label: '香蕉蜂蜜',
    bgGradient: 'from-[#FFFDF0] via-[#FFFBEB] to-[#FEF3C7]',
    cardBg: 'bg-white/90 backdrop-blur-md border-4 border-[#FDE68A]',
    textColor: 'text-[#B45309]',
    buttonBg: 'bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] text-white shadow-lg shadow-[#F59E0B]/40 border-b-4 border-[#D97706]',
    buttonHoverBg: 'hover:from-[#FCD34D] hover:to-[#FBBF24]',
    shadowColor: 'rgba(245, 158, 11, 0.4)',
    emoji: '🍌'
  },
  {
    name: 'blueberry',
    label: '蓝莓棉花糖',
    bgGradient: 'from-[#EFF6FF] via-[#E0F2FE] to-[#BAE6FD]',
    cardBg: 'bg-white/90 backdrop-blur-md border-4 border-[#7DD3FC]',
    textColor: 'text-[#0369A1]',
    buttonBg: 'bg-gradient-to-b from-[#38BDF8] to-[#0EA5E9] text-white shadow-lg shadow-[#0EA5E9]/40 border-b-4 border-[#0284C7]',
    buttonHoverBg: 'hover:from-[#7DD3FC] hover:to-[#38BDF8]',
    shadowColor: 'rgba(14, 165, 233, 0.4)',
    emoji: '🫐'
  },
  {
    name: 'grape',
    label: '晶莹葡萄',
    bgGradient: 'from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF]',
    cardBg: 'bg-white/90 backdrop-blur-md border-4 border-[#D8B4FE]',
    textColor: 'text-[#7E22CE]',
    buttonBg: 'bg-gradient-to-b from-[#C084FC] to-[#A855F7] text-white shadow-lg shadow-[#A855F7]/40 border-b-4 border-[#8B5CF6]',
    buttonHoverBg: 'hover:from-[#D8B4FE] hover:to-[#C084FC]',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    emoji: '🍇'
  }
];

// Generates a proper question for an 8yo child within the chosen maxRange limits
function generateQuestion(mode: GameMode, maxRange: NumberRange): Question {
  const currentMode = mode === 'mixed' 
    ? (Math.random() > 0.5 ? 'addition' : 'subtraction') 
    : mode;

  let num1 = 0;
  let num2 = 0;
  let operator: '+' | '-' = '+';
  let correctAnswer = 0;

  if (maxRange === 20) {
    if (currentMode === 'addition') {
      operator = '+';
      correctAnswer = Math.floor(Math.random() * 16) + 5; // 5 to 20
      num1 = Math.floor(Math.random() * (correctAnswer - 3)) + 2; // at least 2
      num2 = correctAnswer - num1;
    } else {
      operator = '-';
      num1 = Math.floor(Math.random() * 15) + 6; // 6 to 20
      num2 = Math.floor(Math.random() * (num1 - 3)) + 2; // 2 to num1-2
      correctAnswer = num1 - num2;
    }
  } else if (maxRange === 1000) {
    if (currentMode === 'addition') {
      operator = '+';
      correctAnswer = Math.floor(Math.random() * 850) + 120; // 120 to 970
      num1 = Math.floor(Math.random() * (correctAnswer - 50)) + 25;
      num2 = correctAnswer - num1;
    } else {
      operator = '-';
      num1 = Math.floor(Math.random() * 800) + 180; // 180 to 980
      num2 = Math.floor(Math.random() * (num1 - 50)) + 25;
      correctAnswer = num1 - num2;
    }
  } else {
    // Default 100 range
    if (currentMode === 'addition') {
      operator = '+';
      correctAnswer = Math.floor(Math.random() * 90) + 10; // Result is e.g. 10 to 99
      num1 = Math.floor(Math.random() * (correctAnswer - 5)) + 3;
      num2 = correctAnswer - num1;
    } else {
      operator = '-';
      num1 = Math.floor(Math.random() * 85) + 15; // 15 to 99
      num2 = Math.floor(Math.random() * (num1 - 5)) + 3; // 3 to num1-2
      correctAnswer = num1 - num2;
    }
  }

  // Generate 3 unique, plausible distractors
  const distractorsSet = new Set<number>();
  
  // Create interesting distractors (close values, reverse tens, etc.)
  const step = maxRange === 1000 ? 100 : 10;
  const possibleDistractors = [
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
    correctAnswer + step,
    correctAnswer - step,
  ];

  // Try to generate tens-swap distractor (e.g., 54 -> 45) for double digits
  if (maxRange !== 20 && correctAnswer > 10 && correctAnswer < 100 && correctAnswer % 10 !== 0) {
    const units = correctAnswer % 10;
    const tens = Math.floor(correctAnswer / 10);
    const swapped = units * 10 + tens;
    if (swapped <= maxRange && swapped !== correctAnswer) {
      possibleDistractors.push(swapped);
    }
  }

  // Shuffle candidate distractors & take valid ones
  const filteredCandidates = possibleDistractors
    .filter(val => val > 0 && val <= maxRange && val !== correctAnswer)
    .sort(() => Math.random() - 0.5);

  for (const val of filteredCandidates) {
    if (distractorsSet.size < 3) {
      distractorsSet.add(val);
    }
  }

  // Ensure we fully have 3 distractors
  while (distractorsSet.size < 3) {
    const spread = maxRange === 1000 ? 50 : maxRange === 20 ? 4 : 10;
    let randDistractor = correctAnswer + (Math.floor(Math.random() * (spread * 2)) - spread);
    if (randDistractor > 0 && randDistractor <= maxRange && randDistractor !== correctAnswer) {
      distractorsSet.add(randDistractor);
    }
  }

  const options = Array.from(distractorsSet);
  options.push(correctAnswer);
  
  // Shuffle options
  options.sort(() => Math.random() - 0.5);

  return {
    id: Math.random().toString(36).substr(2, 9),
    num1,
    num2,
    operator,
    correctAnswer,
    options,
  };
}

export default function App() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig>(THEMES[0]);
  const [gameMode, setGameMode] = useState<GameMode>('mixed');
  const [selectedRange, setSelectedRange] = useState<NumberRange>(100);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // Score and Game metrics
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  
  // Timing & Scoring state
  const [playMode, setPlayMode] = useState<'practice' | 'challenge'>('practice');
  const [challengeIndex, setChallengeIndex] = useState<number>(0);
  const [challengeCorrect, setChallengeCorrect] = useState<number>(0);
  const [challengeActive, setChallengeActive] = useState<boolean>(false);
  const [challengeSeconds, setChallengeSeconds] = useState<number>(0);
  const [challengeFinished, setChallengeFinished] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number>(9999);

  // Wrong questions & Tutoring state
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [isWrongBookOpen, setIsWrongBookOpen] = useState<boolean>(false);

  // Game state statuses
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [shakeTrigger, setShakeTrigger] = useState<number>(0);
  const [confettiTrigger, setConfettiTrigger] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Challenge Timer Ticker
  useEffect(() => {
    let interval: any = null;
    if (challengeActive && !challengeFinished) {
      interval = setInterval(() => {
        setChallengeSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [challengeActive, challengeFinished]);

  // Load HighScore and BestTime for range/mode
  useEffect(() => {
    const storedHighScore = localStorage.getItem(`mengmeng_best_score_${selectedRange}_${gameMode}`);
    const storedBestTime = localStorage.getItem(`mengmeng_best_time_${selectedRange}_${gameMode}`);
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    } else {
      setHighScore(0);
    }
    if (storedBestTime) {
      setBestTime(parseInt(storedBestTime, 10));
    } else {
      setBestTime(9999);
    }
  }, [selectedRange, gameMode]);

  // Load custom stored mistakes
  useEffect(() => {
    const stored = localStorage.getItem('mengmeng_wrong_questions');
    if (stored) {
      try {
        setWrongQuestions(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Initialize first question
  useEffect(() => {
    setCurrentQuestion(generateQuestion(gameMode, selectedRange));
  }, [gameMode, selectedRange]);

  const handleModeChange = (mode: GameMode) => {
    playBubblePop(isMuted);
    setGameMode(mode);
    setStreak(0);
    setLives(3);
    setSelectedAnswer(null);
    setFeedbackState('idle');
    // Exit current challenge run on mode modification
    setChallengeActive(false);
    setChallengeFinished(false);
    setChallengeIndex(0);
    setChallengeCorrect(0);
    setChallengeSeconds(0);
  };

  const handleRangeChange = (range: NumberRange) => {
    playBubblePop(isMuted);
    setSelectedRange(range);
    setStreak(0);
    setLives(3);
    setSelectedAnswer(null);
    setFeedbackState('idle');
    // Exit current challenge run on difficulty modification
    setChallengeActive(false);
    setChallengeFinished(false);
    setChallengeIndex(0);
    setChallengeCorrect(0);
    setChallengeSeconds(0);
  };

  const handleThemeChange = (theme: ThemeConfig) => {
    playBubblePop(isMuted);
    setSelectedTheme(theme);
  };

  const handleAnswerSelect = (answer: number) => {
    // Prevent double clicking while we transition of a correct question
    if (selectedAnswer !== null || !currentQuestion) return;

    setSelectedAnswer(answer);

    const isCorrect = answer === currentQuestion.correctAnswer;

    if (playMode === 'challenge') {
      let nextCorrectCount = challengeCorrect;

      if (isCorrect) {
        setFeedbackState('correct');
        playCorrectSound(isMuted);
        setConfettiTrigger(prev => prev + 1);
        nextCorrectCount = challengeCorrect + 1;
        setChallengeCorrect(nextCorrectCount);
      } else {
        setFeedbackState('wrong');
        playWrongSound(isMuted);
        setShakeTrigger(prev => prev + 1);

        // ADD TO WRONG QUESTIONS
        const newWrong: WrongQuestion = {
          id: Math.random().toString(36).substring(2, 11),
          num1: currentQuestion.num1,
          num2: currentQuestion.num2,
          operator: currentQuestion.operator,
          correctAnswer: currentQuestion.correctAnswer,
          wrongAnswer: answer,
          timestamp: Date.now()
        };

        setWrongQuestions(prev => {
          const isDuplicate = prev.some(
            item => item.num1 === newWrong.num1 && 
                    item.num2 === newWrong.num2 && 
                    item.operator === newWrong.operator
          );
          if (isDuplicate) return prev;
          const updated = [newWrong, ...prev].slice(0, 50); // limit to 50 items
          localStorage.setItem('mengmeng_wrong_questions', JSON.stringify(updated));
          return updated;
        });

        // Deduct lives but let them finish questions for score
        setLives(prev => Math.max(0, prev - 1));
      }

      const nextIndex = challengeIndex + 1;

      // Automatically advance to next question
      setTimeout(() => {
        if (nextIndex >= 10) {
          // Finished the challenge!
          setChallengeFinished(true);
          setChallengeActive(false);
          setConfettiTrigger(prev => prev + 1);
          playStreakCelebration(isMuted);
          
          // Calculate score and update personal records
          const finalScore = nextCorrectCount * 10;
          
          // Check for high scores or better time for that high score or general record
          const storedBestScore = parseInt(localStorage.getItem(`mengmeng_best_score_${selectedRange}_${gameMode}`) || '0', 10);
          const storedBestTime = parseInt(localStorage.getItem(`mengmeng_best_time_${selectedRange}_${gameMode}`) || '9999', 10);
          
          let isNewRecord = false;
          if (finalScore > storedBestScore) {
            isNewRecord = true;
          } else if (finalScore === storedBestScore && challengeSeconds < storedBestTime) {
            isNewRecord = true;
          }

          if (isNewRecord || storedBestScore === 0) {
            localStorage.setItem(`mengmeng_best_score_${selectedRange}_${gameMode}`, finalScore.toString());
            localStorage.setItem(`mengmeng_best_time_${selectedRange}_${gameMode}`, challengeSeconds.toString());
            // Update local state indicators
            setHighScore(finalScore);
            setBestTime(challengeSeconds);
          }
        } else {
          setChallengeIndex(nextIndex);
          setCurrentQuestion(generateQuestion(gameMode, selectedRange));
        }
        setSelectedAnswer(null);
        setFeedbackState('idle');
      }, isCorrect ? 1000 : 1500); // Give 1.5s for wrongs so they can study the correct answer highlights
      
    } else {
      // Free Play Mode logic (Normal)
      setTotalQuestionsAnswered(prev => prev + 1);

      if (isCorrect) {
        setFeedbackState('correct');
        playCorrectSound(isMuted);
        setConfettiTrigger(prev => prev + 1);
        
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > maxStreak) {
          setMaxStreak(newStreak);
        }

        // Check for custom streak celebration every 5 answers
        if (newStreak % 5 === 0) {
          playStreakCelebration(isMuted);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2200);
        }

        // Automatically load next question after a brief delay
        setTimeout(() => {
          setCurrentQuestion(generateQuestion(gameMode, selectedRange));
          setSelectedAnswer(null);
          setFeedbackState('idle');
        }, 1000);

      } else {
        // Wrong!
        setFeedbackState('wrong');
        playWrongSound(isMuted);
        setShakeTrigger(prev => prev + 1);
        setStreak(0); // Break current streak

        // ADD TO WRONG QUESTIONS
        const newWrong: WrongQuestion = {
          id: Math.random().toString(36).substring(2, 11),
          num1: currentQuestion.num1,
          num2: currentQuestion.num2,
          operator: currentQuestion.operator,
          correctAnswer: currentQuestion.correctAnswer,
          wrongAnswer: answer,
          timestamp: Date.now()
        };

        setWrongQuestions(prev => {
          // Avoid duplicate additions of the exact same math equation within the notebook
          const isDuplicate = prev.some(
            item => item.num1 === newWrong.num1 && 
                    item.num2 === newWrong.num2 && 
                    item.operator === newWrong.operator
          );
          if (isDuplicate) return prev;
          const updated = [newWrong, ...prev].slice(0, 50); // limit to 50 items
          localStorage.setItem('mengmeng_wrong_questions', JSON.stringify(updated));
          return updated;
        });

        // Deduct support heart/lives but keep it fun
        setLives(prev => {
          const nextLive = prev - 1;
          if (nextLive <= 0) {
            // Play special encouragement or auto-reset lives after 1s
            setTimeout(() => {
              setLives(3);
            }, 1500);
            return 0;
          }
          return nextLive;
        });

        // Clear selection after a delay to let the kid retry
        setTimeout(() => {
          setSelectedAnswer(null);
          setFeedbackState('idle');
        }, 1200);
      }
    }
  };

  const handleRedoQuestion = (q: WrongQuestion) => {
    // Reconstruct the original question but format unique cute children choices
    const currentMax = q.correctAnswer > 100 ? 1000 : (q.correctAnswer > 20 ? 100 : 20);
    const step = currentMax === 1000 ? 100 : 10;
    const distractors = [
      q.correctAnswer + 1,
      q.correctAnswer - 1,
      q.correctAnswer + step,
    ].filter(value => value > 0 && value <= currentMax);

    const uniqueChoices = Array.from(new Set([q.correctAnswer, ...distractors])).slice(0, 4);
    while (uniqueChoices.length < 4) {
      const extraNum = q.correctAnswer + (Math.floor(Math.random() * (step * 2)) - step);
      if (extraNum > 0 && extraNum <= currentMax && !uniqueChoices.includes(extraNum)) {
        uniqueChoices.push(extraNum);
      }
    }
    uniqueChoices.sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      id: q.id,
      num1: q.num1,
      num2: q.num2,
      operator: q.operator,
      correctAnswer: q.correctAnswer,
      options: uniqueChoices
    });

    setSelectedAnswer(null);
    setFeedbackState('idle');
    setIsWrongBookOpen(false); // Close Modal immediately when a redo is click
    playBubblePop(isMuted);
  };

  const handleDeleteWrongQuestion = (id: string) => {
    setWrongQuestions(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('mengmeng_wrong_questions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRestart = () => {
    playBubblePop(isMuted);
    setStreak(0);
    setLives(3);
    setSelectedAnswer(null);
    setFeedbackState('idle');

    if (playMode === 'challenge') {
      setChallengeIndex(0);
      setChallengeCorrect(0);
      setChallengeSeconds(0);
      setChallengeActive(true);
      setChallengeFinished(false);
    }

    setCurrentQuestion(generateQuestion(gameMode, selectedRange));
  };

  // Bear cute mascot expression assets depending on app state
  const renderMascotExpression = () => {
    let eyes = (
      <>
        {/* Normal Sparkly Eyes */}
        <ellipse cx="40" cy="55" rx="5" ry="7" fill="#2E2E3A" />
        <ellipse cx="60" cy="55" rx="5" ry="7" fill="#2E2E3A" />
        {/* Sparkles */}
        <circle cx="38" cy="53" r="1.5" fill="white" />
        <circle cx="58" cy="53" r="1.5" fill="white" />
      </>
    );
    let mouth = (
      // Smiling cute mouth
      <path d="M 46 68 Q 50 71 54 68" fill="none" stroke="#2E2E3A" strokeWidth="2.5" strokeLinecap="round" />
    );
    let blush = (
      <>
        {/* Sweet cheeks */}
        <ellipse cx="29" cy="61" rx="5" ry="3.5" fill="#FFA5B6" opacity="0.6" />
        <ellipse cx="71" cy="61" rx="5" ry="3.5" fill="#FFA5B6" opacity="0.6" />
      </>
    );

    let statusText = '口算加油！✊';
    let statusBg = 'bg-white text-gray-700 border-gray-200';

    let hasCrown = false;
    if (playMode === 'challenge' && challengeFinished && challengeCorrect === 10) {
      hasCrown = true;
    }

    if (feedbackState === 'correct') {
      eyes = (
        <>
          {/* Laughing dynamic/curved eyes */}
          <path d="M 34 56 C 36 51, 44 51, 46 56" fill="none" stroke="#2E2E3A" strokeWidth="3" strokeLinecap="round" />
          <path d="M 54 56 C 56 51, 64 51, 66 56" fill="none" stroke="#2E2E3A" strokeWidth="3" strokeLinecap="round" />
        </>
      );
      mouth = (
        // Open cheering mouth
        <path d="M 45 66 Q 50 75 55 66 Z" fill="#FF5252" stroke="#2E2E3A" strokeWidth="2" />
      );
      blush = (
        <>
          <ellipse cx="29" cy="61" rx="6" ry="4.5" fill="#FF4081" className="animate-ping" style={{ animationDuration: '1.5s' }} />
          <ellipse cx="71" cy="61" rx="6" ry="4.5" fill="#FF4081" className="animate-ping" style={{ animationDuration: '1.5s' }} />
          <ellipse cx="29" cy="61" rx="6" ry="4.5" fill="#FF4081" />
          <ellipse cx="71" cy="61" rx="6" ry="4.5" fill="#FF4081" />
        </>
      );
      statusText = '太棒了！✨';
      statusBg = 'bg-green-100 text-green-700 border-green-300 shadow-sm';
    } else if (feedbackState === 'wrong') {
      eyes = (
        <>
          {/* dizzy/hurt eyes */}
          <path d="M 35 52 L 45 60 M 45 52 L 35 60" fill="none" stroke="#4B5563" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 55 52 L 65 60 M 65 52 L 55 60" fill="none" stroke="#4B5563" strokeWidth="3.5" strokeLinecap="round" />
        </>
      );
      mouth = (
        // little frown wavy mouth
        <path d="M 45 68 Q 50 63 55 68" fill="none" stroke="#2E2E3A" strokeWidth="2.5" strokeLinecap="round" />
      );
      blush = (
        <>
          {/* blue spirals/worry clouds */}
          <ellipse cx="29" cy="61" rx="4" ry="2" fill="#93C5FD" opacity="0.8" />
          <ellipse cx="71" cy="61" rx="4" ry="2" fill="#93C5FD" opacity="0.8" />
        </>
      );
      statusText = '哎呀，差一点点！💡';
      statusBg = 'bg-red-100 text-red-700 border-red-300';
    } else if (playMode === 'challenge') {
      if (challengeFinished) {
        if (challengeCorrect === 10) {
          statusText = '满分终极解封！👑';
          statusBg = 'bg-yellow-100 text-yellow-700 border-yellow-300 shadow-md animate-bounce';
        } else if (challengeCorrect >= 8) {
          statusText = '超强速算手！⭐';
          statusBg = 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-md';
        } else {
          statusText = '完成挑战，棒！🎉';
          statusBg = 'bg-emerald-100 text-emerald-700 border-emerald-200';
        }
      } else if (challengeActive) {
        statusText = `第 ${challengeIndex + 1} / 10 关 ⏱️`;
        statusBg = 'bg-blue-50 text-blue-600 border-blue-200';
      } else {
        statusText = '准备挑战了吗？🐻';
        statusBg = 'bg-pink-50 text-pink-500 border-pink-200';
      }
    }

    return (
      <div className="flex flex-col items-center select-none mb-4 sm:mb-6">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32">
          {/* Bear body */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Bear Ears */}
            <circle cx="22" cy="25" r="14" fill="#FFD2CC" />
            <circle cx="22" cy="25" r="8" fill="#FFA5B6" />
            <circle cx="78" cy="25" r="14" fill="#FFD2CC" />
            <circle cx="78" cy="25" r="8" fill="#FFA5B6" />
            
            {/* Bear Face Background */}
            <circle cx="50" cy="55" r="40" fill="#FFE2DC" />
            {/* Snout Background */}
            <ellipse cx="50" cy="66" rx="14" ry="9" fill="white" />
            {/* Nose */}
            <ellipse cx="50" cy="62" rx="4" ry="2.5" fill="#2E2E3A" />

            {/* Dynamic Layers */}
            {blush}
            {eyes}
            {mouth}

            {/* Gold Crown Reward layer */}
            {hasCrown && (
              <g>
                <path d="M 36 22 L 42 12 L 50 19 L 58 12 L 64 22 L 62 26 L 38 26 Z" fill="#FFD700" stroke="#FF8C00" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="36" cy="22" r="1.5" fill="#FF007F" />
                <circle cx="50" cy="19" r="1.5" fill="#18FFFF" />
                <circle cx="64" cy="22" r="1.5" fill="#FF007F" />
                <circle cx="42" cy="12" r="2" fill="#FFEA00" />
                <circle cx="58" cy="12" r="2" fill="#FFEA00" />
              </g>
            )}
          </svg>
          
          {/* Bubbling helper dialogue */}
          <motion.div 
            key={statusText}
            initial={{ scale: 0.7, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={`absolute -top-3 sm:-top-5 -right-16 sm:-right-20 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 ${statusBg} flex items-center gap-1`}
          >
            {statusText}
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${selectedTheme.bgGradient} flex flex-col items-center justify-between p-4 sm:p-6 transition-colors duration-700 overflow-hidden font-fredoka`}>
      {/* Dynamic confetti effects */}
      <Confetti trigger={confettiTrigger} />

      {/* Screen flash/congratulations overlay for 5/10/15 answer milestones */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-40 p-4"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="bg-white/95 rounded-3xl p-6 sm:p-8 max-w-sm text-center border-4 border-yellow-400 shadow-2xl flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center animate-bounce">
                <Trophy size={48} className="text-yellow-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-yellow-600">
                超赞！5连对！🌟
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                你真是个口算天才小宝贝！继续保持冲刺吧！
              </p>
              <div className="flex gap-2">
                <Award className="text-purple-500 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="font-bold text-purple-600 text-sm">解锁荣誉：算术小勇士</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Container */}
      <header className="w-full max-w-lg mx-auto flex items-center justify-between gap-1.5 mb-2 select-none">
        {/* Title */}
        <div className="flex items-center gap-1.5">
          <div className="bg-white/70 p-2 rounded-2xl border-2 border-pink-200 shadow-sm flex items-center justify-center">
            <Sparkles className="text-pink-500 animate-pulse" size={22} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-none">
              萌萌口算
            </h1>
            <span className="text-[9px] sm:text-xs text-slate-500 font-medium select-none">探险第一步</span>
          </div>
        </div>

        {/* Mute, Wrong questions book and Restarters */}
        <div className="flex items-center gap-1.5">
          {/* Wrong book list */}
          <button
            onClick={() => {
              playBubblePop(isMuted);
              setIsWrongBookOpen(true);
            }}
            className="relative h-10 px-3 bg-pink-100 hover:bg-pink-200 border-2 border-pink-300 rounded-2xl flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm text-pink-600 text-xs sm:text-sm font-black"
            id="wrong-book-drawer-toggle"
          >
            <span>📖 错题本</span>
            {wrongQuestions.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center border border-white animate-bounce">
                {wrongQuestions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              playBubblePop(isMuted);
              setIsMuted(!isMuted);
            }}
            className="w-10 h-10 bg-white/70 hover:bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
            title={isMuted ? "取消静音" : "静音"}
            id="volume-toggle-btn"
          >
            {isMuted ? (
              <VolumeX size={20} className="text-slate-400" />
            ) : (
              <Volume2 size={20} className="text-slate-600" />
            )}
          </button>

          <button
            onClick={handleRestart}
            className="w-10 h-10 bg-white/70 hover:bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
            title="重新开始"
            id="restart-btn"
          >
            <RotateCcw size={18} className="text-slate-600" />
          </button>
        </div>
      </header>

      {/* Main Core Section */}
      <main className="w-full max-w-lg mx-auto flex flex-col items-center justify-center flex-1 my-2">
        
        {/* Cute Mascot */}
        {renderMascotExpression()}

        {/* Shaking Outer Card Box */}
        <motion.div
          animate={shakeTrigger > 0 ? {
            x: [0, -12, 12, -12, 12, -6, 6, 0],
          } : {}}
          transition={{ duration: 0.4 }}
          className={`w-full ${selectedTheme.cardBg} rounded-[2.5rem] py-8 px-6 sm:px-8 shadow-xl relative overflow-hidden transition-all duration-500 flex flex-col items-center mb-6 sm:mb-8`}
        >
          {/* Subtle bubble clouds shape in the card header */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-pink-300 via-yellow-200 to-emerald-300 opacity-80" />

          {playMode === 'challenge' && !challengeActive && !challengeFinished ? (
            /* CHALLENGE PRE-START WELCOME CARD */
            <div className="w-full text-center py-4 flex flex-col items-center select-none">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Trophy size={36} className="text-pink-500 animate-bounce" />
              </div>
              <h2 className={`text-2xl font-black ${selectedTheme.textColor} mb-2`}>
                10题魔法速算挑战
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm font-bold max-w-sm mb-6 leading-relaxed">
                宝贝，准备好向终极智慧挑战发起进攻了吗？⏱️
                <br />
                点击下方按钮开启挑战，暖暖熊老师会帮你记录用时和得分哦！看谁是最快最准的口算小勇士！
              </p>
              
              {/* Record score badge */}
              {(highScore > 0 || bestTime < 9999) ? (
                <div className="mb-6 bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-xs text-slate-500 font-bold flex flex-col gap-1 w-full max-w-xs">
                  <span className="text-[#D03B52] font-extrabold text-sm flex items-center justify-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-yellow-400" />
                    我的最高纪录
                  </span>
                  <div className="flex justify-around mt-1">
                    <span>最高得分: <strong className="text-slate-700 text-sm font-black">{highScore}分</strong></span>
                    <span>最佳用时: <strong className="text-slate-700 text-sm font-black">{bestTime === 9999 ? '无' : `${bestTime}秒`}</strong></span>
                  </div>
                </div>
              ) : null}

              <button
                onClick={handleRestart}
                id="start-challenge-adventure"
                className={`w-full py-4 text-xl font-black rounded-3xl ${selectedTheme.buttonBg} ${selectedTheme.buttonHoverBg} active:scale-95 transition-all text-white border-b-6 border-[#E26D82]`}
              >
                🚀 开启魔法十题挑战！
              </button>
            </div>
          ) : playMode === 'challenge' && challengeFinished ? (
            /* CHALLENGE FINAL GRADED SCORECARD */
            <div className="w-full text-center py-4 flex flex-col items-center">
              <div className="relative">
                {/* Visual Medal representation based on score */}
                {challengeCorrect === 10 ? (
                  <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center border-4 border-yellow-400 mb-4 animate-bounce">
                    <Trophy size={48} className="text-yellow-500 fill-yellow-200" />
                  </div>
                ) : challengeCorrect >= 8 ? (
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-indigo-400 mb-4 animate-pulse">
                    <Star size={48} className="text-indigo-500 fill-indigo-200" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-400 mb-4">
                    <Sparkles size={48} className="text-emerald-500 fill-emerald-200" />
                  </div>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-1 flex items-center gap-1.5 justify-center select-none">
                挑战大捷！🏁✨
              </h2>
              <p className="text-xs text-slate-400 font-bold tracking-wider mb-6 select-none">
                萌萌口算训练成绩单
              </p>

              {/* Score Stats Panel */}
              <div className="w-full grid grid-cols-2 gap-4 mb-6">
                {/* Correct count Score */}
                <div className="bg-slate-50 p-4 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                  <span className="text-xs text-slate-400 font-bold block mb-1">最后得分</span>
                  <span className="text-3xl font-black text-red-500">{challengeCorrect * 10} 分</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">答对 {challengeCorrect}/10 题</span>
                </div>

                {/* Elapsed Timer seconds */}
                <div className="bg-slate-50 p-4 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                  <span className="text-xs text-slate-400 font-bold block mb-1">经历时间</span>
                  <span className="text-3xl font-black text-indigo-500">{challengeSeconds} 秒</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">平均 {challengeSeconds > 0 ? (Math.round(challengeSeconds / 10 * 10) / 10) : 0}秒/题</span>
                </div>
              </div>

              {/* Cute feedback bubble */}
              <div className="bg-pink-50 border-2 border-dashed border-pink-100 rounded-2xl p-4 text-xs font-bold text-slate-600 leading-relaxed max-w-sm mb-6 flex gap-2">
                <span className="text-2xl mt-0.5 select-none">🐻</span>
                <div className="text-left">
                  <span className="font-extrabold text-[#D03B52] mb-1 block">暖暖熊老师的魔法密语</span>
                  <span>
                    {challengeCorrect === 10
                      ? "太神奇了！小探险家把魔法怪兽都打跑啦！所有的口算都难不倒你，暖暖熊老师在口算之巅为你欢呼！🌲🥳✨"
                      : challengeCorrect >= 8
                        ? "你太棒了！离满分只有一步之遥啦。暖暖熊老师看见你的口算超能力正在发光，再挑战一次绝对能打出满分！🦁💪💖"
                        : challengeCorrect >= 5
                          ? "哇！大部分算术陷阱都被你成功解答啦！你的基础非常棒，快打开错题本，和暖暖熊老师一起把错误的点滴记下来吧！🎈🚀"
                          : "坚强的小勇士！口算森林里的魔法稍微有点儿难，但这只是升级前的考验。和暖暖熊老师再挑战一次，一定更轻松！🌟🧸"
                    }
                  </span>
                </div>
              </div>

              {/* Grid controls */}
              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={handleRestart}
                  id="challenge-restart-btn-reports"
                  className={`w-full py-3.5 text-lg font-black rounded-2xl ${selectedTheme.buttonBg} ${selectedTheme.buttonHoverBg} active:scale-95 transition-all text-white border-b-6 border-[#E26D82]`}
                >
                  🔄 再次发起魔法挑战
                </button>
                <div className="grid grid-cols-2 gap-3.5 mt-1.5">
                  <button
                    onClick={() => {
                      playBubblePop(isMuted);
                      setPlayMode('practice');
                      setChallengeActive(false);
                      setChallengeFinished(false);
                      setCurrentQuestion(generateQuestion(gameMode, selectedRange));
                    }}
                    id="challenge-to-practice-btn"
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-xl border border-slate-300 active:scale-95 transition-all"
                  >
                    🎪 自由练习模式
                  </button>
                  <button
                    onClick={() => {
                      playBubblePop(isMuted);
                      setIsWrongBookOpen(true);
                    }}
                    id="challenge-to-wrongbook-btn"
                    className="py-2.5 px-3 bg-pink-100 hover:bg-pink-100/90 text-pink-600 text-xs font-black rounded-xl border border-pink-300 active:scale-95 transition-all"
                  >
                    📖 打开错题本
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE PRACTICE / ACTIVE TIMED CHALLENGE PLAY */
            <>
              {/* Stats Bar (Hearts, Progress & Timers) */}
              <div className="w-full flex items-center justify-between mb-6 text-sm">
                {playMode === 'challenge' ? (
                  <>
                    {/* Challenge Index Progress indicator */}
                    <div className="flex items-center gap-1.5 bg-indigo-50 py-1.5 px-3.5 rounded-full border border-indigo-200">
                      <span className="text-xs text-indigo-500 font-bold">进度:</span>
                      <span className="text-sm font-black text-indigo-700">
                        {challengeIndex + 1} / 10 题
                      </span>
                    </div>

                    {/* Ticking Stop Watch */}
                    <div className="flex items-center gap-1.5 bg-rose-50 py-1.5 px-3.5 rounded-full border border-rose-200 animate-pulse">
                      <span className="text-xs text-rose-500 font-bold">用时⏱️:</span>
                      <span className="text-sm font-black text-rose-700 font-mono">
                        {challengeSeconds} 秒
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Lives / Hearts */}
                    <div className="flex items-center gap-1.5 bg-white/70 py-1 px-3 rounded-full border border-slate-200">
                      <span className="text-xs text-slate-500 font-bold">体力:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((heart) => (
                          <motion.div
                            key={heart}
                            animate={lives < heart ? { scale: 0.8, opacity: 0.3 } : { scale: [1, 1.15, 1] }}
                            transition={{ duration: 0.3 }}
                          >
                            <Heart 
                              size={18} 
                              className={lives >= heart ? "text-pink-500 fill-pink-500" : "text-slate-300"} 
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Total score / Level Star indicator */}
                    <div className="flex items-center gap-2 bg-white/70 py-1 px-3 rounded-full border border-slate-200">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-400" />
                        <span className="text-xs text-slate-600 font-extrabold">连对:</span>
                      </div>
                      <motion.span 
                        key={streak}
                        initial={{ scale: 1.4, color: '#f59e0b' }}
                        animate={{ scale: 1, color: '#475569' }}
                        className="text-sm font-black"
                      >
                        {streak}
                      </motion.span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        (最高 {maxStreak})
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Real Math Question Display Box */}
              <div className="w-full text-center py-6 sm:py-8 flex flex-col items-center justify-center">
                {currentQuestion ? (
                  <div className="flex flex-col items-center gap-2">
                    {/* Math values */}
                    <div 
                      className={`text-5xl sm:text-6xl font-black ${selectedTheme.textColor} select-none tracking-wider font-fredoka flex items-center justify-center gap-4`}
                    >
                      <motion.span 
                        key={`num1-${currentQuestion.id}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block"
                      >
                        {currentQuestion.num1}
                      </motion.span>
                      <motion.span 
                        key={`op-${currentQuestion.id}`}
                        initial={{ rotate: -45, scale: 0.8, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        className="text-3xl sm:text-4xl text-slate-400 inline-block"
                      >
                        {currentQuestion.operator}
                      </motion.span>
                      <motion.span 
                        key={`num2-${currentQuestion.id}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block"
                      >
                        {currentQuestion.num2}
                      </motion.span>
                      <span className="text-3xl sm:text-4xl text-slate-400 inline-block">=</span>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-100 border-4 border-dashed border-slate-300 flex items-center justify-center text-slate-300 text-3xl font-bold animate-pulse">
                        ?
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 font-bold mt-4 tracking-wider flex items-center gap-1">
                      <HelpCircle size={14} className="text-blue-400" />
                      仔细想一想，下面哪一个是正确答案呢？
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse text-slate-400 text-lg py-4 font-bold">
                    魔法口算正在出题中... 🌟
                  </div>
                )}
              </div>

              {/* Interactive Multiple Choices */}
              {currentQuestion && (
                <div className="w-full grid grid-cols-2 gap-4 mt-4 select-none">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === currentQuestion.correctAnswer;
                    
                    let btnStyle = "bg-white text-slate-700 border-slate-200 border-b-6 hover:border-b-4 hover:translate-y-[2px] border-b-slate-400 hover:bg-slate-50";
                    
                    if (selectedAnswer !== null) {
                      // If are currently showing feedback for this question
                      if (isSelected) {
                        btnStyle = isCorrect 
                          ? "bg-emerald-400 text-white border-emerald-500 border-b-6 border-b-emerald-600 translate-y-0"
                          : "bg-rose-400 text-white border-rose-500 border-b-6 border-b-rose-600 translate-y-0";
                      } else if (isCorrect && feedbackState === 'wrong') {
                        // Highlight the correct answer if the kids got it wrong, to teach them
                        btnStyle = "bg-emerald-300 text-emerald-800 border-emerald-400 border-b-6 border-b-emerald-500";
                      } else {
                        btnStyle = "bg-white text-slate-300 border-slate-100 border-b-6 border-b-slate-200 opacity-60 pointer-events-none";
                      }
                    }

                    return (
                      <motion.button
                        key={`${currentQuestion.id}-${option}-${index}`}
                        whileHover={selectedAnswer === null ? { scale: 1.05 } : {}}
                        whileTap={selectedAnswer === null ? { scale: 0.95 } : {}}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={selectedAnswer !== null}
                        id={`option-btn-${option}`}
                        className={`h-16 sm:h-20 w-full rounded-3xl text-2xl sm:text-3xl font-extrabold flex items-center justify-center transition-all cursor-pointer shadow-md select-none border-4 ${btnStyle}`}
                      >
                        <span>{option}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Operational settings panel (Mode Selector) */}
        <section className="w-full bg-white/70 backdrop-blur-sm rounded-3xl p-4 border border-white/60 shadow-lg flex flex-col gap-3 select-none">
          {/* Range Settings */}
          <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-100">
            <span className="text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-1">
              <Award size={16} className="text-pink-500 animate-pulse" />
              冒险难度:
            </span>
            <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
              {([20, 100, 1000] as NumberRange[]).map((range) => {
                const label = range === 20 ? '20以内 🐣' : range === 100 ? '100以内 🐇' : '1000以内 🐉';
                const isActive = selectedRange === range;
                return (
                  <button
                    key={range}
                    onClick={() => handleRangeChange(range)}
                    id={`range-selector-${range}`}
                    className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-b from-[#FF8FA3] to-[#FF4D6D] text-white shadow-md shadow-[#FF4D6D]/20' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level settings */}
          <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-100">
            <span className="text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-1">
              <Trophy size={16} className="text-amber-500 animate-pulse" />
              游戏模式:
            </span>
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
              {([
                { name: 'practice', label: '自由练习 🎈' },
                { name: 'challenge', label: '十题挑战 ⏱️' }
              ] as const).map((mode) => {
                const isActive = playMode === mode.name;
                return (
                  <button
                    key={mode.name}
                    onClick={() => {
                      playBubblePop(isMuted);
                      setPlayMode(mode.name);
                      setChallengeActive(false);
                      setChallengeFinished(false);
                      setChallengeIndex(0);
                      setChallengeCorrect(0);
                      setChallengeSeconds(0);
                      setStreak(0);
                      setLives(3);
                      setSelectedAnswer(null);
                      setFeedbackState('idle');
                      setCurrentQuestion(generateQuestion(gameMode, selectedRange));
                    }}
                    id={`playmode-selector-${mode.name}`}
                    className={`px-3 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-b from-slate-600 to-slate-800 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core mode settings */}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-1">
              <TrendingUp size={16} className="text-indigo-500" />
              出题设定:
            </span>
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
              {(['mixed', 'addition', 'subtraction'] as GameMode[]).map((mode) => {
                const label = mode === 'mixed' ? '混合' : mode === 'addition' ? '加法' : '减法';
                const isActive = gameMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    id={`mode-${mode}-btn`}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Schemes changer */}
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500">
              换个马卡龙心情:
            </span>
            <div className="flex items-center gap-2 justify-between flex-wrap">
              {THEMES.map((theme) => {
                const isSelected = selectedTheme.name === theme.name;
                return (
                  <button
                    key={theme.name}
                    onClick={() => handleThemeChange(theme)}
                    id={`theme-${theme.name}-btn`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                      isSelected 
                        ? `${theme.cardBg} scale-102 font-black ${theme.textColor}`
                        : 'bg-white/80 hover:bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    <span>{theme.emoji}</span>
                    <span className="hidden sm:inline">{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      {/* Footer copyright and advice */}
      <footer className="w-full max-w-lg mx-auto text-center mt-4 select-none flex flex-col gap-1">
        <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
          🌈 每日练习10分钟，大脑算术变聪明！
        </p>
      </footer>

      {/* Interactive wrong book overlay modal */}
      <WrongBookModal
        isOpen={isWrongBookOpen}
        onClose={() => setIsWrongBookOpen(false)}
        wrongQuestions={wrongQuestions}
        onDelete={handleDeleteWrongQuestion}
        onRedo={handleRedoQuestion}
        isMuted={isMuted}
        selectedTheme={selectedTheme}
      />
    </div>
  );
}

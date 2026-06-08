import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Languages
} from 'lucide-react';
import { WrongQuestion, ThemeConfig } from '../types';
import { playBubblePop } from '../utils/audio';

interface WrongBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  wrongQuestions: WrongQuestion[];
  onDelete: (id: string) => void;
  onRedo: (q: WrongQuestion) => void;
  isMuted: boolean;
  selectedTheme: ThemeConfig;
}

export default function WrongBookModal({
  isOpen,
  onClose,
  wrongQuestions,
  onDelete,
  onRedo,
  isMuted,
  selectedTheme
}: WrongBookModalProps) {
  // AI explanations cache/loading state mapping by question ID
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const fetchExplanation = async (q: WrongQuestion) => {
    if (explanations[q.id]) {
      // Toggle play speaking if already explained
      handleSpeak(q.id, explanations[q.id]);
      return;
    }

    playBubblePop(isMuted);
    setLoadingStates(prev => ({ ...prev, [q.id]: true }));

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          num1: q.num1,
          num2: q.num2,
          operator: q.operator,
          correctAnswer: q.correctAnswer
        })
      });
      const data = await res.json();
      if (data.explanation) {
        setExplanations(prev => ({ ...prev, [q.id]: data.explanation }));
        // Play text-to-speech automatically on generation
        handleSpeak(q.id, data.explanation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStates(prev => ({ ...prev, [q.id]: false }));
    }
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    // Cancel active speaks
    window.speechSynthesis.cancel();
    
    // Create new utterance and clean emojis for smoother voice reading
    const cleanText = text.replace(/[\u2000-\u3000\ud83c\ud83d\ud83e\udfff]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'zh-CN';
    
    // Play with gentle, conversational pacing perfect for an 8yo child
    utterance.rate = 0.95; 
    
    // Set pitch slightly higher (1.20) to sound super sweet, adorable and full of cartoon teddy bear warmth
    utterance.pitch = 1.2;

    // Dynamically query available voices to find a natural Chinese speaker
    try {
      const voices = window.speechSynthesis.getVoices();
      const zhVoices = voices.filter(v => v.lang.startsWith('zh') || v.lang.startsWith('ZH'));
      
      if (zhVoices.length > 0) {
        // High-quality natural-sounding Chinese voice checklist
        let selectedVoice = zhVoices.find(v => v.name.toLowerCase().includes('xiaoxiao'));
        if (!selectedVoice) selectedVoice = zhVoices.find(v => v.name.toLowerCase().includes('tingting') || v.name.toLowerCase().includes('ting-ting'));
        if (!selectedVoice) selectedVoice = zhVoices.find(v => v.name.toLowerCase().includes('meijia') || v.name.toLowerCase().includes('mei-jia'));
        if (!selectedVoice) selectedVoice = zhVoices.find(v => v.name.toLowerCase().includes('xiaoyi'));
        if (!selectedVoice) selectedVoice = zhVoices.find(v => v.name.toLowerCase().includes('yaoyao'));
        if (!selectedVoice) selectedVoice = zhVoices.find(v => v.name.toLowerCase().includes('huihui'));
        if (!selectedVoice) selectedVoice = zhVoices.find(v => v.name.toLowerCase().includes('google'));
        if (!selectedVoice) selectedVoice = zhVoices[0]; // fallback
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
    } catch (e) {
      console.warn('Speech synthesis voice retrieval error:', e);
    }

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  };

  const handleClose = () => {
    stopSpeaking();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          {/* Backdrop layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Drawer / Dialog Panel */}
          <motion.div
            initial={{ y: '100%', scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full sm:max-w-xl bg-[#FFFDFB] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 max-h-[85vh] sm:max-h-[80vh] flex flex-col shadow-2xl border-t-8 sm:border-y-8 border-[#FFB2C1]"
          >
            {/* Header section in Modal */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-dashed border-pink-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center border-2 border-pink-300">
                  <BookOpen className="text-pink-500 animate-pulse" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-1.5">
                    魔法错题本 📖
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">
                    共收集了 {wrongQuestions.length} 道错题，逐个攻克它！
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                id="close-wrong-book-btn"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Questions List list */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 py-2 scrollbar-thin scrollbar-thumb-pink-200">
              {wrongQuestions.length === 0 ? (
                // Beautiful Empty notebooks state
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full border-4 border-emerald-300 flex items-center justify-center mb-4">
                    <Sparkles size={45} className="text-emerald-400 fill-emerald-300/30 animate-bounce" />
                  </div>
                  <h4 className="text-xl font-black text-emerald-600 mb-1">
                    哇塞！错题本竟然空空如也！🏆
                  </h4>
                  <p className="text-sm font-bold text-slate-400 max-w-xs leading-relaxed">
                    宝贝目前的答题水平已经超越了99%的探险家啦，没有一道错题！继续加油哦！💪🔥
                  </p>
                </div>
              ) : (
                wrongQuestions.map((q) => {
                  const isLoading = loadingStates[q.id];
                  const hasExplanation = !!explanations[q.id];
                  const isSpeaking = speakingId === q.id;

                  return (
                    <motion.div
                      key={q.id}
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-3xl p-4 border-2 border-pink-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
                    >
                      {/* Summary of Equation info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Cute tag circle */}
                          <div className="w-16 h-16 bg-red-50 rounded-2xl border-2 border-red-200 flex items-center justify-center text-red-500 text-xl font-black font-fredoka">
                            {q.num1} {q.operator} {q.num2}
                          </div>
                          
                          {/* Wrong explanation summary stats */}
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-bold">
                              写错的选择: <span className="text-red-500 line-through font-extrabold">{q.wrongAnswer}</span>
                            </span>
                            <span className="text-xs text-emerald-500 font-extrabold flex items-center gap-0.5">
                              正确答案: <span className="bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">{q.correctAnswer}</span> 🎉
                            </span>
                          </div>
                        </div>

                        {/* Interactive redo and delete triggers */}
                        <div className="flex items-center gap-1.5">
                          {/* Redo question */}
                          <button
                            onClick={() => {
                              stopSpeaking();
                              onRedo(q);
                            }}
                            className="px-3 py-1.5 bg-yellow-400 text-white hover:bg-yellow-500 rounded-xl text-xs font-black shadow-sm flex items-center gap-1 cursor-pointer transition-all active:scale-95 border-b-2 border-yellow-600"
                            title="重新做一遍"
                            id={`redo-wrong-${q.id}`}
                          >
                            <RotateCcw size={13} />
                            <span>重做</span>
                          </button>

                          {/* Delete Item */}
                          <button
                            onClick={() => {
                              playBubblePop(isMuted);
                              onDelete(q.id);
                            }}
                            className="p-2 bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-all cursor-pointer border border-slate-200"
                            title="移出错题集"
                            id={`delete-wrong-${q.id}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* AI Explain Helper toggle */}
                      <div className="w-full">
                        <button
                          onClick={() => fetchExplanation(q)}
                          disabled={isLoading}
                          className={`w-full py-2 px-4 rounded-2xl border text-xs font-black flex items-center justify-between gap-2 transition-all cursor-pointer ${
                            hasExplanation 
                              ? 'bg-blue-50 hover:bg-blue-100/80 border-blue-200 text-blue-600'
                              : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm border-b-4 border-indigo-700 hover:border-b-2 hover:translate-y-[2px]'
                          }`}
                          id={`explain-btn-${q.id}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Sparkles size={14} className={isLoading ? 'animate-spin' : 'animate-bounce'} />
                            <span>
                              {isLoading 
                                ? '暖暖熊老师正在写解析...' 
                                : hasExplanation 
                                  ? '暖暖熊智能解析（点击重播语音）' 
                                  : '点我！呼唤暖暖熊老师答疑 🐻✨'
                              }
                            </span>
                          </div>
                          
                          {/* Speaker sound system */}
                          {hasExplanation && (
                            <div className="flex items-center gap-1">
                              {isSpeaking ? (
                                <>
                                  <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                  </span>
                                  <Volume2 size={14} className="animate-bounce" />
                                </>
                              ) : (
                                <VolumeX size={14} />
                              )}
                            </div>
                          )}
                        </button>

                        {/* Explanation dialog text bubbles if exist */}
                        <AnimatePresence>
                          {hasExplanation && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-2"
                            >
                              <div className="bg-[#FFF5F6] border-2 border-dashed border-pink-200 rounded-2xl p-3 sm:p-4 text-xs font-bold text-slate-700 leading-relaxed relative mt-2 flex gap-3">
                                <div className="text-2xl mt-0.5 select-none font-fredoka">🐻</div>
                                <div className="flex-1">
                                  <div className="font-extrabold text-[#D03B52] mb-1 flex items-center gap-1">
                                    <span>暖暖熊老师的魔法小黑板 🖊️</span>
                                  </div>
                                  <p className="whitespace-pre-wrap font-medium">{explanations[q.id]}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Bottom reminder text */}
            <div className="text-[11px] text-center text-slate-400 font-bold py-2 border-t border-slate-100 flex items-center justify-center gap-1">
              <span>💡 重刷错题可以彻底掌握加减法秘密哦，加油！</span>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Answer, DimensionScores } from "@/types";
import { dogQuestions } from "@/data/questions";
import { getPersonalityType } from "@/data/personalityTypes";
import { ChevronLeft, Home } from "lucide-react";

// 动画组件
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div
      className={`transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {children}
    </div>
  );
}

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = dogQuestions[currentIndex];
  const progress = ((currentIndex + 1) / dogQuestions.length) * 100;

  const handleAnswer = useCallback((optionIndex: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const option = currentQuestion.options[optionIndex];
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      optionIndex,
      score: option.score,
    };

    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== currentQuestion.id);
      return [...filtered, newAnswer];
    });

    if (currentIndex < dogQuestions.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsAnimating(false);
      }, 400);
    } else {
      setIsAnimating(false);
    }
  }, [currentIndex, currentQuestion, isAnimating]);

  const handlePrevious = () => {
    if (currentIndex > 0 && !isAnimating) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const calculateResult = () => {
    const scores: DimensionScores = {
      extraversion: 0,
      stability: 0,
      trainability: 0,
      activity: 0,
      friendliness: 0,
    };

    answers.forEach((answer) => {
      const question = dogQuestions.find((q) => q.id === answer.questionId);
      if (question) {
        scores[question.dimension] += answer.score;
      }
    });

    const personality = getPersonalityType(scores);
    router.push(`/result?type=${personality.code}`);
  };

  const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id);

  return (
    <div className="min-h-screen bg-landing flex flex-col">
      {/* 顶部进度条 */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-5 py-4"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        {/* 返回首页按钮 */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center justify-center w-8 h-8 rounded-lg mb-3 transition-all duration-200 hover:bg-[#8B5A3C]/10"
          title="返回首页"
        >
          <Home className="w-5 h-5 text-[#8B5A3C]" />
        </button>

        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1 text-sm transition-colors ${
              currentIndex === 0
                ? "text-[#E5E7EB] cursor-not-allowed"
                : "text-[#6B7280] hover:text-[#FF9A56]"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            上一题
          </button>
          <span className="text-sm font-semibold text-[#FF9A56]">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #FF9A56 0%, #7DD3C0 100%)'
            }}
          />
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-[#6B7280]">
            第 <span className="font-bold text-[#FF9A56]">{currentIndex + 1}</span> / {dogQuestions.length} 题
          </span>
        </div>
      </div>

      {/* 题目内容 */}
      <div className="flex-1 px-5 py-6 flex flex-col">
        <FadeIn key={currentQuestion.id}>
          {/* 题目卡片 */}
          <div className="bg-white rounded-[20px] p-6 mb-6"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            {/* 题号标签 */}
            <div className="text-sm font-semibold text-[#FF9A56] mb-3 tracking-wider">
              第 {currentIndex + 1} 题
            </div>
            
            {/* 场景描述 */}
            {currentQuestion.scenario && (
              <div className="text-sm text-[#FF9A56]/80 mb-3 font-medium">
                {currentQuestion.scenario}
              </div>
            )}

            {/* 题目 */}
            <h2 className="text-xl font-bold text-[#2C3E50] leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>

          {/* 选项 */}
          <div className="space-y-3 flex-1">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer?.optionIndex === index;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={isAnimating}
                  className={`
                    w-full p-4 rounded-2xl text-left transition-all duration-250
                    border-2 flex items-center gap-4
                    ${isSelected
                      ? "border-[#7DD3C0] text-white animate-option-select"
                      : "border-[#E5E7EB] bg-white hover:border-[#FF9A56] hover:translate-x-1"
                    }
                    ${isAnimating ? "pointer-events-none" : ""}
                  `}
                  style={isSelected ? {
                    background: 'linear-gradient(135deg, #7DD3C0 0%, #5BC0A8 100%)',
                    boxShadow: '0 4px 16px rgba(125, 211, 192, 0.3)'
                  } : {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  {/* 选项圆点 */}
                  <div 
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      isSelected 
                        ? "border-white bg-white" 
                        : "border-[#C5C5C5]"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#7DD3C0]" />
                    )}
                  </div>
                  <span className={`font-medium flex-1 ${isSelected ? 'text-white font-semibold' : 'text-[#2C3E50]'}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 量表两端标签 */}
          <div className="flex justify-between px-1 mt-4 text-xs text-[#9CA3AF]">
            <span>非常不同意</span>
            <span>非常同意</span>
          </div>
        </FadeIn>

        {/* 底部 */}
        <div className="mt-8 pt-4 border-t border-[#E5E7EB]">
          {currentIndex === dogQuestions.length - 1 && currentAnswer ? (
            <button
              onClick={calculateResult}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all active:scale-97"
              style={{
                background: 'linear-gradient(135deg, #FF9A56 0%, #FF7A45 100%)',
                boxShadow: '0 4px 20px rgba(255, 154, 86, 0.35)'
              }}
            >
              查看结果 🎉
            </button>
          ) : (
            <div className="text-center text-sm text-[#9CA3AF]">
              选择选项后继续
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

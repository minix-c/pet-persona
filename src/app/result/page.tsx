"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { dogPersonalityTypes } from "@/data/personalityTypes";
import { Download, RotateCcw } from "lucide-react";
import Link from "next/link";

// 动画组件
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </div>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const typeCode = searchParams.get("type") || "ESTA";
  const [personality, setPersonality] = useState(dogPersonalityTypes[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = dogPersonalityTypes.find((t) => t.code === typeCode);
    if (found) {
      setPersonality(found);
      // 显示庆祝动画
      setTimeout(() => setShowConfetti(true), 500);
    }
  }, [typeCode]);

  const generateShareImage = async () => {
    if (!shareCardRef.current) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
      });
      
      const link = document.createElement("a");
      link.download = `我的狗狗是${personality.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("生成图片失败:", error);
      alert("生成图片失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-result">
      {/* 庆祝动画 */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-start justify-center pt-20">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      {/* 结果展示 */}
      <div className="px-4 py-8">
        <FadeIn>
          {/* 顶部祝贺区 */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-lg text-[#8B5A3C] font-medium">
              恭喜你！发现了TA的秘密
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          {/* 类型插画容器 */}
          <div className="relative w-[220px] h-[220px] mx-auto mb-6">
            <div 
              className="absolute inset-0 rounded-full animate-rotate"
              style={{
                border: '2px dashed rgba(255, 154, 86, 0.3)',
                width: '240px',
                height: '240px',
                top: '-10px',
                left: '-10px'
              }}
            />
            <div 
              className="w-full h-full rounded-full flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5EC 100%)',
                boxShadow: '0 8px 32px rgba(139, 90, 60, 0.1), inset 0 -4px 16px rgba(255, 154, 86, 0.1)'
              }}
            >
              <div className="text-8xl">{personality.emoji}</div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          {/* 类型代码 - 暖阳橙大标题 */}
          <div className="text-center mb-2">
            <span 
              className="text-5xl font-bold tracking-widest"
              style={{ 
                color: '#FF9A56',
                textShadow: '2px 2px 0px rgba(255, 154, 86, 0.2)',
                fontFamily: "'Fredoka One', 'Baloo 2', cursive, sans-serif"
              }}
            >
              {personality.code}
            </span>
          </div>

          {/* 类型名称 - 焦糖棕 */}
          <h1 className="text-[28px] font-bold text-center text-[#8B5A3C] mb-2"
            style={{ fontFamily: "'优设标题黑', 'PingFang SC', sans-serif" }}
          >
            {personality.name}
          </h1>        
          
          {/* 标语 */}
          <p className="text-[#6B7280] text-center mb-6 font-medium">
            「{personality.slogan}」
          </p>

          {/* 类型标签 */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {['社交', '外向', '活力'].map((tag, i) => (
              <span 
                key={i}
                className="px-4 py-1.5 rounded-full text-[13px] font-medium"
                style={{
                  background: 'rgba(125, 211, 192, 0.2)',
                  color: '#5BC0A8'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={300}>
          {/* 五维雷达图区域 */}
          <div 
            className="rounded-[20px] p-6 mb-6 bg-white"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <h3 className="text-lg font-semibold text-[#2C3E50] text-center mb-4">
              性格五维图
            </h3>
            
            {/* 简化的五维指示 */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '外向性 (E)', color: '#FF9A56', desc: '社交达人' },
                { label: '稳定性 (S)', color: '#7DD3C0', desc: '情绪稳定' },
                { label: '宜人性 (F)', color: '#FF8B94', desc: '友善亲和' },
                { label: '活动性 (A)', color: '#87CEEB', desc: '活力充沛' },
                { label: '可训练性 (T)', color: '#C5A3D9', desc: '聪明好学' },
              ].map((dim, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dim.color }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#2C3E50]">{dim.label}</div>
                    <div className="text-xs text-[#9CA3AF]">{dim.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          {/* 描述卡片 */}
          <div 
            className="rounded-[20px] p-6 mb-6 bg-white"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <h3 className="text-lg font-semibold text-[#8B5A3C] mb-4 flex items-center gap-2">
              <span>🐾</span> 性格描述
            </h3>
            <p className="text-[#2C3E50] leading-relaxed">{personality.description}</p>
          </div>
        </FadeIn>

        <FadeIn delay={500}>
          {/* 饲养建议 */}
          <div 
            className="rounded-[20px] p-6 mb-6 bg-white"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <h3 className="font-bold text-[#8B5A3C] mb-4 flex items-center gap-2">
              <span>📝</span> 饲养建议
            </h3>
            <ul className="space-y-3">
              {personality.tips.map((tip, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-3 text-[#4B5563] leading-relaxed"
                >
                  <span 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                    style={{ backgroundColor: personality.color }}
                  >
                    {index + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={600}>
          {/* 操作按钮组 */}
          <div className="flex flex-col gap-3 mb-6">
            {/* 保存分享图按钮 - 暖阳橙渐变 */}
            <button
              onClick={generateShareImage}
              disabled={isGenerating}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-60"
              style={{ 
                background: 'linear-gradient(135deg, #FF9A56 0%, #FF7A45 100%)',
                boxShadow: '0 4px 20px rgba(255, 154, 86, 0.35)'
              }}
            >
              <Download className="w-5 h-5" />
              {isGenerating ? "生成中..." : "📥 保存分享图"}
            </button>
            
            {/* 分享按钮 - 白色背景 */}
            <button
              className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-97 bg-white border-2 border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
            >
              <span>🔗</span>
              分享好友
            </button>
            
            {/* 再测一次 */}
            <Link
              href="/pet-persona/quiz"
              className="w-full py-3 text-center text-[#9CA3AF] text-sm hover:text-[#6B7280] transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              再测一次
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={700}>
          {/* 分享提示 */}
          <div className="text-center text-sm text-[#9CA3AF] bg-white/60 py-4 rounded-xl">
            💡 保存图片分享到朋友圈，看看朋友的狗狗是什么性格
          </div>
        </FadeIn>
      </div>

      {/* 隐藏分享卡片（用于生成图片）*/}
      <div
        ref={shareCardRef}
        className="fixed left-[-9999px] top-0 w-[375px] p-8"
        style={{ 
          background: 'linear-gradient(to bottom, #FFF5EC 0%, #FFE4B5 100%)'
        }}
      >
        <div className="text-center mb-6">
          <div className="text-sm text-[#8B5A3C] mb-2">PetPersona 宠物性格测试</div>          
          <div className="text-7xl mb-4">{personality.emoji}</div>          
          
          <div 
            className="text-4xl font-bold mb-1"
            style={{ 
              color: '#FF9A56',
              textShadow: '2px 2px 0px rgba(255, 154, 86, 0.2)'
            }}
          >
            {personality.name}
          </div>          
          
          <div className="text-2xl font-mono text-[#6B7280]">{personality.code}</div>
        </div>
        
        <div className="text-center text-[#6B7280] mb-8 px-4 text-lg">
          「{personality.slogan}」
        </div>
        
        <div 
          className="rounded-2xl p-4 mb-6"
          style={{ background: 'rgba(255,255,255,0.6)' }}
        >
          <div className="text-center text-sm text-[#6B7280] mb-2">扫码测测你家毛孩子</div>
          <div className="w-24 h-24 bg-white mx-auto rounded-lg flex items-center justify-center"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
          >
            <span className="text-xs text-[#9CA3AF]">二维码</span>
          </div>
        </div>

        <div className="text-center text-xs text-[#9CA3AF]">
          petpersona.com
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-[#8B5A3C]">加载中...</div>
    </div>}>
      <ResultContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { dogPersonalityTypes } from "@/data/personalityTypes";
import { Download, RotateCcw } from "lucide-react";
import Link from "next/link";

// 五维雷达图组件
interface RadarChartProps {
  typeCode: string;
  size?: number;
}

function RadarChart({ typeCode, size = 280 }: RadarChartProps) {
  // 从 personality code 反向推算五维得分
  const getDimensionScores = (code: string) => {
    const scores = {
      E: 50, // 外向-内向 (E-I)
      S: 50, // 顺从-主导 (S-D)
      A: 50, // 活跃-慵懒 (A-L)
      F: 50, // 友善-警惕 (F-W)
      C: 50, // 聪明-憨厚 (C-S)
    };

    // 根据 code 的每一位调整得分
    // Code 格式: 第1位=E/I, 第2位=S/?, 第3位=T/F, 第4位=A/C
    // 映射到五维: E, S, A, F, C
    
    if (code.length >= 1) {
      const first = code[0];
      if (first === 'E') scores.E = 85;
      else if (first === 'I') scores.E = 15;
    }
    
    if (code.length >= 2) {
      const second = code[1];
      if (second === 'S') scores.S = 80;
      else if (second === 'I' || second === 'N') scores.S = 20; // I代表内向，对应主导性
    }
    
    if (code.length >= 3) {
      const third = code[2];
      // T=聪明(F), F=友善但这里我们用T/C映射到C维度
      if (third === 'T') scores.C = 82;
      else if (third === 'F') scores.C = 25;
      else if (third === 'A') scores.C = 78;
      else if (third === 'G') scores.C = 22;
    }
    
    if (code.length >= 4) {
      const fourth = code[3];
      if (fourth === 'A') scores.A = 80;
      else if (fourth === 'C' || fourth === 'G') scores.A = 20;
    }
    
    // 第四个维度: F=友善, G=警惕
    if (code.includes('F') && !code.startsWith('F')) {
      scores.F = 78;
    } else if (code.includes('G')) {
      scores.F = 22;
    } else if (code.includes('T') && code[2] !== 'T') {
      scores.F = 75;
    }
    
    // 根据具体类型微调
    const typeAdjustments: Record<string, Partial<typeof scores>> = {
      'ESTA': { E: 88, S: 75, A: 85, F: 82, C: 80 },
      'ESTG': { E: 82, S: 78, A: 88, F: 25, C: 20 },
      'ESFA': { E: 85, S: 72, A: 20, F: 88, C: 85 },
      'ESFG': { E: 78, S: 80, A: 18, F: 85, C: 18 },
      'EITA': { E: 82, S: 30, A: 75, F: 22, C: 88 },
      'EITG': { E: 75, S: 25, A: 72, F: 28, C: 20 },
      'EIFA': { E: 78, S: 28, A: 22, F: 25, C: 85 },
      'EIFG': { E: 70, S: 35, A: 18, F: 22, C: 18 },
      'ISTA': { E: 20, S: 78, A: 82, F: 75, C: 85 },
      'ISTG': { E: 18, S: 75, A: 78, F: 20, C: 22 },
      'ISFA': { E: 22, S: 72, A: 20, F: 85, C: 82 },
      'ISFG': { E: 15, S: 80, A: 15, F: 78, C: 15 },
      'IITA': { E: 18, S: 25, A: 85, F: 20, C: 88 },
      'IITG': { E: 15, S: 22, A: 78, F: 18, C: 20 },
      'IIFA': { E: 20, S: 28, A: 18, F: 22, C: 85 },
      'IIFG': { E: 12, S: 25, A: 12, F: 18, C: 15 },
    };
    
    if (typeAdjustments[code]) {
      Object.assign(scores, typeAdjustments[code]);
    }
    
    return scores;
  };

  const scores = getDimensionScores(typeCode);
  
  // 维度配置
  const dimensions = [
    { key: 'E', label: 'E', subLabel: '外向', fullLabel: '外向-内向', value: scores.E, color: '#FF9A56' },
    { key: 'S', label: 'S', subLabel: '顺从', fullLabel: '顺从-主导', value: scores.S, color: '#7DD3C0' },
    { key: 'A', label: 'A', subLabel: '活跃', fullLabel: '活跃-慵懒', value: scores.A, color: '#87CEEB' },
    { key: 'F', label: 'F', subLabel: '友善', fullLabel: '友善-警惕', value: scores.F, color: '#FF8B94' },
    { key: 'C', label: 'C', subLabel: '聪明', fullLabel: '聪明-憨厚', value: scores.C, color: '#C5A3D9' },
  ];

  const center = size / 2;
  const radius = size * 0.35;
  const angleStep = (Math.PI * 2) / 5;
  const startAngle = -Math.PI / 2; // 从顶部开始

  // 计算多边形顶点
  const getPoint = (value: number, index: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // 生成网格线
  const gridLevels = [20, 40, 60, 80, 100];
  
  // 生成数据多边形点
  const dataPoints = dimensions.map((d, i) => getPoint(d.value, i));
  const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // 标签位置（在外围）
  const getLabelPosition = (index: number, distance: number) => {
    const angle = startAngle + index * angleStep;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* 背景网格 - 五边形层级 */}
      {gridLevels.map((level) => {
        const levelPoints = dimensions.map((_, i) => {
          const angle = startAngle + i * angleStep;
          const r = (level / 100) * radius;
          return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        }).join(' ');
        
        return (
          <polygon
            key={level}
            points={levelPoints}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray={level === 100 ? "none" : "4,4"}
          />
        );
      })}

      {/* 轴线 */}
      {dimensions.map((_, i) => {
        const angle = startAngle + i * angleStep;
        const endX = center + radius * Math.cos(angle);
        const endY = center + radius * Math.sin(angle);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={endX}
            y2={endY}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        );
      })}

      {/* 数据填充区域 */}
      <polygon
        points={polygonPoints}
        fill="rgba(255, 154, 86, 0.35)"
        stroke="#FF9A56"
        strokeWidth="2.5"
        className="transition-all duration-700 ease-out"
      />

      {/* 数据点 */}
      {dataPoints.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="5"
          fill={dimensions[i].color}
          stroke="#FFFFFF"
          strokeWidth="2"
          className="transition-all duration-700 ease-out"
        />
      ))}

      {/* 维度标签 */}
      {dimensions.map((dim, i) => {
        const pos = getLabelPosition(i, radius + 28);
        const isHigh = dim.value >= 50;
        return (
          <g key={i}>
            {/* 主标签 */}
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-bold"
              fill={dim.color}
              style={{ fontSize: '14px', fontWeight: 700 }}
            >
              {dim.label}
            </text>
            {/* 副标签 - 显示当前倾向 */}
            <text
              x={pos.x}
              y={pos.y + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs"
              fill="#6B7280"
              style={{ fontSize: '10px' }}
            >
              {isHigh ? dim.subLabel : dim.fullLabel.split('-')[1]}
            </text>
          </g>
        );
      })}

      {/* 中心点 */}
      <circle
        cx={center}
        cy={center}
        r="3"
        fill="#D1D5DB"
      />
    </svg>
  );
}

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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
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

  // 显示 Toast 提示
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // 分享功能处理
  const handleShare = async () => {
    const shareData = {
      title: `我家狗狗是${personality.name}`,
      text: `${personality.slogan} - 快来测测你家狗狗的性格吧！`,
      url: window.location.href,
    };

    // 1. 首选：Web Share API
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // 用户取消分享，不做处理
        if ((err as Error).name === "AbortError") {
          return;
        }
        console.log("Web Share API 失败，尝试复制链接", err);
      }
    }

    // 2. 降级：复制链接到剪贴板
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        showToastMessage("🔗 链接已复制，快去分享给好友吧！");
        return;
      } catch (err) {
        console.log("复制失败", err);
      }
    }

    // 3. 兜底：提示手动分享
    showToastMessage("📸 请截图保存结果，分享给好友看看吧！");
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
            
            {/* SVG 雷达图 */}
            <RadarChart typeCode={personality.code} size={260} />
            
            {/* 维度说明 */}
            <div className="grid grid-cols-5 gap-1 mt-4 text-center">
              {[
                { label: 'E', desc: '外向', color: '#FF9A56' },
                { label: 'S', desc: '顺从', color: '#7DD3C0' },
                { label: 'A', desc: '活跃', color: '#87CEEB' },
                { label: 'F', desc: '友善', color: '#FF8B94' },
                { label: 'C', desc: '聪明', color: '#C5A3D9' },
              ].map((dim, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="w-2.5 h-2.5 rounded-full mb-1"
                    style={{ backgroundColor: dim.color }}
                  />
                  <span className="text-[10px] font-bold" style={{ color: dim.color }}>{dim.label}</span>
                  <span className="text-[9px] text-gray-400">{dim.desc}</span>
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
              onClick={handleShare}
              className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-97 bg-white border-2 border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
            >
              <span>🔗</span>
              分享好友
            </button>
            
            {/* 再测一次 */}
            <Link
              href="/quiz"
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

        {/* Toast 提示 */}
        {showToast && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div 
              className="px-6 py-4 rounded-2xl shadow-2xl animate-fade-in"
              style={{ 
                background: 'rgba(44, 62, 80, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <p className="text-white text-base font-medium text-center whitespace-nowrap">
                {toastMessage}
              </p>
            </div>
          </div>
        )}
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

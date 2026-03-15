"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { dogPersonalityTypes } from "@/data/personalityTypes";
import { Download, ChevronDown } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

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
    if (code.length >= 1) {
      const first = code[0];
      if (first === 'E') scores.E = 85;
      else if (first === 'I') scores.E = 15;
    }
    
    if (code.length >= 2) {
      const second = code[1];
      if (second === 'S') scores.S = 80;
      else if (second === 'I' || second === 'N') scores.S = 20;
    }
    
    if (code.length >= 3) {
      const third = code[2];
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
    
    if (code.includes('F') && !code.startsWith('F')) {
      scores.F = 78;
    } else if (code.includes('G')) {
      scores.F = 22;
    } else if (code.includes('T') && code[2] !== 'T') {
      scores.F = 75;
    }
    
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
  const startAngle = -Math.PI / 2;

  const getPoint = (value: number, index: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLevels = [20, 40, 60, 80, 100];
  const dataPoints = dimensions.map((d, i) => getPoint(d.value, i));
  const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  const getLabelPosition = (index: number, distance: number) => {
    const angle = startAngle + index * angleStep;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  return (
    <svg width={size} height={size} className="mx-auto">
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

      <polygon
        points={polygonPoints}
        fill="rgba(255, 154, 86, 0.35)"
        stroke="#FF9A56"
        strokeWidth="2.5"
        className="transition-all duration-700 ease-out"
      />

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

      {dimensions.map((dim, i) => {
        const pos = getLabelPosition(i, radius + 28);
        const isHigh = dim.value >= 50;
        return (
          <g key={i}>
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

      <circle cx={center} cy={center} r="3" fill="#D1D5DB" />
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
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      {children}
    </div>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const typeCode = searchParams.get("type") || "ESTA";
  const photoUrl = searchParams.get("photo");
  const [personality, setPersonality] = useState(dogPersonalityTypes[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = dogPersonalityTypes.find((t) => t.code === typeCode);
    if (found) {
      setPersonality(found);
      setTimeout(() => setShowConfetti(true), 500);
    }
    // 生成分享链接
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('type', typeCode);
      setShareUrl(url.toString());
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

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleShare = async () => {
    const shareData = {
      title: `我家狗狗是${personality.name}`,
      text: `${personality.slogan} - 快来测测你家狗狗的性格吧！`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        showToastMessage("🔗 链接已复制，快去分享给好友吧！");
        return;
      } catch (err) {
        console.log("复制失败", err);
      }
    }

    showToastMessage("📸 请截图保存结果，分享给好友看看吧！");
  };

  // 适合的活动（根据性格类型生成）
  const getActivities = (code: string) => {
    const activities: Record<string, string[]> = {
      'ESTA': ['飞盘游戏', '狗狗聚会', '户外跑步', '互动玩具'],
      'ESTG': ['敏捷训练', '巡回游戏', '障碍赛', '追踪训练'],
      'ESFA': ['散步漫游', '益智玩具', '嗅闻垫', '安静陪伴'],
      'ESFG': ['守护训练', '领地巡逻', '警戒游戏', '体能训练'],
      'EITA': ['解谜玩具', '敏捷赛', '飞盘竞技', '智能互动'],
      'EITG': ['独立探索', '捉迷藏', '寻物游戏', '自我娱乐'],
      'EIFA': ['按摩放松', '安静陪伴', '舒缓音乐', '午后小憩'],
      'EIFG': ['独立玩耍', '观察训练', '安静守候', '个人空间'],
      'ISTA': ['游泳运动', '拉力游戏', '团体活动', '户外探险'],
      'ISTG': ['护卫训练', '体能锻炼', '防御游戏', '力量训练'],
      'ISFA': ['家庭陪伴', '日常散步', '安静游戏', '温馨时光'],
      'ISFG': ['家园守护', '安静警戒', '熟悉环境', '安全感活动'],
      'IITA': ['益智解谜', '策略游戏', '学习新技能', '脑力挑战'],
      'IITG': ['独自探索', '自主游戏', '观察学习', '独立训练'],
      'IIFA': ['慵懒午睡', '安静依偎', '慢节奏散步', '舒适享受'],
      'IIFG': ['独处时光', '领地守护', '安静观察', '安全感建设'],
    };
    return activities[code] || ['日常散步', '互动游戏', '陪伴时光'];
  };

  return (
    <div className="min-h-screen bg-result">
      {/* 庆祝动画 */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-start justify-center pt-20">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      <div className="px-4 py-6">
        {/* ========== 简洁概括区（顶部） ========== */}
        <FadeIn>
          <div 
            className="rounded-[24px] p-6 mb-6 relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #FFF5EC 0%, #FFE4D6 100%)',
              boxShadow: '0 8px 32px rgba(139, 90, 60, 0.12)'
            }}
          >
            {/* 装饰背景 */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" 
              style={{ background: 'radial-gradient(circle, #FF9A56 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} 
            />
            
            {/* 顶部祝贺 */}
            <div className="text-center mb-4 relative z-10">
              <div className="text-sm text-[#8B5A3C] font-medium mb-1">🎉 恭喜你！发现了TA的秘密</div>
            </div>

            {/* 宠物照片 + 形象展示 */}
            <div className="flex items-center justify-center gap-4 mb-4 relative z-10">
              {photoUrl && (
                <div className="relative">
                  <div 
                    className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg"
                    style={{ boxShadow: '0 4px 16px rgba(139, 90, 60, 0.2)' }}
                  >
                    <img src={photoUrl} alt="宠物照片" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 text-xl">📷</div>
                </div>
              )}
              
              {/* 形象展示 */}
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5EC 100%)',
                  boxShadow: '0 4px 20px rgba(255, 154, 86, 0.25)'
                }}
              >
                <span className="text-6xl">{personality.emoji}</span>
              </div>
            </div>

            {/* 性格类型名称 */}
            <div className="text-center relative z-10">
              <div 
                className="text-4xl font-bold mb-1"
                style={{ 
                  color: '#FF9A56',
                  textShadow: '2px 2px 0px rgba(255, 154, 86, 0.2)',
                  fontFamily: "'Fredoka One', 'Baloo 2', cursive, sans-serif"
                }}
              >
                {personality.name}
              </div>
              <div className="text-lg text-[#8B5A3C] font-mono mb-2">{personality.code}</div>
              
              {/* Slogan */}
              <p className="text-[#6B7280] text-center font-medium italic">
                「{personality.slogan}」
              </p>
            </div>

            {/* 类型标签 */}
            <div className="flex justify-center gap-2 mt-4 flex-wrap relative z-10">
              {['社交', '外向', '活力'].map((tag, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(125, 211, 192, 0.25)',
                    color: '#4A9B88'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 下滑提示 */}
            <div className="flex justify-center mt-4 animate-bounce">
              <ChevronDown className="w-5 h-5 text-[#FF9A56]" />
            </div>
          </div>
        </FadeIn>

        {/* ========== 详细分析区（下方） ========== */}
        <FadeIn delay={150}>
          <div 
            className="rounded-[20px] p-5 mb-4 bg-white"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <h3 className="text-lg font-bold text-[#2C3E50] text-center mb-4 flex items-center justify-center gap-2">
              <span>📊</span> 性格五维图
            </h3>
            
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
                  <div className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: dim.color }} />
                  <span className="text-[10px] font-bold" style={{ color: dim.color }}>{dim.label}</span>
                  <span className="text-[9px] text-gray-400">{dim.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={250}>
          {/* 性格详细描述 */}
          <div 
            className="rounded-[20px] p-5 mb-4 bg-white"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <h3 className="text-lg font-bold text-[#8B5A3C] mb-3 flex items-center gap-2">
              <span>🐾</span> 性格描述
            </h3>
            <p className="text-[#4B5563] leading-relaxed text-[15px]">{personality.description}</p>
          </div>
        </FadeIn>

        <FadeIn delay={350}>
          {/* 饲养建议 */}
          <div 
            className="rounded-[20px] p-5 mb-4 bg-white"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <h3 className="text-lg font-bold text-[#8B5A3C] mb-4 flex items-center gap-2">
              <span>📝</span> 饲养建议
            </h3>
            <ul className="space-y-3">
              {personality.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3 text-[#4B5563] leading-relaxed text-[15px]">
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

        <FadeIn delay={450}>
          {/* 适合的活动 */}
          <div 
            className="rounded-[20px] p-5 mb-4 bg-white"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <h3 className="text-lg font-bold text-[#8B5A3C] mb-4 flex items-center gap-2">
              <span>🎯</span> 适合的活动
            </h3>
            <div className="flex flex-wrap gap-2">
              {getActivities(personality.code).map((activity, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    background: 'rgba(255, 154, 86, 0.15)',
                    color: '#E8854A'
                  }}
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={550}>
          {/* 二维码分享区 */}
          <div 
            className="rounded-[20px] p-5 mb-6 bg-white"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <h3 className="text-lg font-bold text-[#8B5A3C] mb-4 text-center">
              📲 分享给好友
            </h3>
            
            <div className="flex flex-col items-center">
              {/* 二维码 */}
              <div 
                className="p-4 rounded-2xl bg-white mb-4"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              >
                {shareUrl ? (
                  <QRCodeSVG 
                    value={shareUrl} 
                    size={160}
                    level="M"
                    includeMargin={false}
                    style={{ display: 'block' }}
                  />
                ) : (
                  <div className="w-[160px] h-[160px] flex items-center justify-center bg-gray-100 rounded-lg">
                    <span className="text-gray-400 text-sm">加载中...</span>
                  </div>
                )}
              </div>
              
              {/* 回流文案 */}
              <p className="text-[#8B5A3C] font-medium text-center mb-4">
                🔍 扫码测测你家毛孩子的性格
              </p>
              
              {/* 操作按钮 */}
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={generateShareImage}
                  disabled={isGenerating}
                  className="w-full py-3.5 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-60"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF9A56 0%, #FF7A45 100%)',
                    boxShadow: '0 4px 16px rgba(255, 154, 86, 0.35)'
                  }}
                >
                  <Download className="w-5 h-5" />
                  {isGenerating ? "生成中..." : "保存分享图"}
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-97 bg-white border-2 border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
                >
                  <span>🔗</span>
                  分享好友
                </button>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={650}>
          {/* 再测一次 */}
          <div className="mb-6">
            <Link href="/quiz">
              <button className="w-full py-4 bg-[#C4A484] text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-97">
                🔄 再测一次
              </button>
            </Link>
          </div>

          {/* 底部提示 */}
          <div className="text-center text-xs text-[#9CA3AF] pb-4">
            💡 保存图片分享到朋友圈，看看朋友的狗狗是什么性格
          </div>
        </FadeIn>
      </div>

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
        
        {/* 分享卡片中的二维码 */}
        <div 
          className="rounded-2xl p-4 mb-6"
          style={{ background: 'rgba(255,255,255,0.6)' }}
        >
          <div className="text-center text-sm text-[#6B7280] mb-3">扫码测测你家毛孩子的性格</div>
          <div className="flex justify-center">
            {shareUrl && (
              <QRCodeSVG 
                value={shareUrl} 
                size={120}
                level="M"
                includeMargin={false}
              />
            )}
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

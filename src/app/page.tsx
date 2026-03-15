import Link from "next/link";
import { Dog, Heart, Share2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-landing flex flex-col">
      {/* 装饰元素 - 漂浮爪印 */}
      <div className="fixed top-20 left-8 text-[#FF9A56] opacity-10 animate-float">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C10 2 8 4 8 6C8 8 10 10 12 10C14 10 16 8 16 6C16 4 14 2 12 2ZM6 7C4 7 2 9 2 11C2 13 4 15 6 15C8 15 10 13 10 11C10 9 8 7 6 7ZM18 7C16 7 14 9 14 11C14 13 16 15 18 15C20 15 22 13 22 11C22 9 20 7 18 7ZM8 13C6 13 4 15 4 17C4 19 6 21 8 21C10 21 12 19 12 17C12 15 10 13 8 13ZM16 13C14 13 12 15 12 17C12 19 14 21 16 21C18 21 20 19 20 17C20 15 18 13 16 13Z"/>
        </svg>
      </div>
      <div className="fixed bottom-40 right-6 text-[#FF9A56] opacity-10 animate-float" style={{ animationDelay: '1s' }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C10 2 8 4 8 6C8 8 10 10 12 10C14 10 16 8 16 6C16 4 14 2 12 2ZM6 7C4 7 2 9 2 11C2 13 4 15 6 15C8 15 10 13 10 11C10 9 8 7 6 7ZM18 7C16 7 14 9 14 11C14 13 16 15 18 15C20 15 22 13 22 11C22 9 20 7 18 7ZM8 13C6 13 4 15 4 17C4 19 6 21 8 21C10 21 12 19 12 17C12 15 10 13 8 13ZM16 13C14 13 12 15 12 17C12 19 14 21 16 21C18 21 20 19 20 17C20 15 18 13 16 13Z"/>
        </svg>
      </div>

      {/* Hero Section */}
      <div className="px-4 pt-16 pb-8">
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-[#FF9A56] to-[#FF7A45] rounded-full mb-6 shadow-lg" style={{ boxShadow: '0 8px 32px rgba(255, 154, 86, 0.3)' }}>
            <Dog className="w-14 h-14 text-white" />
          </div>
          
          {/* 主标题 - 使用焦糖棕 */}
          <h1 className="text-[32px] font-bold text-[#8B5A3C] mb-3 leading-tight">
            发现你家毛孩子的<br/>独特性格
          </h1>          
          <p className="text-[#6B7280] text-base mb-2 leading-relaxed">
            25道趣味测试，解锁<br/>专属性格档案
          </p>          
          <p className="text-sm text-[#9CA3AF]">
            基于科学量表 · 16种性格类型
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="text-center">
            <div className="w-14 h-14 bg-[#FFE4B5] rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ boxShadow: '0 4px 12px rgba(255, 154, 86, 0.15)' }}>
              <span className="text-2xl">📝</span>
            </div>
            <div className="text-sm font-semibold text-[#2C3E50]">25题</div>
            <div className="text-xs text-[#6B7280]">约4分钟</div>
          </div>          
          <div className="text-center">
            <div className="w-14 h-14 bg-[#7DD3C0]/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Heart className="w-7 h-7 text-[#7DD3C0]" />
            </div>
            <div className="text-sm font-semibold text-[#2C3E50]">16种</div>
            <div className="text-xs text-[#6B7280]">性格类型</div>
          </div>          
          <div className="text-center">
            <div className="w-14 h-14 bg-[#87CEEB]/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Share2 className="w-7 h-7 text-[#87CEEB]" />
            </div>
            <div className="text-sm font-semibold text-[#2C3E50]">分享</div>
            <div className="text-xs text-[#6B7280]">专属名片</div>
          </div>
        </div>

        {/* CTA Button - 暖阳橙渐变，胶囊形 */}
        <Link
          href="/pet-persona/quiz"
          className="block w-full py-[18px] px-14 bg-gradient-to-br from-[#FF9A56] to-[#FF7A45] text-white text-center rounded-full font-semibold text-xl transition-all active:scale-95"
          style={{ boxShadow: '0 4px 20px rgba(255, 154, 86, 0.4)' }}
        >
          🎯 开始测试
        </Link>
        
        <p className="text-center text-sm text-[#8B5A3C] mt-6 flex items-center justify-center gap-2">
          <span className="font-bold text-[#FF9A56]">12,580</span>
          <span>只狗狗已解锁性格密码</span>
        </p>
      </div>

      {/* 骨头形状分割线 */}
      <div className="flex items-center justify-center gap-2 py-4">
        <div className="h-px bg-[#E5E7EB] flex-1 max-w-[100px]"></div>
        <span className="text-2xl">🦴</span>
        <div className="h-px bg-[#E5E7EB] flex-1 max-w-[100px]"></div>
      </div>

      {/* Sample Results Preview */}
      <div className="px-4 py-6 bg-white/50 backdrop-blur-sm rounded-t-3xl mt-auto">
        <h2 className="text-lg font-bold text-[#8B5A3C] mb-4 text-center">
          热门性格类型
        </h2>        
        <div className="space-y-3">
          {[
            { emoji: "☀️", name: "社交小太阳", code: "ESTA", color: "#FF9A56" },
            { emoji: "🤔", name: "独立思想家", code: "EITG", color: "#7DD3C0" },
            { emoji: "🛡️", name: "敏感小保镖", code: "ISTG", color: "#87CEEB" },
            { emoji: "🍬", name: "软萌棉花糖", code: "IICA", color: "#C5A3D9" },
          ].map((type, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-white rounded-xl"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <span className="text-2xl">{type.emoji}</span>
              <div className="flex-1">
                <div className="font-semibold text-[#2C3E50]">{type.name}</div>
                <div className="text-xs text-[#6B7280] font-mono">{type.code}</div>
              </div>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: type.color }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center bg-white/50">
        <p className="text-xs text-[#9CA3AF]">
          基于DPQ科学量表改编 · 仅供参考娱乐
        </p>
      </div>
    </div>
  );
}

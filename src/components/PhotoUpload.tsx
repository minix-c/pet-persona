"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Camera, ImageIcon, AlertCircle } from "lucide-react";

interface PhotoUploadProps {
  userId?: string;
  onPhotoChange?: (photoData: string | null) => void;
  className?: string;
}

// 压缩图片
async function compressImage(file: File, maxSizeKB: number = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          reject(new Error("无法创建 canvas 上下文"));
          return;
        }

        // 计算压缩后的尺寸
        let { width, height } = img;
        const maxDimension = 1200; // 最大边长
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        // 使用更好的图像质量
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // 计算初始压缩质量
        let quality = 0.9;
        let base64 = canvas.toDataURL("image/jpeg", quality);
        
        // 如果仍然大于限制，逐步降低质量
        const maxSizeBytes = maxSizeKB * 1024;
        let attempts = 0;
        const maxAttempts = 10;
        
        // 估算 base64 大小 (base64 比原始数据大约 33%)
        const getBase64Size = (base64String: string) => {
          const base64Length = base64String.split(",")[1]?.length || 0;
          return (base64Length * 3) / 4;
        };

        while (getBase64Size(base64) > maxSizeBytes && attempts < maxAttempts && quality > 0.3) {
          quality -= 0.1;
          base64 = canvas.toDataURL("image/jpeg", quality);
          attempts++;
        }

        resolve(base64);
      };
      
      img.onerror = () => reject(new Error("图片加载失败"));
    };
    
    reader.onerror = () => reject(new Error("文件读取失败"));
  });
}

export default function PhotoUpload({ 
  userId = "default", 
  onPhotoChange,
  className = "" 
}: PhotoUploadProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageKey = `petPhoto_${userId}`;

  // 从 localStorage 加载已保存的照片
  useEffect(() => {
    try {
      const savedPhoto = localStorage.getItem(storageKey);
      if (savedPhoto) {
        setPhoto(savedPhoto);
        onPhotoChange?.(savedPhoto);
      }
    } catch (e) {
      console.error("读取本地存储失败:", e);
    }
  }, [storageKey, onPhotoChange]);

  // 保存照片到 localStorage
  const savePhoto = useCallback((photoData: string | null) => {
    try {
      if (photoData) {
        localStorage.setItem(storageKey, photoData);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (e) {
      console.error("保存到本地存储失败:", e);
      // 如果存储失败（可能是大小限制），提示用户
      if (e instanceof Error && e.name === "QuotaExceededError") {
        alert("照片太大，无法保存。请尝试上传更小的图片。");
      }
    }
  }, [storageKey]);

  // 处理文件选择
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const needsCompression = file.size > 1024 * 1024; // > 1MB 需要压缩

    setIsCompressing(true);
    setCompressionInfo(needsCompression ? `正在压缩 (${originalSizeMB}MB)...` : "正在处理...");

    try {
      // 添加小延迟让 UI 更新
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const compressedPhoto = await compressImage(file, 500);
      
      // 计算压缩后大小
      const compressedSizeKB = Math.round((compressedPhoto.length * 3) / 4 / 1024);
      
      setPhoto(compressedPhoto);
      savePhoto(compressedPhoto);
      onPhotoChange?.(compressedPhoto);

      if (needsCompression) {
        setCompressionInfo(`已压缩至 ${compressedSizeKB}KB`);
        setTimeout(() => setCompressionInfo(null), 3000);
      }
    } catch (error) {
      console.error("图片处理失败:", error);
      alert("图片处理失败，请重试");
    } finally {
      setIsCompressing(false);
    }
  };

  // 点击上传区域
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 文件输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // 重置 input 以便可以再次选择同一文件
    e.target.value = "";
  };

  // 删除照片
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhoto(null);
    savePhoto(null);
    onPhotoChange?.(null);
    setCompressionInfo(null);
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* 主上传区域 */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer transition-all duration-300 ease-out
          ${isDragging 
            ? "scale-[1.02] ring-4 ring-[#C4A484]/30" 
            : "hover:scale-[1.01]"
          }
        `}
      >
        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* 圆形预览区 */}
        <div 
          className={`
            relative w-[180px] h-[180px] mx-auto rounded-full overflow-hidden
            transition-all duration-300
            ${photo 
              ? "ring-4 ring-[#C4A484]/20" 
              : "ring-2 ring-dashed ring-[#C4A484]/40 hover:ring-[#C4A484]/60"
            }
            ${isDragging ? "ring-4 ring-[#C4A484]/50" : ""}
          `}
          style={{
            background: photo 
              ? "transparent" 
              : "linear-gradient(145deg, #FAF8F4 0%, #F5F0E8 100%)"
          }}
        >
          {photo ? (
            // 已上传照片预览
            <>
              <img
                src={photo}
                alt="宠物照片"
                className="w-full h-full object-cover"
              />
              
              {/* 悬停遮罩 */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <span className="text-white text-sm font-medium flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  更换照片
                </span>
              </div>

              {/* 删除按钮 */}
              <button
                onClick={handleDelete}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
              >
                <X className="w-4 h-4 text-[#8B5A3C]" />
              </button>
            </>
          ) : (
            // 未上传状态
            <div className="w-full h-full flex flex-col items-center justify-center text-[#8A7B72]">
              {isCompressing ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-3 border-[#C4A484]/20 border-t-[#C4A484] animate-spin" />
                  <span className="text-xs text-[#8A7B72]">{compressionInfo}</span>
                </div>
              ) : (
                <>
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 hover:scale-110"
                    style={{ background: "rgba(196, 164, 132, 0.15)" }}
                  >
                    <ImageIcon className="w-8 h-8 text-[#C4A484]" />
                  </div>
                  <span className="text-sm font-medium text-[#8B5A3C]">点击上传</span>
                  <span className="text-xs text-[#9CA3AF] mt-1">或拖拽图片到此处</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* 上传按钮（仅在未上传时显示） */}
        {!photo && !isCompressing && (
          <div className="mt-4 text-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #C4A484 0%, #D4A574 100%)",
                color: "#FFFFFF",
                boxShadow: "0 4px 16px rgba(196, 164, 132, 0.35)"
              }}
            >
              <Upload className="w-4 h-4" />
              上传宠物美照
            </button>
          </div>
        )}

        {/* 更换照片按钮（已上传时显示在下方） */}
        {photo && !isCompressing && (
          <div className="mt-4 text-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "rgba(196, 164, 132, 0.15)",
                color: "#8B5A3C",
                border: "1px solid rgba(196, 164, 132, 0.3)"
              }}
            >
              <Camera className="w-4 h-4" />
              更换照片
            </button>
          </div>
        )}

        {/* 压缩提示 */}
        {compressionInfo && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#7DD3C0]">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{compressionInfo}</span>
          </div>
        )}

        {/* 尺寸提示 */}
        {!photo && !isCompressing && (
          <p className="mt-3 text-center text-xs text-[#9CA3AF]">
            支持 JPG、PNG 格式，大于 1MB 将自动压缩
          </p>
        )}
      </div>
    </div>
  );
}

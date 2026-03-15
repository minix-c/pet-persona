import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "宠物性格测试 - 解锁你家毛孩子的MBTI",
  description: "基于科学量表的宠物性格测试，16种性格类型，生成专属性格名片。",
  openGraph: {
    title: "宠物性格测试",
    description: "测测你家毛孩子是什么性格？",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-w-md mx-auto`}
      >
        {children}
      </body>
    </html>
  );
}

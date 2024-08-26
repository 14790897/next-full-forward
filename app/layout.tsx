import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "next full proxy",
  description: "全代理网页流量，轻松越过防火墙",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 参考 https://nextjs.org/docs/app/building-your-application/optimizing/scripts
    <html lang="en">
      <body className={inter.className}>{children}</body>
      <Script id="service-worker">{`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
                  // 注册成功
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  // 注册失败 :(
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}</Script>
      {/* 谷歌分析 */}
      <GoogleAnalytics gaId="G-N4JC2V0JWY" />
      {/* 微软 clarify */}
      <Script id="clarify">
        {`
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "nt4hmun44h");`}
      </Script>
    </html>
  );
}

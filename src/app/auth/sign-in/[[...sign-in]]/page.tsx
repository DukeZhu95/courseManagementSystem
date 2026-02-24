'use client';

import { SignIn } from '@clerk/nextjs';
import { useEffect } from 'react';
import { clerkAppearance } from '@/config/clerk-appearance';
import '@/styles/clerk-custom-styles.css';

export default function SignInPage() {
  // 🔥 使用 JavaScript 强制修改 DOM
  useEffect(() => {
    const fixClerkFooter = () => {
      // 查找所有可能的 footer 相关元素
      const selectors = [
        '.cl-footer',
        '.cl-footerAction',
        '.cl-internal-b3fm6y',
        '[class*="cl-footer"]',
        '[class*="footerAction"]',
        '[class*="internal-"]',
      ];

      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            if (el instanceof HTMLElement) {
              // 强制设置样式
              el.style.setProperty('background', 'rgba(255, 255, 255, 0.98)', 'important');
              el.style.setProperty('backdrop-filter', 'blur(20px)', 'important');
              el.style.setProperty('-webkit-backdrop-filter', 'blur(20px)', 'important');
              el.style.setProperty('box-shadow', 'none', 'important');

              // 如果是主 footer，设置额外样式
              if (el.classList.contains('cl-footer') || selector === '.cl-footer') {
                el.style.setProperty('border-top', '1px solid rgba(0, 0, 0, 0.08)', 'important');
                el.style.setProperty('border-radius', '0 0 24px 24px', 'important');
                el.style.setProperty('padding', '1.5rem 2rem', 'important');
                el.style.setProperty('margin', '0', 'important');
              }
            }
          });
        } catch {
          console.log('Could not apply styles to:', selector);
        }
      });
    };

    // 立即执行
    fixClerkFooter();

    // 多次延迟执行
    const timers = [100, 300, 500, 1000, 2000].map(delay =>
      setTimeout(fixClerkFooter, delay)
    );

    // 监听 DOM 变化
    const observer = new MutationObserver(() => {
      fixClerkFooter();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <style jsx global>{`
          /* 页面布局 */
          body > div,
          body > div > div,
          .flex.min-h-screen.items-center.justify-center {
              display: block !important;
              justify-content: unset !important;
              align-items: unset !important;
          }

          body {
              display: block !important;
              background: transparent !important;
          }

          /* 容器布局 */
          .auth-page-container {
              min-height: 100vh !important;
              display: flex !important;
              align-items: center !important;
              justify-content: flex-start !important;
              position: relative !important;
              overflow: hidden !important;
              padding: 2rem 3rem 2rem 28rem !important;
          }

          .auth-clerk-wrapper {
              position: relative !important;
              z-index: 1 !important;
              width: 100% !important;
              max-width: 420px !important;
              margin-left: 0 !important;
              margin-right: auto !important;
          }

          /* 背景 */
          .auth-page-background {
              position: fixed !important;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 0;
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
          }

          .auth-page-background::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.15);
          }

          /* Logo */
          .auth-brand-logo {
              position: fixed;
              top: 2rem;
              left: 3rem;
              z-index: 10;
              color: white;
              font-size: 1.5rem;
              font-weight: 700;
              text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          /* 版权信息 */
          .auth-footer-info {
              position: fixed;
              bottom: 2rem;
              left: 3rem;
              z-index: 10;
              color: rgba(255, 255, 255, 0.9);
              font-size: 0.875rem;
              text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          /* 响应式 */
          @media (max-width: 1440px) {
              .auth-page-container {
                  padding: 2rem 2rem 2rem 2.5rem !important;
              }
          }

          @media (max-width: 1024px) {
              .auth-page-container {
                  justify-content: center !important;
                  padding: 2rem 1.5rem !important;
              }

              .auth-clerk-wrapper {
                  margin-left: auto !important;
                  margin-right: auto !important;
              }

              .auth-brand-logo {
                  left: 2rem;
              }

              .auth-footer-info {
                  left: 50%;
                  transform: translateX(-50%);
              }
          }
      `}</style>

      <div className="auth-page-container">
        <div
          className="auth-page-background"
          style={{
            backgroundImage: 'url(/images/background-login_page.jpg)',
          }}
        />

        <div className="auth-brand-logo">
          <span>LessonHub</span>
        </div>

        <div className="auth-clerk-wrapper">
          <SignIn
            path="/auth/sign-in"
            routing="path"
            signUpUrl="/auth/sign-up"
            afterSignInUrl="/select-role"
            appearance={clerkAppearance}
          />
        </div>

        <div className="auth-footer-info">
          © 2024 Course Management System. All rights reserved.
        </div>
      </div>
    </>
  );
}
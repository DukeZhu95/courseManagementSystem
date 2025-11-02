'use client';

import { Achievements } from '../Achievements';
import { RouteGuard } from '@/app/components/auth/route-guard';
import { ArrowLeft, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { CustomUserMenu } from '../custom-user-menu';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import '@/styles/components/student-dashboard-glass.css';

export default function AchievementsPage() {
  const router = useRouter();
  const { user } = useUser();

  const profile = useQuery(
    api.students.getStudentProfile,
    user?.id ? { studentId: user.id } : 'skip'
  );

  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`
    : user?.firstName || 'Student';

  return (
    <RouteGuard>
      <div className="glass-student-container">
        {/* 背景渐变 */}
        <div className="glass-student-background">
          <div className="glass-student-gradient-1"></div>
          <div className="glass-student-gradient-2"></div>
          <div className="glass-student-gradient-3"></div>
        </div>

        {/* 导航栏 */}
        <nav className="glass-student-nav">
          <div className="container">
            <div className="glass-student-nav-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => router.push('/dashboard/student')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '0.75rem 1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#1a202c',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.transform = 'translateX(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <ArrowLeft size={20} />
                  Back to Dashboard
                </button>

                <div className="glass-student-nav-title" style={{ marginLeft: '1rem' }}>
                  <div className="glass-student-nav-icon">
                    <Award size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1>My Achievements</h1>
                    <p className="glass-student-nav-subtitle">View all your earned badges</p>
                  </div>
                </div>
              </div>

              <div className="glass-student-user-section">
                <CustomUserMenu
                  afterSignOutUrl="/auth/sign-in"
                  profile={profile}
                />
              </div>
            </div>
          </div>
        </nav>

        {/* 主要内容 */}
        <main className="container glass-student-main">
          {/* 欢迎区域 */}
          <div className="glass-student-welcome">
            <div className="glass-student-welcome-content">
              <div className="glass-student-sparkle-icon" style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
              }}>
                <Award size={32} />
              </div>
              <div>
                <h2 className="glass-student-welcome-title">
                  {displayName}&apos;s Achievement Gallery 🏆
                </h2>
                <p className="glass-student-welcome-subtitle">
                  Keep up the great work! Every achievement tells your success story.
                </p>
              </div>
            </div>
          </div>

          {/* 成就组件 */}
          <section className="glass-student-section">
            <Achievements />
          </section>
        </main>
      </div>
    </RouteGuard>
  );
}
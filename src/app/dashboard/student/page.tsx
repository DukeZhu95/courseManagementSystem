'use client';

import { JoinClassForm } from '@/app/dashboard/student/join-class-form';
import { RouteGuard } from '@/app/components/auth/route-guard';
import {
  Plus,
  GraduationCap,
  Sparkles,
  Library,
  Calendar,
  Award,
  CheckSquare
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { CustomUserMenu } from '@/app/dashboard/student/custom-user-menu';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { CurrentTasks } from './current-tasks';
import { Id } from '../../../../convex/_generated/dataModel';

// ✅ 定义类型
interface Schedule {
  _id: Id<'classroomSchedules'>;
  classroomId: Id<'classrooms'>;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  location?: string;
}

interface Classroom {
  _id: Id<'classrooms'>;
  code: string;
  name?: string;
  courseName?: string;
  teacherId: string;
  students: Array<{
    studentId: string;
    joinedAt: number;
    status: string;
  }>;
}

export default function StudentDashboard() {
  const { user } = useUser();
  const router = useRouter();

  const profile = useQuery(
    api.students.getStudentProfile,
    user?.id ? { studentId: user.id } : 'skip'
  );

  const schedules = useQuery(
    api.classroomSchedules.getStudentSchedules,
    user?.id ? { studentId: user.id } : 'skip'
  );

  const classrooms = useQuery(
    api.classes.getStudentClassrooms,
    user?.id ? { studentId: user.id } : 'skip'
  );

  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`
    : user?.firstName || 'Student';

  // ✅ 计算课程表信息 - 显示"星期几 + 课程名"
  const getTimetableInfo = () => {
    if (!schedules || schedules.length === 0 || !classrooms || classrooms.length === 0) {
      return {
        label: 'No classes',
        value: 'Join a class',
      };
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const allUpcomingClasses: Array<{
      schedule: Schedule;
      classroom: Classroom;
      dayOfWeek: number;
      startTimeMinutes: number;
      daysUntil: number;
    }> = [];

    schedules.forEach((schedule) => {
      const classroom = classrooms.find((c) => c._id === schedule.classroomId);
      if (!classroom) return;

      schedule.daysOfWeek.forEach((dayOfWeek: number) => {
        const startTimeMinutes = parseTime(schedule.startTime);
        let daysUntil = dayOfWeek - currentDay;

        if (daysUntil === 0) {
          if (startTimeMinutes > currentTime) {
            allUpcomingClasses.push({
              schedule,
              classroom,
              dayOfWeek,
              startTimeMinutes,
              daysUntil: 0,
            });
          }
        } else if (daysUntil > 0) {
          allUpcomingClasses.push({
            schedule,
            classroom,
            dayOfWeek,
            startTimeMinutes,
            daysUntil,
          });
        } else {
          daysUntil += 7;
          allUpcomingClasses.push({
            schedule,
            classroom,
            dayOfWeek,
            startTimeMinutes,
            daysUntil,
          });
        }
      });
    });

    allUpcomingClasses.sort((a, b) => {
      if (a.daysUntil !== b.daysUntil) {
        return a.daysUntil - b.daysUntil;
      }
      return a.startTimeMinutes - b.startTimeMinutes;
    });

    const nextClass = allUpcomingClasses[0];

    if (!nextClass) {
      return {
        label: 'No classes',
        value: 'This week',
      };
    }

    const dayName = dayNames[nextClass.dayOfWeek];
    const courseName = nextClass.classroom.courseName || nextClass.classroom.name;

    if (nextClass.daysUntil === 0) {
      return {
        label: 'Today',
        value: courseName,
      };
    } else if (nextClass.daysUntil === 1) {
      return {
        label: 'Tomorrow',
        value: courseName,
      };
    } else {
      return {
        label: dayName,
        value: courseName,
      };
    }
  };

  const timetableInfo = getTimetableInfo();

  const viewAllClasses = () => {
    router.push('/dashboard/student/classes');
  };

  const viewTimetable = () => {
    router.push('/dashboard/student/timetable');
  };

  const viewAchievements = () => {
    router.push('/dashboard/student/achievements');
  };

  return (
    <RouteGuard>
      <div className="glass-student-container">
        <div className="glass-student-background">
          <div className="glass-student-gradient-1"></div>
          <div className="glass-student-gradient-2"></div>
          <div className="glass-student-gradient-3"></div>
        </div>

        <nav className="glass-student-nav">
          <div className="container">
            <div className="glass-student-nav-content">
              <div className="glass-student-nav-title">
                <div className="glass-student-nav-icon">
                  <GraduationCap size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h1>Student Dashboard</h1>
                  <p className="glass-student-nav-subtitle">Learning Management Portal</p>
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

        <main className="container glass-student-main">
          <div className="glass-student-welcome">
            <div className="glass-student-welcome-content">
              <div className="glass-student-sparkle-icon">
                <Sparkles size={32} />
              </div>
              <div>
                <h2 className="glass-student-welcome-title">
                  Welcome back, {displayName}! 🎓
                </h2>
                <p className="glass-student-welcome-subtitle">
                  Ready to learn something new today? Join classes and track your progress.
                </p>
              </div>
            </div>
          </div>

          {/* 快速统计卡片 */}
          <div className="glass-student-quick-stats">
            <div
              className="glass-student-stat-mini glass-student-stat-1"
              onClick={viewAllClasses}
              style={{ cursor: 'pointer' }}
            >
              <div className="glass-student-stat-mini-icon">
                <Library size={24} strokeWidth={2} />
              </div>
              <div className="glass-student-stat-mini-content">
                <p className="glass-student-stat-mini-label">Enrolled classes</p>
                <p className="glass-student-stat-mini-value">View All</p>
              </div>
            </div>

            <div
              className="glass-student-stat-mini glass-student-stat-2"
              onClick={viewTimetable}
              style={{ cursor: 'pointer' }}
            >
              <div className="glass-student-stat-mini-icon">
                <Calendar size={24} strokeWidth={2} />
              </div>
              <div className="glass-student-stat-mini-content">
                <p className="glass-student-stat-mini-label">{timetableInfo.label}</p>
                <p className="glass-student-stat-mini-value">{timetableInfo.value}</p>
              </div>
            </div>

            {/* ✅ 替换：GRADE → ACHIEVEMENTS */}
            <div
              className="glass-student-stat-mini glass-student-stat-3"
              onClick={viewAchievements}
              style={{ cursor: 'pointer' }}
            >
              <div className="glass-student-stat-mini-icon">
                <Award size={24} strokeWidth={2} />
              </div>
              <div className="glass-student-stat-mini-content">
                <p className="glass-student-stat-mini-label">Achievements</p>
                <p className="glass-student-stat-mini-value">View All</p>
              </div>
            </div>
          </div>

          <div className="glass-student-grid">
            {/* 加入班级部分 */}
            <section className="glass-student-section glass-student-join-section">
              <div className="glass-student-section-header">
                <div className="glass-student-section-title-group">
                  <div className="glass-student-section-icon">
                    <Plus size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2>Join a class</h2>
                    <p className="glass-student-section-subtitle">
                      Enter your class code to get started
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass-student-form-wrapper">
                <JoinClassForm />
              </div>
            </section>

            {/* ✅ 右侧改为两栏布局 */}
            <div className="space-y-6">
              {/* Current Tasks */}
              <section className="glass-student-section glass-student-tasks-section">
                <div className="glass-student-section-header">
                  <div className="glass-student-section-title-group">
                    <div className="glass-student-section-icon">
                      <CheckSquare size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2>Current Tasks</h2>
                      <p className="glass-student-section-subtitle">
                        Track your upcoming assignments and deadlines
                      </p>
                    </div>
                  </div>
                </div>
                <div className="glass-student-tasks-wrapper">
                  <CurrentTasks />
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </RouteGuard>
  );
}
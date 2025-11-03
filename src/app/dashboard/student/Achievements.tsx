'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Award, Star, Trophy, Award as Medal, Zap, Heart, BookOpen, Lock, User, GraduationCap } from 'lucide-react';

// 图标映射
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  star: Star,
  trophy: Trophy,
  medal: Medal,
  zap: Zap,
  heart: Heart,
  book: BookOpen,
};

export function Achievements() {
  const { user } = useUser();
  // const [] = useState<string | null>(null);

  const earnedAchievements = useQuery(
    api.achievements.getStudentAchievements,
    user?.id ? { studentId: user.id } : 'skip'
  );

  // 检测新成就（24小时内）
  const hasNewAchievements = () => {
    if (!earnedAchievements) return false;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return earnedAchievements.some(a => a.awardedAt > oneDayAgo);
  };

  const newAchievementsCount = earnedAchievements?.filter(
    a => a.awardedAt > Date.now() - 24 * 60 * 60 * 1000
  ).length || 0;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Achievements</h2>
        <p className="text-gray-500">Please sign in to view achievements</p>
      </div>
    );
  }

  const earnedCount = earnedAchievements?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* 标题和计数 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Award className="w-6 h-6 text-purple-600" />
            {hasNewAchievements() && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-gray-800">My Achievements</h2>
          {hasNewAchievements() && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full animate-pulse">
        {newAchievementsCount} New
      </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-purple-600">{earnedCount}</p>
          <p className="text-xs text-gray-500">Earned</p>
        </div>
      </div>

      {/* 成就列表 */}
      {earnedCount > 0 ? (
        <div className="space-y-4">
          {earnedAchievements?.map((achievement) => {
            const template = achievement.template;
            if (!template) return null;

            const Icon = ICON_MAP[template.icon] || Star;
            const isNew = achievement.awardedAt > Date.now() - 24 * 60 * 60 * 1000;

            return (
              <div
                key={achievement._id}
                className={`relative p-4 bg-gradient-to-r from-gray-50 to-white border rounded-xl hover:shadow-md transition-all ${
                  isNew ? 'border-yellow-400 shadow-lg' : 'border-gray-200'
                }`}
              >
                {/* NEW 标签 */}
                {isNew && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                    NEW! 🎉
                  </div>
                )}
                <div className="flex items-start gap-4">
                  {/* 徽章图标 */}
                  <div
                    className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: template.color }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* 徽章信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {template.description}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(achievement.awardedAt)}
                      </span>
                    </div>

                    {/* 授予信息 */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-blue-600" />
                        <span>
                          Awarded by <TeacherName teacherId={achievement.awardedBy} />
                        </span>
                      </div>
                      {achievement.classroomId && (
                        <div className="flex items-center gap-1.5">
                          <GraduationCap size={14} className="text-green-600" />
                          <span>
                            in <ClassName classroomId={achievement.classroomId} />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 教师留言 */}
                    {achievement.customMessage && (
                      <div className="mt-3 p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                        <p className="text-xs font-medium text-purple-900 mb-1">
                          Teacher&apos;s Message:
                        </p>
                        <p className="text-sm text-purple-800 italic">
                          &ldquo;{achievement.customMessage}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* 类别标签 */}
                    {template.category && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {template.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 空状态 */
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-1">No achievements yet</p>
          <p className="text-sm text-gray-500">
            Keep working hard! Your teacher will award you achievements for your efforts. 🌟
          </p>
        </div>
      )}

      {/* 鼓励信息 */}
      {earnedCount > 0 && earnedCount < 5 && (
        <div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-700 text-center">
            Keep up the great work! More achievements are waiting for you! 🎯
          </p>
        </div>
      )}
    </div>
  );
}

// 获取教师名称的子组件
function TeacherName({ teacherId }: { teacherId: string }) {
  const profile = useQuery(api.teachers.getTeacherProfile, { teacherId });

  if (!profile) return <span className="text-gray-400">Loading...</span>;

  const name = profile.firstName
    ? `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`
    : 'Teacher';

  return <span className="font-medium text-blue-700">{name}</span>;
}

// 获取课程名称的子组件
function ClassName({ classroomId }: { classroomId: string }) {
  const classroom = useQuery(api.classes.getClassroom, {
    classroomId: classroomId as any
  });

  if (!classroom) return <span className="text-gray-400">Loading...</span>;

  return <span className="font-medium text-green-700">{classroom.name || 'Class'}</span>;
}
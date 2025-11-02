/**
 * Achievements 组件 - 学生端
 * 在学生dashboard中显示获得的成就
 */

'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Award, Star, Trophy, Award as Medal, Zap, Heart, BookOpen, Lock } from 'lucide-react';
import { useState } from 'react';

// 图标映射
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; color?: string }>> = {
  star: Star,
  trophy: Trophy,
  medal: Medal,
  zap: Zap,
  heart: Heart,
  book: BookOpen,
};

export function Achievements() {
  const { user } = useUser();
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // 获取学生获得的成就
  const earnedAchievements = useQuery(
    api.achievements.getStudentAchievements,
    user?.id ? { studentId: user.id } : 'skip'
  );

  // 格式化时间
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800">My Achievements</h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-purple-600">{earnedCount}</p>
          <p className="text-xs text-gray-500">Earned</p>
        </div>
      </div>

      {/* 成就网格 */}
      {earnedCount > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {earnedAchievements?.map((achievement) => {
            const template = achievement.template;
            if (!template) return null;

            const Icon = ICON_MAP[template.icon] || Star;
            const isHovered = hoveredBadge === achievement._id;

            return (
              <div
                key={achievement._id}
                className="relative group"
                onMouseEnter={() => setHoveredBadge(achievement._id)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                {/* 徽章图标 */}
                <div
                  className="aspect-square rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hover:scale-110"
                  style={{ backgroundColor: template.color + '20' }}
                >
                  <Icon
                    className="w-8 h-8"
                    color={template.color}
                  />
                </div>

                {/* Hover 详情卡片 */}
                {isHovered && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-4 bg-gray-900 text-white rounded-lg shadow-xl z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon
                          className="w-5 h-5"
                          color={template.color}
                        />
                        <p className="font-semibold text-sm">{template.name}</p>
                      </div>
                      <p className="text-xs text-gray-300 mb-2">
                        {template.description}
                      </p>
                      {achievement.customMessage && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-xs text-gray-400 mb-1">Message:</p>
                          <p className="text-xs text-gray-200 italic">
                            &ldquo;{achievement.customMessage}&rdquo;
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-3">
                        Earned: {formatDate(achievement.awardedAt)}
                      </p>
                    </div>
                    {/* 小三角 */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* 空状态 */
        <div className="text-center py-8">
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
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs text-purple-700 text-center">
            Keep up the great work! More achievements are waiting for you! 🎯
          </p>
        </div>
      )}
    </div>
  );
}
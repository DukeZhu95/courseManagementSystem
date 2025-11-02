'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { X, Star, Trophy, Award as Medal, Zap, Heart, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Id } from '../../../../convex/_generated/dataModel';

interface AwardAchievementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

// 图标映射
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; color?: string }>> = {
  star: Star,
  trophy: Trophy,
  medal: Medal,
  zap: Zap,
  heart: Heart,
  book: BookOpen,
};

export function AwardAchievementDialog({
                                         isOpen,
                                         onClose,
                                         studentId,
                                         studentName,
                                       }: AwardAchievementDialogProps) {
  const { user } = useUser();
  const [selectedAchievement, setSelectedAchievement] = useState<Id<'achievementTemplates'> | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // 初始化预设成就
  const ensurePresets = useMutation(api.achievements.ensurePresetAchievements);

  // 获取所有可用的成就模板
  const achievementTemplates = useQuery(
    api.achievements.getAllAchievementTemplates,
    user?.id ? { teacherId: user.id } : 'skip'
  );

  // 授予成就的 mutation
  const awardAchievement = useMutation(api.achievements.awardAchievement);

  // 首次打开对话框时，确保预设成就已创建
  useEffect(() => {
    if (isOpen && user?.id && !initializing && achievementTemplates !== undefined) {
      // 如果没有成就或成就少于6个，说明可能需要初始化
      if (!achievementTemplates || achievementTemplates.length < 6) {
        setInitializing(true);
        ensurePresets({ teacherId: user.id })
          .then((result) => {
            if (result.created > 0) {
              console.log(`Created ${result.created} preset achievements`);
            }
          })
          .catch((error) => {
            console.error('Failed to initialize preset achievements:', error);
          })
          .finally(() => {
            setInitializing(false);
          });
      }
    }
  }, [isOpen, user?.id, achievementTemplates, initializing, ensurePresets]);

  const handleAward = async () => {
    if (!selectedAchievement) {
      toast.error('Please select an achievement');
      return;
    }

    setLoading(true);
    try {
      await awardAchievement({
        studentId,
        achievementTemplateId: selectedAchievement,
        customMessage: customMessage.trim() || undefined,
      });

      setSelectedAchievement(null);
      setCustomMessage('');
      onClose();
      
      setTimeout(() => {
        toast.success(`Achievement awarded to ${studentName}!`);
      }, 100);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to award achievement';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-purple-200 p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Award Achievement</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select an achievement for <span className="font-semibold">{studentName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 成就选择网格 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Achievement</h3>

          {initializing || achievementTemplates === undefined ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading achievements...</p>
            </div>
          ) : achievementTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Initializing preset achievements...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {achievementTemplates.map((template) => {
                const Icon = ICON_MAP[template.icon] || Star;
                const isSelected = selectedAchievement === template._id;

                return (
                  <button
                    key={template._id}
                    onClick={() => setSelectedAchievement(template._id)}
                    className={`
                      p-4 rounded-xl border-2 transition-all
                      ${isSelected
                      ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                    }
                    `}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="p-3 rounded-full"
                        style={{
                          backgroundColor: template.color,
                        }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-sm text-gray-800">{template.name}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 自定义留言 */}
        {selectedAchievement && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message for the student..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {customMessage.length}/200
            </p>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAward}
            disabled={!selectedAchievement || loading || initializing}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Awarding...' : 'Award Achievement'}
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Clock, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Task {
  _id: string;
  title: string;
  classId: string;
  dueDate?: number;
  submissions?: Array<{
    _id: string;
    studentId: string;
    [key: string]: unknown;
  }>;
}

interface TasksTrackingProps {
  onTaskClick?: (taskId: Id<'tasks'>) => void;
}

export function TasksTracking({ onTaskClick }: TasksTrackingProps) {
  const { user } = useUser();

  // 获取教师的所有课程
  const classes = useQuery(
    api.classes.getTeacherClasses,
    user?.id ? { teacherId: user.id } : 'skip'
  );

  // 获取所有任务（简化版，实际需要根据classId查询）
  // 这里假设有一个API可以获取教师的所有任务
  const allTasks = useQuery(
    api.tasks.getTeacherTasks,
    user?.id ? { teacherId: user.id } : 'skip'
  );

  if (!classes || !allTasks) {
    return (
      <div className="glass-student-loading">
        <div className="glass-student-loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (allTasks.length === 0) {
    return (
      <div className="glass-student-empty-state">
        <div className="glass-student-empty-icon">
          <CheckCircle2 size={72} strokeWidth={1.5} />
        </div>
        <h3 className="glass-student-empty-title">No tasks yet</h3>
        <p className="glass-student-empty-subtitle">
          Create tasks for your classes to start tracking student progress
        </p>
      </div>
    );
  }

  // 计算任务完成情况
  const getTaskCompletion = (task: Task) => {
    const classInfo = classes?.find((c) => c._id === task.classId);
    const totalStudents = classInfo?.students.length || 0;
    const completedCount = task.submissions?.length || 0;
    const percentage = totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0;

    return {
      completed: completedCount,
      total: totalStudents,
      percentage: Math.round(percentage),
    };
  };

  // 判断任务是否即将到期（3天内）
  const isTaskUrgent = (dueDate: number | undefined) => {
    if (!dueDate) return false;
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    return dueDate - Date.now() < threeDaysInMs && dueDate > Date.now();
  };

  // 判断任务是否已过期
  const isTaskOverdue = (dueDate: number | undefined) => {
    if (!dueDate) return false;
    return dueDate < Date.now();
  };

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {allTasks.map((task) => {
        const completion = getTaskCompletion(task);
        const classInfo = classes?.find((c) => c._id === task.classId);
        const isUrgent = isTaskUrgent(task.dueDate);
        const isOverdue = isTaskOverdue(task.dueDate);

        return (
          <div
            key={task._id}
            className={`
              p-4 rounded-xl border transition-all
              ${isOverdue
              ? 'bg-red-50 border-red-200'
              : isUrgent
                ? 'bg-amber-50 border-amber-200'
                : 'bg-white border-gray-200'
            }
              hover:shadow-md cursor-pointer
            `}
            onClick={() => onTaskClick?.(task._id as Id<'tasks'>)}
            style={{ cursor: onTaskClick ? 'pointer' : 'default' }}
          >
            {/* 任务标题和状态 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {task.title}
                </h4>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="font-medium">{classInfo?.name || 'Unknown Class'}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{classInfo?.code}</span>
                </p>
              </div>

              {/* 状态图标 */}
              <div>
                {isOverdue ? (
                  <AlertCircle className="text-red-500" size={20} />
                ) : isUrgent ? (
                  <Clock className="text-amber-500" size={20} />
                ) : (
                  <CheckCircle2 className="text-green-500" size={20} />
                )}
              </div>
            </div>

            {/* 完成进度 */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 flex items-center gap-1">
                  <Users size={14} />
                  Completion
                </span>
                <span className="font-semibold text-gray-900">
                  {completion.completed}/{completion.total} ({completion.percentage}%)
                </span>
              </div>

              {/* 进度条 */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    completion.percentage === 100
                      ? 'bg-green-500'
                      : completion.percentage >= 50
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                  }`}
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
            </div>

            {/* 截止日期 */}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-sm">
                <Clock size={14} className={
                  isOverdue
                    ? 'text-red-500'
                    : isUrgent
                      ? 'text-amber-500'
                      : 'text-gray-500'
                } />
                <span className={
                  isOverdue
                    ? 'text-red-600 font-medium'
                    : isUrgent
                      ? 'text-amber-600 font-medium'
                      : 'text-gray-600'
                }>
                  {isOverdue ? 'Overdue' : 'Due'} {formatDistanceToNow(task.dueDate, { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { FileText, Calendar, ChevronRight } from 'lucide-react';

interface StudentTaskListProps {
  classroomId: Id<'classrooms'>;
  classCode: string;
}

export function StudentTaskList({
                                  classroomId,
                                  classCode,
                                }: StudentTaskListProps) {
  const router = useRouter();
  const tasks = useQuery(api.tasks.getClassTasks, { classroomId });

  console.log('StudentTaskList - Props:', { classroomId, classCode });
  console.log('StudentTaskList - Tasks:', tasks);

  if (!tasks) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Class Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse">
              <div className="h-64 bg-gray-100 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Class Tasks</h2>
        <span className="text-sm text-gray-500">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tasks available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tasks.map((task) => {
            const taskPath = `/dashboard/student/classroom/${classCode}/task/${task._id}`;
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

            return (
              <div
                key={task._id}
                onClick={() => {
                  console.log('Navigating to:', taskPath);
                  router.push(taskPath);
                }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
                style={{
                  transform: 'translateY(0)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* 顶部色条 */}
                <div className={`h-2 ${isOverdue ? 'bg-red-500' : 'bg-blue-500'}`} />

                <div className="p-6">
                  {/* 图标和状态 */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText size={28} className="text-blue-600" strokeWidth={2} />
                    </div>

                    {isOverdue && (
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                        Overdue
                      </div>
                    )}
                  </div>

                  {/* 标题 */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {task.title}
                  </h3>

                  {/* 描述 */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {task.description}
                  </p>

                  {/* 截止日期 */}
                  {task.dueDate && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-700 font-medium">
                        Due: {formatDate(task.dueDate)}
                      </span>
                    </div>
                  )}

                  {/* 查看详情按钮 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm font-semibold text-blue-600">
                      View Details
                    </span>
                    <ChevronRight size={20} className="text-blue-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { BookOpen, Calendar, Hash, ChevronRight } from 'lucide-react';

// 渐变色方案 - 每个课程卡片使用不同的渐变
const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 紫色
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // 粉红
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // 蓝色
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // 绿色
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // 橙黄
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // 青紫
];

export function StudentClassList() {
  const { user } = useUser();
  const router = useRouter();

  const classes = useQuery(
    api.classes.getStudentClasses,
    user?.id ? { studentId: user.id } : 'skip'
  );

  if (!user?.id) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-gray-500">Please sign in to view your classes.</p>
        </CardContent>
      </Card>
    );
  }

  if (!classes) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="animate-pulse">
            <div className="h-64 bg-gray-100 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    console.log('StudentClassList - No classes found');
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-gray-500">
            You haven&apos;t joined any classes yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {classes.map((classroom, index) => (
        <div
          key={classroom._id}
          onClick={() =>
            router.push(`/dashboard/student/classroom/${classroom.code}`)
          }
          style={{
            position: 'relative',
            cursor: 'pointer',
            borderRadius: '20px',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
            height: 'fit-content',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
          }}
        >
          {/* 渐变背景层 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: gradients[index % gradients.length],
              opacity: 0.9,
            }}
          />

          {/* 玻璃态效果层 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          />

          {/* 装饰圆形 - 右上角 */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '120px',
              height: '120px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              filter: 'blur(40px)',
            }}
          />

          {/* 内容 */}
          <Card
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            <CardHeader style={{ paddingBottom: '0.75rem' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center'
              }}>
                {/* 课程图标 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '64px',
                    height: '64px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <BookOpen size={32} color="white" strokeWidth={2} />
                </div>

                {/* 课程标题 */}
                <CardTitle
                  style={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    lineHeight: '1.4',
                  }}
                >
                  {classroom.name || `Class ${classroom.code}`}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent style={{ paddingTop: '0.75rem' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                {/* 课程代码 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  justifyContent: 'center'
                }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                    }}
                  >
                    <Hash size={14} color="white" />
                  </div>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontWeight: '600',
                      fontFamily: 'monospace',
                    }}
                  >
                    {classroom.code}
                  </p>
                </div>

                {/* 加入日期 */}
                {classroom.students?.map(
                  (student) =>
                    student.studentId === user?.id && (
                      <div
                        key={student.studentId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          justifyContent: 'center'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                          }}
                        >
                          <Calendar size={14} color="white" />
                        </div>
                        <p
                          style={{
                            fontSize: '0.8rem',
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: '500',
                          }}
                        >
                          {formatDate(student.joinedAt)}
                        </p>
                      </div>
                    )
                )}
              </div>

              {/* 查看详情按钮 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'white',
                    fontWeight: '600',
                  }}
                >
                  View Details
                </span>
                <ChevronRight size={16} color="white" />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
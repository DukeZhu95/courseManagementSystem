// components/teacher/StudentCard.tsx
'use client';

import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../convex/_generated/api';
import { BookOpen, Mail, Trophy } from 'lucide-react';
import { useState } from 'react';
import { AwardAchievementDialog } from './AwardAchievementDialog';

interface ClassItem {
  _id: string;
  _creationTime: number;
  name?: string;
  description?: string;
  teacherName?: string;
  code: string;
  teacherId: string;
  createdAt: number;
  students: Array<{
    studentId: string;
    joinedAt: number;
    status: string;
  }>;
}

interface StudentCardProps {
  studentId: string;
  joinedAt: number;
  classes: ClassItem[];
  index: number;
}

export function StudentCard({ studentId, joinedAt, classes, index }: StudentCardProps) {
  const router = useRouter();
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);

  // 获取学生 profile
  const profile = useQuery(api.students.getStudentProfile, { studentId });

  // 获取学生成就数量
  const achievementCount = useQuery(api.achievements.getStudentAchievementCount, { studentId });

  // 生成显示名称
  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`
    : `Student ${studentId.slice(0, 8)}`;

  // 获取头像首字母
  const avatarLetter = profile?.firstName
    ? profile.firstName.charAt(0).toUpperCase()
    : studentId.charAt(0).toUpperCase();

  // 获取学生邮箱
  const studentEmail = profile?.email || `${studentId.slice(0, 12)}@student.edu`;

  // 安全获取头像
  const avatarUrl = (profile as any)?.avatar;

  return (
    <>
      <div
        className="student-card"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* 学生头像 - 居中 */}
        <div className="student-avatar-wrapper" style={{ textAlign: 'center' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="student-avatar-image"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                margin: '0 auto',
              }}
            />
          ) : (
            <div className="student-avatar" style={{ margin: '0 auto' }}>
              {avatarLetter}
            </div>
          )}
        </div>

        {/* 学生信息 - 居中 */}
        <div className="student-info" style={{ textAlign: 'center' }}>
          <h3 className="student-name">
            {displayName}
          </h3>

          {/* 邮箱地址 - 居中显示 */}
          <p className="student-email" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#6b7280',
            marginTop: '8px',
          }}>
            <Mail size={14} />
            <span>{studentEmail}</span>
          </p>
        </div>

        {/* 成就徽章 */}
        {achievementCount !== undefined && achievementCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 12px',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderRadius: '8px',
            margin: '12px 0',
          }}>
            <Trophy size={16} style={{ color: '#F59E0B' }} />
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#92400E',
            }}>
              {achievementCount} Achievement{achievementCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* 课程列表 */}
        <div className="student-classes">
          <div className="student-classes-header">
            <BookOpen size={16} />
            <span>Enrolled Classes ({classes.length})</span>
          </div>
          <div className="student-classes-list">
            {classes.map((classItem: ClassItem) => (
              <div
                key={classItem._id}
                className="student-class-badge"
                onClick={() => router.push(`/dashboard/teacher/class/${classItem._id}`)}
              >
                <BookOpen size={12} />
                <span>{classItem.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 加入日期 */}
        <div className="student-joined">
          Joined: {new Date(joinedAt).toLocaleDateString()}
        </div>

        {/* Award Achievement 按钮 */}
        <button
          onClick={() => setIsAwardDialogOpen(true)}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(139, 92, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Trophy size={18} />
          Award Achievement
        </button>
      </div>

      {/* Award Achievement Dialog */}
      <AwardAchievementDialog
        isOpen={isAwardDialogOpen}
        onClose={() => setIsAwardDialogOpen(false)}
        studentId={studentId}
        studentName={displayName}
      />
    </>
  );
}
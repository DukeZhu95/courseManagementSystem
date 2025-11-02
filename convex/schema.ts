import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // 添加用户表
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    role: v.union(v.literal('teacher'), v.literal('student')),
    name: v.string(),
    createdAt: v.number(),
  }).index('by_userId', ['userId']),

  // 已有的 classrooms 表
  classrooms: defineTable({
    code: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    teacherId: v.string(),
    teacherName: v.optional(v.string()),
    createdAt: v.number(),
    students: v.array(
      v.object({
        studentId: v.string(),
        joinedAt: v.number(),
        status: v.string(),
      })
    ),
  })
    .index('by_code', ['code'])
    .searchIndex('by_student', {
      searchField: 'students',
      filterFields: ['students'],
    }),

  // tasks 表
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    classroomId: v.id('classrooms'),
    teacherId: v.string(),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    status: v.string(),
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
          size: v.number(),
        })
      )
    ),
    // 旧字段（单个文件）- 保留兼容
    storageId: v.optional(v.id('_storage')),
    attachmentName: v.optional(v.string()),
    attachmentUrl: v.optional(v.string()),
    // 新字段（多文件）- 数组
    storageIds: v.optional(v.array(v.id('_storage'))),
    attachmentNames: v.optional(v.array(v.string())),
    attachmentUrls: v.optional(v.array(v.string())),
  })
    .index('by_classroom', ['classroomId'])
    .index('by_teacher', ['teacherId']),

  // ✅ taskSubmissions 表 - 支持多文件
  taskSubmissions: defineTable({
    taskId: v.id('tasks'),
    studentId: v.string(),
    content: v.string(),
    submittedAt: v.number(),
    status: v.string(), // "submitted" | "graded"
    grade: v.optional(v.number()),
    feedback: v.optional(v.string()),
    gradedAt: v.optional(v.number()),
    gradedBy: v.optional(v.string()),
    // ✅ 支持多文件（数组）
    attachmentUrls: v.optional(v.array(v.string())),
    attachmentNames: v.optional(v.array(v.string())),
    storageIds: v.optional(v.array(v.id('_storage'))),
    // 保留旧的单文件字段（向后兼容）
    attachmentUrl: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
  })
    .index('by_task_student', ['taskId', 'studentId'])
    .index('by_task', ['taskId'])
    .index('by_student', ['studentId']),

  // 教师表
  teachers: defineTable({
    teacherId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    bio: v.string(),
    city: v.string(),
    country: v.string(),
    specialization: v.string(),
    teachingPhilosophy: v.string(),
    avatar: v.optional(v.string()),
  }).index("by_teacherId", ["teacherId"]),

  // 学生个人资料表
  studentProfiles: defineTable({
    studentId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    major: v.optional(v.string()),
    goal: v.optional(v.string()),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_student_id', ['studentId']),

  // 教师课程表（教师个人的课程安排 - 现有的）
  teacherSchedules: defineTable({
    teacherId: v.string(),
    courseName: v.string(),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    color: v.string(),
    createdAt: v.number(),
  })
    .index('by_teacher', ['teacherId'])
    .index('by_teacher_and_day', ['teacherId', 'dayOfWeek']),

  // ✅ 新增：班级课程安排表（用于学生课程表）
  classroomSchedules: defineTable({
    classroomId: v.id('classrooms'),     // 关联到具体班级
    daysOfWeek: v.array(v.number()),     // [1, 3, 5] = 周一、三、五
    startTime: v.string(),                // "09:00"
    endTime: v.string(),                  // "10:30"
    location: v.optional(v.string()),     // "Room 101" 或 "Lab A"
    createdAt: v.number(),
  }).index('by_classroom', ['classroomId']),

  // 成就模板表
  achievementTemplates: defineTable({
    teacherId: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    category: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_teacher', ['teacherId']),

  // 学生成就表
  studentAchievements: defineTable({
    studentId: v.string(),
    achievementTemplateId: v.id('achievementTemplates'),
    awardedBy: v.string(),
    awardedAt: v.number(),
    customMessage: v.optional(v.string()),
    classroomId: v.optional(v.id('classrooms')),
  })
    .index('by_student', ['studentId'])  // ← 必需！
    .index('by_student_and_achievement', ['studentId', 'achievementTemplateId']),
});
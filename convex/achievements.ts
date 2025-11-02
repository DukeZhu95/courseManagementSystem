// convex/achievements.ts
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// 预设成就数据
const PRESET_ACHIEVEMENTS = [
  {
    name: 'Star Student',
    description: 'Outstanding performance in class',
    icon: 'star',
    color: '#FCD34D',
    category: 'academic',
  },
  {
    name: 'Top Performer',
    description: 'Achieved highest score',
    icon: 'trophy',
    color: '#8B5CF6',
    category: 'academic',
  },
  {
    name: 'Perfect Score',
    description: 'Got 100% on assignment',
    icon: 'medal',
    color: '#10B981',
    category: 'academic',
  },
  {
    name: 'Quick Learner',
    description: 'Completed work ahead of time',
    icon: 'zap',
    color: '#F59E0B',
    category: 'participation',
  },
  {
    name: 'Helpful Spirit',
    description: 'Always willing to help classmates',
    icon: 'heart',
    color: '#EC4899',
    category: 'behavior',
  },
  {
    name: 'Bookworm',
    description: 'Completed all readings',
    icon: 'book',
    color: '#06B6D4',
    category: 'participation',
  },
];

/**
 * 初始化预设成就模板（首次使用时自动调用）
 */
export const ensurePresetAchievements = mutation({
  args: {
    teacherId: v.string(),
  },
  handler: async (ctx, args) => {
    // 检查是否已经初始化过
    const existing = await ctx.db
      .query('achievementTemplates')
      .withIndex('by_teacher', (q) => q.eq('teacherId', args.teacherId))
      .filter((q) => q.eq(q.field('category'), 'academic'))
      .first();

    // 如果已经有成就，说明已初始化
    if (existing) {
      return { initialized: true, created: 0 };
    }

    // 创建所有预设成就
    let created = 0;
    for (const preset of PRESET_ACHIEVEMENTS) {
      await ctx.db.insert('achievementTemplates', {
        teacherId: args.teacherId,
        name: preset.name,
        description: preset.description,
        icon: preset.icon,
        color: preset.color,
        category: preset.category,
        createdAt: Date.now(),
      });
      created++;
    }

    return { initialized: true, created };
  },
});

/**
 * 创建成就模板（教师）
 */
export const createAchievementTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    return await ctx.db.insert('achievementTemplates', {
      teacherId: identity.subject,
      name: args.name,
      description: args.description,
      icon: args.icon,
      color: args.color,
      category: args.category,
      createdAt: Date.now(),
    });
  },
});

/**
 * 获取教师创建的所有成就模板
 */
export const getTeacherAchievementTemplates = query({
  args: {
    teacherId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('achievementTemplates')
      .withIndex('by_teacher', (q) => q.eq('teacherId', args.teacherId))
      .collect();
  },
});

/**
 * 获取所有成就模板（包括预设和教师创建的）
 */
export const getAllAchievementTemplates = query({
  args: {
    teacherId: v.string(),
  },
  handler: async (ctx, args) => {
    // 获取教师的所有成就模板
    const achievements = await ctx.db
      .query('achievementTemplates')
      .withIndex('by_teacher', (q) => q.eq('teacherId', args.teacherId))
      .collect();

    return achievements;
  },
});

/**
 * 授予学生成就
 */
export const awardAchievement = mutation({
  args: {
    studentId: v.string(),
    achievementTemplateId: v.id('achievementTemplates'),
    customMessage: v.optional(v.string()),
    classroomId: v.optional(v.id('classrooms')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // 检查成就模板是否存在
    const template = await ctx.db.get(args.achievementTemplateId);
    if (!template) {
      throw new Error('Achievement template not found');
    }

    // 检查是否已经授予过
    const existingAward = await ctx.db
      .query('studentAchievements')
      .withIndex('by_student_and_achievement', (q) =>
        q.eq('studentId', args.studentId).eq('achievementTemplateId', args.achievementTemplateId)
      )
      .first();

    if (existingAward) {
      throw new Error('This achievement has already been awarded to this student');
    }

    return await ctx.db.insert('studentAchievements', {
      studentId: args.studentId,
      achievementTemplateId: args.achievementTemplateId,
      awardedBy: identity.subject,
      awardedAt: Date.now(),
      customMessage: args.customMessage,
      classroomId: args.classroomId,
    });
  },
});

/**
 * 获取学生的所有成就
 */
export const getStudentAchievements = query({
  args: {
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query('studentAchievements')
      .withIndex('by_student', (q) => q.eq('studentId', args.studentId))
      .collect();

    // 获取成就模板详情
    const achievementsWithDetails = await Promise.all(
      achievements.map(async (achievement) => {
        const template = await ctx.db.get(achievement.achievementTemplateId);
        return {
          ...achievement,
          template,
        };
      })
    );

    return achievementsWithDetails;
  },
});

/**
 * 撤销成就（可选功能）
 */
export const revokeAchievement = mutation({
  args: {
    achievementId: v.id('studentAchievements'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const achievement = await ctx.db.get(args.achievementId);
    if (!achievement) throw new Error('Achievement not found');

    // 验证是授予者才能撤销
    if (achievement.awardedBy !== identity.subject) {
      throw new Error('Only the teacher who awarded this achievement can revoke it');
    }

    await ctx.db.delete(args.achievementId);
  },
});

/**
 * 获取学生在特定班级获得的成就数量
 */
export const getStudentAchievementCount = query({
  args: {
    studentId: v.string(),
  },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query('studentAchievements')
      .withIndex('by_student', (q) => q.eq('studentId', args.studentId))
      .collect();

    return achievements.length;
  },
});
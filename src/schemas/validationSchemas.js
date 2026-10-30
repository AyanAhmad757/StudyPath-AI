import { z } from 'zod';

/**
 * 1. Syllabus & Curriculum Hierarchy Schema
 */
export const TopicSchema = z.object({
  topicNumber: z.string().optional().default('1.1'),
  title: z.string().min(1, 'Topic title cannot be empty'),
  description: z.string().optional().default(''),
  subtopics: z.array(z.string()).optional().default([]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  prerequisites: z.array(z.string()).optional().default([]),
  estimatedMinutes: z.number().int().positive().default(45),
  learningObjectives: z.array(z.string()).optional().default([]),
  recommendedOrder: z.number().int().positive().default(1),
});

export const UnitSchema = z.object({
  unitNumber: z.number().int().positive().default(1),
  title: z.string().min(1, 'Unit title cannot be empty'),
  description: z.string().optional().default(''),
  topics: z.array(TopicSchema).min(1, 'Each unit must contain at least one topic'),
});

export const SyllabusAnalysisSchema = z.object({
  subject: z.object({
    name: z.string().default('Curriculum Subject'),
    code: z.string().optional().default('CS101'),
    description: z.string().optional().default(''),
  }),
  units: z.array(UnitSchema).min(1, 'Syllabus must contain at least one unit'),
  analysisMetadata: z.object({
    confidence: z.enum(['high', 'medium', 'low', 'uncertain']).default('high'),
    uncertainSections: z.array(z.string()).default([]),
    notes: z.array(z.string()).default([]),
  }).default({
    confidence: 'high',
    uncertainSections: [],
    notes: [],
  }),
});

/**
 * 2. Shared AI Teaching Engine: 16-Section Lesson Schema
 */
export const QuizItemSchema = z.object({
  id: z.string().default(() => `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`),
  question: z.string().min(1, 'Question text cannot be empty'),
  options: z.array(z.string()).min(2, 'Must provide at least 2 options'),
  correctAnswer: z.string().min(1, 'Correct answer must be specified'),
  explanation: z.string().default(''),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
});

export const LessonContentSchema = z.object({
  lessonTitle: z.string().min(1, 'Lesson title cannot be empty'),
  learningObjectives: z.array(z.string()).min(1, 'At least one learning objective is required'),
  prerequisites: z.array(z.string()).default([]),
  simpleIntroduction: z.string().min(1, 'Introduction is required'),
  detailedExplanation: z.array(
    z.object({
      stepNumber: z.number().int().positive(),
      title: z.string(),
      content: z.string(),
    })
  ).min(1, 'Explanation must include at least one structured step'),
  keyDefinitions: z.array(
    z.object({
      term: z.string(),
      definition: z.string(),
    })
  ).default([]),
  workedExamples: z.array(
    z.object({
      problem: z.string(),
      solution: z.string(),
      explanation: z.string().optional().default(''),
    })
  ).default([]),
  equationsAndFormulas: z.array(
    z.object({
      formula: z.string(),
      description: z.string(),
    })
  ).default([]),
  keyPoints: z.array(z.string()).min(1, 'Key points are required'),
  revisionNotes: z.string().min(1, 'Revision notes are required'),
  practiceQuestions: z.array(z.string()).default([]),
  quizQuestions: z.array(QuizItemSchema).min(1, 'At least one quiz question is required'),
  nextTopics: z.array(z.string()).default([]),
  uncertainties: z.array(z.string()).default([]),
  sourceCoverage: z.object({
    groundedInSource: z.boolean().default(false),
    coverageNotes: z.string().default('Grounded in verified curriculum and academic materials.'),
    additionalAiContext: z.string().default(''),
  }).default({
    groundedInSource: false,
    coverageNotes: 'Curriculum explanation generated from academic standards.',
    additionalAiContext: '',
  }),
});

/**
 * 3. AI Doubt Solver Request & Response Schema
 */
export const DoubtQuestionSchema = z.object({
  lessonId: z.string().optional(),
  topicTitle: z.string().min(1),
  question: z.string().min(2, 'Doubt question must be at least 2 characters'),
  relevantContext: z.string().optional().default(''),
  learningLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
});

export const DoubtAnswerSchema = z.object({
  answer: z.string().min(1),
  sourceGrounded: z.boolean().default(false),
  uncertaintyNotes: z.string().optional().default(''),
  suggestedFollowUps: z.array(z.string()).default([]),
});

/**
 * 4. Video Resource Schema
 */
export const VideoResourceSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1),
  channelTitle: z.string().min(1),
  thumbnailUrl: z.string().url().or(z.string().default('')),
  url: z.string().url(),
  relevanceExplanation: z.string().default(''),
});

/**
 * 5. Quiz Attempt Submission Schema
 */
export const QuizAttemptSubmissionSchema = z.object({
  lessonId: z.string(),
  answers: z.record(z.string(), z.string()), // questionId -> selectedOption
});

import { describe, it, expect } from 'vitest';
import {
  SyllabusAnalysisSchema,
  LessonContentSchema,
  QuizAttemptSubmissionSchema,
  VideoResourceSchema,
} from '../../src/schemas/validationSchemas';

describe('Validation Schemas (Zod)', () => {
  it('validates a compliant syllabus analysis hierarchy', () => {
    const validSyllabus = {
      subject: {
        name: 'Distributed Systems',
        code: 'CS701',
        description: 'Core concepts in distributed consensus and replication.',
      },
      units: [
        {
          unitNumber: 1,
          title: 'Consensus Protocols',
          description: 'Raft and Paxos mechanisms',
          topics: [
            {
              topicNumber: '1.1',
              title: 'Raft Leader Election',
              description: 'Heartbeats and election timeouts.',
              subtopics: ['Election timeout', 'Split votes'],
              difficulty: 'intermediate',
              prerequisites: ['Networking fundamentals'],
              estimatedMinutes: 45,
              learningObjectives: ['Understand leader election states'],
              recommendedOrder: 1,
            },
          ],
        },
      ],
      analysisMetadata: {
        confidence: 'high',
        uncertainSections: [],
        notes: [],
      },
    };

    const result = SyllabusAnalysisSchema.safeParse(validSyllabus);
    expect(result.success).toBe(true);
  });

  it('rejects a syllabus missing units or topics', () => {
    const invalidSyllabus = {
      subject: { name: 'Invalid Course' },
      units: [], // Must have at least 1 unit
    };

    const result = SyllabusAnalysisSchema.safeParse(invalidSyllabus);
    expect(result.success).toBe(false);
  });

  it('validates a 16-section structured lesson format', () => {
    const validLesson = {
      lessonTitle: 'B-Tree Indexing in Relational Databases',
      learningObjectives: ['Understand m-way search trees', 'Analyze split operations'],
      prerequisites: ['Binary Search Trees'],
      simpleIntroduction: 'B-Trees are self-balancing search trees optimized for block storage.',
      detailedExplanation: [
        {
          stepNumber: 1,
          title: 'Node Structure and Degree',
          content: 'Every node except root contains between t-1 and 2t-1 keys.',
        },
      ],
      keyDefinitions: [
        { term: 'Branching Factor', definition: 'The maximum number of children a node can reference.' },
      ],
      workedExamples: [
        {
          problem: 'Insert key 45 into a full leaf node with t=3.',
          solution: 'Median key 45 is promoted and the leaf splits into two leaves of size 2.',
          explanation: 'Standard proactive splitting on the descent path.',
        },
      ],
      equationsAndFormulas: [
        { formula: 'h <= log_t((n+1)/2)', description: 'Maximum height of a B-Tree containing n keys.' },
      ],
      keyPoints: ['Optimized for disk block I/O', 'Guaranteed logarithmic depth'],
      revisionNotes: 'Self-balancing, multi-way search tree where all leaves reside at the identical depth.',
      practiceQuestions: ['Why is B-Tree preferred over AVL tree for databases on SSDs?'],
      quizQuestions: [
        {
          id: 'q1',
          question: 'What is the maximum number of children for a B-Tree node of order m?',
          options: ['m', 'm - 1', '2m', 'm / 2'],
          correctAnswer: 'm',
          explanation: 'By definition, an m-way B-tree node has at most m children and m-1 keys.',
          difficulty: 'intermediate',
        },
      ],
      nextTopics: ['B+ Trees', 'LSM Trees'],
      uncertainties: [],
      sourceCoverage: {
        groundedInSource: true,
        coverageNotes: 'Grounded in database systems curriculum.',
        additionalAiContext: '',
      },
    };

    const result = LessonContentSchema.safeParse(validLesson);
    expect(result.success).toBe(true);
  });

  it('rejects lesson output with missing required explanation steps', () => {
    const invalidLesson = {
      lessonTitle: 'Incomplete Lesson',
      learningObjectives: ['Goal 1'],
      simpleIntroduction: 'Intro text',
      detailedExplanation: [], // Empty explanation
      keyPoints: ['Key point'],
      revisionNotes: 'Notes',
      quizQuestions: [],
    };

    const result = LessonContentSchema.safeParse(invalidLesson);
    expect(result.success).toBe(false);
  });

  it('validates video resource structure', () => {
    const validVideo = {
      videoId: '0BopgP-i5oU',
      title: 'Distributed Systems Lecture 1',
      channelTitle: 'MIT OpenCourseWare',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423',
      url: 'https://www.youtube.com/watch?v=0BopgP-i5oU',
      relevanceExplanation: 'Covers RPC and network failures.',
    };

    const result = VideoResourceSchema.safeParse(validVideo);
    expect(result.success).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { quizEngineService } from '../../src/services/api/quizEngineService';

describe('Deterministic Quiz Scoring Engine (Section 11)', () => {
  const sampleQuestions = [
    {
      id: 'q1',
      question: 'What is the time complexity of searching in a balanced AVL tree?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswer: 'O(log n)',
      explanation: 'AVL trees maintain strict balance factor <= 1, guaranteeing logarithmic height.',
      difficulty: 'intermediate',
    },
    {
      id: 'q2',
      question: 'Which HTTP method is idempotent according to RFC 9110?',
      options: ['POST', 'PUT', 'CONNECT', 'PATCH'],
      correctAnswer: 'PUT',
      explanation: 'PUT replaces target resource state; repeated identical requests produce identical state.',
      difficulty: 'intermediate',
    },
    {
      id: 'q3',
      question: 'In TCP, what mechanism prevents packet flooding on the receiver network?',
      options: ['Flow Control', 'Congestion Control', 'Checksum', 'Three-way handshake'],
      correctAnswer: 'Congestion Control',
      explanation: 'Congestion control limits data injection based on perceived network transit bottlenecks.',
      difficulty: 'intermediate',
    },
    {
      id: 'q4',
      question: 'What is the primary purpose of a database write-ahead log (WAL)?',
      options: ['Fast index lookup', 'Atomicity and durability recovery', 'Data encryption', 'Query caching'],
      correctAnswer: 'Atomicity and durability recovery',
      explanation: 'WAL ensures changes are recorded to disk before dirty buffers are flushed.',
      difficulty: 'advanced',
    },
    {
      id: 'q5',
      question: 'Which normal form eliminates transitive dependencies?',
      options: ['1NF', '2NF', '3NF', 'BCNF'],
      correctAnswer: '3NF',
      explanation: 'Third Normal Form requires relations to be in 2NF and have no transitive functional dependencies.',
      difficulty: 'intermediate',
    },
  ];

  it('calculates 100% score for all correct answers without relying on AI', async () => {
    const answers = {
      q1: 'O(log n)',
      q2: 'PUT',
      q3: 'Congestion Control',
      q4: 'Atomicity and durability recovery',
      q5: '3NF',
    };

    const result = await quizEngineService.submitQuizAttempt({
      lessonId: 'test-lesson-1',
      answers,
      quizQuestions: sampleQuestions,
    });

    expect(result.score).toBe(5);
    expect(result.totalQuestions).toBe(5);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.needsRevision).toBe(false);
    expect(result.evaluation.every((e) => e.isCorrect)).toBe(true);
  });

  it('correctly calculates partial score and flags needsRevision when below 60%', async () => {
    const answers = {
      q1: 'O(log n)', // Correct
      q2: 'POST', // Incorrect
      q3: 'Checksum', // Incorrect
      q4: 'Data encryption', // Incorrect
      q5: '1NF', // Incorrect
    };

    const result = await quizEngineService.submitQuizAttempt({
      lessonId: 'test-lesson-2',
      answers,
      quizQuestions: sampleQuestions,
    });

    expect(result.score).toBe(1);
    expect(result.totalQuestions).toBe(5);
    expect(result.percentage).toBe(20);
    expect(result.passed).toBe(false);
    expect(result.needsRevision).toBe(true);
    expect(result.evaluation[0].isCorrect).toBe(true);
    expect(result.evaluation[1].isCorrect).toBe(false);
  });

  it('handles case-insensitivity and extra whitespace in answers', async () => {
    const answers = {
      q1: '  o(log n)  ',
      q2: 'put',
      q3: '  congestion control',
      q4: 'atomicity and durability recovery  ',
      q5: '3nf',
    };

    const result = await quizEngineService.submitQuizAttempt({
      lessonId: 'test-lesson-3',
      answers,
      quizQuestions: sampleQuestions,
    });

    expect(result.score).toBe(5);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('throws an error if no quiz questions are provided for evaluation', async () => {
    await expect(
      quizEngineService.submitQuizAttempt({
        lessonId: 'test-lesson-4',
        answers: { q1: 'test' },
        quizQuestions: [],
      })
    ).rejects.toThrow('No quiz questions provided for evaluation.');
  });
});

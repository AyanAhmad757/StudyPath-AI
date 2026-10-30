import { describe, it, expect } from 'vitest';
import { aiTeachingEngine } from '../../src/services/api/aiTeachingEngine';
import { LessonContentSchema } from '../../src/schemas/validationSchemas';

describe('AI Teaching Engine - Standalone Lesson Generation', () => {
  it('exposes generateStandaloneLesson as a callable function', () => {
    expect(typeof aiTeachingEngine.generateStandaloneLesson).toBe('function');
  });

  it('generates a valid 16-section lesson when searching any topic', async () => {
    const topic = 'Graph Neural Networks';
    const result = await aiTeachingEngine.generateStandaloneLesson({
      topicName: topic,
      learningLevel: 'advanced',
    });

    expect(result).toBeDefined();
    expect(result.title).toBe(topic);
    expect(result.learningLevel).toBe('advanced');
    expect(result.content).toBeDefined();

    // Validate that the returned content conforms strictly to the schema
    const validation = LessonContentSchema.safeParse(result.content);
    expect(validation.success).toBe(true);
    expect(result.content.detailedExplanation.length).toBeGreaterThanOrEqual(1);
    expect(result.content.quizQuestions.length).toBeGreaterThanOrEqual(1);
    expect(result.content.keyPoints.length).toBeGreaterThanOrEqual(1);
  });

  it('rejects an empty topic name gracefully', async () => {
    await expect(
      aiTeachingEngine.generateStandaloneLesson({
        topicName: '   ',
      })
    ).rejects.toThrow('A topic title is required to generate a lesson.');
  });
});

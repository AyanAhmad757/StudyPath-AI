import { describe, it, expect } from 'vitest';
import { videoDiscoveryService } from '../../src/services/api/videoDiscoveryService';

describe('Video Discovery Service (Section 10)', () => {
  it('returns empty video array and handles empty topic title safely', async () => {
    const result = await videoDiscoveryService.searchVideos({ topicTitle: '' });
    expect(result.videos).toEqual([]);
    expect(result.isConfigured).toBe(true);
  });

  it('never fabricates fake video IDs, titles, or URLs when backend is unconfigured', async () => {
    const result = await videoDiscoveryService.searchVideos({
      topicTitle: 'Advanced Quantum Computing',
    });

    // When API is unconfigured, it must report clear error/unconfigured state rather than fake video cards
    expect(result.videos).toEqual([]);
    if (!result.isConfigured) {
      expect(result.error).toBeTruthy();
    }
  });
});

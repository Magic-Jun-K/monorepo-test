import { Test, TestingModule } from '@nestjs/testing';
import { Redis } from 'ioredis';

import { PerformanceService } from '../src/modules/performance/performance.service';

const mockRedis = {
  del: jest.fn().mockResolvedValue(2),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  hgetall: jest.fn().mockResolvedValue({}),
  hset: jest.fn().mockResolvedValue(0),
  hdel: jest.fn().mockResolvedValue(0),
  expire: jest.fn().mockResolvedValue(1),
  flushdb: jest.fn().mockResolvedValue('OK'),
} as unknown as jest.Mocked<Redis>;

describe('PerformanceService', () => {
  let service: PerformanceService;
  let redisClient: jest.Mocked<Redis>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerformanceService, { provide: 'Redis', useValue: mockRedis }],
    }).compile();

    service = module.get<PerformanceService>(PerformanceService);
    redisClient = module.get('Redis');
  });

  it('应清除相关缓存', async () => {
    const testData = [
      { 
        projectId: 'p1',
        env: 'test',
        url: 'http://example.com',
        browser: 'chrome',
        fcp: 100,
        lcp: 200,
        cls: 0.1,
        inp: 10,
        timestamp: Date.now()
      },
      {
        projectId: 'p2',
        env: 'test',
        url: 'http://example.com',
        browser: 'chrome',
        fcp: 120,
        lcp: 220,
        cls: 0.2,
        inp: 15,
        timestamp: Date.now()
      }
    ];
    await service.processBatch(testData);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(redisClient.del).toHaveBeenCalledWith(['stats:p1:*', 'stats:p2:*']);
  });
});

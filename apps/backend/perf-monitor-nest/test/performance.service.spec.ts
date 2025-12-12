import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceService } from '../src/modules/performance/performance.service';
import { Redis } from 'ioredis';

const mockRedis = {
  del: jest.fn(() => Promise.resolve(2)),
  get: jest.fn(() => Promise.resolve(null)),
  set: jest.fn(() => Promise.resolve('OK')),
  hgetall: jest.fn(() => Promise.resolve({})),
  hset: jest.fn(() => Promise.resolve(0)),
  hdel: jest.fn(() => Promise.resolve(0)),
  expire: jest.fn(() => Promise.resolve(1)),
  flushdb: jest.fn(() => Promise.resolve('OK')),
};

describe('PerformanceService', () => {
  let service: PerformanceService;
  let redisClient: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerformanceService, { provide: 'Redis', useValue: mockRedis }],
    }).compile();

    service = module.get<PerformanceService>(PerformanceService);
    redisClient = module.get<Redis>('Redis');
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
        fid: 10,
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
        fid: 15,
        timestamp: Date.now()
      }
    ];
    await service.processBatch(testData);
    expect(redisClient.del).toHaveBeenCalledWith(['stats:p1:*', 'stats:p2:*']);
  });
});

/** @type {import('jest').Config} */
const baseConfig = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/build/'],
  clearMocks: true,
  verbose: true,
  testTimeout: 30000,
  maxWorkers: '50%',
  maxConcurrency: 4,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageReporters: ['text', 'html', 'lcov', 'json'],
};

function getBaseJestConfig(overrides = {}) {
  return {
    ...baseConfig,
    ...overrides,
    coverageDirectory: overrides.coverageDirectory || '../coverage',
  };
}

export { baseConfig, getBaseJestConfig };

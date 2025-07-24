export default {
    displayName: 'be-movie-rating-service',
    preset: '../../jest.preset.js',
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': [
            'ts-jest',
            { tsconfig: '<rootDir>/tsconfig.spec.json' },
        ],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/apps/be-movie-rating-service',
    testMatch: [
        '<rootDir>/src/**/*.spec.ts',
    ],
    // Exclude integration tests from unit test runs
    testPathIgnorePatterns: [
        '/node_modules/',
        '\\.integration\\.spec\\.ts$',
        '\\.int\\.spec\\.ts$',
    ],
    collectCoverageFrom: [
        'src/application/**/*.ts',
        'src/domain/**/*.ts',
        'src/infrastructure/**/*.ts',
        '!src/infrastructure/schemas/**/*.ts',
        '!src/test/**/*.ts',
    ],
};

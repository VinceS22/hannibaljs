module.exports = {
	'preset': 'ts-jest',
	'roots': [
		'<rootDir>/src',
	],
	'collectCoverage': false,
	setupFiles: ['./setupJest.js'],
	testEnvironment: 'node',
	timers: 'fake',
	'testMatch': [
		'**/__tests__/**/*.+(ts|tsx|js)',
		'**/?(*.)+(spec|test).+(ts|tsx|js)',
	],
	'transform': {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
};
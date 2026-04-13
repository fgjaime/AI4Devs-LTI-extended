module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': '<rootDir>/node_modules/react-scripts/config/jest/babelTransform.js',
    '^.+\\.css$': '<rootDir>/node_modules/react-scripts/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': '<rootDir>/node_modules/react-scripts/config/jest/fileTransform.js'
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node']
};

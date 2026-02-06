import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./"
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  testMatch: ["<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}"]
};

export default createJestConfig(customJestConfig);

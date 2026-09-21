"use strict";

const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.test.json");

module.exports = {
  preset: "jest-preset-angular",
  roots: ["<rootDir>/src/"],
  testMatch: ["**/+(*.)+(spec|test).+(ts)"],
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/app/**/*.ts",
    "!src/app/**/*.module.ts",
    "!src/app/**/*.spec.ts",
    "!src/app/**/*.test.ts",
    "!src/app/testing/**/*.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, {
      prefix: "<rootDir>/",
    }),
    "^src/(.*)$": "<rootDir>/src/$1",
  },
};

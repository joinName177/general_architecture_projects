module.exports = {
  forbidden: [
    {
      name: "no-circular-dependencies",
      severity: "error",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "presentation-must-not-call-fetch",
      severity: "error",
      from: {
        path: "^src/modules/.+/presentation/",
      },
      to: {
        path: "^src/shared/api/",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsConfig: {
      fileName: "tsconfig.app.json",
    },
  },
};

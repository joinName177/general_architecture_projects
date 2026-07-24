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
      name: "presentation-must-not-depend-on-infrastructure",
      severity: "error",
      from: {
        path: "^src/modules/.+/presentation/",
      },
      to: {
        path: [
          "^src/generated/",
          "^src/modules/.+/infrastructure/",
          "^src/shared/http/",
        ],
      },
    },
    {
      name: "application-must-remain-transport-independent",
      severity: "error",
      from: {
        path: "^src/modules/.+/application/",
      },
      to: {
        path: [
          "^src/app/",
          "^src/generated/",
          "^src/modules/.+/(?:infrastructure|presentation)/",
          "^src/shared/http/",
        ],
      },
    },
    {
      name: "infrastructure-must-not-depend-on-presentation-or-app",
      severity: "error",
      from: {
        path: "^src/modules/.+/infrastructure/",
      },
      to: {
        path: ["^src/app/", "^src/modules/.+/presentation/"],
      },
    },
    {
      name: "shared-must-not-depend-on-app-or-modules",
      severity: "error",
      from: {
        path: "^src/shared/",
      },
      to: {
        path: ["^src/app/", "^src/modules/"],
      },
    },
    {
      name: "feature-modules-must-not-depend-on-app",
      severity: "error",
      from: {
        path: "^src/modules/",
      },
      to: {
        path: "^src/app/",
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

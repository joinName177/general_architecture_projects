import i18n from "i18next";
import { initReactI18next } from "react-i18next";

void i18n.use(initReactI18next).init({
  fallbackLng: "zh-CN",
  interpolation: {
    escapeValue: false,
  },
  lng: "zh-CN",
  resources: {
    "zh-CN": {
      translation: {
        architecture: {
          description:
            "业务模块将在具备真实边界、契约与 owner 后注册到静态模块目录。",
          eyebrow: "Dify Agent",
          title: "中型前端架构基座已初始化",
        },
      },
    },
  },
});

export { i18n };

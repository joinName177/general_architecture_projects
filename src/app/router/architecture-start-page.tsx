import { useTranslation } from "react-i18next";

export function ArchitectureStartPage() {
  const { t } = useTranslation();

  return (
    <main className="architecture-start-page">
      <section
        aria-labelledby="architecture-start-title"
        className="architecture-start-page__content"
      >
        <p className="architecture-start-page__eyebrow">
          {t("architecture.eyebrow")}
        </p>
        <h1 id="architecture-start-title">{t("architecture.title")}</h1>
        <p>{t("architecture.description")}</p>
      </section>
    </main>
  );
}

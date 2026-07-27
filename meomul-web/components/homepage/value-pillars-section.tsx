import type { ValuePillar } from "@/types/homepage";
import { useI18n } from "@/lib/i18n/provider";
import styles from "@/styles/home-landing-ovastin.module.css";

interface ValuePillarsSectionProps {
  pillars: ValuePillar[];
}

export function ValuePillarsSection({ pillars }: ValuePillarsSectionProps) {
  const { t } = useI18n();
  if (pillars.length === 0) return null;

  return (
    <section className={styles.valueSection}>
      <div className={styles.valueHeader}>
        <p className={styles.valueEyebrow}>{t("home_value_eyebrow")}</p>
        <h2 className={styles.valueTitle}>{t("home_value_title")}</h2>
      </div>

      <div className={styles.valueGrid}>
        {pillars.map((pillar) => (
          <article key={pillar.title} className={styles.valueCard}>
            <p className={styles.valueCardTitle}>{pillar.title}</p>
            <p className={styles.valueCardMetric}>{pillar.metric}</p>
            <p className={styles.valueCardDetail}>{pillar.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

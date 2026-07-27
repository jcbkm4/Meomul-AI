import Link from "next/link";
import { formatHotelLocationLabel } from "@/lib/hotels/hotels-ui";
import { useI18n } from "@/lib/i18n/provider";
import type { EditorialGuideCard } from "@/types/homepage";
import styles from "@/styles/home-landing-ovastin.module.css";

interface EditorialGuidesSectionProps {
  cards: EditorialGuideCard[];
}

export function EditorialGuidesSection({ cards }: EditorialGuidesSectionProps) {
  const { t } = useI18n();
  if (cards.length === 0) return null;

  return (
    <section className={styles.guidesSection}>
      <div className={styles.guidesHeader}>
        <p className={styles.guidesEyebrow}>{t("home_guides_eyebrow")}</p>
        <h2 className={styles.guidesTitle}>{t("home_guides_title")}</h2>
        <p className={styles.guidesDescription}>
          {t("home_guides_desc")}
        </p>
      </div>

      <div className={styles.guidesGrid}>
        {cards.map((guide) => (
          <article key={guide.id} className={styles.guideCard}>
            <Link href={guide.href} className={styles.guideCardLink}>
              {guide.imageUrl ? (
                <img
                  src={guide.imageUrl}
                  alt={guide.title}
                  className={styles.guideCardImage}
                />
              ) : (
                <div className={styles.guideCardFallback} />
              )}
              <div className={styles.guideCardShade} />
              <div className={styles.guideCardContent}>
                <p className={styles.guideCardEyebrow}>{guide.eyebrow}</p>
                <h3>{guide.title}</h3>
                <p className={styles.guideCardDescription}>{guide.description}</p>
                <p className={styles.guideCardMeta}>
                  {formatHotelLocationLabel(guide.location)} · {guide.checkIn} - {guide.checkOut}{" "}
                  ·{" "}
                  {t("home_common_guest_count", {
                    count: guide.guests,
                    suffix: guide.guests === "1" ? "" : "s",
                  })}
                </p>
                <span className={styles.guideCardCta}>
                  {t("home_guides_open_plan")} <span aria-hidden>↗</span>
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

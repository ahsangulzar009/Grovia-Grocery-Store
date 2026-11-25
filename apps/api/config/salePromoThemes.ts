export const SALES_PROMO_KINDS = [
  "winter_sale",
  "mega_sale",
  "promo_sale"
] as const

export type SalePromoKind = (typeof SALES_PROMO_KINDS)[number]

export interface SalePromoTheme {
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  glowA: string;
  glowB: string;
  kickerColor: string
  buttonBg: string;
  buttonText: string;
  buttonHoverBg: string;
}

export const SALE_PROMO_THEME_DEFAULTS = {
  winter_sale: {
    gradientFrom: "var(--color-brand-deep)",
    gradientVia: "var(--color-brand)",
    gradientTo: "var(--color-primary)",
    glowA: "color-mix(in oklab, var(--color-lime) 18%, transparent)",
    glowB: "color-mix(in oklab, var(--color-primary) 36%, transparent)",
    kickerColor: "var(--color-lime)",
    buttonBg: "var(--color-lime)",
    buttonText: "var(--color-brand-deep)",
    buttonHoverBg: "color-mix(in oklab, var(--color-lime) 82%, var(--color-brand-deep)",
  },
  mega_sale: {
    gradientFrom: "color-mix(in oklab, var(--color-accent-crimson) 40%, black)",
    gradientVia: "var(--color-accent-crimson)",
    gradientTo: "var(--color-accent-orange)",
    glowA: "color-mix(in oklab, var(--color-accent-orange) 22%, transparent)",
    glowB: "color-mix(in oklab, var(--color-accent-crimson) 35%, transparent)",
    kickerColor: "var(--color-warning)",
    buttonBg: "var(--color-accent-orange)",
    buttonText: "var(--color-card)",
    buttonHoverBg: "color-mix(in oklab, var(--color-accent-orange) 80%, black)",
  },
  promo_sale: {
    gradientFrom: "var(--color-night-blue)",
    gradientVia: "var(--color-sky)",
    gradientTo: "var(--color-green)",
    glowA: "color-mix(in oklab, var(--color-green) 22%, transparent)",
    glowB: "color-mix(in oklab, var(--color-sky) 35%, transparent)",
    kickerColor: "var(--color-green)",
    buttonBg: "var(--color-sky)",
    buttonText: "var(--color-night-blue)",
    buttonHoverBg: "color-mix(in oklab, var(--color-sky) 80%, black)",
  }
}


export function resolveSalePromoTheme(
  kind: SalePromoKind,
  overrides?: Partial<SalePromoTheme> | null
): SalePromoTheme {
  const base = SALE_PROMO_THEME_DEFAULTS[kind]
  if (!overrides) return { ...base }

  return {
    gradientFrom: overrides.gradientFrom?.trim() || base.gradientFrom,
    gradientVia: overrides.gradientVia?.trim() || base.gradientVia,
    gradientTo: overrides.gradientTo?.trim() || base.gradientTo,
    glowA: overrides.glowA?.trim() || base.glowA,
    glowB: overrides.glowB?.trim() || base.glowB,
    kickerColor: overrides.kickerColor?.trim() || base.kickerColor,
    buttonBg: overrides.buttonBg?.trim() || base.buttonBg,
    buttonText: overrides.buttonText?.trim() || base.buttonText,
    buttonHoverBg: overrides.buttonHoverBg?.trim() || base.buttonHoverBg,
  };
}


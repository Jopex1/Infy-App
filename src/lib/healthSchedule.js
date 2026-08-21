/**
 * Ghana Health Service Default Health Schedule
 * ─────────────────────────────────────────────
 * This is the ONLY place where schedule timings live.
 * Change ageValue/ageUnit here — the engine recalculates all dates automatically.
 *
 * ageUnit: "days" | "weeks" | "months" | "years"
 * activityType: "VACCINATION" | "GROWTH_MONITORING" | "VITAMIN_A" | "DEWORMING"
 */

export const GHS_SCHEDULE = [
  // ── VACCINATION ──────────────────────────────────────────────
  {
    id: "vax_birth",
    activityType: "VACCINATION",
    title: "Birth Vaccines",
    ageValue: 0,
    ageUnit: "days",
    vaccines: ["BCG", "OPV 0", "Hepatitis B (Birth Dose)"],
  },
  {
    id: "vax_6wk",
    activityType: "VACCINATION",
    title: "6-Week Vaccines",
    ageValue: 6,
    ageUnit: "weeks",
    vaccines: ["DPT-HepB-Hib 1", "OPV 1", "PCV 1", "Rotavirus 1"],
  },
  {
    id: "vax_10wk",
    activityType: "VACCINATION",
    title: "10-Week Vaccines",
    ageValue: 10,
    ageUnit: "weeks",
    vaccines: ["DPT-HepB-Hib 2", "OPV 2", "PCV 2", "Rotavirus 2"],
  },
  {
    id: "vax_14wk",
    activityType: "VACCINATION",
    title: "14-Week Vaccines",
    ageValue: 14,
    ageUnit: "weeks",
    vaccines: ["DPT-HepB-Hib 3", "OPV 3", "PCV 3", "Rotavirus 3", "IPV 1"],
  },
  {
    id: "vax_6mo",
    activityType: "VACCINATION",
    title: "6-Month Vaccines",
    ageValue: 6,
    ageUnit: "months",
    vaccines: ["Malaria Vaccine 1"],
  },
  {
    id: "vax_7mo",
    activityType: "VACCINATION",
    title: "7-Month Vaccines",
    ageValue: 7,
    ageUnit: "months",
    vaccines: ["Malaria Vaccine 2", "IPV 2"],
  },
  {
    id: "vax_9mo",
    activityType: "VACCINATION",
    title: "9-Month Vaccines",
    ageValue: 9,
    ageUnit: "months",
    vaccines: ["Measles-Rubella 1", "Yellow Fever", "Malaria Vaccine 3"],
  },
  {
    id: "vax_18mo",
    activityType: "VACCINATION",
    title: "18-Month Vaccines",
    ageValue: 18,
    ageUnit: "months",
    vaccines: ["Measles-Rubella 2", "Men A", "Malaria Vaccine 4"],
  },
  {
    id: "vax_9yr",
    activityType: "VACCINATION",
    title: "9-Year Vaccines (HPV)",
    ageValue: 9,
    ageUnit: "years",
    vaccines: ["HPV"],
  },

  // ── VITAMIN A ─────────────────────────────────────────────────
  {
    id: "vita_6mo",
    activityType: "VITAMIN_A",
    title: "Vitamin A (6 Months)",
    ageValue: 6,
    ageUnit: "months",
    dose: "100,000 IU",
  },
  {
    id: "vita_12mo",
    activityType: "VITAMIN_A",
    title: "Vitamin A (12 Months)",
    ageValue: 12,
    ageUnit: "months",
    dose: "200,000 IU",
  },
  {
    id: "vita_18mo",
    activityType: "VITAMIN_A",
    title: "Vitamin A (18 Months)",
    ageValue: 18,
    ageUnit: "months",
    dose: "200,000 IU",
  },
  {
    id: "vita_24mo",
    activityType: "VITAMIN_A",
    title: "Vitamin A (24 Months)",
    ageValue: 24,
    ageUnit: "months",
    dose: "200,000 IU",
  },
  {
    id: "vita_30mo",
    activityType: "VITAMIN_A",
    title: "Vitamin A (30 Months)",
    ageValue: 30,
    ageUnit: "months",
    dose: "200,000 IU",
  },
  {
    id: "vita_36mo",
    activityType: "VITAMIN_A",
    title: "Vitamin A (36 Months)",
    ageValue: 36,
    ageUnit: "months",
    dose: "200,000 IU",
  },
  {
    id: "vita_42mo",
    activityType: "VITAMIN_A",
    title: "Vitamin A (42 Months)",
    ageValue: 42,
    ageUnit: "months",
    dose: "200,000 IU",
  },
  {
    id: "vita_48mo",
    activityType: "VITAMIN_A",
    title: "Vitamin A (48 Months)",
    ageValue: 48,
    ageUnit: "months",
    dose: "200,000 IU",
  },
  {
    id: "vita_54mo",
    activityType: "VITAMIN_A",
    title: "Vitamin A (54 Months)",
    ageValue: 54,
    ageUnit: "months",
    dose: "200,000 IU",
  },
  {
    id: "vita_60mo",
    activityType: "VITAMIN_A",
    title: "Vitamin A (60 Months / Age 5)",
    ageValue: 60,
    ageUnit: "months",
    dose: "200,000 IU",
  },

  // ── GROWTH MONITORING (monthly 0-24mo, quarterly 27-36mo) ─────
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `growth_${i}mo`,
    activityType: "GROWTH_MONITORING",
    title: i === 0 ? "Birth Measurements" : `Growth Check (${i} Month${i !== 1 ? "s" : ""})`,
    ageValue: i,
    ageUnit: "months",
  })),
  {
    id: "growth_27mo",
    activityType: "GROWTH_MONITORING",
    title: "Growth Check (27 Months)",
    ageValue: 27,
    ageUnit: "months",
  },
  {
    id: "growth_30mo",
    activityType: "GROWTH_MONITORING",
    title: "Growth Check (30 Months)",
    ageValue: 30,
    ageUnit: "months",
  },
  {
    id: "growth_33mo",
    activityType: "GROWTH_MONITORING",
    title: "Growth Check (33 Months)",
    ageValue: 33,
    ageUnit: "months",
  },
  {
    id: "growth_36mo",
    activityType: "GROWTH_MONITORING",
    title: "Growth Check (36 Months / Age 3)",
    ageValue: 36,
    ageUnit: "months",
  },
];

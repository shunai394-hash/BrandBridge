/**
 * Static Model Cases — illustrative deal-flow samples only.
 * Not linked to Supabase `cases` / real product listings.
 */

export type ModelCaseType = "model" | "pilot" | "verified";

export type ModelCase = {
  slug: string;
  type: ModelCaseType;
  /** Short card title (without "Model Case:" prefix) */
  shortTitle: string;
  title: string;
  description: string;
  subtitle: string;
  country: string;
  category: string;
  productType: string;
  targetPartner: string;
  stage: string;
  conditions: {
    moq: string;
    wholesalePrice: string;
    exclusivity: string;
    shipping: string;
    regulatory: string;
  };
  challenge: string[];
  before: string[];
  withBrandBridge: string[];
  timeline: {
    step: number;
    title: string;
    description: string;
  }[];
  partnerInformation: string[];
  whyJapan: string[];
  brandBridgeContribution: string[];
  faq: {
    question: string;
    answer: string;
  }[];
};

export const MODEL_CASE_TYPE_LABEL: Record<ModelCaseType, string> = {
  model: "MODEL CASE",
  pilot: "PILOT CASE",
  verified: "VERIFIED CASE",
};

export const MODEL_CASE_DISCLAIMER =
  "This is a model case created to illustrate how BrandBridge works in practice. It is not a published record of a completed transaction.";

const AUSTRALIAN_CLEAN_BEAUTY: ModelCase = {
  slug: "australian-clean-beauty",
  type: "model",
  shortTitle: "Australian Clean Beauty Brand",
  title: "Model Case: Australian Clean Beauty Brand Entering Japan",
  description:
    "A model case showing how an overseas beauty brand could use BrandBridge to find Japanese partners and move toward direct commercial discussions.",
  subtitle:
    "How an overseas beauty brand could use BrandBridge to find qualified Japanese partners and move from initial interest to commercial discussion.",
  country: "Australia",
  category: "Beauty / Skincare",
  productType: "Clean beauty skincare",
  targetPartner: "Importer / Distributor / Specialty Retailer",
  stage: "Model Case",
  conditions: {
    moq: "300 units (illustrative example)",
    wholesalePrice: "Example range (illustrative)",
    exclusivity: "Negotiable by region/channel (example)",
    shipping: "FOB / EXW example",
    regulatory: "Japanese labeling and regulatory review required",
  },
  challenge: [
    "No local office in Japan",
    "Need for suitable Japanese partners",
    "Difficulty identifying qualified distributors",
    "Repetitive low-fit outreach",
    "Trade terms often discussed too late",
  ],
  before: [
    "Unclear partner fit",
    "Repetitive introductions",
    "Terms discussed too late",
    "Slow qualification",
  ],
  withBrandBridge: [
    "Product and trade terms visible early",
    "Japanese partner types can evaluate fit",
    "Initial discussion starts with commercial context",
    "Better-qualified conversations",
  ],
  timeline: [
    {
      step: 1,
      title: "Brand lists products",
      description:
        "The brand publishes product positioning and illustrative commercial terms so Japanese partners can assess fit early.",
    },
    {
      step: 2,
      title: "Japanese partners discover the listing",
      description:
        "Importers, distributors, and specialty retailers can browse listings relevant to their channel and category.",
    },
    {
      step: 3,
      title: "Initial interest and qualification",
      description:
        "Both sides can review category fit, partner type, and basic trade context before deeper outreach.",
    },
    {
      step: 4,
      title: "Direct commercial discussion",
      description:
        "Conversations can start with MOQ, pricing context, exclusivity, and shipping already in view.",
    },
    {
      step: 5,
      title: "Terms alignment",
      description:
        "Parties can clarify channel scope, exclusivity options, and operational requirements as discussion progresses.",
    },
    {
      step: 6,
      title: "Market entry preparation",
      description:
        "If both sides choose to continue, labeling, compliance, and distribution planning can move into preparation.",
    },
  ],
  partnerInformation: [
    "MOQ",
    "Wholesale pricing",
    "Product positioning",
    "Ingredient / formulation information",
    "Shelf life",
    "Packaging specifications",
    "Channel restrictions",
    "Exclusivity policy",
    "Shipping terms",
    "Labeling / compliance readiness",
  ],
  whyJapan: [
    "Clear positioning can help specialty and premium channels evaluate fit",
    "Appropriate Japanese channel match matters more than broad outreach",
    "Premium / specialty positioning may suit selective distribution",
    "Local partner knowledge can support market adaptation",
    "Controlled initial distribution can reduce early-stage complexity",
  ],
  brandBridgeContribution: [
    "Makes trade terms visible earlier",
    "Helps clarify partner type",
    "Provides a structured first discussion",
    "Reduces unnecessary back-and-forth",
    "Creates a clearer path toward commercial negotiation",
  ],
  faq: [
    {
      question: "Is this a real transaction?",
      answer:
        "No. This is a model case created to illustrate how BrandBridge works.",
    },
    {
      question: "Are the prices and MOQ real?",
      answer: "No. They are illustrative examples.",
    },
    {
      question: "Can a real brand use this process?",
      answer:
        "Yes. The page illustrates the type of information and workflow BrandBridge is designed to support.",
    },
  ],
};

/** Published model cases only (currently model-type). */
export const MODEL_CASES: ModelCase[] = [AUSTRALIAN_CLEAN_BEAUTY];

export function listPublishedModelCases(): ModelCase[] {
  return MODEL_CASES.filter((item) => item.type === "model");
}

export function getModelCaseBySlug(slug: string): ModelCase | null {
  const key = slug.trim().toLowerCase();
  return MODEL_CASES.find((item) => item.slug === key) ?? null;
}

export function listModelCaseSlugs(): string[] {
  return listPublishedModelCases().map((item) => item.slug);
}

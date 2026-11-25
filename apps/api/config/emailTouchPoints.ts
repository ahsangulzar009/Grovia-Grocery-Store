export type EmailAudience = "customer" | "seller" | "admin"

export interface EmailTouchpoint {
  key: string;
  audience: EmailAudience;
  label: string;
  description: string;
  defaultOn: boolean; // Make sure to add this if your interface requires it
  locked?: boolean;
  legacySwitch?: "customerOrderConfirmation" | "customerOrderUpdates" | "sellerDecisions" | "";
}

const EMAIL_TOUCHPOINTS: EmailTouchpoint[] = [
  // --- Seller Alerts ---
  { 
    key: "seller.decision_active", 
    audience: "seller", 
    label: "Application approved", 
    description: "Sent when the seller's shop application is approved and they can start selling.",
    defaultOn: true
  },
  { 
    key: "seller.decision_rejected", 
    audience: "seller", 
    label: "Application rejected", 
    description: "Sent when the seller's shop application is rejected.",
    defaultOn: true
  },
  { 
    key: "seller.decision_terminated", 
    audience: "seller", 
    label: "Shop closed", 
    description: "Sent when the seller's shop account is terminated or closed.",
    defaultOn: true
  },
  { 
    key: "seller.product_approved", 
    audience: "seller", 
    label: "Product approved", 
    description: "Sent when a product submitted by the seller is approved and live.",
    defaultOn: true
  },
  { 
    key: "seller.product_rejected", 
    audience: "seller", 
    label: "Product rejected", 
    description: "Sent when a product submitted by the seller is rejected.",
    defaultOn: true
  },
  { 
    key: "seller.payout_dispatched", 
    audience: "seller", 
    label: "Payout dispatched", 
    description: "Sent when the seller's payout has been successfully dispatched.",
    defaultOn: true
  },

  // --- staff alerts ---
  { 
    key: "admin.new_order", 
    audience: "admin", 
    label: "New order", 
    description: "To the alert the admin team about a newly placed order.", // Filled from cut-off text
    defaultOn: true
  },
  { 
    key: "admin.low_stock", 
    audience: "admin", 
    label: "Low stock", 
    description: "When an order reduces a product's stock below the threshold.", // Filled from cut-off text
    defaultOn: true
  },
  { 
    key: "admin.seller_application", 
    audience: "admin", 
    label: "Seller application", 
    description: "Sent when a new seller submits an application to join the platform.",
    defaultOn: true
  },
  { 
    key: "admin.contact_message", 
    audience: "admin", 
    label: "Contact message", 
    description: "When a customer or seller submits a message via the contact form.", // Filled from cut-off text
    defaultOn: true
  },
  { 
    key: "admin.refund_failed", 
    audience: "admin", 
    label: "Refund failed", 
    description: "When Stripe refund fails and requires manual review.", // Filled from cut-off text ("When S...")
    defaultOn: true
  },
];


export type EmailTouchpointKey = (typeof EMAIL_TOUCHPOINTS)[number]["key"];

export const DEFAULT_DAILY_EMAIL_LIMIT = 400;

export function touchpointByKey(key: string): EmailTouchpoint | undefined {
  return EMAIL_TOUCHPOINTS.find((t) => t.key === key);
}
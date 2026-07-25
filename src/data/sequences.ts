import type { SequenceDef } from "./types";

// Curated order/payment choreography, rendered as sequence diagrams (Sequence Diagrams
// view). Each scenario is an ordered list of messages between participants.
//
//  - `participants` sets the left-to-right lifeline order. Every id is a real node id
//    from systems/datastores/externals, EXCEPT diagram-only actors declared in `actors`
//    below. As with `flows.ts` there is no runtime validation — a typo'd id silently
//    misrenders, so keep ids in sync with the model.
//  - `response: true` draws a dashed return arrow (and closes the caller's activation).
//  - `kind` reuses the FlowKind vocabulary, so messages carry the same labels/legend as
//    the graph views.
//  - Modeling rule: the iPaaS is a CONNECTOR, never an initiator. Every iPaaS-outbound
//    message relays a preceding inbound one — changes originate from real systems
//    (Shopify, OMS, …), not from the iPaaS.
//
// Note: the graph model (`flows.ts`) collapses auth + capture into one checkout call
// ("Authorize & capture"). The payment-authorized / payment-captured scenarios below
// present the auth-then-capture model as their own curated flows and deliberately do NOT
// change `flows.ts`. This bundled data is an illustrative sample (fictional "Acme
// Outfitters"); confirm the real capture trigger and refund path when populating a client.

/** Diagram-only participants that are not architecture nodes (no fact sheet). */
export const actors: Record<string, string> = {
  shopper: "Shopper",
};

export const sequences: SequenceDef[] = [
  // ── Order placed ───────────────────────────────────────────────
  {
    id: "order-placed",
    title: "Order placed",
    domain: "orders",
    summary:
      "A shopper checks out: tax and payment are settled inline, then an order-created " +
      "webhook kicks off asynchronous order creation and confirmation.",
    participants: [
      "shopper",
      "shopify-checkout",
      "tax-service",
      "payment-gateway",
      "ipaas",
      "oms",
      "email-marketing",
    ],
    messages: [
      { from: "shopper", to: "shopify-checkout", kind: "api-call", label: "Place order" },
      { from: "shopify-checkout", to: "tax-service", kind: "api-call", label: "Calculate tax" },
      { from: "tax-service", to: "shopify-checkout", kind: "api-call", label: "Tax amount", response: true },
      { from: "shopify-checkout", to: "payment-gateway", kind: "api-call", label: "Authorize & capture" },
      { from: "payment-gateway", to: "shopify-checkout", kind: "api-call", label: "Approved", response: true },
      { from: "shopify-checkout", to: "shopper", kind: "api-call", label: "Confirmation page", response: true },
      { from: "shopify-checkout", to: "ipaas", kind: "webhook", label: "Order created" },
      { from: "ipaas", to: "oms", kind: "api-call", label: "Create order" },
      { from: "oms", to: "ipaas", kind: "api-call", label: "Order ID", response: true },
      { from: "ipaas", to: "email-marketing", kind: "api-call", label: "Order confirmation" },
    ],
  },

  // ── Order fulfilled ────────────────────────────────────────────
  {
    id: "order-fulfilled",
    title: "Order fulfilled",
    domain: "orders",
    summary:
      "The OMS releases the order for fulfillment through the iPaaS; the 3PL ships, and " +
      "shipment status flows back through the iPaaS to the storefront and the shopper.",
    participants: [
      "oms",
      "ipaas",
      "threepl",
      "shipping-service",
      "shopify-online-store",
      "email-marketing",
    ],
    messages: [
      { from: "oms", to: "ipaas", kind: "api-call", label: "Release for fulfillment" },
      { from: "ipaas", to: "threepl", kind: "api-call", label: "Fulfillment request" },
      { from: "oms", to: "shipping-service", kind: "api-call", label: "Rates & labels" },
      { from: "shipping-service", to: "oms", kind: "api-call", label: "Label & tracking #", response: true },
      { from: "threepl", to: "ipaas", kind: "webhook", label: "Shipment & tracking" },
      { from: "shipping-service", to: "oms", kind: "webhook", label: "Tracking updates" },
      { from: "ipaas", to: "shopify-online-store", kind: "api-call", label: "Status & tracking" },
      { from: "ipaas", to: "email-marketing", kind: "api-call", label: "Shipping notification" },
    ],
  },

  // ── Returns & refunds ──────────────────────────────────────────
  {
    id: "returns-refunds",
    title: "Returns & refunds",
    domain: "orders",
    summary:
      "A shopper requests a return; once the 3PL receives and inspects the item, the OMS " +
      "issues a refund through the payment gateway and notifies the shopper.",
    participants: [
      "shopper",
      "admin-console",
      "oms",
      "threepl",
      "payment-gateway",
      "email-marketing",
    ],
    messages: [
      { from: "shopper", to: "admin-console", kind: "api-call", label: "Request return" },
      { from: "admin-console", to: "oms", kind: "api-call", label: "Create RMA" },
      { from: "oms", to: "threepl", kind: "api-call", label: "Return authorization" },
      { from: "oms", to: "admin-console", kind: "api-call", label: "RMA confirmed", response: true },
      { from: "admin-console", to: "shopper", kind: "api-call", label: "Return label", response: true },
      { from: "threepl", to: "oms", kind: "webhook", label: "Return received & inspected" },
      { from: "oms", to: "payment-gateway", kind: "api-call", label: "Refund" },
      { from: "payment-gateway", to: "oms", kind: "api-call", label: "Refund settled", response: true },
      { from: "oms", to: "email-marketing", kind: "api-call", label: "Refund confirmation" },
    ],
  },

  // ── Payment authorized ─────────────────────────────────────────
  {
    id: "payment-authorized",
    title: "Payment authorized",
    domain: "payments",
    summary:
      "At checkout the payment method is validated and a hold is placed on the funds. " +
      "Nothing is charged yet — capture happens later, when the order ships.",
    participants: ["shopper", "shopify-checkout", "tax-service", "payment-gateway"],
    messages: [
      { from: "shopper", to: "shopify-checkout", kind: "api-call", label: "Submit payment" },
      { from: "shopify-checkout", to: "tax-service", kind: "api-call", label: "Calculate tax" },
      { from: "tax-service", to: "shopify-checkout", kind: "api-call", label: "Tax amount", response: true },
      {
        from: "shopify-checkout",
        to: "payment-gateway",
        kind: "api-call",
        label: "Authorize",
        note: "On decline the order is not created and the shopper is asked for another method.",
      },
      { from: "payment-gateway", to: "shopify-checkout", kind: "api-call", label: "Authorized (hold placed)", response: true },
      { from: "shopify-checkout", to: "shopper", kind: "api-call", label: "Payment accepted", response: true },
    ],
  },

  // ── Payment captured ───────────────────────────────────────────
  {
    id: "payment-captured",
    title: "Payment captured",
    domain: "payments",
    summary:
      "Shopify captures the previously authorized funds — at checkout or once the order " +
      "ships, depending on the client's settings — then settlement is confirmed and the " +
      "financials are posted to the ERP.",
    participants: ["shopify-online-store", "payment-gateway", "oms", "erp"],
    messages: [
      {
        from: "shopify-online-store",
        to: "payment-gateway",
        kind: "api-call",
        label: "Capture payment",
        note: "Initiated by Shopify — at checkout or on fulfillment, per the client's capture settings.",
      },
      { from: "payment-gateway", to: "shopify-online-store", kind: "api-call", label: "Captured", response: true },
      { from: "payment-gateway", to: "oms", kind: "webhook", label: "Settlement status" },
      { from: "oms", to: "erp", kind: "sync", label: "Post financials" },
    ],
  },
];

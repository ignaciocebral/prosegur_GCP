const assert = require("assert");
const fs = require("fs");
const path = require("path");

const bridgeSqlx = fs.readFileSync(
  path.join(__dirname, "..", "definitions", "custom", "03_outputs", "ga4_lead_event_bridge.sqlx"),
  "utf8"
);

assert(
  bridgeSqlx.includes("LOWER(e.event_name) = 'generate_lead_crm'"),
  "ga4_lead_event_bridge must include generate_lead_CRM events; BR/DE/MX IdLead rows moved to this event name after July 2025."
);

assert(
  bridgeSqlx.includes("e.event_name = 'generate_lead'"),
  "ga4_lead_event_bridge must preserve the original generate_lead predicate."
);

console.log("ga4 lead event bridge regression tests passed");

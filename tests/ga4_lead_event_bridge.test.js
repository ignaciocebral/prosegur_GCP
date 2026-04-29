const assert = require("assert");
const fs = require("fs");
const path = require("path");

const bridgeSqlx = fs.readFileSync(
  path.join(__dirname, "..", "definitions", "custom", "03_outputs", "ga4_lead_event_bridge.sqlx"),
  "utf8"
);
const {
  buildCrmLeadEventPredicateSql,
  buildNormalizedLeadUrlSql
} = require("../includes/custom/lead_matching_helpers.js");

const crmLeadPredicateSql = buildCrmLeadEventPredicateSql("e");
const normalizedUrlSql = buildNormalizedLeadUrlSql("url");

assert(
  crmLeadPredicateSql === "LOWER(e.event_name) = 'generate_lead_crm'",
  "ga4_lead_event_bridge must include generate_lead_CRM events; BR/DE/MX IdLead rows moved to this event name after July 2025."
);

assert(
  !bridgeSqlx.includes("OR e.event_name = 'generate_lead'"),
  "ga4_lead_event_bridge IdLead matching must be scoped to generate_lead_CRM, the event with the declared IdLead parameter."
);

assert(
  bridgeSqlx.includes("cc_lead_url_scope"),
  "ga4_lead_event_bridge must compare event URLs against recent cc_leads_master URLs."
);

assert(
  bridgeSqlx.includes("is_matching_excluded_url"),
  "ga4_lead_event_bridge must expose the broad URL matching exclusion flag for every source, not only Meta."
);

assert(
  bridgeSqlx.includes("includes/custom/lead_matching_helpers.js"),
  "ga4_lead_event_bridge should keep lead matching normalization in helpers."
);

assert(
  normalizedUrlSql.includes("r'https?://[^\\s]+'"),
  "URL normalization must extract embedded http/https URLs until whitespace."
);

assert(
  normalizedUrlSql.includes("r'^www\\.'"),
  "URL normalization must remove leading www."
);

assert(
  !normalizedUrlSql.includes("[^\\\\s]+") && !normalizedUrlSql.includes("r'^www\\\\.'"),
  "URL normalization regexes must not be double-escaped in emitted BigQuery SQL."
);

console.log("ga4 lead event bridge regression tests passed");

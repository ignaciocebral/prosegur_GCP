const assert = require("assert");
const fs = require("fs");
const path = require("path");

const sessionKeysSql = fs.readFileSync(
  path.join(__dirname, "..", "definitions", "custom", "02_intermediate", "stg_ga4_session_keys.sqlx"),
  "utf8"
);

const attributionSql = fs.readFileSync(
  path.join(__dirname, "..", "definitions", "custom", "02_intermediate", "int_session_paid_attribution.sqlx"),
  "utf8"
);

assert.ok(
  sessionKeysSql.includes("landing_campaign_id") &&
  sessionKeysSql.includes("landing_adset_id") &&
  sessionKeysSql.includes("landing_ad_id"),
  "Session keys staging should expose campaign_id, adset_id and ad_id extracted from the landing URL."
);

assert.ok(
  sessionKeysSql.includes("campaign_id=([^&#]+)") &&
  sessionKeysSql.includes("adset_id=([^&#]+)") &&
  sessionKeysSql.includes("ad_id=([^&#]+)"),
  "Session keys staging should parse campaign_id, adset_id and ad_id directly from landing_page_location."
);

assert.ok(
  attributionSql.includes("b.landing_campaign_id = mc.campaign_id"),
  "Meta campaign attribution should first attempt a campaign_id join."
);

assert.ok(
  attributionSql.includes("b.landing_campaign_id IS NULL AND LOWER(TRIM(b.campaign)) = LOWER(TRIM(mc.campaign_name))"),
  "Meta campaign attribution should fall back to campaign_name only when campaign_id is absent."
);

assert.ok(
  attributionSql.includes("b.landing_adset_id = mad.adset_id") &&
  attributionSql.includes("b.landing_ad_id = mad.ad_id"),
  "Meta ad attribution should prefer adset_id and ad_id when both are present."
);

assert.ok(
  attributionSql.includes("(b.landing_adset_id IS NULL OR b.landing_ad_id IS NULL)") &&
  attributionSql.includes("LOWER(TRIM(b.term)) = LOWER(TRIM(mad.adset_name))") &&
  attributionSql.includes("LOWER(TRIM(b.content)) = LOWER(TRIM(mad.ad_name))"),
  "Meta ad attribution should fall back to term/content name matching when ad IDs are unavailable."
);

assert.ok(
  attributionSql.includes("THEN 'meta_ids'") &&
  attributionSql.includes("WHEN meta_match_method IS NOT NULL THEN meta_match_method"),
  "The final attribution output should expose when Meta rows were matched through IDs."
);

assert.ok(
  !attributionSql.includes("NOT REGEXP_CONTAINS(COALESCE(b.term, ''), r'^[0-9]+$')"),
  "The old numeric-term guard should be removed once explicit ID joins are supported."
);

console.log("meta ads attribution priority regression tests passed");

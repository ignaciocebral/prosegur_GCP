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
  !sessionKeysSql.includes("campaign_id=([^&#]+)") &&
  sessionKeysSql.includes("adset_id=([^&#]+)") &&
  sessionKeysSql.includes("ad_id=([^&#]+)"),
  "Session keys staging should parse adset_id and ad_id directly from landing_page_location and should not expect a campaign_id URL parameter."
);

assert.ok(
  sessionKeysSql.includes("utm_id=([0-9]+)") &&
  !sessionKeysSql.includes("campaign_name=([0-9]+)"),
  "Session keys staging should trust the numeric prefix of utm_id for Meta campaign IDs and should not infer IDs from campaign_name."
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
  attributionSql.includes("mc.campaign_id IS NOT NULL") &&
  attributionSql.includes("mc.campaign_id = mad.campaign_id") &&
  !attributionSql.includes("b.landing_campaign_id = mad.campaign_id"),
  "Meta ad attribution should only enrich rows after a real Meta campaign match and should key ad lookup off mc.campaign_id."
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
  attributionSql.includes("WHEN b.landing_campaign_id IS NOT NULL THEN 'meta_url_ids'") &&
  !attributionSql.includes("WHEN b.landing_campaign_id IS NOT NULL\n        OR b.landing_adset_id IS NOT NULL\n        OR b.landing_ad_id IS NOT NULL THEN 'meta_url_ids'"),
  "Meta match_method should report meta_url_ids only when the Meta campaign itself matched via landing_campaign_id."
);

assert.ok(
  attributionSql.includes("THEN 'meta_url_ids'") &&
  attributionSql.includes("WHEN meta_match_method IS NOT NULL THEN meta_match_method"),
  "The final attribution output should expose when Meta rows were matched through IDs."
);

assert.ok(
  attributionSql.includes("ELSE 'meta_name_fallback'") &&
  attributionSql.includes("THEN 'google_gclid'") &&
  attributionSql.includes("ELSE 'none'"),
  "match_method values should be explicit about Google gclid matches, Meta URL ID matches, Meta fallback matches, and no-match rows."
);

assert.ok(
  !attributionSql.includes("NOT REGEXP_CONTAINS(COALESCE(b.term, ''), r'^[0-9]+$')"),
  "The old numeric-term guard should be removed once explicit ID joins are supported."
);

console.log("meta ads attribution priority regression tests passed");

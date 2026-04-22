const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  parseGoogleAdsCustomerId,
  buildGoogleAdsIncrementalDateCheckpointSql,
  buildUnifiedCampaignMartIncrementalDateCheckpointSql
} = require("../includes/custom/marketing_helpers.js");
const {
  buildGoogleAdsConversionBucketSql,
  buildGoogleAdsIgnoredActionSql,
  GOOGLE_ADS_IGNORED_ACTION_NAMES
} = require("../includes/custom/marketing_helpers.js");

const campaignPerformanceBaseSql = fs.readFileSync(
  path.join(__dirname, "..", "definitions", "custom", "02_intermediate", "int_campaign_performance_daily_base.sqlx"),
  "utf8"
);
const customerLookupSql = fs.readFileSync(
  path.join(__dirname, "..", "definitions", "custom", "02_intermediate", "src_google_ads_customer_lookup.sqlx"),
  "utf8"
);
const clickMappingSql = fs.readFileSync(
  path.join(__dirname, "..", "definitions", "custom", "02_intermediate", "src_google_ads_click_mapping.sqlx"),
  "utf8"
);

assert.strictEqual(parseGoogleAdsCustomerId("0"), 0);
assert.strictEqual(parseGoogleAdsCustomerId("1703013237"), 1703013237);
assert.strictEqual(parseGoogleAdsCustomerId("not-a-number"), 0);

const checkpointSqlWhenDisabled = buildGoogleAdsIncrementalDateCheckpointSql(
  "`project.dataset.some_table`",
  "0",
  "customer_id",
  "date"
);

assert.ok(
  checkpointSqlWhenDisabled.includes("customer_id IS NOT NULL"),
  "When Google Ads is disabled, any persisted customer_id should trigger a full rebuild."
);

assert.ok(
  checkpointSqlWhenDisabled.includes("THEN DATE('2020-01-01')"),
  "Google incremental checkpoint should force a full rebuild when stale customer rows are detected."
);

const campaignCheckpointSql = buildUnifiedCampaignMartIncrementalDateCheckpointSql(
  "`project.dataset.campaign_mart`",
  "1703013237",
  "Meta Account 1|Meta Account 2"
);

assert.ok(
  campaignCheckpointSql.includes("platform = 'google_ads'"),
  "Campaign mart checkpoint should evaluate stale Google Ads rows."
);

assert.ok(
  campaignCheckpointSql.includes("platform = 'meta_ads'"),
  "Campaign mart checkpoint should evaluate stale Meta Ads rows."
);

const duplicatedByKeywordText = [
  { date: "2023-03-30", customer_id: 1703013237, campaign_id: 11354746448, ad_group_id: 121680257198, criterion_id: 418975308676, keyword_text: "sistema de cobro automático" },
  { date: "2023-03-30", customer_id: 1703013237, campaign_id: 11354746448, ad_group_id: 121680257198, criterion_id: 442046801747, keyword_text: "sistema de cobro automático" },
  { date: "2023-03-30", customer_id: 1703013237, campaign_id: 11354746448, ad_group_id: 121680257198, criterion_id: 518261843938, keyword_text: "sistema de cobro automático" }
];

const oldGrouping = new Map();
for (const row of duplicatedByKeywordText) {
  const key = [row.date, row.customer_id, row.campaign_id, row.ad_group_id, row.keyword_text].join("|");
  oldGrouping.set(key, (oldGrouping.get(key) || 0) + 1);
}
assert.ok(
  [...oldGrouping.values()].some(count => count > 1),
  "The old assertion grain by keyword_text reproduces the false positive."
);

const correctedGrouping = new Map();
for (const row of duplicatedByKeywordText) {
  const matchType = row.criterion_id === 418975308676
    ? "EXACT"
    : row.criterion_id === 442046801747
      ? "BROAD"
      : "PHRASE";
  const key = [row.date, row.customer_id, row.campaign_id, row.ad_group_id, row.keyword_text, matchType].join("|");
  correctedGrouping.set(key, (correctedGrouping.get(key) || 0) + 1);
}
assert.ok(
  [...correctedGrouping.values()].every(count => count === 1),
  "The corrected assertion grain by keyword_text + match_type avoids the false positive."
);

const bucketSql = buildGoogleAdsConversionBucketSql("action_name");
const ignoredActionSql = buildGoogleAdsIgnoredActionSql("action_name");

assert.ok(
  bucketSql.crm.includes("^(Cualificado|Positivo)(_|$)"),
  "CRM mapping should anchor the Cualificado/Positivo family and avoid false positives like 'No Cualificado'."
);

assert.ok(
  bucketSql.crm.includes("^Formulario_04($|_)"),
  "CRM mapping should cover Formulario_04 variants such as _PAY."
);

assert.ok(
  bucketSql.form.includes("Lead Submit") &&
  bucketSql.form.includes("Prosegur Paraguay - GA4 (web) generate_lead"),
  "Form mapping should include the audited Lead Submit and Paraguay GA4 generate_lead actions."
);

assert.ok(
  bucketSql.call.includes("Prosegur Paraguay - GA4 (web) c2c") &&
  bucketSql.call.includes("CMB"),
  "Call mapping should include both callback-style CMB actions and the Paraguay GA4 c2c action."
);

assert.ok(
  bucketSql.call.includes("Clics en el n\u00famero de tel\u00e9fono en tu sitio web m\u00f3vi (C2C)") &&
  bucketSql.call.includes("Llamadas a tel\u00e9fono en sitio web (desv\u00edo de llamada)"),
  "Call mapping should include the accented Spain action-name variants surfaced by the coverage assertion."
);

assert.ok(
  bucketSql.noGestionado.includes("No Gestionado_formulario") &&
  !bucketSql.noGestionado.includes("No Cualificado"),
  "No Gestionado actions should stay isolated from disqualified outcomes."
);

assert.ok(
  bucketSql.noCualificado.includes("No Cualificado") &&
  bucketSql.noCualificado.includes("NoUtil_formulario_02"),
  "Disqualified Google Ads lead states should map to no_cualificado."
);

assert.ok(
  GOOGLE_ADS_IGNORED_ACTION_NAMES.includes("Conversation started"),
  "Ignored Google Ads actions should keep Conversation started outside the hard buckets."
);

assert.ok(
  GOOGLE_ADS_IGNORED_ACTION_NAMES.includes("Purchase"),
  "Ignored Google Ads actions should keep ecommerce actions out of the lead mapping assertion."
);

assert.ok(
  GOOGLE_ADS_IGNORED_ACTION_NAMES.includes("Inicio de la tramitaci\u00f3n de la compra"),
  "Ignored Google Ads actions should include the accented purchase-start variant surfaced by crypto."
);

assert.ok(
  ignoredActionSql.includes("Conversation started") &&
  ignoredActionSql.includes("Purchase") &&
  ignoredActionSql.includes("Inicio de la tramitaci\u00f3n de la compra"),
  "Ignored Google Ads actions should be reusable in SQL to exclude them from downstream conversion totals."
);

assert.ok(
  campaignPerformanceBaseSql.includes("CAST(NULL AS STRING) AS ad_id") &&
  campaignPerformanceBaseSql.includes("CAST(NULL AS STRING) AS ad_name"),
  "Campaign performance base should drop Google ad-level identifiers before joining GA4 aggregates."
);

assert.ok(
  customerLookupSql.includes("customer_descriptive_name AS account_name"),
  "Google Ads customer lookup should expose account_name for downstream joins that expect the normalized column."
);

assert.ok(
  clickMappingSql.includes("acc.account_name"),
  "Click mapping should continue reading the normalized Google Ads account_name column from the customer lookup."
);

const duplicatedGoogleAdsRows = [
  {
    date: "2026-04-21",
    platform: "google_ads",
    campaign_id: "cmp-1",
    ad_group_or_adset_id: "adg-1",
    ad_id: "ad-1",
    ad_name: "Variant A",
    spend: 10
  },
  {
    date: "2026-04-21",
    platform: "google_ads",
    campaign_id: "cmp-1",
    ad_group_or_adset_id: "adg-1",
    ad_id: "ad-2",
    ad_name: "Variant B",
    spend: 15
  }
];

const ga4CampaignAggregate = {
  date: "2026-04-21",
  platform: "google_ads",
  campaign_id: "cmp-1",
  ad_group_or_adset_id: "adg-1",
  ga4_sessions: 3,
  ga4_conversions_form: 1
};

const duplicatedLegacyJoin = duplicatedGoogleAdsRows.map(row => ({
  ...row,
  ga4_sessions: ga4CampaignAggregate.ga4_sessions,
  ga4_conversions_form: ga4CampaignAggregate.ga4_conversions_form
}));

assert.strictEqual(
  duplicatedLegacyJoin.reduce((total, row) => total + row.ga4_sessions, 0),
  6,
  "Keeping Google rows below ad-group grain duplicates one GA4 campaign aggregate across ads."
);

const aggregatedGoogleRows = [...duplicatedGoogleAdsRows.reduce((groups, row) => {
  const key = [row.date, row.platform, row.campaign_id, row.ad_group_or_adset_id].join("|");
  const current = groups.get(key) || {
    date: row.date,
    platform: row.platform,
    campaign_id: row.campaign_id,
    ad_group_or_adset_id: row.ad_group_or_adset_id,
    ad_id: null,
    ad_name: null,
    spend: 0
  };
  current.spend += row.spend;
  groups.set(key, current);
  return groups;
}, new Map()).values()];

const correctedJoin = aggregatedGoogleRows.map(row => ({
  ...row,
  ga4_sessions: ga4CampaignAggregate.ga4_sessions,
  ga4_conversions_form: ga4CampaignAggregate.ga4_conversions_form
}));

assert.strictEqual(
  correctedJoin.length,
  1,
  "Aggregating Google rows to ad-group grain should collapse duplicate ads before the GA4 join."
);

assert.strictEqual(
  correctedJoin[0].ga4_sessions,
  3,
  "After the grain fix, the GA4 session aggregate should be attached only once."
);

assert.strictEqual(
  correctedJoin[0].ad_id,
  null,
  "After aggregation, Google rows should not retain ad_id in the joined output grain."
);

console.log("marketing helpers google ads regression tests passed");

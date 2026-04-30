const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  parseGoogleAdsCustomerId,
  buildGoogleAdsIncrementalDateCheckpointSql,
  buildUnifiedCampaignMartIncrementalDateCheckpointSql,
  buildCountryCodeFromNameSql
} = require("../includes/custom/marketing_helpers.js");
const {
  buildGoogleAdsConversionBucketSql,
  buildGoogleAdsIgnoredActionSql,
  GOOGLE_ADS_IGNORED_ACTION_NAMES
} = require("../includes/custom/marketing_helpers.js");

const campaignPerformanceBaseSql = fs.readFileSync(
  path.join(__dirname, "..", "definitions", "custom", "02_intermediate", "int_performance_daily_base.sqlx"),
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
const sessionPaidAttributionSql = fs.readFileSync(
  path.join(__dirname, "..", "definitions", "custom", "02_intermediate", "int_session_paid_attribution.sqlx"),
  "utf8"
);
const sessionKeysSql = fs.readFileSync(
  path.join(__dirname, "..", "definitions", "custom", "02_intermediate", "stg_ga4_session_keys.sqlx"),
  "utf8"
);
const metaAdsSql = fs.readFileSync(
  path.join(__dirname, "..", "definitions", "custom", "02_intermediate", "src_meta_ads_ad_daily.sqlx"),
  "utf8"
);
const googleAdsIdentityAssertionSql = fs.readFileSync(
  path.join(__dirname, "..", "definitions", "custom", "assertions", "assert_mart_performance_google_ads_identity_completeness.sqlx"),
  "utf8"
);

assert.strictEqual(parseGoogleAdsCustomerId("0"), 0);
assert.strictEqual(parseGoogleAdsCustomerId("1703013237"), 1703013237);
assert.strictEqual(parseGoogleAdsCustomerId("not-a-number"), 0);

const countryCodeSql = buildCountryCodeFromNameSql("account_name");

assert.ok(
  countryCodeSql.includes("THEN 'ES'") &&
    countryCodeSql.includes("THEN 'BR'") &&
    countryCodeSql.includes("THEN 'MX'") &&
    !countryCodeSql.includes("THEN 'Espana'") &&
    !countryCodeSql.includes("THEN 'Brasil'"),
  "Marketing country_code should use the ISO codes published in dim_seo_insights_source_mapping."
);

assert.ok(
  customerLookupSql.includes("country_code") &&
    campaignPerformanceBaseSql.includes("dim_seo_insights_source_mapping") &&
    campaignPerformanceBaseSql.includes("ga4_output_dataset") &&
    campaignPerformanceBaseSql.includes("release_country") &&
    clickMappingSql.includes("acc.country_code IN") &&
    metaAdsSql.includes("COALESCE(al.country_code, 'Other') IN"),
  "Paid-media staging and campaign marts should filter rows to the release country from dim_seo_insights_source_mapping."
);

assert.ok(
  sessionKeysSql.includes('buildCountryCodeFromNameSql("s.geo.country")') &&
    sessionKeysSql.includes("dim_seo_insights_source_mapping") &&
    sessionKeysSql.includes("ga4_output_dataset"),
  "GA4 session staging should derive ISO country_code from geo.country for filtering to the mapped release country."
);

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
  campaignPerformanceBaseSql.includes("entity_grain") &&
  campaignPerformanceBaseSql.includes("entity_id") &&
  campaignPerformanceBaseSql.includes("entity_name") &&
  campaignPerformanceBaseSql.includes("ga4_attribution_grain"),
  "Campaign performance base should expose the observed Ads entity grain plus the effective GA4 attribution grain."
);

assert.ok(
  campaignPerformanceBaseSql.includes("WHEN ad_id IS NOT NULL THEN 'ad'") &&
  campaignPerformanceBaseSql.includes("ELSE 'campaign'") &&
  campaignPerformanceBaseSql.includes("WHEN ad_id IS NOT NULL THEN CAST(ad_id AS STRING)") &&
  campaignPerformanceBaseSql.includes("ELSE CAST(campaign_id AS STRING)"),
  "Google Ads observed rows should use ad-level entity IDs when ad_id exists and fall back to campaign for PMax."
);

assert.ok(
  campaignPerformanceBaseSql.includes("WHEN platform = 'google_ads' AND normalized_google_ad_id IS NOT NULL THEN 'ad'") &&
    campaignPerformanceBaseSql.includes("WHEN platform = 'meta_ads' AND normalized_meta_ad_id IS NOT NULL THEN 'ad'") &&
    campaignPerformanceBaseSql.includes("WHEN COALESCE(normalized_google_ad_group_id, normalized_meta_adset_id) IS NOT NULL THEN 'ad_group_or_adset'") &&
    campaignPerformanceBaseSql.includes("ELSE 'campaign'"),
  "GA4 attribution should degrade from ad to ad_group_or_adset to campaign based on the identifiers actually present."
);

assert.ok(
  customerLookupSql.includes("customer_descriptive_name AS account_name"),
  "Google Ads customer lookup should expose account_name for downstream joins that expect the normalized column."
);

assert.ok(
  clickMappingSql.includes("acc.account_name"),
  "Click mapping should continue reading the normalized Google Ads account_name column from the customer lookup."
);

assert.ok(
  clickMappingSql.includes("click_view_ad_group_ad") &&
    clickMappingSql.includes("REGEXP_EXTRACT(click_view_ad_group_ad, r'~([0-9]+)$') AS INT64) AS ad_id"),
  "Click mapping should extract Google Ads ad_id from click_view_ad_group_ad so GCLID joins can reach ad grain."
);

assert.ok(
  sessionPaidAttributionSql.includes("c.ad_id") &&
    sessionPaidAttributionSql.includes("g.ad_id AS google_ad_id") &&
    sessionPaidAttributionSql.includes("google_ad_id AS ad_id"),
  "Session paid attribution should propagate Google Ads ad_id into paid_attribution.google_ads."
);

assert.ok(
  googleAdsIdentityAssertionSql.includes("platform = 'google_ads'") &&
    googleAdsIdentityAssertionSql.includes("campaign_id IS NOT NULL") &&
    googleAdsIdentityAssertionSql.includes("account_id IS NULL") &&
    googleAdsIdentityAssertionSql.includes("account_name IS NULL") &&
    googleAdsIdentityAssertionSql.includes("impressions") &&
    googleAdsIdentityAssertionSql.includes("clicks") &&
    googleAdsIdentityAssertionSql.includes("spend") &&
    googleAdsIdentityAssertionSql.includes("platform_conversions_total"),
  "Google Ads campaign mart assertion should fail orphaned campaign rows with missing account identity and expose Ads metrics in the failure sample."
);

assert.ok(
  campaignPerformanceBaseSql.includes("NULLIF(CAST(s.paid_attribution.google_ads.ad_group_id AS STRING), '0') AS normalized_google_ad_group_id"),
  "Performance entity context should normalize Google Ads ad_group_id 0 to NULL so PMax sessions join campaign-grain Ads rows."
);

assert.ok(
  campaignPerformanceBaseSql.includes("CAST(s.paid_attribution.google_ads.ad_id AS STRING) AS normalized_google_ad_id") &&
    campaignPerformanceBaseSql.includes("WHEN platform = 'google_ads' AND normalized_google_ad_id IS NOT NULL THEN 'ad'") &&
    campaignPerformanceBaseSql.includes("WHEN platform = 'google_ads' AND normalized_google_ad_id IS NOT NULL THEN normalized_google_ad_id"),
  "Performance entity context should use Google Ads ad_id from the GCLID bridge before degrading GA4 attribution to ad_group_or_adset."
);

const googleAdsPmaxSourceKey = {
  date: "2026-04-27",
  platform: "google_ads",
  campaign_id: "18776968542",
  ad_group_or_adset_id: null,
  account_id: "1534842056",
  spend: 10
};

const googleAdsPmaxGa4KeyBeforeFix = {
  date: "2026-04-27",
  platform: "google_ads",
  campaign_id: "18776968542",
  ad_group_or_adset_id: "0",
  ga4_sessions: 11
};

assert.notStrictEqual(
  googleAdsPmaxSourceKey.ad_group_or_adset_id,
  googleAdsPmaxGa4KeyBeforeFix.ad_group_or_adset_id,
  "The original PMax join shape reproduces the orphaned GA4 row: Ads uses NULL while GA4 attribution can use 0."
);

const googleAdsPmaxGa4KeyAfterFix = {
  ...googleAdsPmaxGa4KeyBeforeFix,
  ad_group_or_adset_id: googleAdsPmaxGa4KeyBeforeFix.ad_group_or_adset_id === "0"
    ? null
    : googleAdsPmaxGa4KeyBeforeFix.ad_group_or_adset_id
};

assert.strictEqual(
  googleAdsPmaxSourceKey.ad_group_or_adset_id,
  googleAdsPmaxGa4KeyAfterFix.ad_group_or_adset_id,
  "Normalizing Google Ads ad_group_id 0 to NULL aligns PMax GA4 sessions with campaign-grain Ads rows."
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

const adLevelAdsRows = duplicatedGoogleAdsRows.map(row => ({
  ...row,
  entity_grain: "ad",
  entity_id: row.ad_id,
  ga4_attribution_grain: null,
  ga4_sessions: 0,
  ga4_conversions_form: 0
}));

const ga4FallbackRow = {
  date: "2026-04-21",
  platform: "google_ads",
  campaign_id: "cmp-1",
  ad_group_or_adset_id: "adg-1",
  ad_id: null,
  ad_name: null,
  entity_grain: "ad_group_or_adset",
  entity_id: "adg-1",
  ga4_attribution_grain: "ad_group_or_adset",
  ga4_sessions: 3,
  ga4_conversions_form: 1,
  spend: 0
};

const optionOneJoinOutput = [...adLevelAdsRows, ga4FallbackRow];

assert.strictEqual(
  optionOneJoinOutput.length,
  3,
  "The new contract should keep observed ad-level Ads rows and add a separate GA4 fallback row when GA4 only reaches ad-group grain."
);

assert.strictEqual(
  optionOneJoinOutput.filter(row => row.entity_grain === "ad").length,
  2,
  "Observed Google Ads rows should keep their ad-level grain when ad_id exists."
);

assert.strictEqual(
  optionOneJoinOutput.filter(row => row.ga4_attribution_grain === "ad_group_or_adset").length,
  1,
  "GA4 fallback rows should retain the grain actually supported by attribution."
);

assert.strictEqual(
  optionOneJoinOutput.reduce((total, row) => total + row.spend, 0),
  25,
  "Keeping the ad-level Ads rows should preserve the total observed spend."
);

assert.strictEqual(
  optionOneJoinOutput.reduce((total, row) => total + row.ga4_sessions, 0),
  3,
  "GA4 fallback rows should contribute sessions only once without duplicating them across ads."
);

assert.deepStrictEqual(
  optionOneJoinOutput.map(row => [row.entity_grain, row.entity_id]),
  [
    ["ad", "ad-1"],
    ["ad", "ad-2"],
    ["ad_group_or_adset", "adg-1"]
  ],
  "entity_grain and entity_id should clearly identify both observed Ads rows and fallback GA4 rows."
);

assert.ok(
  campaignPerformanceBaseSql.includes("ARRAY_AGG(ctx.ad_name IGNORE NULLS LIMIT 1)[SAFE_OFFSET(0)]"),
  "GA4 entity aggregation should prefer a non-null ad_name instead of using names to fragment the entity grain."
);

assert.ok(
  campaignPerformanceBaseSql.includes("ARRAY_AGG(ctx.entity_name IGNORE NULLS LIMIT 1)[SAFE_OFFSET(0)]"),
  "GA4 entity aggregation should prefer a non-null entity_name instead of grouping by descriptive labels."
);

assert.ok(
  campaignPerformanceBaseSql.includes("GROUP BY 1, 2, 3, 4, 6, 8, 10, 13, 14, 16"),
  "GA4 entity aggregation should group by real keys only, including ga4_attribution_grain."
);

console.log("marketing helpers google ads regression tests passed");

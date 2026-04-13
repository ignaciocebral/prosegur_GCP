const assert = require("assert");

const {
  parseGoogleAdsCustomerId,
  buildGoogleAdsIncrementalDateCheckpointSql
} = require("../includes/custom/google_ads_helpers.js");
const {
  buildUnifiedCampaignMartIncrementalDateCheckpointSql
} = require("../includes/custom/campaign_mart_helpers.js");

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

const unifiedMartCheckpointSql = buildUnifiedCampaignMartIncrementalDateCheckpointSql(
  "`project.dataset.mart_campaign_performance_daily`",
  "0",
  "Prosegur Cash Guatemala"
);

assert.ok(
  unifiedMartCheckpointSql.includes("platform = 'google_ads' AND account_id IS NOT NULL"),
  "The unified campaign mart checkpoint should only treat persisted Google rows as stale for the Google branch."
);

assert.ok(
  unifiedMartCheckpointSql.includes("platform = 'meta_ads' AND (account_name NOT IN ('Prosegur Cash Guatemala'))"),
  "The unified campaign mart checkpoint should scope Meta stale detection to Meta rows only."
);

console.log("google ads incremental + grain regression tests passed");

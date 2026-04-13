const assert = require("assert");

const {
  parseMetaAccountNames,
  buildMetaAccountFilterSql,
  buildMetaDisallowedAccountsSql,
  buildMetaIncrementalDateCheckpointSql
} = require("../includes/custom/meta_ads_helpers.js");

assert.deepStrictEqual(
  parseMetaAccountNames(" Prosegur Cash Guatemala | Prosegur Cash Paraguay_refresh "),
  ["Prosegur Cash Guatemala", "Prosegur Cash Paraguay_refresh"]
);

assert.strictEqual(
  buildMetaAccountFilterSql("Prosegur Cash Guatemala", "account"),
  "AND account IN ('Prosegur Cash Guatemala')"
);

assert.strictEqual(
  buildMetaDisallowedAccountsSql("Prosegur Cash Guatemala", "ad_account_name"),
  "ad_account_name NOT IN ('Prosegur Cash Guatemala')"
);

const checkpointSql = buildMetaIncrementalDateCheckpointSql(
  "`project.dataset.stg_meta_ads_ad_daily`",
  "Prosegur Cash Guatemala",
  "ad_account_name",
  "date"
);

assert.ok(
  checkpointSql.includes("ad_account_name NOT IN ('Prosegur Cash Guatemala')"),
  "Checkpoint SQL should detect stale historical rows from foreign Meta accounts."
);

assert.ok(
  checkpointSql.includes("THEN DATE('2020-01-01')"),
  "Checkpoint SQL should force a full rebuild when stale Meta accounts are detected."
);

const emptyConfigCheckpointSql = buildMetaIncrementalDateCheckpointSql(
  "`project.dataset.stg_meta_ads_ad_daily`",
  "",
  "ad_account_name",
  "date"
);

assert.ok(
  emptyConfigCheckpointSql.includes("WHERE TRUE"),
  "Checkpoint SQL should delete historical rows when the Meta account mapping is cleared."
);

console.log("meta_ads_helpers regression tests passed");

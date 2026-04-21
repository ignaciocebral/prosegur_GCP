const {
  parseGoogleAdsCustomerId,
  buildMetaDisallowedAccountsSql
} = require("./marketing_helpers.js");

function buildUnifiedCampaignMartIncrementalDateCheckpointSql(
  selfRef,
  googleAdsCustomerIdRaw,
  metaAccountNamesRaw
) {
  const googleAdsCustomerId = parseGoogleAdsCustomerId(googleAdsCustomerIdRaw);
  const googleStaleRowsPredicate = googleAdsCustomerId === 0
    ? `platform = 'google_ads' AND account_id IS NOT NULL`
    : `platform = 'google_ads' AND CAST(account_id AS INT64) != CAST(${googleAdsCustomerId} AS INT64)`;
  const metaStaleRowsPredicate = `platform = 'meta_ads' AND (${buildMetaDisallowedAccountsSql(metaAccountNamesRaw, "account_name")})`;

  return `
    SELECT
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM ${selfRef}
          WHERE ${googleStaleRowsPredicate}
        ) OR EXISTS (
          SELECT 1
          FROM ${selfRef}
          WHERE ${metaStaleRowsPredicate}
        ) THEN DATE('2020-01-01')
        ELSE COALESCE(DATE_SUB(MAX(date), INTERVAL 3 DAY), DATE('2020-01-01'))
      END
    FROM ${selfRef}
  `;
}

module.exports = {
  buildUnifiedCampaignMartIncrementalDateCheckpointSql
};

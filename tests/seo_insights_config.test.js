const assert = require("assert");

const seoInsights = require("../includes/custom/seo_insights_config");

const filterSpecsSql = seoInsights.buildFilterSpecsSql();

assert.ok(
  filterSpecsSql.includes("country_id = \\'ES\\'"),
  "Generated BigQuery string literals should escape embedded single quotes with backslashes."
);

assert.ok(
  !filterSpecsSql.includes("country_id = ''ES''"),
  "Generated BigQuery string literals must not use doubled single quotes, which BigQuery parses as adjacent strings."
);

const sourceMappingSql = seoInsights.buildSourceMappingDimSql();

assert.ok(
  sourceMappingSql.includes("AS ga4_property_id") &&
    sourceMappingSql.includes("AS google_ads_customer_id") &&
    sourceMappingSql.includes("AS meta_ads_account_names") &&
    sourceMappingSql.includes("AS search_console_dataset"),
  "The SEO source mapping dim should expose GA4, Google Ads, Meta Ads, and Search Console mapping columns."
);

assert.ok(
  sourceMappingSql.includes("'superform_outputs_286664974' AS ga4_output_dataset") &&
    sourceMappingSql.includes("'1703013237' AS google_ads_customer_id") &&
    sourceMappingSql.includes("'searchconsole_es' AS search_console_dataset"),
  "The SEO source mapping dim should map Spain output, Google Ads customer, and Search Console dataset."
);

console.log("seo insights config regression tests passed");


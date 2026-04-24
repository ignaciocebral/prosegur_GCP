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
const propertySourceMappings = seoInsights.PROPERTY_SOURCE_MAPPINGS;

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

assert.deepStrictEqual(
  {
    alemania: propertySourceMappings.superform_outputs_297318261.googleAdsCustomerId,
    mexico: propertySourceMappings.superform_outputs_297350911.googleAdsCustomerId,
    costaRica: propertySourceMappings.superform_outputs_301780572.googleAdsCustomerId,
    honduras: propertySourceMappings.superform_outputs_301773812.googleAdsCustomerId,
    guatemala: propertySourceMappings.superform_outputs_301798001.googleAdsCustomerId
  },
  {
    alemania: "9589630427",
    mexico: "4257302672",
    costaRica: "2868362260",
    honduras: null,
    guatemala: null
  },
  "Additional GA4 output datasets should carry the Google Ads customer IDs currently available in the PRO MCC transfer."
);

assert.ok(
  filterSpecsSql
    .split("\nUNION ALL\n")
    .find((row) => row.includes("'Cash PE' AS market"))
    .includes(
      "'^https?://(www\\\\.)?prosegur\\\\.com\\\\.pe/(?:(?:negocios|empresas)/soluciones-efectivo|blog/efectivo)(?:/|$)' AS gsc_url_include_regex"
    ) &&
    filterSpecsSql
      .split("\nUNION ALL\n")
      .find((row) => row.includes("'Cash PE' AS market"))
      .includes("'market_scope' AS gsc_scope_status"),
  "Cash PE should expose a market-level Search Console URL scope."
);

console.log("seo insights config regression tests passed");

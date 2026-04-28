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
    .find((row) => row.includes("'Cash CO' AS market"))
    .includes(
      "'^https?://(www\\\\.)?prosegur\\\\.com\\\\.co/(?:(?:negocios|empresas)/soluciones-efectivo|blog/efectivo)(?:/|$)' AS gsc_url_include_regex"
    ) &&
    filterSpecsSql
      .split("\nUNION ALL\n")
      .find((row) => row.includes("'Cash CO' AS market"))
      .includes("'market_scope' AS gsc_scope_status"),
  "Cash CO should expose a market-level Search Console URL scope."
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

assert.ok(
  filterSpecsSql
    .split("\nUNION ALL\n")
    .find((row) => row.includes("'Cash ES' AS market"))
    .includes(
      "'^https?://(www\\\\.)?prosegur\\\\.es/(?:(?:negocios-y-pymes|empresas)/soluciones-efectivo|blog/efectivo)(?:/|$)' AS gsc_url_include_regex"
    ) &&
    filterSpecsSql
      .split("\nUNION ALL\n")
      .find((row) => row.includes("'Cash ES' AS market"))
      .includes("'market_scope' AS gsc_scope_status"),
  "Cash ES should expose a market-level Search Console URL scope."
);

assert.ok(
  filterSpecsSql
    .split("\nUNION ALL\n")
    .find((row) => row.includes("'Cash AR' AS market"))
    .includes(
      "'^https?://(www\\\\.)?prosegur\\\\.com\\\\.ar/(?:(?:negocios-pymes|empresas-instituciones)/soluciones-efectivo|blog/efectivo)(?:/|$)' AS gsc_url_include_regex"
    ) &&
    filterSpecsSql
      .split("\nUNION ALL\n")
      .find((row) => row.includes("'Cash AR' AS market"))
      .includes("'market_scope' AS gsc_scope_status"),
  "Cash AR should expose a market-level Search Console URL scope."
);

assert.ok(
  filterSpecsSql
    .split("\nUNION ALL\n")
    .find((row) => row.includes("'Cash PT' AS market"))
    .includes(
      "'^https?://(www\\\\.)?prosegur\\\\.pt/(?:(?:pequenas-medias-empresas|grandes-empresas)/solucoes-para-numerario|blog/numerario)(?:/|$)' AS gsc_url_include_regex"
    ) &&
    filterSpecsSql
      .split("\nUNION ALL\n")
      .find((row) => row.includes("'Cash PT' AS market"))
      .includes("'market_scope' AS gsc_scope_status"),
  "Cash PT should expose a market-level Search Console URL scope."
);

assert.ok(
  filterSpecsSql
    .split("\nUNION ALL\n")
    .find((row) => row.includes("'Seg ES' AS market"))
    .includes(
      "'^https?://(www\\\\.)?prosegur\\\\.es/(?:(?:negocios-y-pymes|empresas)/seguridad(?:/delegaciones(?:/.*)?)?|blog/seguridad)(?:/|$)' AS gsc_url_include_regex"
    ) &&
    filterSpecsSql
      .split("\nUNION ALL\n")
      .find((row) => row.includes("'Seg ES' AS market"))
      .includes("'market_scope' AS gsc_scope_status"),
  "Security ES should expose a market-level Search Console URL scope."
);

assert.ok(
  filterSpecsSql
    .split("\nUNION ALL\n")
    .find((row) => row.includes("'Cash CL' AS market"))
    .includes(
      "'^https?://(www\\\\.)?prosegur\\\\.cl/(?:(?:negocios|empresas)/soluciones-efectivo|blog/efectivo)(?:/|$)' AS gsc_url_include_regex"
    ) &&
    filterSpecsSql
      .split("\nUNION ALL\n")
      .find((row) => row.includes("'Cash CL' AS market"))
      .includes("'market_scope' AS gsc_scope_status"),
  "Cash CL should expose a market-level Search Console URL scope."
);

assert.ok(
  filterSpecsSql
    .split("\nUNION ALL\n")
    .find((row) => row.includes("'Cash BR' AS market"))
    .includes(
      "'^https?://(www\\\\.)?prosegur\\\\.com\\\\.br/(?:(?:pequenos-medios-negocios|grandes-empresas)|blog/dinheiro)(?:/|$)' AS gsc_url_include_regex"
    ) &&
    filterSpecsSql
      .split("\nUNION ALL\n")
      .find((row) => row.includes("'Cash BR' AS market"))
      .includes("'market_scope' AS gsc_scope_status"),
  "Cash BR should expose a market-level Search Console URL scope."
);

assert.ok(
  filterSpecsSql
    .split("\nUNION ALL\n")
    .find((row) => row.includes("'Cash EC' AS market"))
    .includes(
      "'^https?://(www\\\\.)?prosegur\\\\.ec/(?:(?:negocios|servicios)|blog/efectivo)(?:/|$)' AS gsc_url_include_regex"
    ) &&
    filterSpecsSql
      .split("\nUNION ALL\n")
      .find((row) => row.includes("'Cash EC' AS market"))
      .includes("'market_scope' AS gsc_scope_status"),
  "Cash EC should expose a market-level Search Console URL scope."
);

assert.ok(
  filterSpecsSql
    .split("\nUNION ALL\n")
    .find((row) => row.includes("'Seg BR' AS market"))
    .includes(
      "'^https?://(www\\\\.)?segurpro\\\\.com\\\\.br/(?:(?:pequenos-medios-negocios(?:/filiais(?:/.*)?)?|grandes-negocios)|blog/seguranca)(?:/|$)' AS gsc_url_include_regex"
    ) &&
    filterSpecsSql
      .split("\nUNION ALL\n")
      .find((row) => row.includes("'Seg BR' AS market"))
      .includes("'market_scope' AS gsc_scope_status"),
  "Seg BR should expose a market-level Search Console URL scope for SegurPro."
);

const ga4DailySql = seoInsights.buildGa4DailySql();
const cashEsGa4Scope = ga4DailySql.match(/WITH qualifying_sessions_Cash_ES AS \([\s\S]*?\n  \)\n  SELECT/)[0];
const cashArGa4Scope = ga4DailySql.match(/WITH qualifying_sessions_Cash_AR AS \([\s\S]*?\n  \)\n  SELECT/)[0];
const cashCoGa4Scope = ga4DailySql.match(/WITH qualifying_sessions_Cash_CO AS \([\s\S]*?\n  \)\n  SELECT/)[0];
const cashPtGa4Scope = ga4DailySql.match(/WITH qualifying_sessions_Cash_PT AS \([\s\S]*?\n  \)\n  SELECT/)[0];
const cashClGa4Scope = ga4DailySql.match(/WITH qualifying_sessions_Cash_CL AS \([\s\S]*?\n  \)\n  SELECT/)[0];
const segEsGa4Scope = ga4DailySql.match(/WITH qualifying_sessions_Seg_ES AS \([\s\S]*?\n  \)\n  SELECT/)[0];
const segBrGa4Scope = ga4DailySql.match(/WITH qualifying_sessions_Seg_BR AS \([\s\S]*?\n  \)\n  SELECT/)[0];
const cashEcGa4Scope = ga4DailySql.match(/WITH qualifying_sessions_Cash_EC AS \([\s\S]*?\n  \)\n  SELECT/)[0];
const cashBrGa4Scope = ga4DailySql.match(/WITH qualifying_sessions_Cash_BR AS \([\s\S]*?\n  \)\n  SELECT/)[0];
const cashUyGa4Scope = ga4DailySql.match(/WITH qualifying_sessions_Cash_UY AS \([\s\S]*?\n  \)\n  SELECT/)[0];

assert.ok(
    cashEsGa4Scope.includes("event_params_custom.BusinessType") &&
    cashArGa4Scope.includes("event_params_custom.BusinessType") &&
    cashCoGa4Scope.includes("event_params_custom.BusinessType") &&
    cashPtGa4Scope.includes("event_params_custom.BusinessType") &&
    cashClGa4Scope.includes("event_params_custom.BusinessType") &&
    segEsGa4Scope.includes("event_params_custom.BusinessType") &&
    cashEcGa4Scope.includes("event_params_custom.BusinessType") &&
    cashBrGa4Scope.includes("event_params_custom.BusinessType") &&
    !cashEsGa4Scope.includes("gscUrlIncludeRegex") &&
    !cashArGa4Scope.includes("gscUrlIncludeRegex") &&
    !cashCoGa4Scope.includes("gscUrlIncludeRegex") &&
    !cashPtGa4Scope.includes("gscUrlIncludeRegex") &&
    !cashClGa4Scope.includes("gscUrlIncludeRegex") &&
    !segEsGa4Scope.includes("gscUrlIncludeRegex") &&
    !cashEcGa4Scope.includes("gscUrlIncludeRegex") &&
    !cashBrGa4Scope.includes("gscUrlIncludeRegex") &&
    !cashEsGa4Scope.includes("prosegur\\\\.es") &&
    !cashArGa4Scope.includes("prosegur\\\\.com\\\\.ar") &&
    !cashCoGa4Scope.includes("prosegur\\\\.com\\\\.co") &&
    !cashPtGa4Scope.includes("prosegur\\\\.pt") &&
    !cashClGa4Scope.includes("prosegur\\\\.cl") &&
    !segEsGa4Scope.includes("blog/seguridad") &&
    !cashEcGa4Scope.includes("prosegur\\\\.ec") &&
    !cashBrGa4Scope.includes("prosegur\\\\.com\\\\.br") &&
    !segBrGa4Scope.includes("segurpro\\\\.com"),
  "Search Console URL regexes should not replace GA4 BusinessType scoping."
);

assert.ok(
  cashUyGa4Scope.includes("event_params_custom.BusinessType") && !cashUyGa4Scope.includes("e.page.location"),
  "GA4 markets without page filters should use BusinessType scoping."
);

console.log("seo insights config regression tests passed");

# SEO Insights for Alberto

This is the repo-level guide for the `ga4_global` SEO Insights mart. It is intended as the first file Alberto or Codex should read when checking how the SEO source mapping works.

## Where the mapping table is defined

| Layer | File / object | Purpose |
| --- | --- | --- |
| Dataform table | `definitions/custom/04_seo_insights/01_config/dim_seo_insights_source_mapping.sqlx` | Materializes the mapping dimension in the current release config output dataset. |
| Mapping helper | `includes/custom/seo_insights_config.js` | Generates the SQL rows for the dimension table. |
| Market catalog | `GA4_MARKETS` in `seo_insights_config.js` | Defines one SEO market row: market, business line, country, GA4 output dataset, Search Console filters, export flag. |
| Account lookup | `PROPERTY_SOURCE_MAPPINGS` in `seo_insights_config.js` | Maps each GA4 output dataset to release config, GA4 dataset, Google Ads customer ID, and Meta Ads account names. |
| SQL generator | `buildSourceMappingDimSql()` in `seo_insights_config.js` | Loops over `GA4_MARKETS` and emits one `SELECT` row per market, joined by `UNION ALL`. |

## How the mapping is built

The table is generated from repo config, not discovered dynamically from Google Ads, Meta Ads, GA4 Admin, or Search Console APIs.

For every row in `GA4_MARKETS`, Dataform does this:

1. Reads the market fields: `market`, `businessLine`, `countryCode`, `outputDataset`, GSC include/exclude filters, and `includeInMasterExport`.
2. Uses `market.outputDataset` as the key into `PROPERTY_SOURCE_MAPPINGS`.
3. Reads static account metadata from that lookup:
   - `releaseConfigId`
   - `ga4Dataset`
   - `googleAdsCustomerId`
   - `metaAdsProject`
   - `metaAdsSource`
   - `metaAdsAccountNames`
4. Derives `ga4_property_id` from the numeric suffix of the GA4 dataset.
5. Derives Search Console dataset by convention:
   - `ES` -> `searchconsole_es.searchdata_url_impression`
   - `BR` -> `searchconsole_br.searchdata_url_impression`
   - same pattern for the other country codes.
6. Emits the final row into `dim_seo_insights_source_mapping`.

Example:

```text
GA4_MARKETS row:
  market = Cash ES
  countryCode = ES
  outputDataset = superform_outputs_286664974

PROPERTY_SOURCE_MAPPINGS[superform_outputs_286664974]:
  releaseConfigId = espana
  ga4Dataset = analytics_286664974
  googleAdsCustomerId = 1703013237
  metaAdsAccountNames = Prosegur Espana

Derived:
  ga4_property_id = 286664974
  search_console_dataset = searchconsole_es
  search_console_table = searchconsole_es.searchdata_url_impression
```

## What Alberto should edit

Alberto should normally edit only Search Console URL scope fields inside `GA4_MARKETS`:

- `gscUrlIncludeRegex`
- `gscUrlExcludeRegex`
- `gscSiteUrlInclude`

These fields control whether Search Console is scoped to a market or falls back to the full country aggregate.

Alberto should not edit without owner review:

- KPI logic
- joins between GA4, Search Console, Call Center, Sales, Google Ads, or Meta Ads
- table grain
- Dataform release configs
- BigQuery datasets or project IDs
- `PROPERTY_SOURCE_MAPPINGS`, unless the task is explicitly to correct an account mapping

## What the table tells you

The dimension table answers:

- Which GA4 property and GA4 output dataset feeds each SEO market.
- Which Google Ads customer ID is associated with that property/output dataset.
- Which Meta Ads account names are associated with that property/output dataset.
- Which Search Console dataset/table and URL filters are used.
- Whether the market is exported to the master monthly output.
- Whether the GSC scope is `market_scope` or `country_aggregate`.

## Current materialization state

As of 2026-04-24, commit `3e1f3c5` fixed the SEO Insights materialization and added `dim_seo_insights_source_mapping`.

Remote validation completed in `spring-line-421422/europe-west1/repositories/ga4_global`:

- Compiled from Git commit `3e1f3c541ec6a59355ef72b93af9c5cc27bdc7a6`.
- Targeted Dataform invocations succeeded for the 10 SEO output datasets.
- BigQuery confirmed these tables in all 10 SEO output datasets:
  - `dim_seo_insights_source_mapping`
  - `seo_insights_looker_filter_specs`
  - `seo_insights_semantic_daily`
  - `seo_insights_monthly_raw_export`

The mapping dimension has 23 market rows. GA4, Google Ads, and Search Console are populated for all 23. Meta Ads is populated where the current release-config/account mapping exists.

## How to validate after a change

Before opening or merging a PR:

```powershell
node tests/seo_insights_config.test.js
```

After merge, validate the real remote state in this order:

1. Confirm GitHub `main` contains the intended commit.
2. Compile the relevant Dataform release config.
3. Invoke only the affected SEO targets when possible.
4. Monitor the workflow invocation until it reaches `SUCCEEDED` or `FAILED`.
5. Query BigQuery to confirm the table exists in the affected output dataset.

Keep these states separate:

- GitHub `main`
- Dataform compilation result
- Dataform workflow invocation
- BigQuery materialized tables
- Dataform development workspace sync

A merge to `main` does not prove the BigQuery table already exists.

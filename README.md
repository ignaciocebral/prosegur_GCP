# prosegur_GCP

Dataform repository for Prosegur GA4, paid media, attribution, and organic SEO reporting pipelines.

This repository is the canonical local working copy for the `ga4_global` Dataform project. It contains the Dataform graph, JavaScript helpers, tests, and operating notes needed for Codex or another LLM to understand the workflow before changing it.

## Project Scope

The repo publishes analytics tables from these source families:

| Area | Main inputs | Main outputs |
| --- | --- | --- |
| GA4 core | GA4 BigQuery export datasets | `ga4_events`, `ga4_sessions`, `ga4_transactions` |
| Paid media | Google Ads transfer, Meta Ads API export, GA4 click/session data | `mart_campaign_performance_daily`, keyword and attribution marts |
| SEO Insights | GA4 organic sessions/events, Search Console, Call Center leads, sales data | `seo_insights_*` tables |

The active deployment target for the SEO Insights work is:

- GCP project: `spring-line-421422`
- BigQuery/Dataform location: `europe-west1`
- Dataform repository: `spring-line-421422/europe-west1/repositories/ga4_global`

`workflow_settings.yaml` is a public-safe template. Real runtime values are set in remote Dataform release configs through `codeCompilationConfig.vars`.

## Repo Layout

| Path | Purpose |
| --- | --- |
| `definitions/core/` | Core GA4 package definitions and assertions. |
| `definitions/custom/01_sources/` | Custom source declarations for Google Ads and Meta Ads. |
| `definitions/custom/02_intermediate/` | Source-normalized and intermediate marketing models. |
| `definitions/custom/03_outputs/` | Reporting marts outside the SEO Insights area. |
| `definitions/custom/04_seo_insights/` | SEO Insights config, intermediate tables, and outputs. |
| `includes/core/` | Core GA4 package helpers and documentation metadata. |
| `includes/custom/` | Prosegur-specific helper logic and SEO Insights market config. |
| `tests/` | Node regression tests for helper-generated SQL and mapping behavior. |
| `AGENTS.md` | Short Codex routing note for this repo. |

Do not commit `node_modules/`. Regenerate it from `package-lock.json` when local Dataform package tooling is needed.

## Layering Contract

Use these naming conventions when reading or extending the graph:

| Prefix | Layer | Rule |
| --- | --- | --- |
| `src_*` | Source-normalized layer | Clean and normalize one platform/source family. |
| `int_*` | Intermediate layer | Join, enrich, deduplicate, or prepare shared model logic. |
| `mart_*` | Reporting output | Final business-facing paid media or attribution outputs. |
| `seo_insights_*` | Organic SEO mart | Dedicated SEO Insights config, intermediate, and output tables. |

Keep heavy transformations out of final marts when an intermediate layer can own them. Do not create a new mart unless there is a real modeling gap.

## SEO Insights Workflow

SEO Insights is the organic/Search Console mart. It produces a common market-level analytical layer across GA4 organic behavior, Search Console performance, Call Center leads, and sales data.

The main files are:

| File | Purpose |
| --- | --- |
| `includes/custom/seo_insights_config.js` | Central market catalog, source mapping, filter logic, and generated SQL. |
| `definitions/custom/04_seo_insights/01_config/dim_seo_insights_source_mapping.sqlx` | Dimension table mapping markets to GA4, Google Ads, Meta Ads, and Search Console sources. |
| `definitions/custom/04_seo_insights/01_config/seo_insights_looker_filter_specs.sqlx` | Human-readable filter contract and validation status by market. |
| `definitions/custom/04_seo_insights/01_config/seo_insights_coverage_matrix.sqlx` | KPI coverage by market. |
| `definitions/custom/04_seo_insights/02_intermediate/seo_insights_ga4_daily.sqlx` | Organic GA4 sessions and lead proxies. |
| `definitions/custom/04_seo_insights/02_intermediate/seo_insights_gsc_daily.sqlx` | Search Console clicks, impressions, CTR, and position. |
| `definitions/custom/04_seo_insights/02_intermediate/seo_insights_cc_daily.sqlx` | Call Center qualified lead inputs. |
| `definitions/custom/04_seo_insights/02_intermediate/seo_insights_sales_daily.sqlx` | Sales and revenue inputs. |
| `definitions/custom/04_seo_insights/03_outputs/seo_insights_semantic_daily.sqlx` | Main daily semantic table for analysis. |
| `definitions/custom/04_seo_insights/03_outputs/seo_insights_monthly_raw_export.sqlx` | Monthly export contract for workbook delivery. |

Consumer-facing tables:

| Table | Use |
| --- | --- |
| `seo_insights_semantic_daily` | Main analytical output at daily market/KPI grain. |
| `seo_insights_monthly_raw_export` | Monthly export for the workbook contract. |
| `seo_insights_coverage_matrix` | KPI availability by market. |
| `seo_insights_looker_filter_specs` | Filter contract, notes, and GSC scope status. |
| `dim_seo_insights_source_mapping` | Mapping dimension for GA4 property/output, Google Ads customer ID, Meta Ads account names, and Search Console dataset/table. |

The intermediate `seo_insights_*_daily` tables are implementation tables, not the main consumer contract.

## Source Mapping Dimension

`dim_seo_insights_source_mapping` is generated from repo configuration, not dynamically discovered from GA4 Admin, Google Ads, Meta Ads, or Search Console APIs.

The table is built by `buildSourceMappingDimSql()` in `includes/custom/seo_insights_config.js`.

For every market in `GA4_MARKETS`, the helper:

1. Reads market fields such as `market`, `businessLine`, `countryCode`, `outputDataset`, URL filters, and `includeInMasterExport`.
2. Uses `market.outputDataset` as the key into `PROPERTY_SOURCE_MAPPINGS`.
3. Reads static source metadata from that lookup:
   - `releaseConfigId`
   - `ga4Dataset`
   - `googleAdsCustomerId`
   - `metaAdsProject`
   - `metaAdsSource`
   - `metaAdsAccountNames`
4. Derives `ga4_property_id` from the numeric suffix of the GA4 dataset.
5. Derives Search Console dataset by country convention:
   - `ES` -> `searchconsole_es.searchdata_url_impression`
   - `BR` -> `searchconsole_br.searchdata_url_impression`
   - same pattern for the other country codes.
6. Emits one SQL row per market using `UNION ALL`.

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

If an account mapping changes, update `PROPERTY_SOURCE_MAPPINGS` and validate the generated dimension. Do not update this mapping casually as part of URL-filter work.

## Alberto's URL Filter Workflow

Alberto's normal task is to refine the organic URL scope for a market so Search Console and organic page-based signals align with the business line being analyzed.

Start in:

- `includes/custom/seo_insights_config.js`

Find the relevant object inside `GA4_MARKETS`, then update only the URL-scope fields that are needed for the market.

Fields Alberto can edit:

| Field | Applies to | Meaning |
| --- | --- | --- |
| `gscUrlIncludeRegex` | Search Console URL rows | Include URLs that belong to this market. If missing, GSC falls back to country aggregate. |
| `gscUrlExcludeRegex` | Search Console URL rows | Exclude URLs that would otherwise pollute the market scope. |
| `gscSiteUrlInclude` | Search Console site property rows | Restrict to specific Search Console `site_url` values when a country has multiple site properties. |
| `pageIncludeRegex` | GA4 organic sessions/events | Include GA4 page paths for this market. Use only when the GA4 business-type filters are not sufficient. |
| `pageExcludeRegex` | GA4 organic sessions/events | Exclude GA4 page paths for this market. Use only when needed to prevent leakage. |

The market object is shared by the whole SEO Insights mart, so downstream config and output tables inherit the same market metadata. The physical filters are source-specific:

- Search Console uses `gscSiteUrlInclude`, `gscUrlIncludeRegex`, and `gscUrlExcludeRegex`.
- GA4 organic sessions/leads use `pageIncludeRegex` and `pageExcludeRegex`, plus business type, hostname, and organic channel filters.
- Call Center and sales inputs are market-scoped by their own business/country logic; they do not have URL fields.

Do not change these without owner review:

- KPI definitions
- joins between GA4, Search Console, Call Center, Sales, Google Ads, or Meta Ads
- table grain
- output table names
- datasets or project IDs
- Dataform release configs
- `PROPERTY_SOURCE_MAPPINGS`, unless the task is explicitly to correct an account mapping
- non-SEO marts

### How Alberto Should Decide a URL Regex

Use the most restrictive URL pattern that still captures the complete market.

Recommended process:

1. Identify the market and country in `GA4_MARKETS`.
2. Check `seo_insights_looker_filter_specs` for the current `gsc_scope_status`, regex values, and notes.
3. Inspect the relevant Search Console URLs in the country dataset, for example `searchconsole_es.searchdata_url_impression`.
4. Draft `gscUrlIncludeRegex` for the URLs that belong to the market.
5. Add `gscUrlExcludeRegex` only when the include regex also catches unrelated business lines.
6. Use `gscSiteUrlInclude` only when the source `site_url` itself needs restriction.
7. If GA4 organic page scope also needs correction, update `pageIncludeRegex` or `pageExcludeRegex` in the same market object.
8. Run the local SEO config test before opening a PR.

Important behavior:

- `gsc_scope_status = market_scope` means `gscUrlIncludeRegex` exists.
- `gsc_scope_status = country_aggregate` means Search Console is still rolled up by country.
- Country aggregate can duplicate the same GSC values across multiple markets in the same country until URL scope is defined.

### Alberto PR Checklist

Every PR for URL filter changes should state:

- which markets were updated
- which URL patterns were included
- which URL patterns were excluded
- whether `gscSiteUrlInclude` changed
- whether GA4 `pageIncludeRegex` or `pageExcludeRegex` changed
- what remains in `country_aggregate`
- what still needs business or Looker confirmation

## Validation

Run the focused local regression test before opening or merging a PR:

```powershell
node tests/seo_insights_config.test.js
```

For broader mapping or paid-media changes, also run:

```powershell
node tests/google_ads_incremental_and_grain.test.js
node tests/meta_ads_helpers.test.js
```

After merge, validate remote Dataform state in this order:

1. Confirm GitHub `main` contains the intended commit.
2. Compile the relevant remote Dataform release config.
3. Invoke only the affected targets when possible.
4. Monitor the workflow invocation until it reaches `SUCCEEDED` or `FAILED`.
5. Query BigQuery to confirm the expected tables were materialized in the target output dataset.

Keep these states separate:

- local repo working tree
- GitHub `main`
- Dataform compilation result
- Dataform workflow invocation
- BigQuery materialized tables
- Dataform development workspace sync

A merge to `main` does not prove the BigQuery tables already exist.

## Current SEO Insights State

As of 2026-04-24, commit `3e1f3c5` fixed SEO Insights materialization and added `dim_seo_insights_source_mapping`.

Remote validation completed in `spring-line-421422/europe-west1/repositories/ga4_global`:

- Dataform compiled from Git commit `3e1f3c541ec6a59355ef72b93af9c5cc27bdc7a6`.
- Targeted Dataform invocations succeeded for the 10 SEO output datasets.
- BigQuery confirmed these tables in all 10 SEO output datasets:
  - `dim_seo_insights_source_mapping`
  - `seo_insights_looker_filter_specs`
  - `seo_insights_semantic_daily`
  - `seo_insights_monthly_raw_export`

The source mapping dimension has 23 market rows. GA4, Google Ads, and Search Console are populated for all 23. Meta Ads is populated where the current release-config/account mapping exists.

## Access Model for Alberto

Use a dedicated read-only service account for consumption.

Minimum practical IAM:

- `roles/bigquery.jobUser` on `spring-line-421422`
- `roles/bigquery.dataViewer` only on the materialized SEO Insights tables Alberto needs

Guardrails:

- no BigQuery write access
- no Dataform admin permissions
- no permission to alter release configs
- prefer table-level grants if a dataset contains unrelated marts

## Files to Read First

When an LLM or Codex session starts on this repo, inspect these files first:

1. `AGENTS.md`
2. `README.md`
3. `includes/custom/seo_insights_config.js`
4. `definitions/custom/04_seo_insights/01_config/seo_insights_looker_filter_specs.sqlx`
5. `definitions/custom/04_seo_insights/01_config/dim_seo_insights_source_mapping.sqlx`
6. `definitions/custom/04_seo_insights/03_outputs/seo_insights_semantic_daily.sqlx`
7. `definitions/custom/04_seo_insights/03_outputs/seo_insights_monthly_raw_export.sqlx`
8. `workflow_settings.yaml`

For paid media mapping work, read `GOOGLE_ADS_MAPPING.md` and `META_ADS_MAPPING.md`.

## Non-Goals for SEO URL Filter Work

Do not use Alberto's URL-filter task to:

- redesign the mart
- change business ownership
- change dashboards
- create new marts or datasets
- alter release configs
- broaden Alberto's access beyond read-only consumption
- change Looker outside the documented filter contract

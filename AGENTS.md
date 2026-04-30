# prosegur_GCP Project Context

## Local rules

- This path is now the preferred local working copy for the `prosegur_GCP` repository.
- Treat `Programming/projects/prosegur_GCP/` as legacy fallback only.
- Keep `node_modules/` out of source control and regenerate locally when needed.
- Any workflow doc that still points to the Programming path should be updated during the cutover.
- Before branch review, merge-readiness checks, PR validation, or cleanup, fetch/prune and verify local and remote alignment. Do not infer branch status from stale local refs.
- Before deleting any branch, inspect linked worktrees and confirm whether the work is merged or superseded on the remote. Remove worktrees before deleting their linked branches.

## ga4_global / SEO Insights

- For Alberto's SEO Insights onboarding and source mapping contract, start with `README.md`.
- The mapping dimension is materialized by `definitions/custom/04_seo_insights/01_config/dim_seo_insights_source_mapping.sqlx`.
- The mapping logic lives in `includes/custom/seo_insights_config.js`, in `GA4_MARKETS`, `PROPERTY_SOURCE_MAPPINGS`, and `buildSourceMappingDimSql()`.
- For SEO Insights data-quality questions, validate the compiled Dataform SQL and live BigQuery output together. Do not treat a mart as healthy until row freshness, duplicate grain, country/property isolation, metric sanity, and upstream source coverage have all been checked.

## BigQuery / Dataform validation

- Separate structural mart checks from upstream data issues. Grain uniqueness, spend parity, and assertion output prove mart structure; GA4 export freshness, `user_pseudo_id = '0.0'`, click-mapping gaps, and attribution coverage are upstream diagnostics.
- For migration or deletion decisions, check live dependencies first: release configs, workflow schedules, recent job history, Looker Studio reads, and scheduled-query reads.
- When adding assertions, prefer project-native Dataform assertions near the affected mart and include a live query or targeted compile/run validation before declaring the fix ready.

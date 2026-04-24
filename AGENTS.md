# prosegur_GCP Project Context

## Local rules

- This path is now the preferred local working copy for the `prosegur_GCP` repository.
- Treat `Programming/projects/prosegur_GCP/` as legacy fallback only.
- Keep `node_modules/` out of source control and regenerate locally when needed.
- Any workflow doc that still points to the Programming path should be updated during the cutover.

## ga4_global / SEO Insights

- For Alberto's SEO Insights onboarding and source mapping contract, start with `SEO_INSIGHTS_ALBERTO.md`.
- The mapping dimension is materialized by `definitions/custom/04_seo_insights/01_config/dim_seo_insights_source_mapping.sqlx`.
- The mapping logic lives in `includes/custom/seo_insights_config.js`, in `GA4_MARKETS`, `PROPERTY_SOURCE_MAPPINGS`, and `buildSourceMappingDimSql()`.

# Google Ads Mapping (Public-Safe)

This repository does not publish Google Ads customer IDs or GA4 property IDs.

## How to configure in Dataform (private)

Set real values in each Dataform Release Config:

- `GA4_PROJECT`
- `GA4_DATASET`
- `OUTPUTS_DATASET`
- `TRANSFORMATIONS_DATASET`
- `QUALITY_DATASET`
- `LOCAL_TIMEZONE`
- `GOOGLE_ADS_CUSTOMER_ID`

## Country mapping logic in SQL

Country mapping for Google Ads marts is inferred from `customer_descriptive_name`.
If a customer name does not match known patterns, the value defaults to `Other`.

## Recommended internal source of truth

Keep the real customer/property mapping in a private system, for example:

1. Secret Manager (JSON mapping)
2. Internal BigQuery metadata table
3. Private internal documentation

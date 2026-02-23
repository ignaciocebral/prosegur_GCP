declare({
  database: dataform.projectConfig.vars.GA4_PROJECT,
  schema: "meta_api_insights",
  name: "ad_insights"
});

declare({
  database: dataform.projectConfig.vars.GA4_PROJECT,
  schema: "meta_api_insights",
  name: "campaign_insights"
});

declare({
  database: dataform.projectConfig.vars.GA4_PROJECT,
  schema: "meta_ads_mcc_platform",
  name: "AdAccounts"
});

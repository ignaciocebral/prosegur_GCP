const PROJECT_ID = "pga-data-b2b-marketing-dev";
const FILTERS_VERSION = "seo_insights_filters_2026_04_23_daily_gsc";
const TEMPLATE_YEAR = 2026;
const COMPARISON_YEAR = 2025;
const SOURCE_START_DATE = "2025-01-01";
const DELIVERY_MEDIUM = "Plantilla_Prosegur Datos Insights Mensuales (1).xlsx";

const DEFAULT_HOSTNAME_EXCLUDE = [
  "localhost",
  "10.0.2.15",
  "vhs-sh.kunden.wappler.systems",
  "webcorporativa-uat-es.prosegur.net",
  "webalarms-uat-pub1.proseguralarms.net"
];

const KPI_LABELS = {
  sessions: "Sesiones",
  leads: "Leads",
  qualified_leads: "Leads cualificados",
  sales: "Ventas",
  revenue: "Facturación",
  gsc_impressions: "Impresiones SERP",
  gsc_clicks: "Clicks SERP",
  gsc_sum_position: "Suma posiciones SERP"
};

const KPI_KEYS = [
  "sessions",
  "leads",
  "qualified_leads",
  "sales",
  "revenue",
  "gsc_impressions",
  "gsc_clicks",
  "gsc_sum_position"
];

const GSC_KPI_KEYS = ["gsc_impressions", "gsc_clicks", "gsc_sum_position"];

const GSC_DEFAULT_SEARCH_TYPE = "WEB";

function gscDatasetForMarket(market) {
  return `searchconsole_${market.countryCode.toLowerCase()}`;
}

function hasGscUrlScope(market) {
  return Boolean(market.gscUrlIncludeRegex);
}

function propertyIdFromOutputDataset(outputDataset) {
  const match = String(outputDataset || "").match(/(\d+)$/);
  return match ? match[1] : null;
}

const GA4_MARKETS = [
  {
    businessLine: "cash",
    countryCode: "ES",
    market: "Cash ES",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_286664974",
    timezone: "Europe/Madrid",
    dashboardName: "Organic SEO - EMEA - v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex:
      "(^cash$|cash today|logistica de valores|gestion efectivo|gestion del efectivo|banca e instituciones financieras|cajeros)",
    businessTypeExcludeRegex: "(combine|corporate|alarm|avos|rrhh|security|cipher)",
    gscUrlIncludeRegex:
      "^https?://(www\\.)?prosegur\\.es/(?:(?:negocios-y-pymes|empresas)/soluciones-efectivo|blog/efectivo)(?:/|$)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "BusinessType validated in BigQuery. Need Looker confirmation for any extra hostname or page filters.",
    businessNotes: "Cash ES is in the master export and supports the full KPI set."
  },
  {
    businessLine: "cash",
    countryCode: "BR",
    market: "Cash BR",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_297193664",
    timezone: "America/Sao_Paulo",
    dashboardName: "Organic SEO - LATAM SUR, Brasil & USA v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex:
      "(^cash$|cash today|logistica de valores|gestao de numerario|subhome|bancos|correspondente autorizado|transporte internacional|servicos|deposito diario|varejistas|cooperativas de credito|supermercados|postos de combustiveis|farmacia)",
    businessTypeExcludeRegex: "(combine|corporat|alarm|avos|rrhh|security|segurpro)",
    gscUrlIncludeRegex:
      "^https?://(www\\.)?prosegur\\.com\\.br/(?:(?:pequenos-medios-negocios|grandes-empresas)|blog/dinheiro)(?:/|$)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "BigQuery taxonomy points to cash-specific business types. Final Looker filters still need confirmation.",
    businessNotes: "Cash BR is in the master export and supports the full KPI set."
  },
  {
    businessLine: "cash",
    countryCode: "AR",
    market: "Cash AR",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_297153875",
    timezone: "America/Argentina/Buenos_Aires",
    dashboardName: "Organic SEO - LATAM SUR, Brasil & USA v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "(^cash$|cash today|logistica de valores|transporte internacional)",
    businessTypeExcludeRegex: "(combine|corporate|alarm|avos|rrhh|security|seguridad|isoc|hybrid|vigilancia|proteccion|ojo del halcon)",
    gscUrlIncludeRegex:
      "^https?://(www\\.)?prosegur\\.com\\.ar/(?:(?:negocios-pymes|empresas-instituciones)/soluciones-efectivo|blog/efectivo)(?:/|$)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "Cash AR uses a narrow cash taxonomy in GA4. Need Looker review for any extra inclusions or exclusions.",
    businessNotes: "Cash AR is in the master export and supports the full KPI set."
  },
  {
    businessLine: "cash",
    countryCode: "CO",
    market: "Cash CO",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_297326645",
    timezone: "America/Bogota",
    dashboardName: "Organic SEO - LATAM Norte - v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "(^cash$|cash today)",
    businessTypeExcludeRegex: "(combine|corporate|alarm|avos|rrhh|security|cipher)",
    gscUrlIncludeRegex:
      "^https?://(www\\.)?prosegur\\.com\\.co/(?:(?:negocios|empresas)/soluciones-efectivo|blog/efectivo)(?:/|$)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "Cash CO uses business_type in GA4. Need Looker confirmation for exact page or hostname scope.",
    businessNotes: "Cash CO is in the master export and supports the full KPI set."
  },
  {
    businessLine: "cash",
    countryCode: "PE",
    market: "Cash PE",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_297412517",
    timezone: "America/Lima",
    dashboardName: "Organic SEO - LATAM Norte - v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "(^cash$|cash today)",
    businessTypeExcludeRegex: "(combine|corporate|alarm|avos|rrhh|security|cipher)",
    gscUrlIncludeRegex:
      "^https?://(www\\.)?prosegur\\.com\\.pe/(?:(?:negocios|empresas)/soluciones-efectivo|blog/efectivo)(?:/|$)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "Cash PE can be segmented in GA4 via business_type. Need Looker confirmation for the final scope.",
    businessNotes: "Cash PE is in the master export and supports the full KPI set."
  },
  {
    businessLine: "cash",
    countryCode: "PT",
    market: "Cash PT",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_297138761",
    timezone: "Europe/Lisbon",
    dashboardName: "Organic SEO - EMEA - v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "(^cash$|cash today)",
    businessTypeExcludeRegex: "(combine|corporate|alarm|avos|rrhh|security|cipher)",
    gscUrlIncludeRegex:
      "^https?://(www\\.)?prosegur\\.pt/(?:(?:pequenas-medias-empresas|grandes-empresas)/solucoes-para-numerario|blog/numerario)(?:/|$)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "Email trail from 2026-04-10 suggests PT may still use All Traffic for some downstream KPIs. ETL defaults to organic until Looker is confirmed.",
    businessNotes: "Cash PT is in the master export and supports the full KPI set."
  },
  {
    businessLine: "cash",
    countryCode: "CL",
    market: "Cash CL",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_297349390",
    timezone: "America/Santiago",
    dashboardName: "Organic SEO - LATAM SUR, Brasil & USA v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex:
      "(^cash$|cash - pymes|cash - empresas|cash today|logistica de valores|gestion efectivo|cajeros|subhome)",
    businessTypeExcludeRegex: "(combine|corporate|alarm|avos|rrhh|security|cipher)",
    gscUrlIncludeRegex:
      "^https?://(www\\.)?prosegur\\.cl/(?:(?:negocios|empresas)/soluciones-efectivo|blog/efectivo)(?:/|$)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "Cash CL uses multiple cash-prefixed business types. Need Looker review for any additional content filters.",
    businessNotes: "Cash CL is in the master export and supports the full KPI set."
  },
  {
    businessLine: "cash",
    countryCode: "EC",
    market: "Cash EC",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_297333202",
    timezone: "America/Guayaquil",
    dashboardName: "Organic SEO - LATAM Norte - v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "(^cash$|cash today)",
    businessTypeExcludeRegex: "(combine|corporate|alarm|avos|rrhh|security|cipher)",
    gscUrlIncludeRegex:
      "^https?://(www\\.)?prosegur\\.ec/(?:(?:negocios|servicios)|blog/efectivo)(?:/|$)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "Cash EC is segmented with business_type in GA4. Exact Looker filters still need confirmation.",
    businessNotes: "Cash EC is in the master export and supports the full KPI set."
  },
  {
    businessLine: "cash",
    countryCode: "UY",
    market: "Cash UY",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_297377934",
    timezone: "America/Montevideo",
    dashboardName: "Organic SEO - LATAM SUR, Brasil & USA v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "(^cash$|cash today)",
    businessTypeExcludeRegex: "(combine|corporate|alarm|avos|rrhh|security|cipher)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "Cash UY uses business_type in GA4. Need Looker confirmation for any extra filtering.",
    businessNotes: "Cash UY is in the master export and supports the full KPI set."
  },
  {
    businessLine: "cash",
    countryCode: "PY",
    market: "Cash PY",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_297430230",
    timezone: "America/Asuncion",
    dashboardName: "Organic SEO - LATAM SUR, Brasil & USA v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "(^cash$|cash today)",
    businessTypeExcludeRegex: "(combine|corporate|alarm|avos|rrhh|security|cipher)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "Cash PY uses business_type in GA4. Need Looker confirmation for exact filters.",
    businessNotes: "Cash PY is in the master export and supports the full KPI set."
  },
  {
    businessLine: "security",
    countryCode: "ES",
    market: "Seg ES",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_286664974",
    timezone: "Europe/Madrid",
    dashboardName: "Organic SEO - EMEA - v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "^security( \\(.+\\))?$",
    businessTypeExcludeRegex: "(combine|alarm|cash|avos|rrhh|cipher)",
    gscUrlIncludeRegex:
      "^https?://(www\\.)?prosegur\\.es/(?:(?:negocios-y-pymes|empresas)/seguridad(?:/delegaciones(?:/.*)?)?|blog/seguridad)(?:/|$)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "Security ES has the full funnel. GA4 business_type is validated in BigQuery but Looker page and hostname filters still need confirmation.",
    businessNotes: "Security ES is the only security market with the full KPI set."
  },
  {
    businessLine: "security",
    countryCode: "AR",
    market: "Seg AR",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_297153875",
    timezone: "America/Argentina/Buenos_Aires",
    dashboardName: "Organic SEO - LATAM SUR, Brasil & USA v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex:
      "(^security$|seguridad|isoc|hybrid|vigilancia|proteccion contra incendios|ojo del halcon)",
    businessTypeExcludeRegex: "(combine|corporate|alarm|cash|avos|rrhh)",
    gscUrlIncludeRegex:
      "^https?://(www\\.)?prosegur\\.com\\.ar/(?:(?:negocios-pymes|empresas-instituciones)/seguridad(?:/filiales(?:/.*)?)?|blog/seguridad)(?:/|$)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "Security AR spreads over several business_type aliases in March 2026 data. Need Looker confirmation of the exact alias set.",
    businessNotes: "Security AR only supports sessions and GA4 conversion leads."
  },
  {
    businessLine: "security",
    countryCode: "BR",
    market: "Seg BR",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_297193664",
    timezone: "America/Sao_Paulo",
    dashboardName: "Organic SEO - LATAM SUR, Brasil & USA v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "(^security$|segurpro)",
    businessTypeExcludeRegex: "(combine|corporat|alarm|cash|avos|rrhh)",
    gscUrlIncludeRegex:
      "^https?://(www\\.)?segurpro\\.com\\.br/(?:(?:pequenos-medios-negocios(?:/filiais(?:/.*)?)?|grandes-negocios)|blog/seguranca)(?:/|$)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "Security BR currently relies on the SegurPro alias observed in BigQuery. This needs direct Looker validation.",
    businessNotes: "Security BR only supports sessions and GA4 conversion leads."
  },
  {
    businessLine: "security",
    countryCode: "CO",
    market: "Seg CO",
    includeInMasterExport: true,
    outputDataset: "superform_outputs_297326645",
    timezone: "America/Bogota",
    dashboardName: "Organic SEO - LATAM Norte - v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "^security$",
    businessTypeExcludeRegex: "(combine|corporate|alarm|cash|avos|rrhh|cipher)",
    gscUrlIncludeRegex:
      "^https?://(www\\.)?prosegur\\.com\\.co/(?:(?:negocios/seguridad(?:/sucursales(?:/.*)?)?|empresas/seguridad))(?:/|$)",
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes:
      "Security CO can be segmented with the exact security business_type. Need final Looker confirmation.",
    businessNotes: "Security CO only supports sessions and GA4 conversion leads."
  },
  {
    businessLine: "talent",
    countryCode: "ES",
    market: "Talento ES",
    includeInMasterExport: false,
    outputDataset: "superform_outputs_286664974",
    timezone: "Europe/Madrid",
    dashboardName: "Security - Trabaja con Nosotros v1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "^rrhh$",
    businessTypeExcludeRegex: null,
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes: "Talento is implemented for the semantic layer but not exported to the master workbook.",
    businessNotes: "Talento only supports sessions and GA4 conversion leads."
  },
  {
    businessLine: "talent",
    countryCode: "BR",
    market: "Talento BR",
    includeInMasterExport: false,
    outputDataset: "superform_outputs_297193664",
    timezone: "America/Sao_Paulo",
    dashboardName: "Security - Trabaja con Nosotros v1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "^rrhh$",
    businessTypeExcludeRegex: null,
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes: "Talento is implemented for the semantic layer but not exported to the master workbook.",
    businessNotes: "Talento only supports sessions and GA4 conversion leads."
  },
  {
    businessLine: "talent",
    countryCode: "CO",
    market: "Talento CO",
    includeInMasterExport: false,
    outputDataset: "superform_outputs_297326645",
    timezone: "America/Bogota",
    dashboardName: "Security - Trabaja con Nosotros v1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "^rrhh$",
    businessTypeExcludeRegex: null,
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes: "Talento is implemented for the semantic layer but not exported to the master workbook.",
    businessNotes: "Talento only supports sessions and GA4 conversion leads."
  },
  {
    businessLine: "talent",
    countryCode: "CL",
    market: "Talento CL",
    includeInMasterExport: false,
    outputDataset: "superform_outputs_297349390",
    timezone: "America/Santiago",
    dashboardName: "Security - Trabaja con Nosotros v1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "^rrhh$",
    businessTypeExcludeRegex: null,
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes: "Talento is implemented for the semantic layer but not exported to the master workbook.",
    businessNotes: "Talento only supports sessions and GA4 conversion leads."
  },
  {
    businessLine: "talent",
    countryCode: "PE",
    market: "Talento PE",
    includeInMasterExport: false,
    outputDataset: "superform_outputs_297412517",
    timezone: "America/Lima",
    dashboardName: "Security - Trabaja con Nosotros v1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "^rrhh$",
    businessTypeExcludeRegex: null,
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes: "Talento is implemented for the semantic layer but not exported to the master workbook.",
    businessNotes: "Talento only supports sessions and GA4 conversion leads."
  },
  {
    businessLine: "talent",
    countryCode: "PT",
    market: "Talento PT",
    includeInMasterExport: false,
    outputDataset: "superform_outputs_297138761",
    timezone: "Europe/Lisbon",
    dashboardName: "Security - Trabaja con Nosotros v1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "^rrhh$",
    businessTypeExcludeRegex: null,
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes: "Talento is implemented for the semantic layer but not exported to the master workbook.",
    businessNotes: "Talento only supports sessions and GA4 conversion leads."
  },
  {
    businessLine: "avos",
    countryCode: "ES",
    market: "Avos Tech ES",
    includeInMasterExport: false,
    outputDataset: "superform_outputs_286664974",
    timezone: "Europe/Madrid",
    dashboardName: "Organic SEO - EMEA - v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "avos",
    businessTypeExcludeRegex: null,
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes: "Avos Tech is kept in the semantic layer but excluded from the current master workbook.",
    businessNotes: "Avos Tech only supports sessions and GA4 conversion leads."
  },
  {
    businessLine: "avos",
    countryCode: "CO",
    market: "Avos Tech CO",
    includeInMasterExport: false,
    outputDataset: "superform_outputs_297326645",
    timezone: "America/Bogota",
    dashboardName: "Organic SEO - LATAM Norte - v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "avos",
    businessTypeExcludeRegex: null,
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes: "Avos Tech is kept in the semantic layer but excluded from the current master workbook.",
    businessNotes: "Avos Tech only supports sessions and GA4 conversion leads."
  },
  {
    businessLine: "avos",
    countryCode: "CL",
    market: "Avos Tech CL",
    includeInMasterExport: false,
    outputDataset: "superform_outputs_297349390",
    timezone: "America/Santiago",
    dashboardName: "Organic SEO - LATAM SUR, Brasil & USA v.1",
    trafficScope: "organic_search",
    businessTypeIncludeRegex: "avos",
    businessTypeExcludeRegex: null,
    hostnameInclude: [],
    hostnameExclude: DEFAULT_HOSTNAME_EXCLUDE,
    pageIncludeRegex: null,
    pageExcludeRegex: null,
    filterValidationStatus: "pending_looker_validation",
    validationNotes: "Avos Tech is kept in the semantic layer but excluded from the current master workbook.",
    businessNotes: "Avos Tech only supports sessions and GA4 conversion leads."
  }
];

const CC_QUALIFIED_MARKETS = [
  "Cash ES",
  "Cash BR",
  "Cash AR",
  "Cash CO",
  "Cash PE",
  "Cash PT",
  "Cash CL",
  "Cash EC",
  "Cash UY",
  "Cash PY",
  "Seg ES"
];

const SALES_SOURCE_CONFIGS = [
  {
    market: "Cash ES",
    businessLine: "cash",
    countryCode: "ES",
    sourceSystem: "sales_gold.sales_leads_cash",
    sourceTable: "`pga-data-b2b-marketing-dev.sales_gold.sales_leads_cash`",
    dateExpression: "sale_date",
    salesExpression: "COUNT(DISTINCT offer_id)",
    revenueExpression: "SUM(COALESCE(net_amount_eur, 0))",
    extraWhere:
      "country_id = 'ES' AND LOWER(COALESCE(attribution_channel, '')) = 'organic' AND LOWER(COALESCE(stage, '')) = 'ganada'",
    validationNotes:
      "Uses the gold sales_leads_cash fact filtered to ES, attribution_channel = Organic and stage = Ganada. Final Looker confirmation is still required."
  },
  {
    market: "Cash AR",
    businessLine: "cash",
    countryCode: "AR",
    sourceSystem: "sales_gold.sales_leads_cash",
    sourceTable: "`pga-data-b2b-marketing-dev.sales_gold.sales_leads_cash`",
    dateExpression: "sale_date",
    salesExpression: "COUNT(DISTINCT offer_id)",
    revenueExpression: "SUM(COALESCE(net_amount_eur, 0))",
    extraWhere:
      "country_id = 'AR' AND LOWER(COALESCE(attribution_channel, '')) = 'organic' AND LOWER(COALESCE(stage, '')) = 'ganada'",
    validationNotes:
      "Uses the gold sales_leads_cash fact filtered to AR, attribution_channel = Organic and stage = Ganada."
  },
  {
    market: "Cash BR",
    businessLine: "cash",
    countryCode: "BR",
    sourceSystem: "sales_gold.sales_leads_cash",
    sourceTable: "`pga-data-b2b-marketing-dev.sales_gold.sales_leads_cash`",
    dateExpression: "sale_date",
    salesExpression: "COUNT(DISTINCT offer_id)",
    revenueExpression: "SUM(COALESCE(net_amount_eur, 0))",
    extraWhere:
      "country_id = 'BR' AND LOWER(COALESCE(attribution_channel, '')) = 'organic' AND LOWER(COALESCE(stage, '')) = 'ganada'",
    validationNotes:
      "Uses the gold sales_leads_cash fact filtered to BR, attribution_channel = Organic and stage = Ganada."
  },
  {
    market: "Cash CL",
    businessLine: "cash",
    countryCode: "CL",
    sourceSystem: "sales_gold.sales_leads_cash",
    sourceTable: "`pga-data-b2b-marketing-dev.sales_gold.sales_leads_cash`",
    dateExpression: "sale_date",
    salesExpression: "COUNT(DISTINCT offer_id)",
    revenueExpression: "SUM(COALESCE(net_amount_eur, 0))",
    extraWhere:
      "country_id = 'CL' AND LOWER(COALESCE(attribution_channel, '')) = 'organic' AND LOWER(COALESCE(stage, '')) = 'ganada'",
    validationNotes:
      "Uses the gold sales_leads_cash fact filtered to CL, attribution_channel = Organic and stage = Ganada."
  },
  {
    market: "Cash CO",
    businessLine: "cash",
    countryCode: "CO",
    sourceSystem: "sales_gold.sales_leads_cash",
    sourceTable: "`pga-data-b2b-marketing-dev.sales_gold.sales_leads_cash`",
    dateExpression: "sale_date",
    salesExpression: "COUNT(DISTINCT offer_id)",
    revenueExpression: "SUM(COALESCE(net_amount_eur, 0))",
    extraWhere:
      "country_id = 'CO' AND LOWER(COALESCE(attribution_channel, '')) = 'organic' AND LOWER(COALESCE(stage, '')) = 'ganada'",
    validationNotes:
      "Uses the gold sales_leads_cash fact filtered to CO, attribution_channel = Organic and stage = Ganada."
  },
  {
    market: "Cash EC",
    businessLine: "cash",
    countryCode: "EC",
    sourceSystem: "sales_gold.sales_leads_cash",
    sourceTable: "`pga-data-b2b-marketing-dev.sales_gold.sales_leads_cash`",
    dateExpression: "sale_date",
    salesExpression: "COUNT(DISTINCT offer_id)",
    revenueExpression: "SUM(COALESCE(net_amount_eur, 0))",
    extraWhere:
      "country_id = 'EC' AND LOWER(COALESCE(attribution_channel, '')) = 'organic' AND LOWER(COALESCE(stage, '')) = 'ganada'",
    validationNotes:
      "Uses the gold sales_leads_cash fact filtered to EC, attribution_channel = Organic and stage = Ganada."
  },
  {
    market: "Cash PE",
    businessLine: "cash",
    countryCode: "PE",
    sourceSystem: "sales_gold.sales_leads_cash",
    sourceTable: "`pga-data-b2b-marketing-dev.sales_gold.sales_leads_cash`",
    dateExpression: "sale_date",
    salesExpression: "COUNT(DISTINCT offer_id)",
    revenueExpression: "SUM(COALESCE(net_amount_eur, 0))",
    extraWhere:
      "country_id = 'PE' AND LOWER(COALESCE(attribution_channel, '')) = 'organic' AND LOWER(COALESCE(stage, '')) = 'ganada'",
    validationNotes:
      "Uses the gold sales_leads_cash fact filtered to PE, attribution_channel = Organic and stage = Ganada."
  },
  {
    market: "Cash PT",
    businessLine: "cash",
    countryCode: "PT",
    sourceSystem: "sales_gold.sales_leads_cash",
    sourceTable: "`pga-data-b2b-marketing-dev.sales_gold.sales_leads_cash`",
    dateExpression: "sale_date",
    salesExpression: "COUNT(DISTINCT offer_id)",
    revenueExpression: "SUM(COALESCE(net_amount_eur, 0))",
    extraWhere:
      "country_id = 'PT' AND LOWER(COALESCE(attribution_channel, '')) = 'organic' AND LOWER(COALESCE(stage, '')) = 'ganada'",
    validationNotes:
      "Uses the gold sales_leads_cash fact filtered to PT, attribution_channel = Organic and stage = Ganada. Looker still needs validation because PT may be contrasted with All Traffic downstream."
  },
  {
    market: "Cash PY",
    businessLine: "cash",
    countryCode: "PY",
    sourceSystem: "sales_gold.sales_leads_cash",
    sourceTable: "`pga-data-b2b-marketing-dev.sales_gold.sales_leads_cash`",
    dateExpression: "sale_date",
    salesExpression: "COUNT(DISTINCT offer_id)",
    revenueExpression: "SUM(COALESCE(net_amount_eur, 0))",
    extraWhere:
      "country_id = 'PY' AND LOWER(COALESCE(attribution_channel, '')) = 'organic' AND LOWER(COALESCE(stage, '')) = 'ganada'",
    validationNotes:
      "Uses the gold sales_leads_cash fact filtered to PY, attribution_channel = Organic and stage = Ganada."
  },
  {
    market: "Cash UY",
    businessLine: "cash",
    countryCode: "UY",
    sourceSystem: "sales_gold.sales_leads_cash",
    sourceTable: "`pga-data-b2b-marketing-dev.sales_gold.sales_leads_cash`",
    dateExpression: "sale_date",
    salesExpression: "COUNT(DISTINCT offer_id)",
    revenueExpression: "SUM(COALESCE(net_amount_eur, 0))",
    extraWhere:
      "country_id = 'UY' AND LOWER(COALESCE(attribution_channel, '')) = 'organic' AND LOWER(COALESCE(stage, '')) = 'ganada'",
    validationNotes:
      "Uses the gold sales_leads_cash fact filtered to UY, attribution_channel = Organic and stage = Ganada."
  },
  {
    market: "Seg ES",
    businessLine: "security",
    countryCode: "ES",
    sourceSystem: "sales_gold.sales_leads_security",
    sourceTable: "`pga-data-b2b-marketing-dev.sales_gold.sales_leads_security`",
    dateExpression: "sale_date",
    salesExpression: "COUNT(DISTINCT offer_id)",
    revenueExpression: "SUM(COALESCE(net_amount_eur, 0))",
    extraWhere:
      "country_id = 'ES' AND LOWER(COALESCE(attribution_channel, '')) = 'organic' AND LOWER(COALESCE(stage, '')) = 'ganada'",
    validationNotes:
      "Uses the gold sales_leads_security fact filtered to ES, attribution_channel = Organic and stage = Ganada."
  }
];

const PROPERTY_SOURCE_MAPPINGS = {
  superform_outputs_286664974: {
    releaseConfigId: "espana",
    ga4Dataset: "analytics_286664974",
    googleAdsCustomerId: "1703013237",
    metaAdsAccountNames: "Prosegur Espa\u00f1a",
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_297138761: {
    releaseConfigId: "portugal",
    ga4Dataset: "analytics_297138761",
    googleAdsCustomerId: "8037331123",
    metaAdsAccountNames: "Prosegur Cash Portugal",
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_297153875: {
    releaseConfigId: "argentina",
    ga4Dataset: "analytics_297153875",
    googleAdsCustomerId: "4263469660",
    metaAdsAccountNames: "Prosegur Cash Argentina",
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_297193664: {
    releaseConfigId: "brasil",
    ga4Dataset: "analytics_297193664",
    googleAdsCustomerId: "9192320856",
    metaAdsAccountNames: "Prosegur Brasil",
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_297318261: {
    releaseConfigId: "alemania",
    ga4Dataset: "analytics_297318261",
    googleAdsCustomerId: "9589630427",
    metaAdsAccountNames: null,
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_297326645: {
    releaseConfigId: "colombia",
    ga4Dataset: "analytics_297326645",
    googleAdsCustomerId: "2412701548",
    metaAdsAccountNames: "Prosegur Cash Colombia",
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_297333202: {
    releaseConfigId: "ecuador",
    ga4Dataset: "analytics_297333202",
    googleAdsCustomerId: "2213354917",
    metaAdsAccountNames: "Prosegur Cash Ecuador",
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_297349390: {
    releaseConfigId: "chile",
    ga4Dataset: "analytics_297349390",
    googleAdsCustomerId: "2407906005",
    metaAdsAccountNames: "Prosegur Cash Chile",
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_297350911: {
    releaseConfigId: "mexico",
    ga4Dataset: "analytics_297350911",
    googleAdsCustomerId: "4257302672",
    metaAdsAccountNames: null,
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_297377934: {
    releaseConfigId: "uruguay",
    ga4Dataset: "analytics_297377934",
    googleAdsCustomerId: "7630556878",
    metaAdsAccountNames: "Prosegur Cash Uruguay|Prosegur Cash Uruguay_dolar|Prosegur Cash Uruguay_",
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_297412517: {
    releaseConfigId: "peru",
    ga4Dataset: "analytics_297412517",
    googleAdsCustomerId: "3987648656",
    metaAdsAccountNames: null,
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_297430230: {
    releaseConfigId: "paraguay",
    ga4Dataset: "analytics_297430230",
    googleAdsCustomerId: "9812854435",
    metaAdsAccountNames: "Prosegur Cash Paraguay|Prosegur Cash Paraguay_refresh",
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_301773812: {
    releaseConfigId: "honduras",
    ga4Dataset: "analytics_301773812",
    googleAdsCustomerId: null,
    metaAdsAccountNames: null,
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_301780572: {
    releaseConfigId: "costa_rica",
    ga4Dataset: "analytics_301780572",
    googleAdsCustomerId: "2868362260",
    metaAdsAccountNames: null,
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  },
  superform_outputs_301798001: {
    releaseConfigId: "guatemala",
    ga4Dataset: "analytics_301798001",
    googleAdsCustomerId: null,
    metaAdsAccountNames: null,
    metaAdsProject: "spring-line-421422",
    metaAdsSource: "meta_api_insights"
  }
};

function sqlString(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function sqlBool(value) {
  return value ? "TRUE" : "FALSE";
}

function sqlArray(values) {
  if (!values || values.length === 0) {
    return "CAST([] AS ARRAY<STRING>)";
  }
  return `[${values.map((value) => sqlString(value)).join(", ")}]`;
}

function escapeIdentifier(value) {
  return String(value).replace(/[^a-zA-Z0-9_]/g, "_");
}

function resolveDateLowerBoundExpression(dateLowerBoundExpression) {
  return dateLowerBoundExpression || `DATE('${SOURCE_START_DATE}')`;
}

function resolveMarkets(options = {}) {
  if (!options.outputDataset) {
    return GA4_MARKETS;
  }
  const markets = GA4_MARKETS.filter((market) => market.outputDataset === options.outputDataset);
  if (markets.length > 0) {
    return markets;
  }
  if (String(options.outputDataset).includes("example")) {
    return GA4_MARKETS;
  }
  return markets;
}

function findSalesSource(market) {
  return SALES_SOURCE_CONFIGS.find((item) => item.market === market) || null;
}

function hasQualifiedLeads(market) {
  return CC_QUALIFIED_MARKETS.includes(market.market);
}

function kpiAvailability(market, kpiKey) {
  const isCash = market.businessLine === "cash";
  const isSecurityEs = market.businessLine === "security" && market.countryCode === "ES";
  const isSecurityNonEs = market.businessLine === "security" && market.countryCode !== "ES";
  const isTalentOrAvos = ["talent", "avos"].includes(market.businessLine);

  if (kpiKey === "sessions") {
    return "available";
  }

  if (kpiKey === "leads") {
    if (isSecurityNonEs || isTalentOrAvos) {
      return "partial";
    }
    return "available";
  }

  if (kpiKey === "qualified_leads") {
    return isCash || isSecurityEs ? "available" : "not_available";
  }

  if (kpiKey === "sales" || kpiKey === "revenue") {
    return isCash || isSecurityEs ? "available" : "not_available";
  }

  if (GSC_KPI_KEYS.includes(kpiKey)) {
    return hasGscUrlScope(market) ? "available" : "partial";
  }

  return "not_available";
}

function coverageNotes(market, kpiKey) {
  if (GSC_KPI_KEYS.includes(kpiKey)) {
    if (hasGscUrlScope(market)) {
      return `Search Console scoped via gscUrlIncludeRegex on ${gscDatasetForMarket(market)}.`;
    }
    return `Search Console rolled up at country level (${gscDatasetForMarket(market)}). Same value across markets sharing this country until gscUrlIncludeRegex is provided.`;
  }

  if (["talent", "avos"].includes(market.businessLine) && !market.includeInMasterExport) {
    if (kpiKey === "sessions" || kpiKey === "leads") {
      return "Implemented for the semantic layer only. Excluded from the current master workbook.";
    }
    return "Not exported to the current master workbook.";
  }

  if (market.businessLine === "security" && market.countryCode !== "ES") {
    if (kpiKey === "leads") {
      return "GA4 conversion proxy. Full funnel metrics are not available for this market.";
    }
    if (["qualified_leads", "sales", "revenue"].includes(kpiKey)) {
      return "Security outside ES only supports sessions and GA4 conversion leads.";
    }
  }

  if (market.businessLine === "cash" && market.countryCode === "PT") {
    return "Cash PT needs explicit Looker validation because the email trail mentioned All Traffic for some downstream KPIs.";
  }

  if (market.businessLine === "security" && market.countryCode === "ES" && ["sales", "revenue"].includes(kpiKey)) {
    return "Sales and revenue use the gold security sales fact filtered to Organic + Ganada and still need final Looker validation.";
  }

  return market.businessNotes;
}

function coverageSourceSystem(market, kpiKey) {
  if (kpiKey === "sessions" || kpiKey === "leads") {
    return `ga4_outputs.${market.outputDataset}`;
  }
  if (kpiKey === "qualified_leads") {
    return market.businessLine === "security" ? "cc_gold.cc_leads_security" : "cc_gold.cc_leads_master";
  }
  if (GSC_KPI_KEYS.includes(kpiKey)) {
    return `${gscDatasetForMarket(market)}.searchdata_url_impression`;
  }
  const salesSource = findSalesSource(market.market);
  if (salesSource) {
    return salesSource.sourceSystem;
  }
  return "not_available";
}

function buildCoverageMatrixSql(options = {}) {
  const rows = [];
  for (const market of resolveMarkets(options)) {
    for (const kpiKey of KPI_KEYS) {
      rows.push(
        [
          `SELECT ${sqlString(FILTERS_VERSION)} AS filters_version`,
          `${sqlString(market.businessLine)} AS business_line`,
          `${sqlString(market.countryCode)} AS country_code`,
          `${sqlString(market.market)} AS market`,
          `${sqlString(KPI_LABELS[kpiKey])} AS kpi`,
          `${sqlString(kpiAvailability(market, kpiKey))} AS availability_status`,
          `${sqlString(coverageSourceSystem(market, kpiKey))} AS source_system`,
          `${sqlBool(market.includeInMasterExport)} AS export_to_master`,
          `${sqlString(coverageNotes(market, kpiKey))} AS notes`
        ].join(", ")
      );
    }
  }
  return rows.join("\nUNION ALL\n");
}

function buildFilterSpecsSql(options = {}) {
  const rows = resolveMarkets(options).map((market) => {
    const salesSource = findSalesSource(market.market);
    const qualifiedDefinition = hasQualifiedLeads(market)
      ? `COUNTIF(is_qualified = 1) from ${market.businessLine === "security" ? "cc_gold.cc_leads_security" : "cc_gold.cc_leads_master (final_product=CASH)"} using management_end_date and channel = organic.`
      : "Not supported for this market.";
    const salesDefinition = salesSource
      ? `Sales from ${salesSource.sourceSystem} using ${salesSource.dateExpression} with filters ${salesSource.extraWhere}.`
      : "Not supported for this market.";
    const revenueDefinition = salesSource
      ? `Revenue from ${salesSource.sourceSystem} using ${salesSource.dateExpression} with filters ${salesSource.extraWhere}.`
      : "Not supported for this market.";

    return [
      `SELECT ${sqlString(FILTERS_VERSION)} AS filters_version`,
      `${sqlString(market.market)} AS market`,
      `${sqlString(market.businessLine)} AS business_line`,
      `${sqlString(market.countryCode)} AS country_code`,
      `${sqlString(market.dashboardName)} AS dashboard_name`,
      `${sqlArray([market.countryCode])} AS included_countries`,
      `${sqlString(market.outputDataset)} AS ga4_output_dataset`,
      `${sqlString(market.timezone)} AS source_timezone`,
      `${sqlString("ga4_property_local_date / monthly date_trunc")} AS month_basis`,
      `${sqlString(market.trafficScope)} AS allowed_channel_scope`,
      `${sqlString("event_params_custom.BusinessType")} AS primary_segmentation_field`,
      `${sqlString(market.businessTypeIncludeRegex)} AS business_type_include_regex`,
      `${sqlString(market.businessTypeExcludeRegex)} AS business_type_exclude_regex`,
      `${sqlArray(market.hostnameInclude)} AS hostname_include`,
      `${sqlArray(market.hostnameExclude)} AS hostname_exclude`,
      `${sqlString(market.pageIncludeRegex)} AS page_include_regex`,
      `${sqlString(market.pageExcludeRegex)} AS page_exclude_regex`,
      `${sqlString(
        "GA4 conversions: cmb/form/c2c/generate_lead from ga4_events joined to ga4_sessions for channel scoping."
      )} AS lead_definition`,
      `${sqlString(qualifiedDefinition)} AS qualified_lead_definition`,
      `${sqlString(salesDefinition)} AS sales_definition`,
      `${sqlString(revenueDefinition)} AS revenue_definition`,
      `${sqlArray(
        [
          `ga4_outputs.${market.outputDataset}`,
          hasQualifiedLeads(market)
            ? (market.businessLine === "security" ? "cc_gold.cc_leads_security" : "cc_gold.cc_leads_master")
            : null,
          salesSource ? salesSource.sourceSystem : null,
          `${gscDatasetForMarket(market)}.searchdata_url_impression`
        ].filter(Boolean)
      )} AS source_systems`,
      `${sqlString(market.filterValidationStatus)} AS filter_validation_status`,
      `${sqlString(market.validationNotes)} AS validation_notes`,
      `${sqlString(market.businessNotes)} AS business_notes`,
      `${sqlString(DELIVERY_MEDIUM)} AS delivery_medium`,
      `${sqlBool(market.includeInMasterExport)} AS export_to_master`,
      `${sqlString(gscDatasetForMarket(market))} AS gsc_dataset`,
      `${sqlString(market.gscUrlIncludeRegex || null)} AS gsc_url_include_regex`,
      `${sqlString(market.gscUrlExcludeRegex || null)} AS gsc_url_exclude_regex`,
      `${sqlString(hasGscUrlScope(market) ? "market_scope" : "country_aggregate")} AS gsc_scope_status`
    ].join(", ");
  });

  return rows.join("\nUNION ALL\n");
}

function buildSourceMappingDimSql(options = {}) {
  const rows = resolveMarkets(options).map((market) => {
    const mapping = PROPERTY_SOURCE_MAPPINGS[market.outputDataset] || {};
    const ga4Dataset = mapping.ga4Dataset || `analytics_${propertyIdFromOutputDataset(market.outputDataset)}`;
    const ga4PropertyId = propertyIdFromOutputDataset(ga4Dataset);
    const gscDataset = gscDatasetForMarket(market);

    return [
      `SELECT ${sqlString(FILTERS_VERSION)} AS filters_version`,
      `${sqlString(market.market)} AS market`,
      `${sqlString(market.businessLine)} AS business_line`,
      `${sqlString(market.countryCode)} AS country_code`,
      `${sqlString(mapping.releaseConfigId || null)} AS release_config_id`,
      `${sqlString(PROJECT_ID)} AS ga4_project`,
      `${sqlString(ga4Dataset)} AS ga4_dataset`,
      `${sqlString(ga4PropertyId)} AS ga4_property_id`,
      `${sqlString(market.outputDataset)} AS ga4_output_dataset`,
      `${sqlString(mapping.googleAdsCustomerId || null)} AS google_ads_customer_id`,
      `${sqlString(mapping.metaAdsProject || null)} AS meta_ads_project`,
      `${sqlString(mapping.metaAdsSource || null)} AS meta_ads_source`,
      `${sqlString(mapping.metaAdsAccountNames || null)} AS meta_ads_account_names`,
      `${sqlString(PROJECT_ID)} AS search_console_project`,
      `${sqlString(gscDataset)} AS search_console_dataset`,
      `${sqlString(`${gscDataset}.searchdata_url_impression`)} AS search_console_table`,
      `${sqlArray(market.gscSiteUrlInclude || [])} AS gsc_site_url_include`,
      `${sqlString(market.gscUrlIncludeRegex || null)} AS gsc_url_include_regex`,
      `${sqlString(market.gscUrlExcludeRegex || null)} AS gsc_url_exclude_regex`,
      `${sqlString(hasGscUrlScope(market) ? "market_scope" : "country_aggregate")} AS gsc_scope_status`,
      `${sqlString(market.filterValidationStatus)} AS filter_validation_status`,
      `${sqlBool(market.includeInMasterExport)} AS export_to_master`
    ].join(", ");
  });

  return rows.join("\nUNION ALL\n");
}

function ga4BusinessFilter(alias, market) {
  const clauses = [`${alias}.session_id IS NOT NULL`];

  if (market.businessTypeIncludeRegex) {
    clauses.push(
      `REGEXP_CONTAINS(LOWER(TRIM(COALESCE(${alias}.event_params_custom.BusinessType, ''))), ${sqlString(
        market.businessTypeIncludeRegex
      )})`
    );
  }

  if (market.businessTypeExcludeRegex) {
    clauses.push(
      `NOT REGEXP_CONTAINS(LOWER(TRIM(COALESCE(${alias}.event_params_custom.BusinessType, ''))), ${sqlString(
        market.businessTypeExcludeRegex
      )})`
    );
  }

  if (market.hostnameInclude && market.hostnameInclude.length > 0) {
    clauses.push(
      `LOWER(TRIM(COALESCE(${alias}.page.hostname, ''))) IN (${market.hostnameInclude
        .map((value) => sqlString(value.toLowerCase()))
        .join(", ")})`
    );
  }

  if (market.hostnameExclude && market.hostnameExclude.length > 0) {
    clauses.push(
      `LOWER(TRIM(COALESCE(${alias}.page.hostname, ''))) NOT IN (${market.hostnameExclude
        .map((value) => sqlString(value.toLowerCase()))
        .join(", ")})`
    );
  }

  if (market.pageIncludeRegex) {
    clauses.push(
      `REGEXP_CONTAINS(LOWER(TRIM(COALESCE(${alias}.page.path, ''))), ${sqlString(market.pageIncludeRegex)})`
    );
  }

  if (market.pageExcludeRegex) {
    clauses.push(
      `NOT REGEXP_CONTAINS(LOWER(TRIM(COALESCE(${alias}.page.path, ''))), ${sqlString(market.pageExcludeRegex)})`
    );
  }

  return clauses.join("\n      AND ");
}

function ga4ChannelFilter(sessionAlias, market) {
  if (market.trafficScope === "all_traffic") {
    return "TRUE";
  }
  return `LOWER(COALESCE(${sessionAlias}.last_non_direct_traffic_source.default_channel_grouping, '')) IN ('organic search', 'organic ai')`;
}

function leadConversionCondition(alias) {
  return [
    `REGEXP_CONTAINS(LOWER(${alias}.event_name), 'cmb')`,
    `(REGEXP_CONTAINS(LOWER(${alias}.event_name), 'form') AND NOT REGEXP_CONTAINS(LOWER(${alias}.event_name), 'formulario'))`,
    `REGEXP_CONTAINS(LOWER(${alias}.event_name), 'c2c')`,
    `${alias}.event_name = 'generate_lead'`
  ].join(" OR ");
}

function buildGa4DailySql(options = {}) {
  const dateLowerBoundExpression = resolveDateLowerBoundExpression(options.dateLowerBoundExpression);
  const parts = [];

  for (const market of resolveMarkets(options)) {
    const sessionScopeName = `qualifying_sessions_${escapeIdentifier(market.market)}`;
    const baseSelect = [
      `${sqlString(FILTERS_VERSION)} AS filters_version`,
      `${sqlString(market.businessLine)} AS business_line`,
      `${sqlString(market.countryCode)} AS country_code`,
      `${sqlString(market.market)} AS market`,
      `${sqlString(`ga4_outputs.${market.outputDataset}`)} AS source_system`,
      `${sqlString(market.filterValidationStatus)} AS filter_validation_status`,
      `${sqlString(market.validationNotes)} AS notes`
    ].join(",\n    ");

    parts.push(`
SELECT * FROM (
  WITH ${sessionScopeName} AS (
    SELECT DISTINCT e.session_id
    FROM \`${PROJECT_ID}.${market.outputDataset}.ga4_events\` e
    WHERE e.event_date >= ${dateLowerBoundExpression}
      AND ${ga4BusinessFilter("e", market)}
  )
  SELECT
    s.session_date AS activity_date,
    ${baseSelect},
    ${sqlString(KPI_LABELS.sessions)} AS kpi,
    COUNT(DISTINCT s.session_id) AS metric_value,
    ${sqlString("Distinct sessions filtered by GA4 business_type and channel scope.")} AS source_detail
  FROM \`${PROJECT_ID}.${market.outputDataset}.ga4_sessions\` s
  INNER JOIN ${sessionScopeName} scope USING (session_id)
  WHERE s.session_date >= ${dateLowerBoundExpression}
    AND ${ga4ChannelFilter("s", market)}
  GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
)
`);

    parts.push(`
SELECT * FROM (
  SELECT
    e.event_date AS activity_date,
    ${baseSelect},
    ${sqlString(KPI_LABELS.leads)} AS kpi,
    COUNTIF(${leadConversionCondition("e")}) AS metric_value,
    ${sqlString("GA4 conversion proxy based on cmb/form/c2c/generate_lead and channel-scoped sessions.")} AS source_detail
  FROM \`${PROJECT_ID}.${market.outputDataset}.ga4_events\` e
  INNER JOIN \`${PROJECT_ID}.${market.outputDataset}.ga4_sessions\` s
    USING (session_id)
  WHERE e.event_date >= ${dateLowerBoundExpression}
    AND ${ga4BusinessFilter("e", market)}
    AND ${ga4ChannelFilter("s", market)}
  GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
)
`);
  }

  return parts.join("\nUNION ALL\n");
}

function buildCcDailySql(options = {}) {
  const dateLowerBoundExpression = resolveDateLowerBoundExpression(options.dateLowerBoundExpression);
  const parts = [];

  for (const market of resolveMarkets(options)) {
    if (!hasQualifiedLeads(market)) {
      continue;
    }

    const isSecurity = market.businessLine === "security";
    const sourceTableName = isSecurity ? "cc_gold.cc_leads_security" : "cc_gold.cc_leads_master";
    const productFilter = isSecurity ? "" : `\n  AND final_product = ${sqlString("CASH")}`;
    const sourceDetail = isSecurity
      ? "Qualified leads from cc_gold.cc_leads_security filtered by country and organic channel."
      : "Qualified leads from cc_gold.cc_leads_master filtered by country, final_product=CASH and organic channel.";

    parts.push(`
SELECT
  management_end_date AS activity_date,
  ${sqlString(FILTERS_VERSION)} AS filters_version,
  ${sqlString(market.businessLine)} AS business_line,
  ${sqlString(market.countryCode)} AS country_code,
  ${sqlString(market.market)} AS market,
  ${sqlString(sourceTableName)} AS source_system,
  ${sqlString("pending_looker_validation")} AS filter_validation_status,
  ${sqlString(
    market.countryCode === "PT"
      ? "Qualified leads use cc_gold organic scope. PT still needs Looker confirmation for downstream funnel alignment."
      : "Qualified leads use cc_gold organic scope and still need final Looker confirmation."
  )} AS notes,
  ${sqlString(KPI_LABELS.qualified_leads)} AS kpi,
  COUNTIF(is_qualified = 1) AS metric_value,
  ${sqlString(sourceDetail)} AS source_detail
FROM \`${PROJECT_ID}.${sourceTableName}\`
WHERE management_end_date >= ${dateLowerBoundExpression}
  AND country_id = ${sqlString(market.countryCode)}${productFilter}
  AND LOWER(COALESCE(channel, '')) = 'organic'
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
`);
  }

  if (parts.length === 0) {
    return `
SELECT
  DATE('${SOURCE_START_DATE}') AS activity_date,
  ${sqlString(FILTERS_VERSION)} AS filters_version,
  'none' AS business_line,
  'XX' AS country_code,
  'None' AS market,
  'none' AS source_system,
  'not_configured' AS filter_validation_status,
  'No CC configuration available.' AS notes,
  ${sqlString(KPI_LABELS.qualified_leads)} AS kpi,
  0 AS metric_value,
  'No source configured.' AS source_detail
WHERE FALSE
`;
  }

  return parts.join("\nUNION ALL\n");
}

function buildSalesDailySql(options = {}) {
  const dateLowerBoundExpression = resolveDateLowerBoundExpression(options.dateLowerBoundExpression);
  const parts = [];
  const allowedMarkets = new Set(resolveMarkets(options).map((market) => market.market));

  for (const source of SALES_SOURCE_CONFIGS) {
    if (!allowedMarkets.has(source.market)) {
      continue;
    }

    const commonColumns = [
      `${sqlString(FILTERS_VERSION)} AS filters_version`,
      `${sqlString(source.businessLine)} AS business_line`,
      `${sqlString(source.countryCode)} AS country_code`,
      `${sqlString(source.market)} AS market`,
      `${sqlString(source.sourceSystem)} AS source_system`,
      `${sqlString("pending_looker_validation")} AS filter_validation_status`,
      `${sqlString(source.validationNotes)} AS notes`
    ].join(",\n  ");

    parts.push(`
SELECT
  ${source.dateExpression} AS activity_date,
  ${commonColumns},
  ${sqlString(KPI_LABELS.sales)} AS kpi,
  ${source.salesExpression} AS metric_value,
  ${sqlString(`Sales derived from ${source.sourceSystem}.`)} AS source_detail
FROM ${source.sourceTable}
WHERE ${source.dateExpression} >= ${dateLowerBoundExpression}
  AND ${source.extraWhere}
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
`);

    parts.push(`
SELECT
  ${source.dateExpression} AS activity_date,
  ${commonColumns},
  ${sqlString(KPI_LABELS.revenue)} AS kpi,
  ${source.revenueExpression} AS metric_value,
  ${sqlString(`Revenue derived from ${source.sourceSystem}.`)} AS source_detail
FROM ${source.sourceTable}
WHERE ${source.dateExpression} >= ${dateLowerBoundExpression}
  AND ${source.extraWhere}
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
`);
  }

  if (parts.length === 0) {
    return `
SELECT
  DATE('${SOURCE_START_DATE}') AS activity_date,
  ${sqlString(FILTERS_VERSION)} AS filters_version,
  'none' AS business_line,
  'XX' AS country_code,
  'None' AS market,
  'none' AS source_system,
  'not_configured' AS filter_validation_status,
  'No sales source configured.' AS notes,
  ${sqlString(KPI_LABELS.sales)} AS kpi,
  0 AS metric_value,
  'No source configured.' AS source_detail
WHERE FALSE
`;
  }

  return parts.join("\nUNION ALL\n");
}

function buildGscDailySql(options = {}) {
  const dateLowerBoundExpression = resolveDateLowerBoundExpression(options.dateLowerBoundExpression);
  const parts = [];

  for (const market of resolveMarkets(options)) {
    const dataset = gscDatasetForMarket(market);
    const sourceSystem = `${dataset}.searchdata_url_impression`;
    const hasUrlScope = hasGscUrlScope(market);

    const filterClauses = [
      `data_date >= ${dateLowerBoundExpression}`,
      `search_type = ${sqlString(GSC_DEFAULT_SEARCH_TYPE)}`
    ];
    if (market.gscSiteUrlInclude && market.gscSiteUrlInclude.length > 0) {
      filterClauses.push(
        `LOWER(TRIM(COALESCE(site_url, ''))) IN (${market.gscSiteUrlInclude
          .map((value) => sqlString(value.toLowerCase()))
          .join(", ")})`
      );
    }
    if (market.gscUrlIncludeRegex) {
      filterClauses.push(
        `REGEXP_CONTAINS(LOWER(COALESCE(url, '')), ${sqlString(market.gscUrlIncludeRegex)})`
      );
    }
    if (market.gscUrlExcludeRegex) {
      filterClauses.push(
        `NOT REGEXP_CONTAINS(LOWER(COALESCE(url, '')), ${sqlString(market.gscUrlExcludeRegex)})`
      );
    }

    const validationStatus = hasUrlScope ? "pending_looker_validation" : "country_aggregate_pending_url_scope";
    const notes = hasUrlScope
      ? `Search Console scoped to ${dataset} with market-level URL regex. Awaiting Looker confirmation.`
      : `Search Console rolled up at country level (${dataset}). Same value across markets sharing this country until gscUrlIncludeRegex is provided.`;

    const commonColumns = [
      `${sqlString(FILTERS_VERSION)} AS filters_version`,
      `${sqlString(market.businessLine)} AS business_line`,
      `${sqlString(market.countryCode)} AS country_code`,
      `${sqlString(market.market)} AS market`,
      `${sqlString(sourceSystem)} AS source_system`,
      `${sqlString(validationStatus)} AS filter_validation_status`,
      `${sqlString(notes)} AS notes`
    ].join(",\n  ");

    const whereClause = filterClauses.join("\n  AND ");
    const sourceDetail = `Search Console ${GSC_DEFAULT_SEARCH_TYPE} traffic from ${sourceSystem}${hasUrlScope ? " with market URL scope" : " (country aggregate)"}.`;

    parts.push(`
SELECT
  data_date AS activity_date,
  ${commonColumns},
  ${sqlString(KPI_LABELS.gsc_impressions)} AS kpi,
  SUM(COALESCE(impressions, 0)) AS metric_value,
  ${sqlString(sourceDetail)} AS source_detail
FROM \`${PROJECT_ID}.${sourceSystem}\`
WHERE ${whereClause}
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
`);

    parts.push(`
SELECT
  data_date AS activity_date,
  ${commonColumns},
  ${sqlString(KPI_LABELS.gsc_clicks)} AS kpi,
  SUM(COALESCE(clicks, 0)) AS metric_value,
  ${sqlString(sourceDetail)} AS source_detail
FROM \`${PROJECT_ID}.${sourceSystem}\`
WHERE ${whereClause}
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
`);

    parts.push(`
SELECT
  data_date AS activity_date,
  ${commonColumns},
  ${sqlString(KPI_LABELS.gsc_sum_position)} AS kpi,
  SUM(COALESCE(sum_position, 0)) AS metric_value,
  ${sqlString(sourceDetail + " Avg position downstream = sum_position / impressions + 1.")} AS source_detail
FROM \`${PROJECT_ID}.${sourceSystem}\`
WHERE ${whereClause}
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
`);
  }

  return parts.join("\nUNION ALL\n");
}

module.exports = {
  COMPARISON_YEAR,
  DELIVERY_MEDIUM,
  FILTERS_VERSION,
  PROPERTY_SOURCE_MAPPINGS,
  SOURCE_START_DATE,
  TEMPLATE_YEAR,
  buildCcDailySql,
  buildCoverageMatrixSql,
  buildFilterSpecsSql,
  buildGa4DailySql,
  buildGscDailySql,
  buildSourceMappingDimSql,
  buildSalesDailySql
};

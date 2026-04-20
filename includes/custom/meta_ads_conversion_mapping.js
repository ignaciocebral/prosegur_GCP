const FORM_CONVERSION_NAMES = [
  "offsite_conversion.fb_pixel_custom.Form",
  "offsite_conversion.fb_pixel_custom.form",
  "offsite_conversion.fb_pixel_custom.Formulario Contacto"
];

const CRM_CONVERSION_NAMES = [
  "offsite_conversion.fb_pixel_custom.Cualificado"
];

const CONTACT_CONVERSION_NAMES = [
  "offsite_conversion.fb_pixel_custom.c2c",
  "offsite_conversion.fb_pixel_custom.click to call",
  "offsite_conversion.fb_pixel_custom.click_to_whatsapp"
];

const VISITA_CONVERSION_NAMES = [
  "offsite_conversion.fb_pixel_custom.Visita"
];

const NO_GESTIONADO_CONVERSION_NAMES = [
  "offsite_conversion.fb_pixel_custom.No Gestionado"
];

const NO_CUALIFICADO_CONVERSION_NAMES = [
  "offsite_conversion.fb_pixel_custom.No Cualificado",
  "offsite_conversion.fb_pixel_custom.Cuelga",
  "offsite_conversion.fb_pixel_custom.Telefono Erroneo",
  "offsite_conversion.fb_pixel_custom.Registro Error"
];

const CUALIFICADO_NEGATIVO_CONVERSION_NAMES = [
  "offsite_conversion.fb_pixel_custom.Cualificado Negativo",
  "offsite_conversion.fb_pixel_custom.Baja Recaudacion"
];

const META_ADS_REVIEW_CONVERSION_NAMES = [
  "offsite_conversion.fb_pixel_custom.Lead_60s/50%",   // **pendiente** review
  "CompleteRegistration"
];

const META_ADS_CONVERSION_AUDIT = [
  {
    conversion_name: "offsite_conversion.fb_pixel_custom.Form, form, Formulario Contacto",
    recommended_bucket: "form",
    scope: "ES, BR, AR, CL, CO, CRI, ECU, MEX, PE, PT, PY, UY, DE",
    reason: "Validated against GTM Meta tags/CAPI tags and raw BigQuery conversion names."
  },
  {
    conversion_name: "offsite_conversion.fb_pixel_custom.CMB/cmb",
    recommended_bucket: "call",
    scope: "ES, BR, AR, CL, CO, CRI, ECU, MEX, PE, PT, PY, UY, DE",
    reason: "Business treats CMB as callback/contact lead. GTM fires it from Te Llamamos style forms."
  },
  {
    conversion_name: "contact_total, contact_website, offsite_conversion.fb_pixel_custom.c2c, offsite_conversion.fb_pixel_custom.click to call, offsite_conversion.fb_pixel_custom.click_to_whatsapp",
    recommended_bucket: "call",
    scope: "ES, BR, AR, CL, CO, CRI, ECU, MEX, PE, PY, UY",
    reason: "Validated as direct contact intents in GTM and/or Meta live event breakdown."
  },
  {
    conversion_name: "offsite_conversion.fb_pixel_custom.Cualificado",
    recommended_bucket: "crm",
    scope: "BR, AR, CO, CRI, MEX, PE, PY",
    reason: "Qualified lead state present in raw Meta export."
  },
  {
    conversion_name: "offsite_conversion.fb_pixel_custom.Visita",
    recommended_bucket: "visita",
    scope: "BR, AR, CL, CO, CRI, MEX, PE",
    reason: "Visit-style event present in BigQuery raw conversions."
  },
  {
    conversion_name: "offsite_conversion.fb_pixel_custom.No Gestionado",
    recommended_bucket: "no_gestionado",
    scope: "BR, AR, CL, CO, CRI, MEX, PE, PY",
    reason: "Unmanaged lead outcomes that should stay separate from qualification outcomes."
  },
  {
    conversion_name: "offsite_conversion.fb_pixel_custom.No Cualificado, Cuelga, Telefono Erroneo, Registro Error",
    recommended_bucket: "no_cualificado",
    scope: "BR, AR, CL, CO, CRI, MEX, PE, PY",
    reason: "Invalid or disqualified lead outcomes that should be tracked separately from unmanaged leads."
  },
  {
    conversion_name: "offsite_conversion.fb_pixel_custom.Cualificado Negativo, Baja Recaudacion",
    recommended_bucket: "cualificado_negativo",
    scope: "BR, AR, CL, CO, CRI, MEX, PE, PY",
    reason: "Qualified-but-negative lead outcomes that should be kept apart from unmanaged and invalid leads."
  },
  {
    conversion_name: "offsite_conversion.fb_pixel_custom.Lead_60s/50%",
    recommended_bucket: "review",
    scope: "DE",
    reason: "Appears in Meta live event breakdown but was not present in BigQuery raw conversions during this audit. Left outside buckets pending business definition."
  },
  {
    conversion_name: "CompleteRegistration",
    recommended_bucket: "review",
    scope: "CO, PE live Meta events",
    reason: "Visible in live Meta API but not in the BigQuery raw conversion export used by this ETL."
  }
];

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlInList(values) {
  return values.map(sqlLiteral).join(", ");
}

function buildMetaAdsExcludedFromCoverageSql(columnName) {
  return META_ADS_REVIEW_CONVERSION_NAMES.length
    ? `${columnName} IN (${sqlInList(META_ADS_REVIEW_CONVERSION_NAMES)})`
    : "FALSE";
}

function buildMetaAdsConversionBucketSql(columnName) {
  return {
    cmb: `LOWER(${columnName}) LIKE '%cmb%'`,
    form: `${columnName} IN (${sqlInList(FORM_CONVERSION_NAMES)})`,
    crm: `${columnName} IN (${sqlInList(CRM_CONVERSION_NAMES)})`,
    contact: `${columnName} IN (${sqlInList(CONTACT_CONVERSION_NAMES)})`,
    visita: `${columnName} IN (${sqlInList(VISITA_CONVERSION_NAMES)})`,
    noGestionado: `${columnName} IN (${sqlInList(NO_GESTIONADO_CONVERSION_NAMES)})`,
    noCualificado: `${columnName} IN (${sqlInList(NO_CUALIFICADO_CONVERSION_NAMES)})`,
    cualificadoNegativo: `${columnName} IN (${sqlInList(CUALIFICADO_NEGATIVO_CONVERSION_NAMES)})`
  };
}

module.exports = {
  buildMetaAdsConversionBucketSql,
  buildMetaAdsExcludedFromCoverageSql,
  META_ADS_CONVERSION_AUDIT,
  META_ADS_REVIEW_CONVERSION_NAMES
};

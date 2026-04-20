const FORM_ACTION_NAMES = [    // los nombres del mapping salen de los nombres de las conversion actions de Google Ads que aparecen en BigQuery
  "Form",
  "Website lead",                                                //este mapping sirve para  src_google_ads_performance.sqlx
  "Env\u00edo de formulario para clientes potenciales",
  "Lead form - Submit",
  "Formularios",
  "Lead Submit",
  "Prosegur Paraguay - GA4 (web) generate_lead"
];

const CALL_ACTION_NAMES = [
  "CMB",
  "C2C",
  "Llamadas desde anuncios (GAds)",
  "Llamadas a tel\u00e9fono en sitio web (desv\u00edo de llamada)",
  "Clics en el n\u00famero de tel\u00e9fono en tu sitio web m\u00f3vi (C2C)",
  "Prosegur Paraguay - GA4 (web) c2c"
];

const NO_GESTIONADO_ACTION_NAMES = [   // estados negativos o no gestionados
  "No Cualificado",  //sacarlo en categoria nueva
  "NoUtil_formulario_02", //ya no se utiliza
  "No Gestionado_formulario"
];

const GOOGLE_ADS_IGNORED_ACTION_NAMES = [   // acciones a ignorar: no deben entrar en este ETL ni contarse como conversiones utiles
  "Conversation started",
  "Compra",
  "Purchase",
  "Checkout",
  "Inicio de la tramitacion de la compra"
];

const GOOGLE_ADS_CONVERSION_AUDIT = [     //  Esa constante sirve como **documentación estructurada** dentro del propio helper. documenta logica detras del mapping. 
  {                                        //**Pendiente a revisión**. y necesita **revisión periodica** cuando se cambie 
    action_name: "Website lead",          //nomres de conversion action en GAds, tags en GTM, nuevos paises/cuentas, criterio de negocio
    recommended_bucket: "form",
    scope: "Spain / Prosegur Marketing Corporativo",
    reason: "Official Google Ads action is a WEBPAGE submit lead. In Spain, GTM Form and CMB tags both send to this same conversion action, so SQL cannot split them."
  },
  {
    action_name: "Form, Lead form - Submit, Envio de formulario para clientes potenciales, Formularios, Lead Submit, Prosegur Paraguay - GA4 (web) generate_lead",
    recommended_bucket: "form",
    scope: "AR, BR, CL, CO, CRI, ECU, ES, PE, PT, PY, DE, Cipher BR",
    reason: "Validated as form/lead-submit style actions in Google Ads API and GTM."
  },
  {
    action_name: "CMB, C2C, Llamadas desde anuncios (GAds), Llamadas a telefono en sitio web (desvio de llamada), Clics en el numero de telefono en tu sitio web movi (C2C), Prosegur Paraguay - GA4 (web) c2c",
    recommended_bucket: "call",
    scope: "AR, BR, CL, CO, CRI, ECU, ES, PE, PT, PY, DE",
    reason: "These actions are used operationally as call/contact buckets in the ETL. Some CMB actions are form submits technically, but business currently treats them as call/contact leads."
  },
  {
    action_name: "Cualificado*, Positivo*, Formulario_04*",
    recommended_bucket: "crm",
    scope: "ES, PT, BR, CO, DE",
    reason: "Offline/imported CRM stage actions confirmed in Google Ads API."
  },
  {
    action_name: "No Cualificado, NoUtil_formulario_02, No Gestionado*",
    recommended_bucket: "no_gestionado",
    scope: "BR, CO and any account reusing the same naming",
    reason: "These names represent negative or unmanaged lead states and should not fall into crm."
  },
  {
    action_name: "Visita, CIPHER - Visita",
    recommended_bucket: "visita",
    scope: "CO, BR, Cipher",
    reason: "Validated as visit/page-view style actions."
  },
  {
    action_name: "Conversation started, Compra, Purchase, Checkout, Inicio de la tramitacion de la compra",
    recommended_bucket: "ignored",
    scope: "BR, PE historical data, Digital Gold, Change AU",
    reason: "These actions should be ignored in the lead model and excluded from the conversion mapping coverage checks."
  }
];

function sqlLiteral(value) {    //Sirve para convertir un valor JS en un literal SQL seguro.
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlInList(values) {    // Toma una lista de strings y la convierte en una lista SQL para un IN (...).
  return values.map(sqlLiteral).join(", ");
}

function buildGoogleAdsIgnoredActionSql(columnName) {
  return GOOGLE_ADS_IGNORED_ACTION_NAMES.length
    ? `${columnName} IN (${sqlInList(GOOGLE_ADS_IGNORED_ACTION_NAMES)})`
    : "FALSE";
}

function buildGoogleAdsExcludedFromCoverageSql(columnName) {  //  Construye la condición SQL que excluye nombres que no quieres que disparen la assertion de coverage
  return buildGoogleAdsIgnoredActionSql(columnName);
}

function buildGoogleAdsConversionBucketSql(columnName) {   // funcion principal, Toma el nombre de una columna SQL y devuelve un objeto con expresiones SQL para cada bucket(crm, form, call, visira, noGestionado)
  return {
    crm: [
      `REGEXP_CONTAINS(${columnName}, r'^(Cualificado|Positivo)(_|$)')`,
      `REGEXP_CONTAINS(${columnName}, r'^Formulario_04($|_)')`
    ].join(" OR "),
    form: `${columnName} IN (${sqlInList(FORM_ACTION_NAMES)})`,
    call: `${columnName} IN (${sqlInList(CALL_ACTION_NAMES)})`,
    visita: `${columnName} LIKE '%Visita%'`,
    noGestionado: [
      `${columnName} IN (${sqlInList(NO_GESTIONADO_ACTION_NAMES)})`,
      `${columnName} LIKE '%No Gestionado%'`,
      `${columnName} LIKE '%NoGestionado%'`
    ].join(" OR ")
  };
}

module.exports = {
  buildGoogleAdsConversionBucketSql,
  buildGoogleAdsIgnoredActionSql,
  buildGoogleAdsExcludedFromCoverageSql,
  GOOGLE_ADS_CONVERSION_AUDIT,
  GOOGLE_ADS_IGNORED_ACTION_NAMES
};

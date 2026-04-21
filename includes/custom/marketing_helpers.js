function buildCountryCodeFromNameSql(columnName) {
  return `
    CASE
      WHEN REGEXP_CONTAINS(LOWER(COALESCE(${columnName}, '')), r'argentin') THEN 'Argentina'
      WHEN REGEXP_CONTAINS(LOWER(COALESCE(${columnName}, '')), r'brasil|brazil') THEN 'Brasil'
      WHEN REGEXP_CONTAINS(LOWER(COALESCE(${columnName}, '')), r'colombi') THEN 'Colombia'
      WHEN REGEXP_CONTAINS(LOWER(COALESCE(${columnName}, '')), r'peru|perú') THEN 'Peru'
      WHEN REGEXP_CONTAINS(LOWER(COALESCE(${columnName}, '')), r'espana|españa|spain|corporativ') THEN 'Espana'
      WHEN REGEXP_CONTAINS(LOWER(COALESCE(${columnName}, '')), r'paraguay|paragua') THEN 'Paraguay'
      WHEN REGEXP_CONTAINS(LOWER(COALESCE(${columnName}, '')), r'chile') THEN 'Chile'
      WHEN REGEXP_CONTAINS(LOWER(COALESCE(${columnName}, '')), r'portug') THEN 'Portugal'
      WHEN REGEXP_CONTAINS(LOWER(COALESCE(${columnName}, '')), r'alemania|aleman|germany|deutschland|german') THEN 'Alemania'
      ELSE 'Other'
    END
  `;
}

function parseGoogleAdsCustomerId(rawValue) {
  const parsed = Number.parseInt(String(rawValue || "0"), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildGoogleAdsIncrementalDateCheckpointSql(
  selfRef,
  rawValue,
  customerIdColumnName = "customer_id",
  dateColumnName = "date"
) {
  const customerId = parseGoogleAdsCustomerId(rawValue);
  const staleRowsPredicate = customerId === 0
    ? `${customerIdColumnName} IS NOT NULL`
    : `CAST(${customerIdColumnName} AS INT64) != CAST(${customerId} AS INT64)`;
  return `
    SELECT
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM ${selfRef}
          WHERE ${staleRowsPredicate}
        ) THEN DATE('2020-01-01')
        ELSE COALESCE(DATE_SUB(MAX(${dateColumnName}), INTERVAL 3 DAY), DATE('2020-01-01'))
      END
    FROM ${selfRef}
  `;
}

function parseMetaAccountNames(rawValue) {
  return String(rawValue || "")
    .split("|")
    .map(name => name.trim())
    .filter(Boolean);
}

function escapeSqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildMetaInListSql(rawValue) {
  return parseMetaAccountNames(rawValue).map(escapeSqlLiteral).join(", ");
}

function buildMetaAccountFilterSql(rawValue, columnName = "account") {
  const allowedAccountsSql = buildMetaInListSql(rawValue);
  return allowedAccountsSql
    ? `AND ${columnName} IN (${allowedAccountsSql})`
    : `AND FALSE -- no Meta account configured for this release config`;
}

function buildMetaDisallowedAccountsSql(rawValue, columnName = "ad_account_name") {
  const allowedAccountsSql = buildMetaInListSql(rawValue);
  return allowedAccountsSql
    ? `${columnName} NOT IN (${allowedAccountsSql})`
    : `TRUE`;
}

function buildMetaIncrementalDateCheckpointSql(
  selfRef,
  rawValue,
  accountColumnName = "ad_account_name",
  dateColumnName = "date"
) {
  const disallowedAccountsSql = buildMetaDisallowedAccountsSql(rawValue, accountColumnName);
  return `
    SELECT
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM ${selfRef}
          WHERE ${disallowedAccountsSql}
        ) THEN DATE('2020-01-01')
        ELSE COALESCE(DATE_SUB(MAX(${dateColumnName}), INTERVAL 3 DAY), DATE('2020-01-01'))
      END
    FROM ${selfRef}
  `;
}

module.exports = {
  buildCountryCodeFromNameSql,
  parseGoogleAdsCustomerId,
  buildGoogleAdsIncrementalDateCheckpointSql,
  parseMetaAccountNames,
  buildMetaAccountFilterSql,
  buildMetaDisallowedAccountsSql,
  buildMetaIncrementalDateCheckpointSql
};

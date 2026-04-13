function parseMetaAccountNames(rawValue) {
  return String(rawValue || "")
    .split("|")
    .map(name => name.trim())
    .filter(Boolean);
}

function escapeSqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildInListSql(rawValue) {
  return parseMetaAccountNames(rawValue).map(escapeSqlLiteral).join(", ");
}

function buildMetaAccountFilterSql(rawValue, columnName = "account") {
  const allowedAccountsSql = buildInListSql(rawValue);
  return allowedAccountsSql
    ? `AND ${columnName} IN (${allowedAccountsSql})`
    : `AND FALSE -- no Meta account configured for this release config`;
}

function buildMetaDisallowedAccountsSql(rawValue, columnName = "ad_account_name") {
  const allowedAccountsSql = buildInListSql(rawValue);
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
  parseMetaAccountNames,
  buildMetaAccountFilterSql,
  buildMetaDisallowedAccountsSql,
  buildMetaIncrementalDateCheckpointSql
};

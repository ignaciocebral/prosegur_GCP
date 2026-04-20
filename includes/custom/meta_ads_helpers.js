function parseMetaAccountNames(rawValue) {  //convierte la variable de configuración de Meta en una lista usable de cuentas
  return String(rawValue || "")             //porque una release config puede traer varias cuentas Meta en una sola variable
    .split("|")
    .map(name => name.trim())
    .filter(Boolean);
}

function escapeSqlLiteral(value) {   //Sirve para proteger un valor antes de meterlo en SQL como texto.
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildInListSql(rawValue) {  // usa las dos funcioens de arriba para construir filtros IN (...) en SQL sin repetir la lógica
  return parseMetaAccountNames(rawValue).map(escapeSqlLiteral).join(", ");
}

function buildMetaAccountFilterSql(rawValue, columnName = "account") { //  Construye el filtro positivo: “solo estas cuentas Meta están permitidas”.
  const allowedAccountsSql = buildInListSql(rawValue);
  return allowedAccountsSql
    ? `AND ${columnName} IN (${allowedAccountsSql})`
    : `AND FALSE -- no Meta account configured for this release config`;
}

function buildMetaDisallowedAccountsSql(rawValue, columnName = "ad_account_name") { // detecta filas stale / históricas / incorrectas dentro de una tabla incremental ya construida
  const allowedAccountsSql = buildInListSql(rawValue);
  return allowedAccountsSql
    ? `${columnName} NOT IN (${allowedAccountsSql})`
    : `TRUE`;
}

function buildMetaIncrementalDateCheckpointSql(  //  decidir desde qué fecha recalcular una tabla incremental de Meta
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
          WHERE ${disallowedAccountsSql}   //si encuentras filas malas, fuerza rebuild completo
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

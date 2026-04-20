function countryCodeFromCustomerNameSQL(columnName) { return `
    CASE
      WHEN REGEXP_CONTAINS(LOWER(${columnName}), r'argentin') THEN 'Argentina'
      WHEN REGEXP_CONTAINS(LOWER(${columnName}), r'brasil|brazil') THEN 'Brasil'
      WHEN REGEXP_CONTAINS(LOWER(${columnName}), r'colombi') THEN 'Colombia'
      WHEN REGEXP_CONTAINS(LOWER(${columnName}), r'peru|perú') THEN 'Peru'
      WHEN REGEXP_CONTAINS(LOWER(${columnName}), r'espana|spain|corporativ') THEN 'Espana'
      WHEN REGEXP_CONTAINS(LOWER(${columnName}), r'paraguay') THEN 'Paraguay'
      WHEN REGEXP_CONTAINS(LOWER(${columnName}), r'chile') THEN 'Chile'
      WHEN REGEXP_CONTAINS(LOWER(${columnName}), r'portugal') THEN 'Portugal'
      WHEN REGEXP_CONTAINS(LOWER(${columnName}), r'alemania|germany|deutschland') THEN 'Alemania'
      ELSE 'Other'
    END
  `;
}

function parseGoogleAdsCustomerId(rawValue) {     //convierte el valor de la variable GOOGLE_ADS_CUSTOMER_ID en un número usable.
  const parsed = Number.parseInt(String(rawValue || "0"), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildGoogleAdsIncrementalDateCheckpointSql(  //construye el SQL que decide desde qué fecha volver a recalcular un incremental.
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

module.exports = {     //“expone” funciones o constantes para que otros archivos las puedan usar con require(...).
  parseGoogleAdsCustomerId,
  buildGoogleAdsIncrementalDateCheckpointSql
};

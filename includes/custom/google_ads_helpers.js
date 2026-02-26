function countryCodeFromCustomerNameSQL(columnName) {
  return `
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

module.exports = {
  countryCodeFromCustomerNameSQL
};

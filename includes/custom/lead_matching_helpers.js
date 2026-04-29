function buildCrmLeadEventPredicateSql(eventAlias = "e") {
  return `LOWER(${eventAlias}.event_name) = 'generate_lead_crm'`;
}

function buildNormalizedLeadUrlSql(urlExpression) {
  return `
    NULLIF(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              LOWER(COALESCE(REGEXP_EXTRACT(${urlExpression}, r'https?://[^\\s]+'), ${urlExpression})),
              r'^https?://',
              ''
            ),
            r'^www\\.',
            ''
          ),
          r'[?#].*$',
          ''
        ),
        r'\\.html$|/$',
        ''
      ),
      ''
    )
  `;
}

function buildCcLeadUrlScopeSql(projectId, windowDays = 30) {
  const normalizedUrlSql = buildNormalizedLeadUrlSql("url");
  return `
    SELECT DISTINCT
      ${normalizedUrlSql} AS normalized_url
    FROM \`${projectId}.cc_gold.cc_leads_master\`
    WHERE entry_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${windowDays} DAY)
      AND lead_id IS NOT NULL
      AND lead_id != ""
      AND ${normalizedUrlSql} IS NOT NULL
  `;
}

module.exports = {
  buildCrmLeadEventPredicateSql,
  buildNormalizedLeadUrlSql,
  buildCcLeadUrlScopeSql
};

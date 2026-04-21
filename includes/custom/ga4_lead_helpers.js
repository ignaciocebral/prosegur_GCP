function getLeadEventClassifier(eventAlias = "e") {
  const eventName = `${eventAlias}.event_name`;
  const lowerEventName = `LOWER(${eventName})`;

  const isCmb = `REGEXP_CONTAINS(${lowerEventName}, r'cmb')`;
  const isForm = `
    REGEXP_CONTAINS(${lowerEventName}, r'form')
    AND NOT REGEXP_CONTAINS(${lowerEventName}, r'formulario')
  `;
  const isC2c = `REGEXP_CONTAINS(${lowerEventName}, r'c2c')`;
  const isGenerateLead = `${eventName} = 'generate_lead'`;

  const leadOnlyPredicate = `
    (
      ${isCmb}
      OR (${isForm})
      OR ${isC2c}
      OR ${isGenerateLead}
    )
  `;

  const leadOrPageViewPredicate = `
    (
      (
        REGEXP_CONTAINS(${lowerEventName}, r'(page_view|cmb|form|c2c)')
        AND NOT REGEXP_CONTAINS(${lowerEventName}, r'formulario')
      )
      OR ${isGenerateLead}
    )
  `;

  return {
    isCmb,
    isForm,
    isC2c,
    isGenerateLead,
    leadOnlyPredicate,
    leadOrPageViewPredicate
  };
}

module.exports = {
  getLeadEventClassifier
};

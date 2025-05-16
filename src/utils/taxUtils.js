// src/utils/taxUtils.js
/**
 * Calculate tax based on brackets
 * @param {number} taxableIncome - Taxable income
 * @param {Array} taxBrackets - Tax brackets
 * @returns {number} - Tax amount
 */
export const calculateTaxFromBrackets = (taxableIncome, taxBrackets) => {
  if (!taxBrackets || !taxBrackets.length) return 0;
  
  // Sort brackets by lower limit
  const sortedBrackets = [...taxBrackets].sort((a, b) => a.lower_limit - b.lower_limit);
  
  // Find applicable bracket
  const applicableBracket = sortedBrackets.find(
    bracket => 
      taxableIncome >= bracket.lower_limit && 
      (bracket.upper_limit === null || taxableIncome <= bracket.upper_limit)
  );
  
  if (!applicableBracket) return 0;
  
  // Calculate tax
  const { base_amount, rate, lower_limit } = applicableBracket;
  return base_amount + (taxableIncome - lower_limit + 1) * rate;
};

/**
 * Calculate effective tax rate
 * @param {number} taxAmount - Tax amount
 * @param {number} taxableIncome - Taxable income
 * @returns {number} - Effective tax rate
 */
export const calculateEffectiveTaxRate = (taxAmount, taxableIncome) => {
  if (!taxableIncome) return 0;
  return taxAmount / taxableIncome;
};

/**
 * Calculate monthly tax from annual amount
 * @param {number} annualTax - Annual tax amount
 * @returns {number} - Monthly tax amount
 */
export const calculateMonthlyTax = (annualTax) => {
  return annualTax / 12;
};

/**
 * Calculate provisional tax payments
 * @param {number} taxAmount - Annual tax amount
 * @returns {Object} - Provisional tax payments data
 */
export const calculateProvisionalPayments = (taxAmount) => {
  if (!taxAmount) return { first: 0, second: 0 };
  
  const firstPayment = taxAmount * 0.5;
  const secondPayment = taxAmount * 0.5;
  
  // Get tax year dates
  const currentYear = new Date().getFullYear();
  
  return {
    first: {
      amount: firstPayment,
      dueDate: `${currentYear}-08-31`
    },
    second: {
      amount: secondPayment,
      dueDate: `${currentYear + 1}-02-28`
    }
  };
};
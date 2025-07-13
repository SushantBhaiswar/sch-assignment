const prService = require('../services/prService');
const ruleService = require('../services/ruleService');
const catchAsync = require('../utils/catchAsync');

/**
 * Process a Purchase Requisition (PR) with business rules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processPR = catchAsync(async (req, res) => {
  const { body } = req;

  const businessRules = await ruleService.loadBusinessRules();

  const processedPR = await prService.processPurchaseRequisition(body, businessRules);

  res.sendJSONResponse({
    code: 200,
    message: 'PR processed successfully',
    data: processedPR,
    status: true
  });
});

const getPRs = catchAsync(async (req, res) => {
  const { permissions } = req;
  const { query } = req;

  const result = await prService.getPRs(permissions, query);

  res.sendJSONResponse({
    code: 200,
    message: 'PRs retrieved successfully',
    data: result,
    status: true
  });
});

module.exports = {
  processPR,
  getPRs
}; 
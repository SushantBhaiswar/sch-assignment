
/**
 * Process a Purchase Requisition with business rules
 * @param {Object} pr - The purchase requisition object
 * @param {Object} businessRules - The business rules to apply
 * @returns {Object} The processed PR
 */
const processPurchaseRequisition = async (pr, businessRules) => {
    let processedPR = { ...pr };

    const deliveryDays = calculateDeliveryDays(pr.deliveryDate);
    processedPR.deliveryDays = deliveryDays;

    processedPR = await applyApprovalRules(processedPR, businessRules.approvalRules);

    processedPR = await applyUrgencyRules(processedPR, businessRules.approvalRules);

    processedPR.processedAt = new Date().toISOString();
    processedPR.processedBy = 'PR-processing-System';

    return processedPR;

  
};

/**
 * Calculate delivery days from delivery date
 * @param {string} deliveryDate - ISO date string
 * @returns {number} Number of days until delivery
 */
const calculateDeliveryDays = (deliveryDate) => {
  const today = new Date();
  const delivery = new Date(deliveryDate);
  const diffTime = delivery.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Apply approval rules to the PR
 * @param {Object} pr - The purchase requisition
 * @param {Array} approvalRules - Array of approval rules
 * @returns {Object} The processed PR
 */
const applyApprovalRules = async (pr, approvalRules) => {
  if (!approvalRules || !Array.isArray(approvalRules)) {
    return pr;
  }

  for (const rule of approvalRules) {
    if (rule.action === 'autoApprove') {
      const conditionMet = evaluateCondition(pr, rule.condition);
      
      if (conditionMet) {
        pr.status = rule.setStatus || 'Approved';
        pr.autoApproved = true;
        pr.approvalRule = rule.condition;
        break;
      }
    }
  }


  return pr;
};

/**
 * Apply urgency rules to the PR
 * @param {Object} pr - The purchase requisition
 * @param {Array} approvalRules - Array of approval rules (can include urgency rules)
 * @returns {Object} The processed PR
 */
const applyUrgencyRules = async (pr, approvalRules) => {
  if (!approvalRules || !Array.isArray(approvalRules)) {
    return pr;
  }

  for (const rule of approvalRules) {
    if (rule.action === 'setUrgency') {
      const conditionMet = evaluateCondition(pr, rule.condition);
      
      if (conditionMet) {
        pr.urgency = rule.urgency || 'Medium';
        pr.urgencyRule = rule.condition;
        console.log(`Set urgency to ${pr.urgency} based on rule: ${rule.condition}`);
        break; 
      }
    }
  }


  return pr;
};

/**
 * Evaluate a condition against the PR data
 * @param {Object} pr - The purchase requisition
 * @param {string} condition - The condition to evaluate
 * @returns {boolean} Whether the condition is met
 */
const evaluateCondition = (pr, condition) => {
    let evaluatedCondition = condition;
    
    evaluatedCondition = evaluatedCondition.replace(/totalAmount/g, pr.totalAmount);
    evaluatedCondition = evaluatedCondition.replace(/deliveryDays/g, pr.deliveryDays);
    
    // Handle different comparison operators
    if (evaluatedCondition.includes('<')) {
      const [left, right] = evaluatedCondition.split('<').map(s => s.trim());
      return parseFloat(left) < parseFloat(right);
    } else if (evaluatedCondition.includes('>')) {
      const [left, right] = evaluatedCondition.split('>').map(s => s.trim());
      return parseFloat(left) > parseFloat(right);
    } else if (evaluatedCondition.includes('===')) {
      const [left, right] = evaluatedCondition.split('===').map(s => s.trim());
      return left === right;
    } else if (evaluatedCondition.includes('==')) {
      const [left, right] = evaluatedCondition.split('==').map(s => s.trim());
      return left === right;
    } else if (evaluatedCondition.includes('!=')) {
      const [left, right] = evaluatedCondition.split('!=').map(s => s.trim());
      return left !== right;
    }
    
    return false;
 
};


/**
 * Get PRs with role-based filtering
 * @param {Object} permissions - User permissions
 * @param {Object} query - Query parameters (optional)
 * @returns {Object} Filtered PRs with metadata
 */
const getPRs = async (permissions, query = {}) => {
    const fs = require('fs').promises;
    const path = require('path');

    // Load PR data
    const dataPath = path.join(__dirname, '../../data/prs.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const allPRs = JSON.parse(data);

    // Validate permissions
    if (!permissions || !permissions.allowedPlants || !permissions.maxAmount) {
      throw new Error('Invalid permissions object');
    }

    const { allowedPlants, maxAmount } = permissions;
    const allowedPlantsSet = new Set(allowedPlants);

    // Apply role-based filtering first 
    let filteredPRs = allPRs.filter(pr => {
      const plantAllowed = allowedPlantsSet.has(pr.plant);
      const amountAllowed = pr.amount <= maxAmount;
      return plantAllowed && amountAllowed;
    });

    // Apply additional query filters
    if (query.plant) {
      filteredPRs = filteredPRs.filter(pr => pr.plant === query.plant);
    }

    if (query.status) {
      filteredPRs = filteredPRs.filter(pr => pr.status === query.status);
    }

    if (query.department) {
      filteredPRs = filteredPRs.filter(pr => pr.department === query.department);
    }

    if (query.minAmount !== undefined) {
      const minAmount = parseFloat(query.minAmount);
      if (!isNaN(minAmount)) {
        filteredPRs = filteredPRs.filter(pr => pr.amount >= minAmount);
      }
    }

    if (query.maxAmount !== undefined) {
      const maxAmount = parseFloat(query.maxAmount);
      if (!isNaN(maxAmount)) {
        filteredPRs = filteredPRs.filter(pr => pr.amount <= maxAmount);
      }
    }

    // Sort by creation date 
    if (filteredPRs.length > 0) {
      filteredPRs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Apply pagination
    const limit = parseInt(query.limit) || filteredPRs.length;
    const offset = parseInt(query.offset) || 0;
    const paginatedPRs = filteredPRs.slice(offset, offset + limit);

  
    return {
      prs: paginatedPRs,
      metadata: {
        total: filteredPRs.length,
        limit,
        offset,
        hasMore: offset + limit < filteredPRs.length
      }
    };

 
};

module.exports = {
  getPRs,
  processPurchaseRequisition
}; 
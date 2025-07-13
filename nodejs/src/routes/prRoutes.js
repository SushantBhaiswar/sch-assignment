const express = require('express');
const prController = require('../controllers/prController');
const validate = require('../middlewares/validate');
const { rbacMiddleware } = require('../middlewares/rbac');
const { processPRSchema,getPRsSchema } = require('../validations/prValidation');

const router = express.Router();

/**
 * POST /processPR
 * Process a Purchase Requisition (PR) with business rules
 */
router.post('/processPR', validate(processPRSchema), prController.processPR);

/**
 * GET /getPRs
 * Get PRs with role-based filtering
 */
router.get('/getPRs', rbacMiddleware, validate(getPRsSchema), prController.getPRs);


module.exports = router; 
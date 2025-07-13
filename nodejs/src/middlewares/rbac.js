const fs = require('fs').promises;
const path = require('path');
const cacheService = require('../services/cacheService');
const ApiError = require('../utils/apiError');
const httpStatus = require('http-status').default;

/**
 * RBAC middleware for role-based access control
 */
const rbacMiddleware = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-role'];

    if (!userId || !userRole) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Missing user information in headers');
    }

    req.user = {
      id: userId,
      role: userRole
    };

    // Try to get permissions from cache first
    const cacheKey = `permissions:${userRole}`;
    let permissions = await cacheService.get(cacheKey);
    console.log(permissions)

    if (!permissions) {
      const permissionsPath = path.join(__dirname, '../../config/permissions.json');
      const permissionsData = await fs.readFile(permissionsPath, 'utf8');
      const allPermissions = JSON.parse(permissionsData);

      permissions = allPermissions[userRole];
      console.log(permissions)
      if (!permissions) {
        throw new ApiError(httpStatus.FORBIDDEN, `No permissions found for role: ${userRole}`);
      }

      // Cache permissions for 1 hour
      await cacheService.set(cacheKey, permissions, 3600);
      console.log(`Cached permissions for role: ${userRole}`);
    }

    // Add permissions to request object
    req.permissions = permissions;

    // Validate access to requested resources based on query parameters
    if (req.query.plant) {
      const requestedPlant = req.query.plant;
      console.log('requestedPlant',requestedPlant)
      console.log('permissions.allowedPlants',permissions.allowedPlants.includes(requestedPlant))
      if (!permissions.allowedPlants.includes(requestedPlant)) {
        throw new ApiError(
          httpStatus.FORBIDDEN, 
          `Unauthorized access to plant: ${requestedPlant}.`
        );
      }
    }

    // Validate amount limits if specified in query
    if (req.query.maxAmount) {
      const requestedMaxAmount = parseFloat(req.query.maxAmount);
      if (!isNaN(requestedMaxAmount) && requestedMaxAmount > permissions.maxAmount) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Requested max amount ${requestedMaxAmount} exceeds user limit: ${permissions.maxAmount}`
        );
      }
    }

    console.log(`User ${userId} with role ${userRole} authenticated with permissions:`, permissions);
    next();

  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Authentication failed'));
    }
  }
};

/**
 * Export cache functions for external use
 */
const cacheFunctions = {
  /**
   * Cache permissions for a specific role
   * @param {string} role - User role
   * @param {Object} permissions - Permissions object
   * @param {number} ttl - Time to live in seconds
   */
  async cachePermissions(role, permissions, ttl = 3600) {
    const cacheKey = `permissions:${role}`;
    await cacheService.set(cacheKey, permissions, ttl);
    console.log(`Manually cached permissions for role: ${role}`);
  },

  /**
   * Get cached permissions for a role
   * @param {string} role - User role
   * @returns {Object|null} Cached permissions or null
   */
  async getCachedPermissions(role) {
    const cacheKey = `permissions:${role}`;
    return await cacheService.get(cacheKey);
  },

  /**
   * Clear cached permissions for a role
   * @param {string} role - User role
   */
  async clearCachedPermissions(role) {
    const cacheKey = `permissions:${role}`;
    await cacheService.del(cacheKey);
    console.log(`Cleared cached permissions for role: ${role}`);
  },

  
};

module.exports = {
  rbacMiddleware,
  cacheFunctions
}; 
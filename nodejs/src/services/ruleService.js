const fs = require('fs').promises;
const path = require('path');



/**
 * Load business rules from the configuration file
 * @returns {Object} The business rules object
 */
const loadBusinessRules = async () => {
    const rulesPath = path.join(__dirname, '../../config/businessRules.json');
    
    await fs.access(rulesPath);
   

    const rulesData = await fs.readFile(rulesPath, 'utf8');
    const businessRules = JSON.parse(rulesData);

    return businessRules;

};



module.exports = {
  loadBusinessRules,
}; 
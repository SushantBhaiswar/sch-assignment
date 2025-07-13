/**
 * Pick specific properties from an object
 * @param {Object} object - The source object
 * @param {string[]} keys - Array of keys to pick
 * @returns {Object} - Object with only the picked keys
 */
const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

module.exports = pick; 
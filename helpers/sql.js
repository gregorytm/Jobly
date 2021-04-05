const { BadRequestError } = require("../expressError");

/**
 * Creates the column upate protion of a SQL SET clause, and the matching values,
 * by reading the key/value pairs in the dataToUpdate param. By defualt the keys
 * in dataToUpdate will be used as the column names but the propertyToColumnNameMap
 * arg can be used to override the column name for a specific property.
 */

function sqlForPartialUpdate(dataToUpdate, propertyToColumnNameMap = {}) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (dataPropertyName, idx) =>
      `"${propertyToColumnNameMap[dataPropertyName] || dataPropertyName}"=$${
        idx + 1
      }`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

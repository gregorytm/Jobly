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

//my attempt
function createCompanyFilterSql(filters) {
  //todo:make func past tests
  const name = filters;
  console.log(name);
  if (name === undefined) {
    return "";
  }
}

//starter func code
// function createCompanyFilterSql(filters) {
//   //todo:make func past tests
//   return {
//     whereClause:
//       "WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE '%' || $3 || '%'",
//     values: [800, 900, "dav"],
//   };
// }

module.exports = { sqlForPartialUpdate, createCompanyFilterSql };

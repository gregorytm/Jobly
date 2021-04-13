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

function createCompanyFilterSql(filters = {}) {
  //todo:make func past tests
  const name = filters.name;
  const min = filters.minEmployees;
  const max = filters.maxEmployees;
  let whereClauses = [];
  let values = [];

  if (min !== undefined) {
    whereClauses.push(`num_employees >= $${values.length + 1}`);
    values.push(min);
  }
  if (max !== undefined) {
    whereClauses.push(`num_employees <= $${values.length + 1}`);
    values.push(max);
  }
  if (name !== undefined) {
    whereClauses.push(`name ILIKE '%' || $${values.length + 1} || '%'`);
    values.push(name);
  }
  return {
    whereClause:
      whereClauses.length === 0 ? "" : `WHERE ${whereClauses.join(" AND ")}`,
    values,
  };
}

function createJobsFilterSql({ title, minSalary, hasEquity }) {
  let whereClauses = [];
  let values = [];

  if (minSalary !== undefined) {
    whereClauses.push(`salary >= $${values.length + 1}`);
    values.push(minSalary);
  }
  if (hasEquity === true) {
    whereClauses.push(`equity > 0`);
  }
  if (title !== undefined) {
    whereClauses.push(`title ILIKE '%' || $${values.length + 1} || '%'`);
    values.push(title);
  }
  return {
    whereClause:
      whereClauses.length === 0 ? "" : `WHERE ${whereClauses.join(" AND ")}`,
    values,
  };
}

module.exports = {
  sqlForPartialUpdate,
  createCompanyFilterSql,
  createJobsFilterSql,
};

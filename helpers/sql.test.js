const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate, createCompanyFilterSql } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("returns the update clause and values for a simple object", function () {
    const results = sqlForPartialUpdate({ foo: 1, bar: "Hello World!!!" });
    expect(results).toMatchInlineSnapshot(`
      Object {
        "setCols": "\\"foo\\"=$1, \\"bar\\"=$2",
        "values": Array [
          1,
          "Hello World!!!",
        ],
      }
    `);
  });

  test("replaces column name with values from propertyToColumnNameMap and includes unmapped property as column names", function () {
    const results = sqlForPartialUpdate({ foo: 1, bar: 2 }, { foo: "F_oo_O" });
    expect(results).toMatchInlineSnapshot(`
      Object {
        "setCols": "\\"F_oo_O\\"=$1, \\"bar\\"=$2",
        "values": Array [
          1,
          2,
        ],
      }
    `);
  });

  test("throws an error if object is empty", function () {
    expect.assertions(2);
    try {
      sqlForPartialUpdate({});
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error).toHaveProperty("message", "No data");
    }
  });
});

describe("createCompanyFilterSql", function () {
  test("retuns empty where clause with no filters are passed", function () {
    const result = createCompanyFilterSql({});
    expect(result).toEqual({ whereClause: "", values: [] });
  });
  test("retuns where cluase when only name is passed", function () {
    const result = createCompanyFilterSql({ name: "Greg" });
    expect(result).toEqual({
      whereClause: "WHERE name ILIKE '%' || $1 || '%'",
      values: ["Greg"],
    });
  });

  test("retuns where cluase when only minEmployees is passed", function () {
    const result = createCompanyFilterSql({ minEmployees: 2 });
    expect(result).toEqual({
      whereClause: "WHERE num_empolyees >= $1",
      values: [2],
    });
  });

  test("retuns where cluase when only maxEmployees is passed", function () {
    const result = createCompanyFilterSql({ maxEmployees: 200 });
    expect(result).toEqual({
      whereClause: "WHERE num_empolyees <= $1",
      values: [200],
    });
  });

  test("retuns where cluase when minEmployees and maxEmployees are passed", function () {
    const result = createCompanyFilterSql({
      minEmployees: 2,
      maxEmployees: 200,
    });
    expect(result).toEqual({
      whereClause: "WHERE num_empolyees >= $1 AND num_employees <= $2",
      values: [2, 200],
    });
  });

  test("retuns where cluase when all filters are passed", function () {
    const result = createCompanyFilterSql({
      minEmployees: 2,
      maxEmployees: 200,
      name: "Greg",
    });
    expect(result).toEqual({
      whereClause:
        "WHERE num_empolyees >= $1 AND num_employees <= $2 AND name ILIKE '%' || $3 || '%'",
      values: [2, 200, "Greg"],
    });
  });
});

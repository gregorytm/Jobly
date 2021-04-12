const { BadRequestError } = require("../expressError");
const {
  sqlForPartialUpdate,
  createCompanyFilterSql,
  createJobsFilterSql,
} = require("./sql");

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
      whereClause: "WHERE num_employees >= $1",
      values: [2],
    });
  });

  test("retuns where cluase when only maxEmployees is passed", function () {
    const result = createCompanyFilterSql({ maxEmployees: 200 });
    expect(result).toEqual({
      whereClause: "WHERE num_employees <= $1",
      values: [200],
    });
  });

  test("retuns where cluase when minEmployees and maxEmployees are passed", function () {
    const result = createCompanyFilterSql({
      minEmployees: 2,
      maxEmployees: 200,
    });
    expect(result).toEqual({
      whereClause: "WHERE num_employees >= $1 AND num_employees <= $2",
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
        "WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE '%' || $3 || '%'",
      values: [2, 200, "Greg"],
    });
  });
});

describe("createJobsFilterSql", function () {
  test("retuns empty where clause with no filters are passed", function () {
    const result = createJobsFilterSql({});
    expect(result).toEqual({ whereClause: "", values: [] });
  });

  test("retuns where cluase when only title is passed", function () {
    const result = createJobsFilterSql({ title: "web dev" });
    expect(result).toMatchInlineSnapshot(`
      Object {
        "values": Array [
          "web dev",
        ],
        "whereClause": "WHERE title ILIKE '%' || $1 || '%'",
      }
    `);
  });

  test("retuns where cluase when only minSalary is passed", function () {
    const result = createJobsFilterSql({ minSalary: 20_000 });
    expect(result).toMatchInlineSnapshot(`
      Object {
        "values": Array [
          20000,
        ],
        "whereClause": "WHERE salary >= $1",
      }
    `);
  });

  test("retuns where cluase hasEquity is passed", function () {
    const result = createJobsFilterSql({ hasEquity: true });
    expect(result).toMatchInlineSnapshot(`
      Object {
        "values": Array [],
        "whereClause": "WHERE equity > 0",
      }
    `);
  });

  test("retuns where cluase when title and hasEquity are passed", function () {
    const result = createJobsFilterSql({
      title: "web dev",
      hasEquity: true,
    });
    expect(result).toMatchInlineSnapshot(`
      Object {
        "values": Array [
          "web dev",
        ],
        "whereClause": "WHERE equity > 0 AND title ILIKE '%' || $1 || '%'",
      }
    `);
  });

  test("retuns where cluase when all filters are passed", function () {
    const result = createJobsFilterSql({
      title: "accountant",
      minSalary: 20_000,
      hasEquity: true,
    });
    expect(result).toMatchInlineSnapshot(`
      Object {
        "values": Array [
          20000,
          "accountant",
        ],
        "whereClause": "WHERE salary >= $1 AND equity > 0 AND title ILIKE '%' || $2 || '%'",
      }
    `);
  });
});

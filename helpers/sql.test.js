const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

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

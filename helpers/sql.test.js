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

  test("replaces column name with values from propertyToColumnNameMap", function(){
    const results = sqlForPartialUpdate({ foo: 1 });
    expect(results).toEqual({"setCols": "\"foo\"=$1", "values": [1]})
  });

  test("throws an error if object is empty", function(){
    const results = sqlForPartialUpdate();
    expect(results).toThrowError(BadRequestError)
  })
});

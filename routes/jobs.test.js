const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  adminToken,
  u1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/*************************************GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          companyHandle: "c2",
          equity: "0.2",
          id: expect.any(Number),
          salary: 175000,
          title: "popcorn vendor",
        },
        {
          companyHandle: "c2",
          equity: "0.2",
          id: expect.any(Number),
          salary: 75000,
          title: "the accountant",
        },
        {
          companyHandle: "c1",
          equity: "0.2",
          id: expect.any(Number),
          salary: 75000,
          title: "web dev",
        },
      ],
    });
  });

  //is this ok to do????
  test("fails: test next() handler", async function () {
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });

  test("empty array for no matches", async function () {
    const resp = await request(app).get("/jobs/?title=nope");
    expect(resp.body).toMatchInlineSnapshot(`
      Object {
        "jobs": Array [],
      }
    `);
  });

  test("returns results for 'dev'", async function () {
    const resp = await request(app).get("/jobs/?title=dev");
    expect(resp.body).toEqual({
      jobs: [
        {
          companyHandle: "c1",
          equity: "0.2",
          id: expect.any(Number),
          salary: 75000,
          title: "web dev",
        },
      ],
    });
  });
  test("return results for 'dev' and 'equity'", async function () {
    const resp = await request(app).get("/jobs/?title=dev&hasEquity=true");
    expect(resp.body).toEqual({
      jobs: [
        {
          companyHandle: "c1",
          equity: "0.2",
          id: expect.any(Number),
          salary: 75000,
          title: "web dev",
        },
      ],
    });
  });
});

describe("POST /jobs/:companyHandle", function () {
  const newJob = {
    title: "web dev",
    salary: 70000,
    equity: 0.2,
  };
  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/jobs/c1")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        ...newJob,
        equity: "0.2",
        companyHandle: "c1",
        id: expect.any(Number),
      },
    });
  });
  test("unauthroized for users", async function () {
    const resp = await request(app)
      .post("/jobs/c1")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toMatchInlineSnapshot(`
      Object {
        "error": Object {
          "message": "Unauthorized",
          "status": 401,
        },
      }
    `);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs/c1")
      .send({
        title: "accounting",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toMatchInlineSnapshot(`
      Object {
        "error": Object {
          "message": Array [
            "instance requires property \\"salary\\"",
          ],
          "status": 400,
        },
      }
    `);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs/c1")
      .send({
        foobar: true,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toMatchInlineSnapshot(`
      Object {
        "error": Object {
          "message": Array [
            "instance additionalProperty \\"foobar\\" exists in instance when not allowed",
            "instance requires property \\"title\\"",
            "instance requires property \\"salary\\"",
          ],
          "status": 400,
        },
      }
    `);
  });

  test("requries logged in user", async function () {
    const resp = await request(app).post("/jobs/c1").send(newJob);
    expect(resp.statusCode).toEqual(401);
  });
});

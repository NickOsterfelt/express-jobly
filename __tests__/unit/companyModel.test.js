process.env.NODE_ENV = "test"

const Company = require("../../models/companies")

const db = require("../../db")

beforeEach(async () => {
    await db.query(`
        INSERT INTO companies
        (handle, name, num_employees, description, logo_url)
        VALUES
        ($1, $2, $3, $4, $5)`,
        ["test",
        "TESTCOMPANY",
        1, 
        "a test company",
        "https://test.com"]
    );
});

describe("Company.findOne(handle)", () => {
    it("should get a company", async () => {
        const result = await Company.findOne("test");
        expect(result.name).toBe("TESTCOMPANY");
        expect(result.num_employees = "1");
    });

    it("should throw an error if not found", async () => {
        try {
            const result = await Company.findOne("testestsest");
        }
        catch(e) { 
            expect(e.status).toBe(404);
        }
    });
});

// describe("Company.findAll()", () => {
//     it("should gets all companies", async() => {
//         const result = await Company.findAll();
//         expect(result.length).toBe(1);
//         expect(result[0].handle = "test");
//     });
// });

describe("Company.create(data)", () => {
    it("should create and add a new company to the database", async() => {
        const data = {
            handle: "test2",
            name: "TEST2",
            num_employees: 2,
            description: "test company 2",
            logo_url: "https://test2.company"
        }

        const result = await Company.findAll();
        expect(result.length).toBe(1);
        expect(result[0].handle = "test");
    });
});


afterEach(async () => {
    await db.query("DELETE FROM companies");
});

afterAll(async () => {
    await db.end();
});
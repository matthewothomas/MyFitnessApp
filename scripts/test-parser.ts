
import { parseBoditraxCSV } from "../src/lib/boditrax-parser";

// Mock File object
class MockFile {
    content: string;
    name: string;
    constructor(content: string, name: string) {
        this.content = content;
        this.name = name;
    }
    async text() {
        return this.content;
    }
}

const mockCSV = `
Some Header Info
...

User Scan Details

Metric, Value, Date
Weight, 80.5, 2024-01-01T10:00:00Z
Fat Mass, 15.2, 2024-01-01T10:00:00Z
Muscle Mass, 60.0, 2024-01-01T10:00:00Z
Weight, 81.0, 2024-01-08T10:00:00Z
Fat Mass, 15.0, 2024-01-08T10:00:00Z
`;

async function runTest() {
    const file = new MockFile(mockCSV, "test.csv") as any as File;
    try {
        const results = await parseBoditraxCSV(file);
        console.log("Parsed Results:", JSON.stringify(results, null, 2));

        // Assertions
        if (results.length !== 2) throw new Error("Expected 2 records (one per date)");
        if (results[0].Weight !== 80.5) throw new Error("Incorrect Weight for first record");
        if (results[1].Weight !== 81.0) throw new Error("Incorrect Weight for second record");

        console.log("TEST PASSED");
    } catch (e) {
        console.error("TEST FAILED", e);
        process.exit(1);
    }
}

runTest();

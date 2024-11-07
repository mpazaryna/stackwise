import { assertEquals, assertExists } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { exists } from "https://deno.land/std@0.210.0/fs/exists.ts";

interface TestCase {
  name: string;
  input: string;
  expectedSections: string[];
}

const testCases: TestCase[] = [
  {
    name: "python and conda setup",
    input: "python,conda",
    expectedSections: [
      "Python Base Setup",
      "Conda Environment Setup"
    ]
  },
  {
    name: "deno base setup",
    input: "deno",
    expectedSections: [
      "Deno Base Setup"
    ]
  }
];

async function cleanupFile() {
  try {
    await Deno.remove("setup-guide.md");
  } catch {
    // Ignore if file doesn't exist
  }
}

async function runMainScript(input: string): Promise<boolean> {
  const process = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-read",
      "--allow-write",
      "main.ts",
      input
    ],
  });

  const { success } = await process.output();
  return success;
}

for (const testCase of testCases) {
  Deno.test(`generates setup guide for ${testCase.name}`, async () => {
    // Clean up before test
    await cleanupFile();

    try {
      // Run the main script
      const success = await runMainScript(testCase.input);
      assertEquals(success, true);

      // Verify file exists
      const fileExists = await exists("setup-guide.md");
      assertExists(fileExists);

      // Read and verify content
      const content = await Deno.readTextFile("setup-guide.md");
      
      // Verify each expected section is present
      for (const section of testCase.expectedSections) {
        assertEquals(
          content.includes(section), 
          true, 
          `Expected to find section "${section}" in output`
        );
      }
    } finally {
      // Clean up after test
      await cleanupFile();
    }
  });
}
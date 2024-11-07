// main.ts
import { parse as yamlParse } from "https://deno.land/std@0.210.0/yaml/mod.ts";
import { walk } from "https://deno.land/std@0.210.0/fs/walk.ts";

type RuleType = 'base' | 'module' | 'composite';

interface Rule {
  id: string;
  type: RuleType;
  name: string;
  content: string;
  requires?: string[];
}

async function loadRules(): Promise<Rule[]> {
  const rules: Rule[] = [];
  const rulesDir = new URL('.', import.meta.url).pathname;

  try {
    for await (const entry of walk(rulesDir, {
      exts: ['.yaml', '.yml'],
      maxDepth: 1,
    })) {
      if (entry.isFile) {
        const content = await Deno.readTextFile(entry.path);
        try {
          const rule = yamlParse(content) as Rule;
          rules.push(rule);
        } catch (e) {
          console.error(`Error parsing ${entry.path}:`, e);
        }
      }
    }
  } catch (e) {
    console.error("Error reading rules directory:", e);
    Deno.exit(1);
  }

  return rules;
}

function findMatchingRules(rules: Rule[], keywords: string[]): Rule[] {
  const matches = new Set<Rule>();
  
  // Process each keyword
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    
    // For 'python' alone, only match base-python
    if (keywordLower === 'python' && keywords.length === 1) {
      const baseRule = rules.find(rule => rule.id === 'base-python-001');
      if (baseRule) matches.add(baseRule);
      continue;
    }
    
    // For other keywords, match exact module names
    for (const rule of rules) {
      // Extract the specific module name from the rule id
      // e.g., 'python-conda-001' -> 'conda'
      const moduleName = rule.id.split('-')[1];
      
      if (moduleName && moduleName.toLowerCase() === keywordLower) {
        matches.add(rule);
        // Add required dependencies
        if (rule.requires) {
          for (const reqId of rule.requires) {
            const requiredRule = rules.find(r => r.id === reqId);
            if (requiredRule) matches.add(requiredRule);
          }
        }
      }
    }
  }

  return Array.from(matches);
}

function composeMarkdown(rules: Rule[]): string {
  const sortedRules = rules.sort((a, b) => {
    if (a.type === 'base') return -1;
    if (b.type === 'base') return 1;
    return 0;
  });

  let markdown = `# Project Setup Guide\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;
  markdown += `## Included Components\n`;
  markdown += sortedRules.map(rule => `- ${rule.name}`).join('\n');
  markdown += '\n\n';
  
  sortedRules.forEach(rule => {
    markdown += rule.content + '\n';
  });

  return markdown;
}

async function main() {
  if (Deno.args.length === 0) {
    console.error("Usage: deno run --allow-read --allow-write main.ts python,conda,pytest");
    Deno.exit(1);
  }

  const keywords = Deno.args[0].split(',').map(k => k.trim());
  console.log("Processing keywords:", keywords);

  const rules = await loadRules();
  
  if (rules.length === 0) {
    console.error("No rules found in directory");
    Deno.exit(1);
  }

  const matchedRules = findMatchingRules(rules, keywords);

  if (matchedRules.length === 0) {
    console.error("No matching rules found");
    Deno.exit(1);
  }

  const markdown = composeMarkdown(matchedRules);
  
  const outputFile = "setup-guide.md";
  await Deno.writeTextFile(outputFile, markdown);
  console.log(`Generated ${outputFile}`);
  console.log("Matched rules:", matchedRules.map(r => r.name).join(", "));
}

if (import.meta.main) {
  main();
}

// Only base Python
// deno run --allow-read --allow-write main.ts python
// Matches: Python Base Setup

// Base Python + Conda
// deno run --allow-read --allow-write main.ts python,conda
// Matches: Python Base Setup, Conda Environment Setup

// Base Python + Pytest
// deno run --allow-read --allow-write main.ts python,pytest
// Matches: Python Base Setup, Pytest Configuration
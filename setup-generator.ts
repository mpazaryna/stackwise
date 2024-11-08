// setup-generator.ts
import { walk } from "https://deno.land/std@0.210.0/fs/walk.ts";
import { join } from "https://deno.land/std@0.210.0/path/mod.ts";

type RuleType = 'base' | 'module' | 'composite';

interface Rule {
  id: string;
  type: RuleType;
  name: string;
  content: string;
  requires?: string[];
}

// Move rules inline to avoid template literal parsing issues
const RULES: Rule[] = [
  {
    id: 'base-python-001',
    type: 'base',
    name: 'Python Base Setup',
    content: [
      '# Python Project Setup',
      '',
      '## Project Structure',
      '```',
      'project/',
      '├── src/',
      '│   └── __init__.py',
      '├── tests/',
      '│   └── __init__.py',
      '└── README.md',
      '```',
      '',
      '## Basic .gitignore',
      '```',
      '__pycache__/',
      '*.py[cod]',
      '*$py.class',
      '.Python',
      'build/',
      'develop-eggs/',
      'dist/',
      'downloads/',
      'eggs/',
      '.eggs/',
      '```'
    ].join('\n'),
  },
  {
    id: 'python-conda-001',
    type: 'module',
    name: 'Conda Environment Setup',
    requires: ['base-python-001'],
    content: [
      '## Conda Environment Setup',
      '',
      '### Environment Configuration',
      'Create `environment.yml`:',
      '```yaml',
      'name: project-env',
      'channels:',
      '  - conda-forge',
      '  - defaults',
      'dependencies:',
      '  - python=3.9',
      '  - pip',
      '```',
      '',
      '### Setup Commands',
      '```bash',
      '# Create environment',
      'conda env create -f environment.yml',
      '',
      '# Activate environment',
      'conda activate project-env',
      '```'
    ].join('\n'),
  }
];

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
  //markdown += `## Included Components\n\n`;
  markdown += sortedRules.map(rule => `- ${rule.name}`).join('\n');
  markdown += '\n\n';
  
  sortedRules.forEach(rule => {
    markdown += rule.content + '\n';
  });

  return markdown;
}

async function main() {
  if (Deno.args.length === 0) {
    console.error("Usage: deno run --allow-read --allow-write setup-generator.ts python,conda,pytest");
    Deno.exit(1);
  }

  const keywords = Deno.args[0].split(',').map(k => k.trim());
  console.log("Processing keywords:", keywords);

  const matchedRules = findMatchingRules(RULES, keywords);

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
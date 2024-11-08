// src/rules/conda.ts
export default {
  id: 'python-conda-001',
  type: 'module' as const,
  name: 'Conda Environment Setup',
  requires: ['base-python-001'],
  content: `## Conda Environment Setup

### Environment Configuration
Create \`environment.yml\`:
\`\`\`yaml
name: project-env
channels:
  - conda-forge
  - defaults
dependencies:
  - python=3.9
  - pip
\`\`\`

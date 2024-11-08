// rules/base-python.ts
export default {
  id: 'base-python-001',
  type: 'base' as const,
  name: 'Python Base Setup',
  content: `## Python Base Setup

### Installation
1. Download Python from [python.org](https://python.org)
2. Install Python with PATH option enabled
3. Verify installation:
\`\`\`bash
python --version
pip --version
\`\`\`

### Basic Project Structure
\`\`\`
project/
├── src/
├── tests/
├── README.md
└── requirements.txt
\`\`\`
`
};
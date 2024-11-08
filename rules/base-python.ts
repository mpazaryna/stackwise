// src/rules/base-python.ts
export default {
  id: 'base-python-001',
  type: 'base' as const,
  name: 'Python Base Setup',
  content: `Python Project Setup

## Project Structure

project/
├── src/
│   └── __init__.py
├── tests/
│   └── __init__.py
└── README.md

## Basic .gitignore
\`\`\`shell
__pycache__/
*.py[cod]
*$py.class
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
\`\`\``
};

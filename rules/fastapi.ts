// rules/fastapi.ts
export default {
  id: 'python-fastapi-001',
  type: 'module' as const,
  name: 'FastAPI Web Framework',
  requires: ['base-python-001'],
  content: `## FastAPI Setup

### Basic Application
Create \`src/main.py\`:
\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
\`\`\`

### Dependencies
With conda:
\`\`\`bash
conda install fastapi uvicorn
\`\`\`

Or with poetry:
\`\`\`bash
poetry add fastapi uvicorn
\`\`\`
`
};
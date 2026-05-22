#!/usr/bin/env bash
set -euo pipefail

MODEL="${1:-qwen2.5:3b}"

if ! command -v ollama &>/dev/null; then
  echo "Error: ollama CLI not found. Install from https://ollama.ai"
  exit 1
fi

echo "Pulling model: $MODEL"
ollama pull "$MODEL"

echo "Seeding Ollama provider into database..."
pnpm tsx scripts/seed-ollama.ts

echo ""
echo "Done! Ollama provider registered with endpoint http://localhost:11434/v1"
echo "Run 'ollama serve' in another terminal, then start the API."
echo "The model '$MODEL' will be auto-discovered via the models list endpoint."

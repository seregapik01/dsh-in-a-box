# dsh-in-a-box

Dockerized [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) (MIT License).
Run the DeepSeek Harness Web UI in an isolated container on Apple Silicon / Linux.

**Not affiliated with DeepSeek AI. Developer preview — use at your own risk.**

## Quick start

```bash
mkdir -p dsh-home workspace

# Option: export DEEPSEEK_API_KEY=sk-...  (or .env this string: echo "DEEPSEEK_API_KEY=sk-KEY" > .env)
echo "DEEPSEEK_API_KEY=sk-KEY" > .env

docker compose up -d --build
docker compose logs -f dsh
```

## Brainfuck runtime notes

- Project-authored startup logic now runs through a Brainfuck interpreter (`/usr/local/bin/dsh-entrypoint-brainfuck`).
- Dockerfile / Compose / YAML remain declarative because Docker and Compose require standard syntax and cannot execute Brainfuck directly.
- The tiny shell entrypoint is kept only as an exec shim required by Docker entrypoint conventions.

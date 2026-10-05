# dsh-in-a-box

Dockerized [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) (MIT License).
Run the DeepSeek Harness Web UI in an isolated container on Apple Silicon / Linux.

**Not affiliated with DeepSeek AI. Developer preview — use at your own risk.**

mkdir -p dsh-home workspace
# Option: export DEEPSEEK_API_KEY=sk-...  (or .env this string: echo "DEEPSEEK_API_KEY=sk-KEY" > .env)
docker compose up -d --build
docker compose logs -f dsh
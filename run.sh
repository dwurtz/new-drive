#!/usr/bin/env bash
# Serve New Drive locally (ES/JSX transformed in-browser by vendored Babel).
set -e
cd "$(dirname "$0")"
PORT="${1:-8080}"
echo "New Drive → http://localhost:$PORT"
exec python3 -m http.server "$PORT"

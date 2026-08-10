#!/bin/bash
cd "$(dirname "$0")"
echo "Hahn & Vo Shop → http://localhost:8440"
python3 -m http.server 8440

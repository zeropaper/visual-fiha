Docker build & run

Build (local):

```bash
docker build -t visual-fiha-frontend:local . \
  --build-arg VITE_BACKEND_URL=https://api.example.com
```

Run locally (maps container port 8080 -> host 8080):

```bash
docker run --rm -p 8080:8080 visual-fiha-frontend:local
```

Tips:
- CI already passes `VITE_BACKEND_URL` as a build-arg in `.github/workflows/build-and-publish.yml`.
- To change runtime port, set `PORT` at container start: `-e PORT=80 -p 80:80`.
- If you need runtime substitution of env vars into built assets, consider adding an `envsubst` step in `entrypoint.sh`.

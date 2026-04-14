````md
# Deploy `code-arena` to a VPS with a domain

## 1. Build and push from your Mac

```bash
docker login
docker buildx create --use --name mybuilder
docker buildx inspect --bootstrap
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t jonaaldas/code-arena:latest \
  --push .
```
````

## 2. Install Docker on the VPS

```bash
apt-get update
apt-get install -y ca-certificates curl gnupg

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
```

## 3. Log in on the VPS

```bash
docker login
```

## 4. Create the app folder

```bash
mkdir -p ~/apps/code-arena
cd ~/apps/code-arena
```

## 5. Create `docker-compose.yml`

```bash
cat > docker-compose.yml <<'EOF'
services:
    app:
        image: jonaaldas/code-arena:latest
        container_name: code-arena
        ports:
            - "127.0.0.1:3000:3000"
        restart: unless-stopped
EOF
```

## 6. Run the app

```bash
docker compose pull
docker compose up -d
```

## 7. Test the app on the VPS

```bash
curl http://127.0.0.1:3000
```

## 8. Get the VPS IP

```bash
curl ifconfig.me
```

## 9. Add DNS records for your domain

Create these records:

| Type | Name  | Value         |
| ---- | ----- | ------------- |
| A    | `@`   | `YOUR_VPS_IP` |
| A    | `www` | `YOUR_VPS_IP` |

If you use Cloudflare, use **DNS only** first.

## 10. Open ports on the VPS

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

## 11. Install Caddy

```bash
apt-get update
apt-get install -y caddy
```

## 12. Create `/etc/caddy/Caddyfile`

```bash
cat > /etc/caddy/Caddyfile <<'EOF'
yourdomain.com, www.yourdomain.com {
    reverse_proxy 127.0.0.1:3000
}
EOF
```

Replace `yourdomain.com` with your real domain.

## 13. Reload Caddy

```bash
systemctl reload caddy
systemctl status caddy
```

## 14. Open the site

```text
https://yourdomain.com
```

## 15. Update the app later

### On your Mac

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t jonaaldas/code-arena:latest \
  --push .
```

### On the VPS

```bash
cd ~/apps/code-arena
docker compose pull
docker compose up -d
```

## 16. Useful commands

```bash
docker ps
docker compose logs
docker compose logs -f
docker compose down
docker compose restart
systemctl status caddy
```

```

```

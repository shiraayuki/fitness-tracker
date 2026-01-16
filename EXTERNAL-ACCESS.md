# External Access Guide / Externer Zugriff

This guide explains how to access your Fitness Tracker from outside your home network.

Diese Anleitung erklaert, wie du von ausserhalb deines Heimnetzwerks auf den Fitness Tracker zugreifen kannst.

---

## Option 1: Tailscale (Recommended / Empfohlen)

Tailscale is the easiest and most secure option. It creates a private VPN without port forwarding.

Tailscale ist die einfachste und sicherste Option. Es erstellt ein privates VPN ohne Port-Forwarding.

### Setup Steps / Einrichtung

1. **Install Tailscale on your Raspberry Pi / Installiere Tailscale auf dem Raspberry Pi:**
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up
   ```

2. **Install Tailscale on your devices / Installiere Tailscale auf deinen Geraeten:**
   - Download from https://tailscale.com/download
   - Available for: iOS, Android, Windows, Mac, Linux

3. **Access via Tailscale IP / Zugriff ueber Tailscale IP:**
   ```
   http://<tailscale-ip>:8080
   ```
   Find your Tailscale IP with: `tailscale ip -4`

**Advantages / Vorteile:**
- No router configuration needed / Keine Router-Konfiguration noetig
- Encrypted connection / Verschluesselte Verbindung
- Works from anywhere / Funktioniert von ueberall
- Free for personal use / Kostenlos fuer private Nutzung

---

## Option 2: Cloudflare Tunnel (Also Secure / Auch Sicher)

Cloudflare Tunnel exposes your app via a public URL without port forwarding.

Cloudflare Tunnel macht deine App ueber eine oeffentliche URL erreichbar ohne Port-Forwarding.

### Prerequisites / Voraussetzungen
- Cloudflare account (free) / Cloudflare Konto (kostenlos)
- A domain (can be cheap, ~$10/year) / Eine Domain (kann guenstig sein, ~10 EUR/Jahr)

### Setup Steps / Einrichtung

1. **Install cloudflared / Installiere cloudflared:**
   ```bash
   # On Raspberry Pi
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
   sudo dpkg -i cloudflared.deb
   ```

2. **Login to Cloudflare / Anmelden bei Cloudflare:**
   ```bash
   cloudflared tunnel login
   ```

3. **Create tunnel / Tunnel erstellen:**
   ```bash
   cloudflared tunnel create fitness-tracker
   ```

4. **Configure tunnel / Tunnel konfigurieren:**
   Create `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: /home/pi/.cloudflared/<TUNNEL_ID>.json

   ingress:
     - hostname: fitness.yourdomain.com
       service: http://localhost:8080
     - service: http_status:404
   ```

5. **Add DNS record / DNS Eintrag hinzufuegen:**
   ```bash
   cloudflared tunnel route dns fitness-tracker fitness.yourdomain.com
   ```

6. **Start tunnel / Tunnel starten:**
   ```bash
   cloudflared tunnel run fitness-tracker
   ```

7. **Run as service / Als Service starten:**
   ```bash
   sudo cloudflared service install
   ```

**Advantages / Vorteile:**
- HTTPS included / HTTPS inklusive
- DDoS protection / DDoS Schutz
- No port forwarding / Kein Port-Forwarding

---

## Option 3: Port Forwarding + DynDNS (Traditional / Traditionell)

This is the traditional method using your router's port forwarding.

Dies ist die traditionelle Methode mit Port-Forwarding am Router.

### Step 1: Port Forwarding / Port-Weiterleitung

1. **Find your Raspberry Pi's local IP / Finde die lokale IP deines Raspberry Pi:**
   ```bash
   hostname -I
   # Example: 192.168.1.100
   ```

2. **Configure your router / Konfiguriere deinen Router:**
   - Open router admin page (usually http://192.168.1.1 or http://192.168.188.1)
   - Find "Port Forwarding" or "NAT" settings
   - Add rule:
     - External Port: 8080 (or 80)
     - Internal IP: Your Raspberry Pi IP
     - Internal Port: 8080
     - Protocol: TCP

### Step 2: DynDNS Setup

Since home IP addresses change, you need DynDNS to have a stable hostname.

Da sich Heim-IP-Adressen aendern, brauchst du DynDNS fuer einen stabilen Hostnamen.

**Free DynDNS Services / Kostenlose DynDNS-Dienste:**
- https://www.duckdns.org (recommended)
- https://www.noip.com
- https://freedns.afraid.org

**DuckDNS Setup (Example / Beispiel):**

1. Create account at https://www.duckdns.org
2. Create a subdomain (e.g., `myfitness.duckdns.org`)
3. Install updater on Raspberry Pi:
   ```bash
   mkdir -p ~/duckdns
   cat > ~/duckdns/duck.sh << 'EOF'
   #!/bin/bash
   echo url="https://www.duckdns.org/update?domains=YOURDOMAIN&token=YOURTOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
   EOF
   chmod +x ~/duckdns/duck.sh
   ```

4. Add to crontab for auto-updates:
   ```bash
   crontab -e
   # Add this line:
   */5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
   ```

5. Access via:
   ```
   http://myfitness.duckdns.org:8080
   ```

### Step 3: SSL/HTTPS (Optional but Recommended)

For secure HTTPS access, use Let's Encrypt:

1. Install certbot:
   ```bash
   sudo apt install certbot
   ```

2. Get certificate:
   ```bash
   sudo certbot certonly --standalone -d myfitness.duckdns.org
   ```

3. Update nginx configuration (see nginx/conf.d/fitness-tracker.conf)

4. Restart:
   ```bash
   docker compose restart nginx
   ```

**Note:** This requires port 443 forwarding on your router.

---

## Security Recommendations / Sicherheitsempfehlungen

1. **Use strong password / Starkes Passwort verwenden**
   - Minimum 12 characters / Mindestens 12 Zeichen
   - Mix of letters, numbers, symbols / Mischung aus Buchstaben, Zahlen, Symbolen

2. **Keep software updated / Software aktuell halten**
   ```bash
   cd fitness-tracker
   git pull
   docker compose up -d --build
   ```

3. **Monitor access logs / Zugriffslogs ueberwachen**
   ```bash
   docker compose logs nginx
   ```

4. **Consider Tailscale or Cloudflare / Erwaege Tailscale oder Cloudflare**
   - More secure than port forwarding
   - Sicherer als Port-Forwarding

---

## Troubleshooting / Fehlerbehebung

**Cannot access from outside / Kein Zugriff von aussen:**
- Check port forwarding is correct / Pruefe Port-Forwarding
- Verify firewall allows port 8080 / Firewall erlaubt Port 8080
- Test with: https://www.yougetsignal.com/tools/open-ports/

**DynDNS not updating / DynDNS aktualisiert nicht:**
- Check cron is running: `systemctl status cron`
- Check duck.log for errors / Pruefe duck.log auf Fehler

**SSL certificate issues / SSL Zertifikatsprobleme:**
- Ensure port 80 is open for Let's Encrypt validation
- Renew certificate: `sudo certbot renew`

---

## Quick Comparison / Schnellvergleich

| Method | Difficulty | Security | Cost |
|--------|-----------|----------|------|
| Tailscale | Easy | High | Free |
| Cloudflare Tunnel | Medium | High | Domain cost |
| Port Forwarding | Medium | Medium | Free |

**My Recommendation / Meine Empfehlung:** Start with Tailscale - it's the easiest and most secure option for personal use.

#!/bin/bash
set -e

echo "=== 🍺 Tilty McTiltface Installer ==="

# --- System deps ---
echo "Installing system packages..."
sudo apt update
sudo apt install -y python3-venv bluez

# --- Project venv ---
echo "Creating Python virtual environment in the root directory..."
cd ..
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install bleak python-dotenv pyyaml requests
cd rpi

# --- Capabilities ---
echo "Granting BLE permissions..."
sudo setcap cap_net_raw,cap_net_admin+eip $(readlink -f $(which python3))

# --- Config ---
if [ ! -f config.yaml ]; then
  echo "Copying default config..."
  cp config.example.yaml config.yaml
  echo "⚠️  Please edit config.yaml with your Firebase email/password."
fi

# --- Systemd ---
echo "Installing systemd service..."
SERVICE_NAME=tiltbridge.service
SERVICE_PATH=/etc/systemd/system/$SERVICE_NAME

sudo cp tiltbridge.service $SERVICE_PATH
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl restart $SERVICE_NAME

echo "✅ Install complete! Logs available with: journalctl -u $SERVICE_NAME -f"

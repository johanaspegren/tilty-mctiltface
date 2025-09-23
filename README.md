# Tilty McTiltface

A Raspberry Pi + Firestore bridge for [Tilt Hydrometers](https://tilthydrometer.com).  
Scans BLE iBeacon adverts, parses Tilt readings, and uploads them to Firebase/Firestore.  
Includes a backend service and frontend dashboard.

I love the Tilt hydrometer, but found it hard to run inside my fermentation fridge.
It that does a good job at keeping temperature in the wanted range - but also prevents BLE/WiFi from escaping.

So even if there is an old phone to have as Tilt slave, you either have BLE but lack WiFI (inside fridge)
or have WiFi but lack BLE (outside).

Thus running an ethernet cable into the fridge and hooking up a RPI to fetch and relay the
Tilt signals seemed like a good idea. However the existing Tilt2 code for RPI, as intereesting read as it is comes with a few limitations and drawbacks.

In this application we have a simplified BLE reader that picks up the signalling from nearby Tilts using the bleak libs instead of the aioblescan and then standard python firebase libs to push the data to a Firestore db

## Design Choices

### BLE Library: Bleak vs Aioblescan

Both [Bleak](https://github.com/hbldh/bleak) and [aioblescan](https://github.com/frawau/aioblescan) are great options for Bluetooth LE development on the Raspberry Pi. They just serve slightly different purposes:

**Bleak**

- Modern, actively maintained, cross-platform library
- Runs on Linux (BlueZ), macOS, and Windows
- High-level API (device + advertisement objects, callbacks) that integrates smoothly with async Python apps

**Aioblescan**

- Linux-only, closer to the metal with raw HCI packet access
- Very fast and detailed: captures _everything_ the radio hears, including malformed adverts
- Useful for debugging and specialized low-level BLE work

For this project, we use **Bleak** because it provides the right balance of portability, maintainability, and ease of integration with Firestore. But if you need raw packet inspection, **aioblescan** remains a solid choice.

---

### About Node-RED

[Node-RED](https://nodered.org/) is a fantastic tool for building IoT flows and quick prototypes. It offers a visual programming interface and a large ecosystem of nodes.

For this project, however, we chose **Python + Bleak** because:

- It keeps dependencies lightweight (just a Python venv with `bleak` and `firebase-admin`)
- The logic is transparent and version-controlled in plain Python source code
- It runs cross-platform, which makes local debugging easy
- It integrates naturally with systemd for reliable background service management

If your use case leans more towards graphical flow editing or combining multiple IoT sources, Node-RED could still be a great fit. We simply picked the Python route for clarity and maintainability.

---

## 📂 Project Structure

- backend/ FastAPI backend w Firestore
- frontend/ React UI dashboard and management
- rpi/ Raspberry Pi bridge (BLE -> Firestore)

---

## 🔧 Install on Raspberry Pi

Most RPIs should work, I wrote this for a RPI3 ona 8GB SD Card w Bookworm

Note: You should have a fairly new python though for the libs sake

Fetch the code
```bash
git clone https://github.com/johanaspegren/tilty-mctiltface
cd tilty-mctiltface
```

### Quick Install

Open the app https://tilty-live.web.app/tilts
create an account with email/pw and log in on the app

Enter email/pw in config.yaml (in this directory)

Then run the installation script

```bash
cd ~/dev/tilt/rpi
bash ./install.sh
```

### 1. System packages

Do not do this is you did the quick install :-)

```bash
sudo apt update
sudo apt install -y bluez
```

2. Project venv in the root dir, important or the calling command will fail

```bash
cd ..
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install bleak pyyaml requests
cd rpi
```

3. Bluetooth permissions
   Allow Python to access BLE without sudo:

```bash
sudo setcap cap_net_raw,cap_net_admin+eip $(readlink -f $(which python3))
```

4. Firestore connection
   Open the app https://tilty-live.web.app/tilts
   create an account with email/pw and log in on the app

```bash
Copy rpi/config.example.yaml to config.yaml and update the two fields with your email/pw:
user_email: "tilt-pi@example.com"
user_password: "super-secret-password"

and also:
allowed_colors: ["YELLOW", "RED"]   # optionally add your tilts, or leave [] for all
post_min_interval_sec: 600          # only push updates every 10min per Tilt
debug: false
```

⚙️ Systemd Setup

```bash
Create service file tiltbridge.service:

[Unit]
Description=Tilty McTiltface BLE→Firestore
After=network.target bluetooth.target

[Service]
ExecStart=/home/pi/dev/tilt/.venv/bin/python /home/pi/dev/tilt/rpi/tilt_bridge.py
WorkingDirectory=/home/pi/dev/tilt/rpi
StandardOutput=append:/home/pi/tiltbridge.log
StandardError=append:/home/pi/tiltbridge.log
Restart=always
User=pi
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

Install + start:

```bash
sudo cp tiltbridge.service /etc/systemd/system/tiltbridge.service
sudo systemctl daemon-reload
sudo systemctl enable tiltbridge.service
sudo systemctl start tiltbridge.service
```

📝 Logs

```bash
tail -f /home/pi/tiltbridge.log
sudo systemctl status tiltbridge.service
journalctl -u tiltbridge.service -f
```

Restart

```bash
# reload systemd configs (if you changed tiltbridge.service itself)
sudo systemctl daemon-reload

# restart your service
sudo systemctl restart tiltbridge.service

# check that it’s running
sudo systemctl status tiltbridge.service

# follow logs live
journalctl -u tiltbridge.service -f

```

🚀 Running
Manually:

```bash
source ./.venv/bin/activate
python ./rpi/tilt_bridge.py
```

🧹 Cleanup

If you’ve previously run Node-RED or aioblescan Tilt integrations, they can interfere.
Follow Cleanup instructions
to remove them.

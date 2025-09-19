# Cleanup: Removing Old Tilt Installations on Raspberry Pi

If you’ve previously run Node-RED flows or `aioblescan` scripts for Tilt hydrometers, they can interfere with the new `tilt_bridge.py`.  
This guide helps you **stop old services and uninstall leftover packages**.

---

## Stop & disable Node-RED

```bash
sudo systemctl stop nodered.service
sudo systemctl disable nodered.service
# (Optional) block it from ever starting again
sudo systemctl mask nodered.service

```

## Double-check where the unit lives:

```bash
systemctl status nodered.service | cat
sudo rm -f /etc/systemd/system/nodered.service /lib/systemd/system/nodered.service
sudo systemctl daemon-reload
```

## Remove Node-RED & dashboard

If installed via the official script:

```bash
command -v node-red-uninstall && sudo node-red-uninstall
```

Otherwise:

```bash
sudo npm -g remove node-red
sudo npm -g remove node-red-dashboard
```

## Remove user workspace (flows & nodes):

```bash
mv ~/.node-red ~/.node-red.backup-$(date +%F) # safe backup
```

## Remove aioblescan

Check if pip knows about it:

```bash
pip3 show aioblescan || python3 -m pip show aioblescan
```

## Uninstall:

```bash
sudo pip3 uninstall -y aioblescan || sudo python3 -m pip uninstall -y aioblescan
```

## Also nuke leftover files:

```bash
import aioblescan, os, shutil
p = os.path.dirname(aioblescan.**file**)
print("Removing:", p)
shutil.rmtree(p, ignore_errors=True)
```

## Remove stray files

```bash
rm -f ~/master.zip /home/pi/flow.json
rm -rf ~/aioblescan-master
```

## Sanity check

Nothing should be on Node-RED’s default port:

```bash
ss -tulpen | grep 1880 || echo "✅ No Node-RED on port 1880."
```

## No stray aioblescan processes:

```bash
pgrep -af 'aioblescan|node-red' || echo "✅ No old processes."
```

## Reboot

```bash
   sudo reboot
```

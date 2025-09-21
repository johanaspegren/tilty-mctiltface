import requests
import asyncio, struct, socket, yaml, logging
from datetime import datetime, timezone
from uuid import UUID
from bleak import BleakScanner
from modules.firestore_writer import FirestoreWriter

# --- Logging setup ---
logging.basicConfig(
    level=logging.INFO,  # change to DEBUG for raw adv spam
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),                    # console
        logging.FileHandler("/home/pi/tiltbridge.log", mode="a")  # file
    ]
)
log = logging.getLogger("tiltbridge")

APPLE_COMPANY_ID = 0x004C
IBEACON_PREFIX = b"\x02\x15"

TILT_UUID_TO_COLOR = {
    "A495BB10-C5B1-4B44-B512-1370F02D74DE": "RED",
    "A495BB20-C5B1-4B44-B512-1370F02D74DE": "GREEN",
    "A495BB30-C5B1-4B44-B512-1370F02D74DE": "BLACK",
    "A495BB40-C5B1-4B44-B512-1370F02D74DE": "PURPLE",
    "A495BB50-C5B1-4B44-B512-1370F02D74DE": "ORANGE",
    "A495BB60-C5B1-4B44-B512-1370F02D74DE": "BLUE",
    "A495BB70-C5B1-4B44-B512-1370F02D74DE": "YELLOW",
    "A495BB80-C5B1-4B44-B512-1370F02D74DE": "PINK",
}

def f_to_c(temp_f: int) -> float:
    return round((temp_f - 32) * 5.0 / 9.0, 2)


class TiltBridge:
    def __init__(self, cfg):
        self.writer = FirestoreWriter(
            cfg["project_id"],
            cfg["api_key"],
            cfg["user_email"],
            cfg["user_password"],
            cfg["user_uid"],
        )
        self.allowed_colors = set(c.upper() for c in cfg.get("allowed_colors", [])) or None
        self.min_interval = cfg.get("post_min_interval_sec", 15)
        self.debug = cfg.get("debug", False)
        self.hostname = socket.gethostname()
        self.last_post = {}
        self.last_values = {}

    def _should_post(self, color, temp_f, sg, now):
        last_t = self.last_post.get(color, 0)
        last_vals = self.last_values.get(color)

        # Require enough time to pass
        if now - last_t < self.min_interval:
            return False

        # Optional: also require significant change to break through earlier
        if last_vals and (
            last_vals[0] == temp_f and abs(last_vals[1] - sg) < 0.001
        ):
            return False
        return True


    def detection_callback(self, device, adv):
        for cid, data in (adv.manufacturer_data or {}).items():
            if cid != APPLE_COMPANY_ID:
                continue
            if len(data) < 23 or not data.startswith(IBEACON_PREFIX):
                continue
            try:
                uuid_str = str(UUID(bytes=data[2:18])).upper()
                color = TILT_UUID_TO_COLOR.get(uuid_str)
                if not color or (self.allowed_colors and color not in self.allowed_colors):
                    continue

                temp_f = int.from_bytes(data[18:20], "big")
                temp_c = f_to_c(temp_f)
                gravity_raw = int.from_bytes(data[20:22], "big")
                sg = round(gravity_raw / 1000.0, 3)
                tx_power = struct.unpack("b", data[22:23])[0]
                now = datetime.now(timezone.utc)
                epoch = now.timestamp()
                seen_at = now.strftime("%Y-%m-%d %H:%M:%S %Z")

                if not self._should_post(color, temp_f, sg, epoch):
                    return

                batch_id = self.writer.get_current_batch(color)

                payload = {
                    "uuid": uuid_str,
                    "color": color,
                    "temp_f": temp_f,
                    "temp_c": temp_c,
                    "gravity_raw": gravity_raw,
                    "sg": sg,
                    "rssi": getattr(adv, "rssi", getattr(device, "rssi", None)),
                    "tx_power": int(tx_power),
                    "address": device.address,
                    "pi_hostname": self.hostname,
                    "seen_epoch": epoch,
                    "seen_at": seen_at,
                    "seen_iso": now.isoformat(),
                    "batch_id": batch_id,   # 👈 attach batch here
                }

                self.writer.write_reading(color, payload)
                self.last_post[color] = epoch
                self.last_values[color] = (temp_f, sg)

            except Exception as e:
                log.error(f"Parse/post error: {e}")

    async def run(self):
        scanner = BleakScanner(detection_callback=self.detection_callback)
        await scanner.start()
        log.info("TiltBridge scanning… (Ctrl+C to stop)")
        try:
            while True:
                await asyncio.sleep(5)
        finally:
            await scanner.stop()


async def main():
    with open("config.yaml") as f:
        cfg = yaml.safe_load(f)
    bridge = TiltBridge(cfg)
    await bridge.run()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log.info("Bye.")

import time
import requests
import logging

log = logging.getLogger("tiltbridge")

class FirestoreWriter:
    def __init__(self, project_id: str, api_key: str, email: str, password: str, user_uid: str):
        self.project_id = project_id
        self.api_key = api_key
        self.email = email
        self.password = password
        self.user_uid = user_uid
        self.id_token = None
        self.token_expiry = 0

    def _refresh_token(self):
        if self.id_token and time.time() < self.token_expiry - 60:
            return  # still valid

        log.info("Authenticating Firebase user…")
        resp = requests.post(
            f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={self.api_key}",
            json={
                "email": self.email,
                "password": self.password,
                "returnSecureToken": True,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        self.id_token = data["idToken"]
        self.token_expiry = time.time() + int(data["expiresIn"])
        log.info("Got Firebase ID token")

    def get_current_batch(self, color: str):
        """Fetch current batchId for a Tilt color from /tilts/{color} doc."""
        self._refresh_token()
        url = (
            f"https://firestore.googleapis.com/v1/projects/{self.project_id}"
            f"/databases/(default)/documents/users/{self.user_uid}/tilts/{color}"
        )
        resp = requests.get(url, headers={"Authorization": f"Bearer {self.id_token}"})
        if resp.status_code != 200:
            log.warning(f"Failed to fetch current batch for {color}: {resp.status_code}")
            return None

        data = resp.json()
        fields = data.get("fields", {})
        current = fields.get("current_batch", {})
        if "stringValue" in current:
            val = current["stringValue"]
            return val if val and val.lower() != "none" else None
        return None


    def write_reading(self, color: str, payload: dict):
        self._refresh_token()
        url = (
            f"https://firestore.googleapis.com/v1/projects/{self.project_id}"
            f"/databases/(default)/documents/users/{self.user_uid}/tilts/{color}/readings"
        )
        fs_payload = {"fields": {k: self._wrap_value(v) for k, v in payload.items()}}
        log.debug("Posting to Firestore: %s", fs_payload)
        log.debug("posting URL: %s", url)
        resp = requests.post(url, headers={"Authorization": f"Bearer {self.id_token}"}, json=fs_payload)
        log.debug("Firestore response: %s %s", resp.status_code, resp.text)
        if resp.status_code != 200:
            log.error("Firestore write failed: %s", resp.text)
        return resp

    def _wrap_value(self, v):
        if isinstance(v, bool):
            return {"booleanValue": v}
        if isinstance(v, int):
            return {"integerValue": v}
        if isinstance(v, float):
            return {"doubleValue": v}
        return {"stringValue": str(v)}

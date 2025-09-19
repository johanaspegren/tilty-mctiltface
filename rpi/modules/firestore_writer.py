"""
Standalone Firestore writer for Tilt readings
"""
import os
os.environ["GRPC_VERBOSITY"] = "ERROR"
os.environ["GRPC_TRACE"] = ""

import firebase_admin
from firebase_admin import credentials, firestore


class FirestoreWriter:
    def __init__(self, project_id: str, creds_file: str, user_uid: str):
        self.project_id = project_id
        self.user_uid = user_uid
        if not firebase_admin._apps:
            print("Initializing Firebase app...", creds_file)
            cred = credentials.Certificate(creds_file)
            firebase_admin.initialize_app(cred, {"projectId": project_id})
        self.db = firestore.client()
    def write_reading(self, color: str, payload: dict):
        """
        Write a single Tilt reading to Firestore.

        Path:
        users/{uid}/tilts/{color}/readings/{autoId}
        """
        ref = (
            self.db.collection("users")
            .document(self.user_uid)
            .collection("tilts")
            .document(color)
            .collection("readings")
            .document()
        )
        payload = dict(payload)
        payload["seen_at"] = firestore.SERVER_TIMESTAMP
        ref.set(payload)
        return ref.id  # return Firestore-generated document ID



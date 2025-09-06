import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface RequestMetadata {
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: Date;
  error?: string;
}

export async function saveRequest(
  userId: string,
  method: string,
  url: string,
  status: number,
  duration: number,
  error?: string,
): Promise<void> {
  const ref = collection(db, "requests");
  await addDoc(ref, {
    userId,
    method,
    url,
    status,
    duration,
    error: error ?? null,
    timestamp: Timestamp.now(),
  });
}

export async function fetchRequestHistory(
  userId: string,
): Promise<RequestMetadata[]> {
  const ref = collection(db, "requests");
  const q = query(ref, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      method: data.method,
      url: data.url,
      status: data.status,
      duration: data.duration,
      error: data.error ?? undefined,
      timestamp: data.timestamp.toDate(),
    };
  });
}

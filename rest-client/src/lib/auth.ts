import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth } from "./firebase";

export interface AppUser {
  id: string;
  email: string;
  name?: string;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AppUser> {
  const auth = getAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return {
    id: result.user.uid,
    email: result.user.email ?? "",
    name: result.user.displayName ?? "",
  };
}

export async function signupUser(
  email: string,
  password: string,
): Promise<AppUser> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return {
    id: result.user.uid,
    email: result.user.email ?? "",
    name: result.user.displayName ?? "",
  };
}

export function logoutUser(): void {
  signOut(auth);
}

export async function getCurrentUser(): Promise<AppUser | null> {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        resolve({
          id: user.uid,
          email: user.email ?? "",
          name: user.displayName ?? "",
        });
      } else {
        resolve(null);
      }
    });
  });
}

import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.tsx";
import LanguageSwitcher from "./LanguageSwitcher.tsx";

export default function Header() {
  const { pathname } = useLocation();

  const navItems = [
    { path: "/signin", label: "Sign In" },
    { path: "/signup", label: "Sign Up" },
    { path: "/rest", label: "REST Client" },
    { path: "/history", label: "History" },
    { path: "/variables", label: "Variables" },
  ];
  let currentUser: string | null = "No user is signed in";
  const { user, logout } = useAuthContext();
  if (user) {
    currentUser = user.email;
  } else {
    currentUser = "No user is signed";
  }
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold tracking-wide">REST Client</h1>
      <nav className="flex gap-4">
        {navItems.map(({ path, label }) => {
          if (path === "/signin" || path === "/signup") {
            return !user ? (
              <Link
                key={path}
                to={path}
                className={`text-sm font-medium hover:underline ${
                  pathname === path ? "underline font-semibold" : ""
                }`}
              >
                {label}
              </Link>
            ) : (
              ""
            );
          } else {
            return (
              <Link
                key={path}
                to={path}
                className={`text-sm font-medium hover:underline ${
                  pathname === path ? "underline font-semibold" : ""
                }`}
              >
                {label}
              </Link>
            );
          }
        })}
        <span>
          {" "}
          <b>User: </b> {currentUser}
        </span>
        {user ? (
          <span onClick={logout} style={{ color: "red", cursor: "pointer" }}>
            {" "}
            logout{" "}
          </span>
        ) : (
          <Link to={"/signin"}> Login </Link>
        )}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}

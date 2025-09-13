import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.tsx";
import LanguageSwitcher from "./LanguageSwitcher.tsx";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { pathname } = useLocation();
  const { user, logout } = useAuthContext();
  const { t } = useTranslation();
  const navItems = user
    ? [
        { path: "/rest", label: "appName" },
        { path: "/history", label: "history" },
        { path: "/variables", label: "variables" },
      ]
    : [
        { path: "/signin", label: "signin" },
        { path: "/signup", label: "signup" },
      ];
  let currentUser: string | null = "No user is signed in";

  if (user) {
    currentUser = user.email;
  } else {
    currentUser = "No user is signed";
  }
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md px-6 py-4 flex justify-between items-center">
      <Link to={"/"}>
        <h1 className="text-xl font-bold tracking-wide">{t("appName")}</h1>
      </Link>
      <nav className="flex gap-4">
        <LanguageSwitcher />
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
                {t(label)}
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
                {t(label)}
              </Link>
            );
          }
        })}

        {user ? (
          <>
            {" "}
            <span>
              {" "}
              <b>{t("user")}: </b> {currentUser}
            </span>
            <span onClick={logout} style={{ color: "red", cursor: "pointer" }}>
              {" "}
              {t("signout")}{" "}
            </span>
          </>
        ) : (
          ""
        )}
      </nav>
    </header>
  );
}

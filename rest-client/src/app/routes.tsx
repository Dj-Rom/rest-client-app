import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./layout";
import SignIn from "./signin";
import SignUp from "./signup";
import RestClient from "./rest";
import History from "./history";
import Variables from "./variables";
import MainWithoutLogin from "../components/MainWithoutLogin";
import { useAuthContext } from "../context/AuthContext";
import type { JSX } from "react";
import { useState } from "react";
import type { RequestMetadata } from "../lib/api";

// ProtectedRoute
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuthContext();
  return user ? children : <MainWithoutLogin />;
}

// PublicRoute
interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user } = useAuthContext();
  if (user) return <Navigate to="/" replace />;
  return children;
};

// HomePage
function HomePage() {
  const { user } = useAuthContext();
  if (!user) return <MainWithoutLogin />;
  return <h1>Welcome {user.email}</h1>;
}

// Обёрточный компонент для RestClient + History
function RestClientPageWrapper() {
  const [restoreData, setRestoreData] = useState<RequestMetadata | null>(null);

  function handleRestore(entry: RequestMetadata) {
    setRestoreData(entry);
  }

  return (
    <>
      <RestClient restoreRequest={restoreData} />
      <History onSelect={handleRestore} />
    </>
  );
}

// Router
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "signin",
        element: (
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        ),
      },
      {
        path: "signup",
        element: (
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        ),
      },
      {
        path: "rest",
        element: (
          <ProtectedRoute>
            <RestClientPageWrapper />
          </ProtectedRoute>
        ),
      },
      {
        path: "history",
        element: (
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        ),
      },
      {
        path: "variables",
        element: (
          <ProtectedRoute>
            <Variables />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

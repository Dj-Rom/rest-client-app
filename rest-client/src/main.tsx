import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./lib/i18n";
import { AuthProvider } from "./context/AuthContext";
import { VariableProvider } from "./context/VariableContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <VariableProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </VariableProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

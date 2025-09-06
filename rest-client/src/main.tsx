import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./lib/i18n";
import { AuthProvider } from "./context/AuthContext.tsx";
import { VariableProvider } from "./context/VariableContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <VariableProvider>
          <RouterProvider router={router} />
        </VariableProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

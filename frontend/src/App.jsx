
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import RootLayout from "./app/layout";
import Home from "./app/page";
import DashboardLayout from "./app/dashboard/layout";
import DashboardPage from "./app/dashboard/page";
import DocumentsPage from "./app/dashboard/documents/page";
import AssistantPage from "./app/dashboard/assistant/page";

export default function App() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Routes>
          {/* Home page */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            }
          />

          {/* Documents */}
          <Route
            path="/dashboard/documents"
            element={
              <DashboardLayout>
                <DocumentsPage />
              </DashboardLayout>
            }
          />

          {/* AI Assistant */}
          <Route
            path="/dashboard/assistant"
            element={
              <DashboardLayout>
                <AssistantPage />
              </DashboardLayout>
            }
          />

          {/* Redirect unknown routes to home */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
}

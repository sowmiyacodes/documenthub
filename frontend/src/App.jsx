import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./app/layout";
import Home from "./app/page";
import DashboardLayout from "./app/dashboard/layout";
import DashboardPage from "./app/dashboard/page";
import DocumentsPage from "./app/dashboard/documents/page";

export default function App() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/documents"
            element={
              <DashboardLayout>
                <DocumentsPage />
              </DashboardLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
}

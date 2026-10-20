import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-workspace flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="dashboard-viewport flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Page Content */}
        <main className="dashboard-main flex-1 overflow-y-auto">
          <div className="dashboard-main-inner mx-auto h-full w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
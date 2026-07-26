import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top Navbar */}
        <TopNavbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto h-full w-full max-w-7xl px-8 py-8">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
import { DashboardNavbar } from "./DashboardNavbar";
import { AdminPanel } from "./AdminPanel";

export function AdminPanelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
      <DashboardNavbar userRole="admin" notificationCount={4} />
      
      <main className="container mx-auto p-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Admin Control Panel</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and generate system-wide AI reports
          </p>
        </div>

        <AdminPanel />
      </main>
    </div>
  );
}


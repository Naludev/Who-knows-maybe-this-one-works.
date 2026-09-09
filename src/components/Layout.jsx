import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/BottomNav";

export default function Layout() {
  const { pathname } = useLocation();
  const [me, setMe] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    base44.auth.me().then((u) => { setMe(u); setLoading(false); }).catch(() => setLoading(false));
  }, [pathname]);

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  // Onboarding gate
  if (me && !me.onboarded && pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  if (me && me.onboarded && pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }

  const hideChrome = pathname === "/onboarding";

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {!hideChrome && (
        <header className="sticky top-0 z-40 glass border-b border-border/60">
          <div className="flex items-center justify-between px-4 h-14">
            <span className="font-heading font-extrabold text-lg tracking-tight">
              BL <span className="text-gradient">World</span>
            </span>
          </div>
        </header>
      )}
      <main className={hideChrome ? "" : "min-h-[calc(100vh-3.5rem)]"}>
        <Outlet />
      </main>
      {!hideChrome && <BottomNav />}
    </div>
  );
}
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./lib/theme";
import { LandingPage } from "./components/landing/LandingPage";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { Overview } from "./pages/dashboard/Overview";
import { LinksPage } from "./pages/dashboard/LinksPage";
import { LinkDetail } from "./pages/dashboard/LinkDetail";
import { AnalyticsPage } from "./pages/dashboard/AnalyticsPage";
import { SettingsPage } from "./pages/dashboard/SettingsPage";
import { QrCodesPage } from "./pages/dashboard/QrCodesPage";
import { RedirectPage } from "./pages/RedirectPage";

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/r/:alias" element={<RedirectPage />} />
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="links" element={<LinksPage />} />
            <Route path="links/:id" element={<LinkDetail />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="qr" element={<QrCodesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

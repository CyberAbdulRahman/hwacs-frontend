// // src/App.tsx
// import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// import { HomePage } from "./components/HomePage";
// import { SignUpPage } from "./components/SignUpPage";
// import { LoginPage } from "./components/LoginPage";
// import { ForgotPasswordPage } from "./components/ForgotPasswordPage";

// import  { OtpVerificationPage }  from "./components/OtpVerificationPage";

// import { AdminLoginPage } from "./components/AdminLoginPage";
// import { AdminSignUpPage } from "./components/AdminSignUpPage";
// import { AdminActivatePage } from "./components/AdminActivatePage";
// import { AdminOtpVerificationPage } from "./components/AdminOtpVerificationPage";

// import { DashboardOverview } from "./components/DashboardOverview";
// import { VulnerabilitiesPage } from "./components/VulnerabilitiesPage";
// import { ResetPasswordPage } from "./components/ResetPasswordPage";
// import { LogFilesPage } from "./components/LogFilesPage";
// import { TrafficPage } from "./components/TrafficPage";
// import { NotificationsPage } from "./components/NotificationsPage";
// import { AdminPanelPage } from "./components/AdminPanelPage";
// import { ProfilePage } from "./components/ProfilePage";
// import { AdminProfilePage } from "./components/AdminProfilePage";
// import { ExternalHoneypotRegistrationPage } from "./components/ExternalHoneypotRegistrationPage";
// import { HoneypotManagementPage } from "./components/HoneypotManagementPage";

// import { Toaster } from "./components/ui/sonner";

// // ✅ Simple role detector from localStorage (based on your setAuth usage)
// function getRole(): "admin" | "user" | null {
//   try {
//     const raw = localStorage.getItem("auth");
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);
//     const role = parsed?.user?.role;
//     return role === "admin" ? "admin" : role === "user" ? "user" : null;
//   } catch {
//     return null;
//   }
// }

// // ✅ Legacy /dashboard smart redirect
// function DashboardRedirect() {
//   const role = getRole();
//   if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
//   if (role === "user") return <Navigate to="/user-dashboard" replace />;
//   return <Navigate to="/login" replace />;
// }

// export default function App() {
//   return (
//     <Router>
//       <Toaster position="top-right" />

//       <Routes>
//         {/* =======================
//             Public Routes
//         ======================= */}
//         <Route path="/" element={<HomePage />} />
//         <Route path="/signup" element={<SignUpPage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/forgot-password" element={<ForgotPasswordPage />} />

//         {/* =======================
//             OTP (USER + ADMIN both handled in your OTP page)
//         ======================= */}
//         <Route path="/otp-verification" element={<OtpVerificationPage />} />

//         {/* =======================
//             ADMIN AUTH / ACTIVATION
//         ======================= */}
//         <Route path="/admin-login" element={<AdminLoginPage />} />
//         <Route path="/admin-signup" element={<AdminSignUpPage />} />
//         <Route path="/admin-activate" element={<AdminActivatePage />} />
//         <Route path="/admin-otp-verification" element={<AdminOtpVerificationPage />} />

//         {/* =======================
//             Admin Routes
//         ======================= */}
//         <Route path="/admin-dashboard" element={<DashboardOverview userRole="admin" />} />
//         <Route path="/admin-vulnerabilities" element={<VulnerabilitiesPage userRole="admin" />} />
//         <Route path="/admin-logs" element={<LogFilesPage userRole="admin" />} />
//         <Route path="/admin-traffic" element={<TrafficPage userRole="admin" />} />
//         <Route path="/admin-notifications" element={<NotificationsPage userRole="admin" />} />
//         <Route path="/admin-panel" element={<AdminPanelPage />} />
//         <Route path="/admin-profile" element={<AdminProfilePage />} />
//         <Route path="/admin-honeypot-management" element={<HoneypotManagementPage />} />

//         {/* =======================
//             User Routes
//         ======================= */}
//         <Route path="/user-dashboard" element={<DashboardOverview userRole="user" />} />
//         <Route path="/user-vulnerabilities" element={<VulnerabilitiesPage userRole="user" />} />
//         <Route path="/user-logs" element={<LogFilesPage userRole="user" />} />
//         <Route path="/user-traffic" element={<TrafficPage userRole="user" />} />
//         <Route path="/user-notifications" element={<NotificationsPage userRole="user" />} />
//         <Route path="/profile" element={<ProfilePage />} />
//         <Route
//           path="/user-external-honeypot"
//           element={<ExternalHoneypotRegistrationPage userRole="user" />}
//         />

//         {/* =======================
//             Legacy Route FIX ✅
//         ======================= */}
//         <Route path="/dashboard" element={<DashboardRedirect />} />

//         {/* =======================
//             Fallback (unknown route)
//         ======================= */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }
// src/App.tsx
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { HomePage } from "./components/HomePage";
import { SignUpPage } from "./components/SignUpPage";
import { LoginPage } from "./components/LoginPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";

import { OtpVerificationPage } from "./components/OtpVerificationPage";

import { AdminLoginPage } from "./components/AdminLoginPage";
import { AdminSignUpPage } from "./components/AdminSignUpPage";
import { AdminActivatePage } from "./components/AdminActivatePage";
import { AdminOtpVerificationPage } from "./components/AdminOtpVerificationPage";

import { DashboardOverview } from "./components/DashboardOverview";
import { VulnerabilitiesPage } from "./components/VulnerabilitiesPage";
import { LogFilesPage } from "./components/LogFilesPage";
import { TrafficPage } from "./components/TrafficPage";
import { NotificationsPage } from "./components/NotificationsPage";
import { AdminPanelPage } from "./components/AdminPanelPage";
import { ProfilePage } from "./components/ProfilePage";
import { AdminProfilePage } from "./components/AdminProfilePage";
import { ExternalHoneypotRegistrationPage } from "./components/ExternalHoneypotRegistrationPage";
import { HoneypotManagementPage } from "./components/HoneypotManagementPage";

import { Toaster } from "./components/ui/sonner";

// ✅ Simple role detector from localStorage (based on your setAuth usage)
function getRole(): "admin" | "user" | null {
  const role = localStorage.getItem("role");
  if (role === "admin" || role === "user") return role;
  return null;
}


// ✅ Legacy /dashboard smart redirect
function DashboardRedirect() {
  const role = getRole();
  if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
  if (role === "user") return <Navigate to="/user-dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        {/* =======================
            Public Routes
        ======================= */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ✅ Forgot -> sends link, only shows message */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ✅ Reset page (opened from email link) */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* =======================
            OTP (USER + ADMIN)
        ======================= */}
        <Route path="/otp-verification" element={<OtpVerificationPage />} />

        {/* =======================
            ADMIN AUTH / ACTIVATION
        ======================= */}
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin-signup" element={<AdminSignUpPage />} />
        <Route path="/admin-activate" element={<AdminActivatePage />} />
        <Route path="/admin-otp-verification" element={<AdminOtpVerificationPage />} />

        {/* =======================
            Admin Routes
        ======================= */}
        <Route path="/admin-dashboard" element={<DashboardOverview userRole="admin" />} />
        <Route path="/admin-vulnerabilities" element={<VulnerabilitiesPage userRole="admin" />} />
        <Route path="/admin-logs" element={<LogFilesPage userRole="admin" />} />
        <Route path="/admin-traffic" element={<TrafficPage userRole="admin" />} />
        <Route path="/admin-notifications" element={<NotificationsPage userRole="admin" />} />
        <Route path="/admin-panel" element={<AdminPanelPage />} />
        <Route path="/admin-profile" element={<AdminProfilePage />} />
        <Route path="/admin-honeypot-management" element={<HoneypotManagementPage userRole="admin" />} />

        {/* =======================
            User Routes
        ======================= */}
        <Route path="/user-dashboard" element={<DashboardOverview userRole="user" />} />
        <Route path="/user-vulnerabilities" element={<VulnerabilitiesPage userRole="user" />} />
        <Route path="/user-logs" element={<LogFilesPage userRole="user" />} />
        <Route path="/user-traffic" element={<TrafficPage userRole="user" />} />
        <Route path="/user-notifications" element={<NotificationsPage userRole="user" />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/user-external-honeypot"
          element={<ExternalHoneypotRegistrationPage userRole="user" />}
        />

        {/* =======================
            Legacy Route FIX ✅
        ======================= */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* =======================
            Fallback (unknown route)
        ======================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}


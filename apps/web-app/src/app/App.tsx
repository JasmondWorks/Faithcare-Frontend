import { Toaster } from "react-hot-toast";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { BulkMessaging } from "./components/BulkMessaging";
import { Communities } from "./components/Communities";
import { FirstTimersManagement } from "./components/FirstTimersManagement";
import { FocusTimer } from "./components/FocusTimer";
import { FollowUps } from "./components/FollowUps";
import GuestRoute from "./components/GuestRoute";
import { OTPVerification } from "./components/OTPVerification";
import { PrayerRequests } from "./components/PrayerRequests";
import ProtectedRoute from "./components/ProtectedRoute";
import { SalvationRecords } from "./components/SalvationRecords";
import { SecondTimers } from "./components/SecondTimers";
import { SundayJournal } from "./components/SundayJournal";
import AppLayout from "./layouts/AppLayout";
import AcceptInvite from "./pages/AcceptInvite";
import { ChangePassword } from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import { IndividualOnboarding } from "./pages/IndividualOnboarding";
import { LandingPage } from "./pages/LandingPage";
import { MessageTemplates } from "./pages/MessageTemplates";
import NotFoundPage from "./pages/NotFoundPage";
import { OrganizationOnboarding } from "./pages/OrganizationOnboarding";
import Register from "./pages/Register";
import BibleReader from "./pages/scripture/BibleReader";
import Bookmarks from "./pages/scripture/Bookmarks";
import ReadingPlans from "./pages/scripture/ReadingPlans";
import ScriptureHistory from "./pages/scripture/ScriptureHistory";
import ScriptureLayout from "./pages/scripture/ScriptureLayout";
import ScriptureToday from "./pages/scripture/ScriptureToday";
import { SignIn } from "./pages/SignIn";
import { SignUpChoice } from "./pages/SignUpChoice";
import SignUpIndividual from "./pages/SignUpIndividual";
import SignUpOrganization from "./pages/SignUpOrganization";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import AuthProvider from "./providers/AuthProvider";
import { Settings } from "./pages/Settings";


export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <AuthProvider>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/accept-invite" element={<AcceptInvite />} />
          <Route path="/register" element={<Register />} />

          <Route element={<GuestRoute />}>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up-individual" element={<SignUpIndividual />} />
            <Route
              path="/sign-up-organization"
              element={<SignUpOrganization />}
            />
            <Route path="/sign-up-choice" element={<SignUpChoice />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OTPVerification />} />
          </Route>

          <Route
            path="/individual-onboarding"
            element={
              <ProtectedRoute allowedRoles={['individual']}>
                <IndividualOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organization-onboarding"
            element={<ProtectedRoute allowedRoles={['organization']}>
              <OrganizationOnboarding />
            </ProtectedRoute>}
          />
          <Route element={<ProtectedRoute />}>

            {/* Layout-wrapped routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/settings/change-password"
                element={<ChangePassword />}
              />

              {/* Individual */}
              <Route path="/sunday-journal" element={<SundayJournal />} />
              <Route path="/focus-timer" element={<FocusTimer />} />

              {/* Memorization module */}
              {/* <Route path="/memorization" element={<MemorizationDashboard />} />
              <Route path="/memorization/practice" element={<PracticeSession />} />
              <Route path="/memorization/collections" element={<Collections />} />
              <Route path="/memorization/add" element={<AddVerse />} />
              <Route path="/memorization/progress" element={<MemorizationProgress />} /> */}

              {/* Scripture module */}
              <Route path="/scripture" element={<ScriptureLayout />}>
                <Route index element={<ScriptureToday />} />
                <Route path="read" element={<BibleReader />} />
                <Route path="plans" element={<ReadingPlans />} />
                <Route path="bookmarks" element={<Bookmarks />} />
                <Route path="history" element={<ScriptureHistory />} />
              </Route>

              {/* Organization */}
              <Route path="/first-timers" element={<FirstTimersManagement />} />
              <Route path="/second-timers" element={<SecondTimers />} />
              <Route path="/salvation-records" element={<SalvationRecords />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/prayer-requests" element={<PrayerRequests />} />
              <Route path="/follow-ups" element={<FollowUps />} />
              <Route path="/bulk-messaging" element={<BulkMessaging />} />
              <Route path="/message-templates" element={<MessageTemplates />} />
            </Route>
          </Route>

          {/* â”€â”€ Fallbacks â”€â”€ */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

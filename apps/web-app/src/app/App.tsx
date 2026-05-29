import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SignIn } from "./pages/SignIn";
import { LandingPage } from "./pages/LandingPage";
import { SignUpChoice } from "./pages/SignUpChoice";
import { OrganizationOnboarding } from "./pages/OrganizationOnboarding";
import { IndividualOnboarding } from "./pages/IndividualOnboarding";
import ForgotPassword from "./pages/ForgotPassword";
import { Settings } from "./pages/Settings";
import SignUpIndividual from "./pages/SignUpIndividual";
import SignUpOrganization from "./pages/SignUpOrganization";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import OTPVerification from "./pages/OTPVerification";

import { ChangePassword } from "./pages/ChangePassword";

import { SundayJournal } from "./components/SundayJournal";
import ScriptureLayout from "./pages/scripture/ScriptureLayout";
import ScriptureToday from "./pages/scripture/ScriptureToday";
import BibleReader from "./pages/scripture/BibleReader";
import ReadingPlans from "./pages/scripture/ReadingPlans";
import Bookmarks from "./pages/scripture/Bookmarks";
import ScriptureHistory from "./pages/scripture/ScriptureHistory";
import MemorizationDashboard from "./pages/memorization/MemorizationDashboard";
import PracticeSession from "./pages/memorization/PracticeSession";
import Collections from "./pages/memorization/Collections";
import AddVerse from "./pages/memorization/AddVerse";
import MemorizationProgress from "./pages/memorization/MemorizationProgress";
import { PrayerRequests } from "./components/PrayerRequests";
import { FocusTimer } from "./components/FocusTimer";
import { FirstTimersManagement } from "./components/FirstTimersManagement";
import { FollowUps } from "./components/FollowUps";
import { SalvationRecords } from "./components/SalvationRecords";
import { SecondTimers } from "./components/SecondTimers";
import { Communities } from "./components/Communities";
import { BulkMessaging } from "./components/BulkMessaging";
import { MessageTemplates } from "./pages/MessageTemplates";

import AcceptInvite from "./pages/AcceptInvite";
import Register from "./pages/Register";
import AuthProvider from "./providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";

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

import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AppLayout from "../layout/AppLayout";
import LoginPage from "../pages/Auth/LoginPage";
import ProtectedRoute from "../components/ProtectedRoute";

// Lazy-loaded pages — each chunk only loads when that route is visited
const DashboardMainPage = lazy(
  () => import("../pages/Dashboard/DashboardMainPage"),
);
const GenderMainPage = lazy(() => import("../pages/Gender/GenderMainPage"));
const UserMainPage = lazy(() => import("../pages/User/UserMainPage"));
const AthleteMainPage = lazy(() => import("../pages/Athlete/AthleteMainPage"));
const CoachMainPage = lazy(() => import("../pages/Coach/CoachMainPage"));
const EventMainPage = lazy(() => import("../pages/Event/EventMainPage"));
const RecordMainPage = lazy(() => import("../pages/Record/RecordMainPage"));
const SportMainPage = lazy(() => import("../pages/Sport/SportMainPage"));
const EditSportPage = lazy(() => import("../pages/Sport/EditSportPage"));
const DeleteSportPage = lazy(() => import("../pages/Sport/DeleteSportPage"));
const AnnouncementMainPage = lazy(
  () => import("../pages/Announcement/AnnouncementMainPage"),
);
const PracticeScheduleMainPage = lazy(
  () => import("../pages/PracticeSchedule/PracticeScheduleMainPage"),
);
const AthleteDashboardPage = lazy(
  () => import("../pages/AthleteDashboard/AthleteDashboardPage"),
);
const CoachDashboardPage = lazy(
  () => import("../pages/CoachDashboard/CoachDashboardPage"),
);
const AccountSettingsPage = lazy(
  () => import("../pages/AccountSettings/AccountSettingsPage"),
);
const ReportsMainPage = lazy(
  () => import("../pages/Dashboard/Components/ReportsMainPage"),
);
const AthletePracticeSessionsPage = lazy(
  () => import("../pages/AthleteDashboard/AthletePracticeSessionsPage"),
);
const AthleteEventsPage = lazy(
  () => import("../pages/AthleteDashboard/AthleteEventsPage"),
);
const AthleteAttendancePage = lazy(
  () => import("../pages/AthleteDashboard/AthleteAttendancePage"),
);
const AthleteProfilePage = lazy(
  () => import("../pages/Athlete/Components/AthleteProfilePage"),
);
const AthleteDocumentsPage = lazy(
  () => import("../pages/Athlete/Components/AthleteDocumentsPage"),
);
const AthleteAcademicRecordsPage = lazy(
  () => import("../pages/Athlete/Components/AthleteAcademicRecordsPage"),
);
const CoachReviewDashboard = lazy(
  () => import("../pages/Coach/Components/CoachReviewDashboard"),
);
const EquipmentMainPage = lazy(
  () => import("../pages/Equipment/EquipmentMainPage"),
);


const PageLoader = () => (
  <div
    style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f1f35,#1a3a5c,#396B99)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 48,
          height: 48,
          border: "3px solid rgba(99,179,237,0.25)",
          borderTopColor: "#63b3ed",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 1rem",
        }}
      />
      <p
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: "0.8rem",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        Loading...
      </p>
    </div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />

        {/* Protected */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={
              user?.role === "Athlete" ? (
                <Navigate to="/athlete-dashboard" replace />
              ) : user?.role === "Coach" ? (
                <Navigate to="/coach-dashboard" replace />
              ) : (
                <DashboardMainPage />
              )
            }
          />

          {/* Athlete-only */}
          <Route
            path="/athlete-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Athlete"]}>
                <AthleteDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athlete/practice-sessions"
            element={
              <ProtectedRoute allowedRoles={["Athlete"]}>
                <AthletePracticeSessionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athlete/events"
            element={
              <ProtectedRoute allowedRoles={["Athlete"]}>
                <AthleteEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athlete/attendance"
            element={
              <ProtectedRoute allowedRoles={["Athlete"]}>
                <AthleteAttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athlete/documents"
            element={
              <ProtectedRoute allowedRoles={["Athlete"]}>
                <AthleteDocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athlete/academic-records"
            element={
              <ProtectedRoute allowedRoles={["Athlete"]}>
                <AthleteAcademicRecordsPage />
              </ProtectedRoute>
            }
          />

          {/* Coach-only */}
          <Route
            path="/coach-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Coach"]}>
                <CoachDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* All authenticated */}
          <Route path="/account-settings" element={<AccountSettingsPage />} />
          <Route path="/announcements" element={<AnnouncementMainPage />} />

          {/* Admin-only */}
          <Route
            path="/genders"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <GenderMainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <UserMainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <ReportsMainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sports"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <SportMainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sport/edit/:sport_id"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <EditSportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sport/delete/:sport_id"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DeleteSportPage />
              </ProtectedRoute>
            }
          />

          {/* Admin & Coach */}
          <Route
            path="/athletes"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Coach"]}>
                <AthleteMainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athletes/:athleteId"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Coach", "Athlete"]}>
                <AthleteProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/academic-reviews"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Coach"]}>
                <CoachReviewDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coaches"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Coach"]}>
                <CoachMainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Coach"]}>
                <EventMainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice-schedules"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Coach"]}>
                <PracticeScheduleMainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Coach"]}>
                <RecordMainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Coach"]}>
                <EquipmentMainPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

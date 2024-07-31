import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import AdminSidebar from "./scenes/global/AdminSidebar";
import CoordinatorSidebar from "./scenes/global/CoordinatorSidebar";
import VolunteerSidebar from "./scenes/global/VolunteerSidebar";
import AdminDashboard from "./scenes/dashboard/AdminDashboard";
import CoordinatorDashboard from "./scenes/dashboard/CoordinatorDashBoard";
import VolunteerDashboard from "./scenes/dashboard/VolunteerDashboard";
import ViewTeamDetails from "./components/ViewTeamDetails";
import ViewCommunityDetails from "./components/ViewCommunityDetails";
import ViewEventDetails from "./components/ViewEventDetails";
import ViewPollDetails from "./components/ViewPollDetails";
import ViewSurveyDetails from "./components/ViewSurveyDetails";
import ViewUserDetail from "./components/ViewUserDetail";
import ViewSingleCommunityDetails from "./components/ViewSingleCommunityDetails";
import ViewSingleEventDetail from "./components/ViewSingleEventDetail";
import ViewSinglePollDetails from "./components/ViewSinglePollDetails";
import ViewSingleSurveyDetails from "./components/ViewSingleSurveyDetails";
import ViewGoalsDetails from "./components/ViewGoalsDetails";
import ViewSingleGoalDetails from "./components/ViewSingleGoalDetails";
import ViewSingleTaskDetails from "./components/ViewTaskDetails";
import ViewSessionDetails from "./components/ViewSessionDetails";
import AddUser from "./components/AddUser";
import DeactivateUser from "./components/DeactivateUser";
import ReactivateUser from "./components/ReactivateUser";
import UserCommunitiesManager from "./components/UserCommunitiesManager";
import UserGoalsManager from "./components/UserGoalsManager";
import EditCommunity from "./components/EditCommunity";
import AddCommunity from "./components/AddCommunity";
import ManageCommunity from "./components/ManageCommunity";
import CommunityGoalsManager from "./components/CommunityGoalsManager";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import Login from "./components/Login";
import ChangePassword from "./components/ChangePassword";
import ResetPassword from "./components/ResetPassword";
import ForgotPassword from "./components/ForgotPassword";
import ManageTeam from "./components/ManageTeam";
import EditUser from "./components/EditUser";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  useEffect(() => {
    // Optionally, you can refresh userRole from localStorage or API
  }, []);

  const renderSidebar = () => {
    switch (userRole) {
      case "Administrator":
        return <AdminSidebar isSidebar={isSidebar} />;
      case "Coordinator":
        return <CoordinatorSidebar isSidebar={isSidebar} />;
      case "Volunteer":
        return <VolunteerSidebar isSidebar={isSidebar} />;
      default:
        return null;
    }
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<Login setUserRole={setUserRole} />} />
          <Route path="/reset_password" element={<ResetPassword />} />          
          <Route path="/forgot_password" element={<ForgotPassword />} />
  
          {/* Redirect root path to login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Dashboard Layout Routes */}
          <Route path="/*" element={
            <div className="app">
              {renderSidebar()}
              <main className="content">
                <Topbar setIsSidebar={setIsSidebar} />
                <Routes>
                  <Route path="/admin_dashboard" element={<AdminDashboard />} />
                  <Route path="/coordinator_dashboard" element={<CoordinatorDashboard />} />
                  <Route path="/volunteer_dashboard" element={<VolunteerDashboard />} />
                  
                  {/* Other routes */}
                  <Route path="/change_password" element={<ChangePassword />} />
                  <Route path="/team" element={<ViewTeamDetails />} />
                  <Route path="/user/:id" element={<ViewUserDetail />} />
                  <Route path="/community" element={<ViewCommunityDetails />} />
                  <Route path="/community/:id" element={<ViewSingleCommunityDetails/>} />
                  <Route path="/events" element={<ViewEventDetails />} />
                  <Route path="/events/:id" element={<ViewSingleEventDetail />} />
                  <Route path="/polls" element={<ViewPollDetails />} />
                  <Route path="/polls/:id" element={<ViewSinglePollDetails/>} />
                  <Route path="/surveys" element={<ViewSurveyDetails />} />
                  <Route path="/surveys/:id" element={<ViewSingleSurveyDetails />} />
                  <Route path="/goals" element={<ViewGoalsDetails/>} />
                  <Route path="/goals/:id" element={<ViewSingleGoalDetails />} />
                  <Route path="/tasks/:taskId" element={<ViewSingleTaskDetails />} />
                  <Route path="/sessions" element={<ViewSessionDetails/>} />
                  <Route path="/manage_team" element={<ManageTeam/>} />
                  <Route path="/edit_user/:id" element={<EditUser/>} />
                  <Route path="/add_user" element={<AddUser/>} />
                  <Route path="/deactivate_user/:id" element={<DeactivateUser />} />
                  <Route path="/reactivate_user/:id" element={<ReactivateUser/>} />
                  <Route path="/assign_community" element={<UserCommunitiesManager />} />
                  <Route path="/assign_goal" element={<UserGoalsManager />} />
                  <Route path="/add_community" element={<AddCommunity/>} />
                  <Route path="/edit_community/:id" element={<EditCommunity/>} />
                  <Route path="/manage_community" element={<ManageCommunity/>} />
                  <Route path="/assign_community_goal" element={<CommunityGoalsManager/>} />

        

                  
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/form" element={<Form />} />
                  <Route path="/bar" element={<Bar />} />
                  <Route path="/pie" element={<Pie />} />
                  <Route path="/line" element={<Line />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/geography" element={<Geography />} />
                </Routes>
              </main>
            </div>
          } />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

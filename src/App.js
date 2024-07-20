import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import AdminSidebar from "./scenes/global/AdminSidebar";
import CoordinatorSidebar from "./scenes/global/CoordinatorSidebar";
import VolunteerSidebar from "./scenes/global/VolunteerSidebar";
import AdminDashboard from "./scenes/dashboard/AdminDashboard";
import CoordinatorDashboard from "./scenes/dashboard/CoordinatorDashBoard";
import VolunteerDashboard from "./scenes/dashboard/VolunteerDashboard";
import Team from "./scenes/team";
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
                  <Route path="/team" element={<Team />} />
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

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import Prediction from "./pages/Prediction";
import WhaleActivity from "./pages/WhaleActivity";
import Anomalies from "./pages/Anomalies";
import RiskAnalysis from "./pages/RiskAnalysis";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* No Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Navbar */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/prediction"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Prediction />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/whales"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WhaleActivity />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/anomalies"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Anomalies />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/risk"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <RiskAnalysis />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

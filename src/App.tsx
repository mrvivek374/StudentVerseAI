import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./theme";
import { StoreProvider, useStore } from "./store";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Legal from "./pages/Legal";
import Resources from "./pages/Resources";
import Dashboard from "./pages/Dashboard";
import Copilot from "./components/Copilot";

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  return user ? <>{children}</> : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <div className="page-bg" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/privacy" element={<Legal title="Privacy Policy" />} />
          <Route path="/terms" element={<Legal title="Terms & Conditions" />} />
          <Route
            path="/app/*"
            element={
              <Protected>
                <Dashboard />
                <Copilot />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StoreProvider>
    </ThemeProvider>
  );
}

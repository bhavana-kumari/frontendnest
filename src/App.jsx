import { Route, Routes } from "react-router-dom";
import ProtectedRoute, { GuestRoute } from "./components/common/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import About from "./pages/About";
import AddProperty from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import OwnerDashboard from "./pages/OwnerDashboard";
import Profile from "./pages/Profile";
import PropertyDetails from "./pages/PropertyDetails";
import Register from "./pages/Register";
import SearchResults from "./pages/SearchResults";
import TenantDashboard from "./pages/TenantDashboard";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/explore" element={<SearchResults />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant"
          element={
            <ProtectedRoute role="tenant">
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <ProtectedRoute role="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/listings/new"
          element={
            <ProtectedRoute role="owner">
              <AddProperty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/listings/:id/edit"
          element={
            <ProtectedRoute role="owner">
              <EditProperty />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

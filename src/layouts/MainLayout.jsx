import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/navbar/Footer";
import { health } from "../services/geoService";

export default function MainLayout() {
  const [apiDown, setApiDown] = useState(false);

  useEffect(() => {
    health()
      .then(() => setApiDown(false))
      .catch(() => setApiDown(true));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Navbar />
      {apiDown && (
        <div className="bg-red-50 px-4 py-2 text-center text-sm text-red-800">
          The NestFind API is unreachable. Start the backend and confirm MongoDB is running.
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Layout() {
  return (
    <>
      <Header />
      <main className="p-4">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

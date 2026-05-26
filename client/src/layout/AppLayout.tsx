import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { HeaderProvider } from "../contexts/HeaderContext";
import AthleteStatusWarning from "../components/AthleteStatusWarning";

const AppLayout = () => {
  return (
    <HeaderProvider>
      <div className="min-h-screen bg-[#f0f4f8] dark:bg-[#0a0e1a] transition-colors duration-300">
        <AthleteStatusWarning />
        <AppSidebar />

        <div className="flex-1 flex flex-col transition-all duration-300">
          <div className="sticky top-0 z-[60]">
            <AppHeader />
          </div>

          <main className="pt-16 sm:ml-60 transition-all duration-300 px-6 sm:px-8 lg:px-10 py-6">
            <Outlet />
          </main>

          <footer className="mt-auto py-5 px-4 sm:px-5 lg:px-7 sm:ml-60 transition-all duration-300">
            <div className="text-center text-sm text-gray-500 dark:text-gray-600">
              <p>© 2025 FAMS. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </HeaderProvider>
  );
};

export default AppLayout;
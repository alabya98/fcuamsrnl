import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import AppRoutes from "./routes/AppRoutes";
import AthleteStatusWarning from "./components/AthleteStatusWarning";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          {/* ✅ NEW: Athlete Status Warning Banner - Shows for athletes with inactive status or approaching inactive */}
          <AthleteStatusWarning />

          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              // Default options
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                fontWeight: '600',
                fontSize: '14px',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              // Success toast style
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                  color: '#fff',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10b981',
                },
              },
              // Error toast style
              error: {
                duration: 4000,
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ef4444',
                },
              },
              // Loading toast style
              loading: {
                style: {
                  background: '#3b82f6',
                  color: '#fff',
                },
              },
            }}
          />
          
          <AppRoutes />
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
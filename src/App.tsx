import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Donors from "./pages/Donors";
import Emergency from "./pages/Emergency";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { cfg, missingEnvKeys } from "@/lib/config";

const queryClient = new QueryClient();

// Configuration check component
const ConfigCheck = () => {
  const missingKeys = missingEnvKeys();
  
  if (missingKeys.length === 0) {
    return null; // All config is present, render the app normally
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            VGU Blood Finder AI
          </h1>
          <p className="text-gray-600">
            Configuration required to get started
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-4">
            Missing Environment Variables
          </h2>
          <p className="text-yellow-700 mb-4">
            The following environment variables need to be configured:
          </p>
          <ul className="list-disc list-inside space-y-2 text-yellow-700">
            {missingKeys.map((key) => (
              <li key={key} className="font-mono text-sm">{key}</li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            How to Fix
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Create a <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> file in the project root</li>
            <li>Add the missing environment variables with your actual values</li>
            <li>Restart the development server</li>
          </ol>
          
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Example .env.local file:</p>
            <pre className="text-xs text-gray-800 overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_WA_COORDINATOR=+1234567890
VITE_WA_COMMUNITY_LINK=https://chat.whatsapp.com/your-community
VITE_AI_CHAT_ENDPOINT=https://your-ai-endpoint.com/chat
VITE_ADMIN_EMAIL=admin@vgu.edu.in
VITE_ADMIN_PASSWORD=admin123`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const missingKeys = missingEnvKeys();
  
  if (missingKeys.length > 0) {
    return <ConfigCheck />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="donors" element={<Donors />} />
              <Route path="emergency" element={<Emergency />} />
              <Route path="chat" element={<Chat />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

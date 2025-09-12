import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  AlertTriangle, 
  MessageCircle, 
  UserPlus,
  Menu,
  X,
  Download,
  Share2,
  LogOut
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { cfg } from '@/lib/config';
import { exportDonorsCSV } from '@/lib/hooks';
import ShareRegistration from './ShareRegistration';
import { useToast } from '@/hooks/use-toast';

const Layout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
    toast({
      title: "Logged out successfully",
    });
  };

  const handleExport = async () => {
    try {
      await exportDonorsCSV();
      toast({
        title: "Export successful",
        description: "Donors CSV downloaded",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export donors CSV",
        variant: "destructive",
      });
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Donors', href: '/donors', icon: Users },
    { name: 'Emergency', href: '/emergency', icon: AlertTriangle },
    { name: 'AI Chat', href: '/chat', icon: MessageCircle },
    { name: 'Register', href: '/register', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-surface border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            {/* Left side - Logo and app name */}
            <div className="flex items-center min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              <div className="flex items-center ml-2 lg:ml-0 min-w-0">
                <img
                  src={cfg.appLogo}
                  alt="VGU Logo"
                  className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 flex-shrink-0"
                />
                <h1 className="text-sm sm:text-xl font-semibold text-gray-900 truncate">
                  {cfg.appName}
                </h1>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Desktop Actions */}
              <button
                onClick={handleExport}
                className="hidden lg:inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>

              <button
                onClick={() => navigate('/emergency')}
                className="hidden sm:inline-flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium bg-danger text-text-invert rounded-lg hover:bg-red-700"
              >
                <AlertTriangle size={14} className="sm:mr-2" />
                <span className="hidden sm:inline">Emergency</span>
              </button>

              {/* Mobile Emergency Button */}
              <button
                onClick={() => navigate('/emergency')}
                className="sm:hidden p-2 bg-danger text-text-invert rounded-lg hover:bg-red-700"
                title="Emergency"
              >
                <AlertTriangle size={16} />
              </button>

              {/* Share Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="hidden sm:inline-flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Share2 size={14} className="sm:mr-2" />
                  <span className="hidden lg:inline">Share</span>
                </button>

                {/* Mobile Share Button */}
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="sm:hidden p-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  title="Share"
                >
                  <Share2 size={16} />
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <ShareRegistration onClose={() => setShowShareMenu(false)} />
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <LogOut size={14} className="sm:mr-2" />
                <span className="hidden lg:inline">Logout</span>
              </button>

              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                className="sm:hidden p-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-56 sm:w-64 bg-surface border-r border-gray-200 transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col h-full pt-14 sm:pt-16 lg:pt-0">
            <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2.5 sm:py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 group transition-colors"
                >
                  <item.icon size={18} className="mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Mobile Bottom Actions */}
            <div className="lg:hidden border-t border-gray-200 p-3 sm:p-4 space-y-2">
              <button
                onClick={() => {
                  handleExport();
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Download size={16} className="mr-3" />
                Export CSV
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          <div className="h-full overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
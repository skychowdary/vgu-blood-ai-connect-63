import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { cfg, missingEnvKeys } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';
import ConfigBanner from '@/components/ConfigBanner';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configErrors, setConfigErrors] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is already authenticated
    if (auth.isAuthenticated()) {
      navigate('/');
      return;
    }

    // Validate configuration
    const missing = missingEnvKeys();
    setConfigErrors(missing);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = auth.login(email, password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: `Welcome to ${cfg.appName}`,
        });
        navigate('/');
      } else {
        toast({
          title: "Invalid credentials",
          description: "Please check your email and password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show configuration error banner if needed
  if (configErrors.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Configuration Required
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Please set the following environment variables:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {configErrors.map((env) => (
                      <li key={env} className="font-mono text-xs">
                        {env}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
      <div className="w-full max-w-md">
        <ConfigBanner />
        <div className="vgu-card">
          {/* Logo and Title */}
          <div className="text-center mb-6 sm:mb-8">
            <img
              src={cfg.appLogo}
              alt="VGU Logo"
              className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {cfg.appName}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Sign in to access the dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="vgu-input"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="vgu-input pr-12"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full vgu-button-primary"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
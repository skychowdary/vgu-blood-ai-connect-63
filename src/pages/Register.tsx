import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Heart } from 'lucide-react';
import { supabase, BLOOD_GROUPS, USER_ROLES } from '@/lib/supabase';
import { cfg } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    branch: '',
    class_year: '',
    blood_group: '',
    phone_e164: '',
    availability: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Format phone number
      const cleanPhone = formData.phone_e164.replace(/\D/g, '');
      const phone_e164 = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

      // Prepare user data
      const userData = {
        full_name: formData.full_name,
        role: formData.role as any,
        branch: formData.branch,
        class_year: formData.role === 'Student' && formData.class_year ? parseInt(formData.class_year) : null,
        blood_group: formData.blood_group as any,
        phone_e164,
        availability: formData.availability,
      };

      const { error } = await supabase.from('users').insert([userData]);
      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Registration successful! 🎉",
        description: "Welcome to VGU Blood Finder AI",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="vgu-card">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">Welcome to the VGU Blood Finder community</p>
            
            <a
              href={cfg.tgJoinLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full vgu-button-primary inline-flex items-center justify-center mb-4"
            >
              <Heart size={16} className="mr-2" />
              Join Telegram Channel
            </a>
            
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium text-red-600">🚨 For Emergency Alerts:</span> Join our community to receive instant notifications about urgent blood donation requests and save lives!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
      <div className="w-full max-w-2xl">
        <div className="vgu-card">
          <div className="text-center mb-6 sm:mb-8">
            <img src={cfg.appLogo} alt="VGU Logo" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Join as a Blood Donor</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Help save lives in your community</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleInputChange}
                className="vgu-input"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="vgu-input"
                required
                disabled={submitting}
              >
                <option value="">Select Role</option>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch *
              </label>
              <input
                name="branch"
                type="text"
                value={formData.branch}
                onChange={handleInputChange}
                className="vgu-input"
                placeholder="e.g., Computer Science"
                required
                disabled={submitting}
              />
            </div>

            {formData.role === 'Student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Year
                </label>
                <input
                  name="class_year"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.class_year}
                  onChange={handleInputChange}
                  className="vgu-input"
                  placeholder="e.g., 2"
                  disabled={submitting}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group *
              </label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleInputChange}
                className="vgu-input"
                required
                disabled={submitting}
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                name="phone_e164"
                type="tel"
                value={formData.phone_e164}
                onChange={handleInputChange}
                className="vgu-input"
                placeholder="9876543210"
                required
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">10-digit number without +91</p>
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center">
                <input
                  name="availability"
                  type="checkbox"
                  checked={formData.availability}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                  disabled={submitting}
                />
                <span className="text-sm text-gray-700">I am currently available to donate blood</span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full vgu-button-primary"
              >
                {submitting ? 'Registering...' : 'Register as Donor'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Register;
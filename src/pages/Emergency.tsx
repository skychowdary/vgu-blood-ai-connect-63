import { useState } from 'react';
import { AlertTriangle, Phone, MapPin, Calendar, User } from 'lucide-react';
import { supabase, BLOOD_GROUPS } from '@/lib/supabase';
import { useEmergencyRequests } from '@/lib/hooks';
import { cfg, createEmergencyMessage } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';
import EmergencyList from '@/components/EmergencyList';

const Emergency = () => {
  const { toast } = useToast();
  const { data: emergencyRequests, loading: emergencyLoading, refetch } = useEmergencyRequests();
  
  // Form state
  const [formData, setFormData] = useState({
    requester_name: '',
    blood_group: '',
    units_needed: 1,
    hospital: '',
    location: '',
    contact_phone: '',
    need_by: '',
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'units_needed' ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.blood_group) {
        toast({
          title: "Blood group required",
          description: "Please select a blood group",
          variant: "destructive",
        });
        return;
      }

      // Format phone number (remove non-digits, ensure E.164 format)
      const cleanPhone = formData.contact_phone.replace(/\D/g, '');
      const phone_e164 = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

      // Prepare emergency data
      const emergencyData = {
        requester_name: formData.requester_name || null,
        blood_group: formData.blood_group as any,
        units_needed: formData.units_needed,
        hospital: formData.hospital || null,
        location: formData.location || null,
        contact_phone: phone_e164 || null,
        need_by: formData.need_by ? new Date(formData.need_by).toISOString() : null,
        status: 'open' as const,
      };

      // Insert into database
      const { error } = await supabase
        .from('emergency_requests')
        .insert([emergencyData]);

      if (error) throw error;

      // Create WhatsApp message for coordinator
      const message = createEmergencyMessage(
        formData.blood_group,
        formData.units_needed,
        formData.hospital || 'Not specified',
        formData.location || 'Not specified',
        formData.contact_phone || 'Not provided'
      );

      // Open WhatsApp to coordinator
      const whatsappUrl = `https://wa.me/${cfg.waCoordinator}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // Success feedback
      toast({
        title: "Emergency request submitted",
        description: "Coordinator has been notified via WhatsApp",
      });

      // Reset form
      setFormData({
        requester_name: '',
        blood_group: '',
        units_needed: 1,
        hospital: '',
        location: '',
        contact_phone: '',
        need_by: '',
      });

      // Refresh emergency list
      refetch();

    } catch (error) {
      console.error('Error submitting emergency request:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit emergency request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto min-h-screen">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start mb-4">
          <AlertTriangle size={28} className="text-red-600 mr-0 sm:mr-3 mb-2 sm:mb-0 flex-shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Emergency Blood Center</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Submit urgent blood requests and manage emergency situations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Emergency Request Form */}
        <div className="vgu-card">
          <div className="flex items-center mb-6">
            <AlertTriangle size={24} className="text-red-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Create Emergency Request
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Requester Name */}
            <div>
              <label htmlFor="requester_name" className="block text-sm font-medium text-gray-700 mb-1">
                Requester Name (Optional)
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="requester_name"
                  name="requester_name"
                  type="text"
                  value={formData.requester_name}
                  onChange={handleInputChange}
                  className="vgu-input pl-10"
                  placeholder="Your name or organization"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Blood Group & Units */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="blood_group" className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group *
                </label>
                <select
                  id="blood_group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleInputChange}
                  className="vgu-input"
                  required
                  disabled={submitting}
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="units_needed" className="block text-sm font-medium text-gray-700 mb-1">
                  Units Needed
                </label>
                <input
                  id="units_needed"
                  name="units_needed"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.units_needed}
                  onChange={handleInputChange}
                  className="vgu-input"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Hospital */}
            <div>
              <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">
                Hospital
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="hospital"
                  name="hospital"
                  type="text"
                  value={formData.hospital}
                  onChange={handleInputChange}
                  className="vgu-input pl-10"
                  placeholder="Hospital name"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                className="vgu-input"
                placeholder="City, area, or detailed address"
                disabled={submitting}
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="vgu-input pl-10"
                  placeholder="WhatsApp number (e.g., 9876543210)"
                  disabled={submitting}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter 10-digit mobile number without +91
              </p>
            </div>

            {/* Need By */}
            <div>
              <label htmlFor="need_by" className="block text-sm font-medium text-gray-700 mb-1">
                Needed By (Optional)
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="need_by"
                  name="need_by"
                  type="datetime-local"
                  value={formData.need_by}
                  onChange={handleInputChange}
                  className="vgu-input pl-10"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full vgu-button-danger"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Emergency Request...
                </div>
              ) : (
                <>
                  <AlertTriangle size={16} className="mr-2" />
                  Submit Emergency Request
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              This will notify the coordinator via WhatsApp and add the request to our system
            </p>
          </form>
        </div>

        {/* Active Emergency Requests */}
        <div className="vgu-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Active Emergency Requests
            </h2>
            <span className="vgu-badge-danger">
              {emergencyRequests.length} Open
            </span>
          </div>

          <EmergencyList 
            requests={emergencyRequests}
            loading={emergencyLoading}
            compact={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Emergency;
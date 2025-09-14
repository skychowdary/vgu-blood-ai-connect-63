import { useState } from 'react';
import { AlertTriangle, Phone, MapPin, Calendar, User } from 'lucide-react';
import { supabase, BLOOD_GROUPS } from '@/lib/supabase';
import { useEmergencyRequests } from '@/lib/hooks';
import { cfg } from '@/lib/config';
import { sendTelegramAlert } from '@/lib/telegram';
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

  const handleStatusChange = async (requestId: string, newStatus: 'open' | 'closed') => {
    try {
      const { error } = await supabase
        .from('emergency_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Request marked as ${newStatus}`,
      });

      // Refresh emergency list
      refetch();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update failed",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

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
      const { data, error } = await supabase
        .from('emergency_requests')
        .insert([emergencyData])
        .select()
        .single();

      if (error) throw error;

      // Send Telegram alert
      try {
        await sendTelegramAlert({
          blood_group: formData.blood_group,
          units_needed: formData.units_needed,
          hospital: formData.hospital || null,
          location: formData.location || null,
          contact_phone: formData.contact_phone || null,
          need_by: formData.need_by || null,
          requester_name: formData.requester_name || null,
        });
      } catch (telegramError) {
        console.error('Telegram alert failed:', telegramError);
        // Show warning but don't fail the entire request
        toast({
          title: "Telegram alert failed",
          description: "Request saved but could not send Telegram notification. Check console for details.",
          variant: "destructive",
        });
      }

      // Success feedback
      toast({
        title: "Emergency request submitted",
        description: "Alert sent to Telegram channel and added to system",
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
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start mb-4">
          <AlertTriangle size={24} className="text-red-600 mr-0 sm:mr-3 mb-2 sm:mb-0 flex-shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Emergency Blood Center</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Submit urgent blood requests and manage emergency situations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Emergency Request Form */}
        <div className="vgu-card">
          <div className="flex items-center mb-4 sm:mb-6">
            <AlertTriangle size={20} className="text-red-600 mr-2 sm:mr-3" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Create Emergency Request
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
                  className="vgu-input pl-10 text-sm sm:text-base"
                  placeholder="Your name or organization"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Blood Group & Units */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="blood_group" className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group *
                </label>
                <select
                  id="blood_group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleInputChange}
                  className="vgu-input text-sm sm:text-base"
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
                  className="vgu-input text-sm sm:text-base"
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
                  className="vgu-input pl-10 text-sm sm:text-base"
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
                  className="vgu-input text-sm sm:text-base"
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
                  className="vgu-input pl-10 text-sm sm:text-base"
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
                  className="vgu-input pl-10 text-sm sm:text-base"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full vgu-button-danger text-sm sm:text-base py-3 sm:py-4 font-semibold touch-target"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    <span className="text-sm sm:text-base">Submitting Emergency Request...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <AlertTriangle size={16} className="mr-2" />
                    <span>Submit Emergency Request</span>
                  </div>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-2 px-2">
                This will send an alert to the Telegram channel and add the request to our system
              </p>
            </div>
          </form>
        </div>

        {/* Active Emergency Requests */}
        <div className="vgu-card">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Active Emergency Requests
            </h2>
            <span className="vgu-badge-danger text-xs sm:text-sm">
              {emergencyRequests.filter(r => r.status === 'open').length} Open
            </span>
          </div>

           <EmergencyList 
             requests={emergencyRequests}
             loading={emergencyLoading}
             compact={false}
             onStatusChange={handleStatusChange}
           />
        </div>
      </div>
    </div>
  );
};

export default Emergency;
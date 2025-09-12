import { useEffect, useState } from 'react';
import { Users, Heart, AlertTriangle, TrendingUp } from 'lucide-react';
import { useDashboardStats, useEmergencyRequests } from '@/lib/hooks';
import { supabase, BLOOD_GROUPS } from '@/lib/supabase';
import StatCard from '@/components/StatCard';
import ChartPie from '@/components/ChartPie';
import ChartBar from '@/components/ChartBar';
import EmergencyList from '@/components/EmergencyList';
import ConfigBanner from '@/components/ConfigBanner';

const Dashboard = () => {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { data: emergencyRequests, loading: emergencyLoading } = useEmergencyRequests();
  
  const [bloodGroupData, setBloodGroupData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Blood group colors
  const bloodGroupColors: Record<string, string> = {
    'A+': '#EF4444', // red-500
    'A-': '#DC2626', // red-600
    'B+': '#3B82F6', // blue-500
    'B-': '#2563EB', // blue-600
    'O+': '#10B981', // emerald-500
    'O-': '#059669', // emerald-600
    'AB+': '#8B5CF6', // violet-500
    'AB-': '#7C3AED', // violet-600
  };

  useEffect(() => {
    const fetchChartData = async () => {
      setChartsLoading(true);
      
      try {
        // Fetch blood group distribution
        const { data: users } = await supabase
          .from('users')
          .select('blood_group, branch');

        if (users) {
          // Blood group chart data
          const bloodGroupCounts = BLOOD_GROUPS.reduce((acc, group) => {
            acc[group] = users.filter(user => user.blood_group === group).length;
            return acc;
          }, {} as Record<string, number>);

          const bloodChartData = Object.entries(bloodGroupCounts)
            .filter(([_, count]) => count > 0)
            .map(([group, count]) => ({
              name: group,
              value: count,
              color: bloodGroupColors[group] || '#6B7280',
            }));

          setBloodGroupData(bloodChartData);

          // Branch chart data
          const branchCounts = users.reduce((acc, user) => {
            const branch = user.branch || 'Unknown';
            acc[branch] = (acc[branch] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const branchChartData = Object.entries(branchCounts)
            .map(([branch, count]) => ({
              name: branch,
              value: count,
            }));

          setBranchData(branchChartData);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setChartsLoading(false);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto min-h-screen">
      <ConfigBanner />
      
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Overview of blood donor management and emergency requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Donors"
          value={stats.totalDonors}
          icon={Users}
          description="Registered users"
          loading={statsLoading}
        />
        
        <StatCard
          title="Available Donors"
          value={stats.availableDonors}
          icon={Heart}
          description="Ready to donate"
          loading={statsLoading}
        />
        
        <StatCard
          title="Open Emergencies"
          value={stats.openEmergencies}
          icon={AlertTriangle}
          description="Active requests"
          loading={statsLoading}
        />
        
        <StatCard
          title="Availability Rate"
          value={`${stats.availabilityPercentage}%`}
          icon={TrendingUp}
          description="Available / Total"
          loading={statsLoading}
        />
      </div>

      {/* Charts and Emergency Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Charts Section */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          <ChartPie
            data={bloodGroupData}
            title="Donors by Blood Group"
            loading={chartsLoading}
          />
          
          <ChartBar
            data={branchData}
            title="Donors by Branch"
            loading={chartsLoading}
          />
        </div>

        {/* Emergency Alerts Sidebar */}
        <div className="xl:col-span-1 order-first xl:order-last">
          <div className="vgu-card h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Live Emergency Alerts
              </h3>
              <span className="vgu-badge-danger">
                {stats.openEmergencies} Open
              </span>
            </div>
            
            <div className="max-h-96 xl:max-h-[600px] overflow-y-auto">
              <EmergencyList 
                requests={emergencyRequests}
                loading={emergencyLoading}
                compact={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
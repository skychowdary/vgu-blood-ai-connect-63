import { useState, useEffect } from 'react';
import { supabase, type User, type EmergencyRequest } from './supabase';
import Papa from 'papaparse';

// Fetch donors with filters and pagination
export const useDonors = (filters: {
  bloodGroup?: string;
  branch?: string;
  availableOnly?: boolean;
  page?: number;
  limit?: number;
}) => {
  const [data, setData] = useState<User[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonors = async () => {
    setLoading(true);
    setError(null);

    try {
      const { bloodGroup, branch, availableOnly = true, page = 0, limit = 25 } = filters;
      
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .range(page * limit, (page + 1) * limit - 1);

      if (availableOnly) {
        query = query.eq('availability', true);
      }

      if (bloodGroup) {
        query = query.eq('blood_group', bloodGroup);
      }

      if (branch) {
        query = query.ilike('branch', `${branch}%`);
      }

      const { data: users, count: totalCount, error } = await query;

      if (error) throw error;

      setData(users || []);
      setCount(totalCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch donors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [filters.bloodGroup, filters.branch, filters.availableOnly, filters.page]);

  return { data, count, loading, error, refetch: fetchDonors };
};

// Fetch emergency requests
export const useEmergencyRequests = () => {
  const [data, setData] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data: requests, error } = await supabase
        .from('emergency_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emergency requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return { data, loading, error, refetch: fetchRequests };
};

// Dashboard statistics
export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    availableDonors: 0,
    openEmergencies: 0,
    availabilityPercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total donors
        const { count: totalDonors } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Get available donors
        const { count: availableDonors } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('availability', true);

        // Get open emergencies
        const { count: openEmergencies } = await supabase
          .from('emergency_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open');

        const availabilityPercentage = totalDonors > 0 ? Math.round((availableDonors / totalDonors) * 100) : 0;

        setStats({
          totalDonors: totalDonors || 0,
          availableDonors: availableDonors || 0,
          openEmergencies: openEmergencies || 0,
          availabilityPercentage,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};

// Export donors to CSV
export const exportDonorsCSV = async () => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;

    const csv = Papa.unparse(users || []);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `vgu_donors_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
};
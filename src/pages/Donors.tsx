import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, MessageCircle, Phone } from 'lucide-react';
import { useDonors, exportDonorsCSV } from '@/lib/hooks';
import { supabase, BLOOD_GROUPS, type User } from '@/lib/supabase';
import { createDonorMessage } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';

const Donors = () => {
  const { toast } = useToast();
  
  // Filters
  const [bloodGroup, setBloodGroup] = useState('');
  const [branch, setBranch] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Branch suggestions
  const [branchSuggestions, setBranchSuggestions] = useState<string[]>([]);
  const [showBranchSuggestions, setShowBranchSuggestions] = useState(false);
  
  // Data
  const { data: donors, count, loading, error } = useDonors({
    bloodGroup: bloodGroup || undefined,
    branch: branch || undefined,
    availableOnly,
    page,
    limit: 25,
  });

  // Debounced search for branch suggestions
  useEffect(() => {
    if (branch.length > 1) {
      const timeoutId = setTimeout(async () => {
        try {
          const { data } = await supabase
            .from('users')
            .select('branch')
            .ilike('branch', `${branch}%`)
            .limit(10);
          
          if (data) {
            const uniqueBranches = Array.from(
              new Set(
                (data as { branch: string | null }[])
                  .map((row) => row.branch)
                  .filter((b): b is string => typeof b === 'string' && b.length > 0)
              )
            );
            setBranchSuggestions(uniqueBranches.slice(0, 5));
            setShowBranchSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching branch suggestions:', error);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setBranchSuggestions([]);
      setShowBranchSuggestions(false);
    }
  }, [branch]);

  // Filter donors by search term
  const filteredDonors = useMemo(() => {
    if (!searchTerm) return donors;
    
    const term = searchTerm.toLowerCase();
    return donors.filter(donor =>
      donor.full_name.toLowerCase().includes(term) ||
      donor.branch.toLowerCase().includes(term) ||
      donor.blood_group.toLowerCase().includes(term) ||
      donor.role.toLowerCase().includes(term)
    );
  }, [donors, searchTerm]);

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

  const handleWhatsAppContact = (donor: User) => {
    const message = createDonorMessage(donor.full_name, donor.blood_group, donor.branch);
    const whatsappUrl = `https://wa.me/${donor.phone_e164}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const clearFilters = () => {
    setBloodGroup('');
    setBranch('');
    setAvailableOnly(true);
    setSearchTerm('');
    setPage(0);
  };

  const totalPages = Math.ceil(count / 25);

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="mb-3 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Donor Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            {count} total donors • Page {page + 1} of {Math.max(1, totalPages)}
          </p>
        </div>
        
        <button
          onClick={handleExport}
          className="w-full sm:w-auto vgu-button-secondary inline-flex items-center justify-center"
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="vgu-card mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center mb-4">
          <div className="flex items-center mb-2 sm:mb-0">
            <Filter size={20} className="text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          
          {(bloodGroup || branch || !availableOnly) && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-accent sm:ml-auto"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search donors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="vgu-input pl-10"
            />
          </div>

          {/* Blood Group Filter */}
          <div>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="vgu-input"
            >
              <option value="">All Blood Groups</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Branch (type to search)"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              onFocus={() => setShowBranchSuggestions(true)}
              onBlur={() => setTimeout(() => setShowBranchSuggestions(false), 200)}
              className="vgu-input"
            />
            
            {showBranchSuggestions && branchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10">
                {branchSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setBranch(suggestion);
                      setShowBranchSuggestions(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Availability Filter */}
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
              />
              <span className="text-sm text-gray-700">Available only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Donors Table - Desktop */}
      <div className="hidden lg:block vgu-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blood Group
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 xl:px-6 py-4">
                        <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 xl:px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>No donors found</p>
                    <p className="text-sm mt-1">
                      Try adjusting your filters or search term
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDonors.map((donor) => (
                  <tr key={donor.id} className="hover:bg-gray-50">
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {donor.full_name}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donor.role}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donor.branch}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donor.class_year || '-'}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <span className="vgu-badge-primary">
                        {donor.blood_group}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleWhatsAppContact(donor)}
                        className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                        title="Contact via WhatsApp"
                      >
                        <MessageCircle size={16} className="mr-1" />
                        <span className="hidden xl:inline">{donor.phone_e164}</span>
                        <span className="xl:hidden">Contact</span>
                      </button>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <span className={`vgu-badge ${
                        donor.availability ? 'vgu-badge-success' : 'vgu-badge-warning'
                      }`}>
                        {donor.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        {totalPages > 1 && (
          <div className="px-3 sm:px-4 xl:px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
              Showing {page * 25 + 1} to {Math.min((page + 1) * 25, count)} of {count} results
            </div>
            
            <div className="flex justify-center sm:justify-end space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-1 text-sm bg-primary text-white rounded-lg">
                {page + 1}
              </span>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Donors Cards - Mobile/Tablet */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {loading ? (
          [...Array(10)].map((_, i) => (
            <div key={i} className="vgu-card animate-pulse">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredDonors.length === 0 ? (
          <div className="vgu-card text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-lg font-medium">No donors found</p>
            <p className="text-sm mt-1">
              Try adjusting your filters or search term
            </p>
          </div>
        ) : (
          filteredDonors.map((donor) => (
            <div key={donor.id} className="vgu-card hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                    {donor.full_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {donor.role} • {donor.branch}
                    {donor.class_year && ` • Year ${donor.class_year}`}
                  </p>
                </div>
                <span className={`vgu-badge ml-2 flex-shrink-0 ${
                  donor.availability ? 'vgu-badge-success' : 'vgu-badge-warning'
                }`}>
                  {donor.availability ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="vgu-badge-primary text-sm">
                  {donor.blood_group}
                </span>
                
                <button
                  onClick={() => handleWhatsAppContact(donor)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 touch-target"
                >
                  <MessageCircle size={16} className="mr-1" />
                  <span className="hidden sm:inline">Contact</span>
                  <span className="sm:hidden">Chat</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination for Mobile Cards */}
      {totalPages > 1 && (
        <div className="lg:hidden mt-4 sm:mt-6">
          <div className="vgu-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Showing {page * 25 + 1} to {Math.min((page + 1) * 25, count)} of {count} results
              </div>
              
              <div className="flex justify-center sm:justify-end space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-target transition-colors duration-200"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium">
                  {page + 1}
                </span>
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-target transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donors;
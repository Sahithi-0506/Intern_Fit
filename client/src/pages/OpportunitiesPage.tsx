import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Internship } from '@internfit/shared';
import { InternshipCard } from '../components/internships/InternshipCard';
import { FilterSidebar } from '../components/internships/FilterSidebar';
import { SkillMatchModal } from '../components/resume/SkillMatchModal';
import { Briefcase, Loader2 } from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All');
  const [workMode, setWorkMode] = useState('All');
  const [category, setCategory] = useState('All');

  const [selectedMatchInternship, setSelectedMatchInternship] = useState<Internship | null>(null);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (city !== 'All') params.append('city', city);
      if (workMode !== 'All') params.append('workMode', workMode);
      if (category !== 'All') params.append('category', category);

      const res = await api.get(`/internships?${params.toString()}`);
      if (res.data.success) {
        setInternships(res.data.items);
        setTotal(res.data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOpportunities();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, city, workMode, category]);

  const handleToggleSave = async (id: string) => {
    try {
      await api.post(`/internships/${id}/save`);
      fetchOpportunities();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCity('All');
    setWorkMode('All');
    setCategory('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Briefcase className="w-7 h-7 text-teal-600" />
          Genuine Internship Opportunities Across India
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Every published opportunity contains verified supporting evidence and links to the original employer application portal.
        </p>
      </div>

      {/* Main Grid: Filters + Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <FilterSidebar
            search={search}
            onSearchChange={setSearch}
            city={city}
            onCityChange={setCity}
            workMode={workMode}
            onWorkModeChange={setWorkMode}
            category={category}
            onCategoryChange={setCategory}
            onReset={handleResetFilters}
          />
        </div>

        {/* Listings List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Showing {internships.length} verified listings</span>
            {city !== 'All' && <span className="text-teal-700">Filtered by: {city}</span>}
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <span className="text-sm text-slate-500">Loading opportunities...</span>
            </div>
          ) : internships.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No matching internships found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search criteria or reset filters to see all available openings across India.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {internships.map(internship => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  onToggleSave={handleToggleSave}
                  onMatchSkills={int => setSelectedMatchInternship(int)}
                  onRefresh={fetchOpportunities}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Skill Match Modal */}
      {selectedMatchInternship && (
        <SkillMatchModal
          isOpen={!!selectedMatchInternship}
          onClose={() => setSelectedMatchInternship(null)}
          internshipId={selectedMatchInternship.id}
          internshipTitle={selectedMatchInternship.title}
          companyName={selectedMatchInternship.companyName}
        />
      )}
    </div>
  );
};

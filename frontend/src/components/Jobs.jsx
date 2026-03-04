import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Settings,
  Plus,
  CheckCircle2,
  ChevronDown,
  Info,
  SlidersHorizontal,
  Check,
  Search,
  X,
  Home,
  Building2,
  Briefcase,
  Loader2,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { BRAND } from '../config/branding';
import { API_URL } from '../config/api';
import SideMenu from './SideMenu';
import Header from './Header';
import JobCardOrion from './JobCardOrion';
import DashboardLayout from './DashboardLayout';
import './SideMenu.css';

const Jobs = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Nova Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);

  // Jobs data state
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobStats, setJobStats] = useState({ totalJobs: 0, visaJobs: 0, remoteJobs: 0, highPayJobs: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('us');
  const [sponsorshipFilter, setSponsorshipFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [userProfile, setUserProfile] = useState(null);
  const [recommendedTags, setRecommendedTags] = useState([]);

  // Advanced Filter States
  const [selectedJobFunctions, setSelectedJobFunctions] = useState([]);
  const [jobFunctionInput, setJobFunctionInput] = useState('');
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [allLocationsToggle, setAllLocationsToggle] = useState(false);
  const [selectedCities, setSelectedCities] = useState([]);
  const [cityInput, setCityInput] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [datePostedFilter, setDatePostedFilter] = useState('all');
  const [yearsExperienceFilter, setYearsExperienceFilter] = useState('all');

  // Fetch user profile to get default filters
  const fetchUserProfile = async () => {
    try {
      const storedToken = token || localStorage.getItem('auth_token');
      if (!storedToken) return;

      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: { 'token': storedToken }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setUserProfile(data.profile);

          // Set defaults if currently empty
          const targetRole = data.profile.preferences?.target_role || data.profile.targetRole;
          const preferredLocation = data.profile.preferences?.preferred_locations || data.profile.address?.city || data.profile.city;

          if (targetRole && !searchKeyword) {
            setSearchKeyword(targetRole);
          }
          if (preferredLocation && !locationFilter) {
            setLocationFilter(preferredLocation);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching user profile for filters:', err);
    }
  };


  // Fetch jobs from API
  const fetchJobs = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `${API_URL}/api/jobs?page=${page}&limit=20`;

      if (countryFilter && countryFilter !== 'all') {
        url += `&country=${countryFilter}`;
      }

      if (searchKeyword) {
        url += `&search=${encodeURIComponent(searchKeyword)}`;
      }

      if (locationFilter) {
        url += `&location=${encodeURIComponent(locationFilter)}`;
      }

      if (workTypeFilter && workTypeFilter !== 'all') {
        url += `&type=${workTypeFilter}`;
      }

      if (sponsorshipFilter === 'visa-friendly') {
        url += `&visa=true`;
      }

      // Add advanced filters to query
      if (selectedJobFunctions.length > 0) {
        url += `&job_functions=${encodeURIComponent(selectedJobFunctions.join(','))}`;
      }
      if (selectedExperience.length > 0) {
        url += `&experience=${encodeURIComponent(selectedExperience.join(','))}`;
      }
      if (selectedCities.length > 0) {
        url += `&cities=${encodeURIComponent(selectedCities.join(','))}`;
      }
      if (datePostedFilter !== 'all') {
        url += `&date_posted=${datePostedFilter}`;
      }
      if (salaryFilter !== 'all') {
        url += `&salary=${salaryFilter}`;
      }

      console.log('Fetching jobs from:', url);

      const headers = {};
      // Add token for personalized match scores
      if (token) {
        headers['token'] = token;
      } else {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) headers['token'] = storedToken;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      const jobsArray = data.jobs || [];

      if (jobsArray.length > 0) {
        const mappedJobs = jobsArray.map(job => ({
          id: job.id || job._id || job.externalId,
          title: job.title,
          company: job.company,
          location: job.location,
          salaryRange: job.salaryRange || job.salary || 'Competitive',
          description: job.description,
          type: job.type || 'onsite',
          visaTags: job.visaTags || [],
          categoryTags: job.categoryTags || [],
          highPay: job.highPay || false,
          matchScore: job.matchScore || 0,
          sourceUrl: job.sourceUrl || job.url
        }));
        setJobs(mappedJobs);

        if (data.pagination) {
          setPagination(data.pagination);
        } else {
          const total = data.total || mappedJobs.length;
          setPagination({
            page: page,
            limit: 20,
            total,
            pages: Math.ceil(total / 20)
          });
        }
        console.log('Loaded', mappedJobs.length, 'jobs');
      } else {
        setJobs([]);
        setPagination(data.pagination || { page: 1, limit: 20, total: jobsArray.length, pages: 1 });
        setError('No jobs found matching your filters');
      }

      if (data.recommendedFilters) {
        setRecommendedTags(data.recommendedFilters);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(`Failed to load jobs: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch job stats
  const fetchJobStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/jobs/stats/summary`);
      const data = await response.json();
      // Handle both {success, stats} and direct stats response
      if (data.stats) {
        setJobStats(data.stats);
      } else if (data.totalJobs !== undefined) {
        setJobStats(data);
      }
    } catch (error) {
      console.error('Error fetching job stats:', error);
    }
  };

  // Initial fetch on component mount
  // Fetch jobs when filters or page change
  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage, countryFilter, workTypeFilter, sponsorshipFilter, selectedJobFunctions, selectedExperience, selectedCities, datePostedFilter, salaryFilter]);

  // Debounced keyword search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchJobs(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword, locationFilter]);

  // Initial fetch for stats and profile
  useEffect(() => {
    fetchJobStats();
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  // Filter jobs locally
  // Jobs are now filtered on the server
  const displayJobs = jobs;

  const getWorkTypeIcon = (type) => {
    switch (type) {
      case 'remote': return <Home className="w-3 h-3" />;
      case 'hybrid': return <Building2 className="w-3 h-3" />;
      case 'onsite': return <Briefcase className="w-3 h-3" />;
      default: return <Briefcase className="w-3 h-3" />;
    }
  };


  const clearFilters = () => {
    setSearchKeyword('');
    setLocationFilter('');
    setCountryFilter('us');
    setSponsorshipFilter('all');
    setWorkTypeFilter('all');
    setSelectedJobFunctions([]);
    setSelectedExperience([]);
    setAllLocationsToggle(false);
    setSelectedCities([]);
    setSalaryFilter('all');
    setIndustryFilter('all');
    setDatePostedFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchKeyword || locationFilter || countryFilter !== 'usa' || sponsorshipFilter !== 'all' || workTypeFilter !== 'all';

  const handleAskNova = (job) => {
    setActiveJob(job);
    setIsChatOpen(true);
  };

  return (
    <DashboardLayout activePage="jobs">
      <div className="jobs-page-content p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-4 sm:mb-2">
          <h1 className="text-xl sm:text-2xl font-bold">Recommended Jobs</h1>
          <div className="flex items-center gap-4">
            <div className="text-xs sm:text-sm text-gray-500">
              Based on your resume profile
            </div>
            <div className="text-xs sm:text-sm font-bold text-gray-400">
              {pagination.total.toLocaleString()} total
            </div>
          </div>
        </div>


        {/* Advanced Filters Section */}
        <section className="jobs-filters-section mb-6">
          <div className="flex flex-col gap-4">
            {/* Top Row: Core Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Country & Location Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={`rounded-full h-8 px-3 text-xs font-medium border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 ${countryFilter !== 'us' || selectedCities.length > 0 ? 'border-primary text-primary bg-primary/5' : ''}`}>
                    {selectedCities.length > 0 ? selectedCities[0] : (countryFilter === 'us' ? 'United States' : 'Canada')}
                    {selectedCities.length > 1 && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1 h-3.5 flex items-center justify-center">+{selectedCities.length - 1}</Badge>}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold mb-3">Country</h4>
                      <RadioGroup value={countryFilter} onValueChange={setCountryFilter} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="us" id="us" className="text-primary border-gray-300" />
                          <Label htmlFor="us" className="text-sm font-medium">United States</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ca" id="ca" className="text-primary border-gray-300" />
                          <Label htmlFor="ca" className="text-sm font-medium">Canada</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold">Location</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-500">All locations {countryFilter === 'us' ? 'within the US' : 'within Canada'}</span>
                          <Checkbox checked={allLocationsToggle} onCheckedChange={setAllLocationsToggle} className="rounded-full" />
                        </div>
                      </div>

                      {!allLocationsToggle && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {selectedCities.map(city => (
                              <Badge key={city} className="bg-emerald-100 text-emerald-700 border-0 flex items-center gap-1 py-1 px-2 text-xs">
                                {city}
                                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCities(prev => prev.filter(c => c !== city))} />
                              </Badge>
                            ))}
                          </div>
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Enter City"
                              className="pl-9 h-10 text-sm border-gray-200"
                              value={cityInput}
                              onChange={(e) => setCityInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && cityInput.trim()) {
                                  if (!selectedCities.includes(cityInput.trim())) {
                                    setSelectedCities(prev => [...prev, cityInput.trim()]);
                                  }
                                  setCityInput('');
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => {
                        setSelectedCities([]);
                        setAllLocationsToggle(false);
                      }}>Reset</Button>
                      <Button size="sm" className="flex-1 text-xs bg-black text-white hover:bg-black/90" onClick={() => {
                        if (cityInput.trim() && !selectedCities.includes(cityInput.trim())) {
                          setSelectedCities(prev => [...prev, cityInput.trim()]);
                          setCityInput('');
                        }
                      }}>Confirm</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Job Function / Search Query Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={`rounded-full h-8 px-3 text-xs font-medium border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 ${selectedJobFunctions.length > 0 || searchKeyword ? 'border-primary text-primary bg-primary/5' : ''}`}>
                    {searchKeyword || (selectedJobFunctions.length > 0 ? selectedJobFunctions[0] : 'Job Function')}
                    {selectedJobFunctions.length > 1 && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1 h-3.5 flex items-center justify-center">+{selectedJobFunctions.length - 1}</Badge>}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold mb-1"><span className="text-red-500 mr-1">*</span>Job Function</h4>
                      <p className="text-[11px] text-gray-500 mb-3">Please select/enter your expected job function</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedJobFunctions.map(func => (
                          <Badge key={func} className="bg-emerald-100 text-emerald-700 border-0 flex items-center gap-1 py-1 px-2 text-xs">
                            {func}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedJobFunctions(prev => prev.filter(f => f !== func))} />
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Search functions..."
                        className="h-10 text-sm border-gray-200"
                        value={jobFunctionInput}
                        onChange={(e) => setJobFunctionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && jobFunctionInput.trim()) {
                            if (!selectedJobFunctions.includes(jobFunctionInput.trim())) {
                              setSelectedJobFunctions(prev => [...prev, jobFunctionInput.trim()]);
                            }
                            setJobFunctionInput('');
                          }
                        }}
                      />
                    </div>
                    <Button size="sm" className="w-full text-xs bg-black text-white hover:bg-black/90" onClick={() => {
                      if (jobFunctionInput.trim() && !selectedJobFunctions.includes(jobFunctionInput.trim())) {
                        setSelectedJobFunctions(prev => [...prev, jobFunctionInput.trim()]);
                        setJobFunctionInput('');
                      }
                    }}>Confirm</Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Experience Level Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={`rounded-full h-8 px-3 text-xs font-medium border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 ${selectedExperience.length > 0 ? 'border-primary text-primary bg-primary/5' : ''}`}>
                    {selectedExperience.length > 0 ? selectedExperience[0] : 'Experience Level'}
                    {selectedExperience.length > 1 && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1 h-3.5 flex items-center justify-center">+{selectedExperience.length - 1}</Badge>}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4" align="start">
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold mb-1"><span className="text-red-500 mr-1">*</span>Experience Level</h4>
                    {[
                      { id: 'intern', label: 'Intern/New Grad' },
                      { id: 'entry', label: 'Entry Level' },
                      { id: 'mid', label: 'Mid Level' },
                      { id: 'senior', label: 'Senior Level' },
                      { id: 'lead', label: 'Lead/Staff' },
                      { id: 'director', label: 'Director/Executive' }
                    ].map((level) => (
                      <div key={level.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={level.id}
                          checked={selectedExperience.includes(level.label)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedExperience(prev => [...prev, level.label]);
                            } else {
                              setSelectedExperience(prev => prev.filter(l => l !== level.label));
                            }
                          }}
                          className={`${selectedExperience.includes(level.label) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'} rounded w-4 h-4`}
                        />
                        <Label htmlFor={level.id} className="text-sm font-medium text-gray-600 cursor-pointer">{level.label}</Label>
                      </div>
                    ))}
                    <Button size="sm" className="w-full text-xs bg-black text-white hover:bg-black/90 mt-2" onClick={() => { }}>Confirm</Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Work Type Filter (Onsite/Remote) */}
              <Select value={workTypeFilter} onValueChange={setWorkTypeFilter}>
                <SelectTrigger className={`rounded-full h-8 w-fit gap-2 px-3 py-0 text-xs font-medium border-gray-200 bg-white hover:bg-gray-50 ${workTypeFilter !== 'all' ? 'border-primary text-primary bg-primary/5' : ''}`}>
                  <SelectValue placeholder="Full-time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Work Type</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>

              {/* Sponsorship Filter */}
              <Select value={sponsorshipFilter} onValueChange={setSponsorshipFilter}>
                <SelectTrigger className={`rounded-full h-8 w-fit gap-2 px-3 py-0 text-xs font-medium border-gray-200 bg-white hover:bg-gray-50 ${sponsorshipFilter !== 'all' ? 'border-primary text-primary bg-primary/5' : ''}`}>
                  <SelectValue placeholder="Onsite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Status</SelectItem>
                  <SelectItem value="visa-friendly">Visa Sponsoring</SelectItem>
                  <SelectItem value="no-sponsorship">Citizens Only</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                <Select defaultValue="recommended">
                  <SelectTrigger className="rounded-full h-8 w-fit gap-2 px-3 py-0 text-xs font-medium border-gray-200 bg-white hover:bg-gray-50">
                    <SelectValue placeholder="Recommended" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="newest">Date Posted</SelectItem>
                    <SelectItem value="relevance">Relevance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bottom Row: Additional Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={datePostedFilter} onValueChange={setDatePostedFilter}>
                <SelectTrigger className={`rounded-full w-fit gap-2 h-8 px-3 py-0 border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium ${datePostedFilter !== 'all' ? 'border-primary bg-primary/5 text-primary' : ''}`}>
                  <SelectValue placeholder="Date Posted" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={salaryFilter} onValueChange={setSalaryFilter}>
                <SelectTrigger className={`rounded-full w-fit gap-2 h-8 px-3 py-0 border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium ${salaryFilter !== 'all' ? 'border-primary bg-primary/5 text-primary' : ''}`}>
                  <SelectValue placeholder="Salary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any salary</SelectItem>
                  <SelectItem value="40k">$40,000+</SelectItem>
                  <SelectItem value="80k">$80,000+</SelectItem>
                  <SelectItem value="120k">$120,000+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className={`rounded-full w-fit gap-2 h-8 px-3 py-0 border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium ${industryFilter !== 'all' ? 'border-primary bg-primary/5 text-primary' : ''}`}>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                </SelectContent>
              </Select>

              <Select value={yearsExperienceFilter} onValueChange={setYearsExperienceFilter}>
                <SelectTrigger className={`rounded-full w-fit gap-2 h-8 px-3 py-0 border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium ${yearsExperienceFilter !== 'all' ? 'border-primary bg-primary/5 text-primary' : ''}`}>
                  <SelectValue placeholder="Years of Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any experience</SelectItem>
                  <SelectItem value="0-1">0-1 years</SelectItem>
                  <SelectItem value="2-5">2-5 years</SelectItem>
                  <SelectItem value="5+">5+ years</SelectItem>
                </SelectContent>
              </Select>

              <Button className="h-8 px-4 rounded-full bg-emerald-400 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 border-0 shadow-sm shadow-emerald-200 text-xs ml-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> All Filters
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-primary h-10 px-4 text-xs font-bold gap-1">
                  <X className="w-4 h-4" /> Reset Filters
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Job List Section */}
        <section className="job-list-section">
          <div className="container">
            {/* Loading State */}
            {isLoading && (
              <div className="loading-state">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p>Loading jobs...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <h3>Unable to load jobs</h3>
                <p>{error}</p>
                <Button onClick={fetchJobs} className="btn-primary">
                  <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                </Button>
              </div>
            )}

            {/* Job List */}
            {!isLoading && !error && (
              <>
                <div className="job-list space-y-1.5">
                  {displayJobs.map(job => (
                    <JobCardOrion key={job.id} job={job} onAskNova={handleAskNova} />
                  ))}
                </div>

                {displayJobs.length === 0 && (
                  <div className="no-jobs-found">
                    <Filter className="w-12 h-12" />
                    <h3>No jobs found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                    <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
                  </div>
                )}

                {pagination.pages > 1 && (
                  <div className="pagination-controls flex items-center justify-center gap-4 mt-12 pb-12">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium">
                      Page {currentPage} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentPage(prev => Math.min(pagination.pages, prev + 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      disabled={currentPage === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default Jobs;


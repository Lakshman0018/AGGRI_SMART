import React, { useState, useMemo, useEffect } from 'react';
import api from '../services/api.service';
import cropsDataJSON from '../data/crops.json';
import { pestsData as localPests } from '../storage/pests';

const severityLevels = [
  { level: 'Low', colorClass: 'bg-success/10 text-success border border-success/20' },
  { level: 'Medium', colorClass: 'bg-warning/10 text-warning border border-warning/20' },
  { level: 'High', colorClass: 'bg-error/10 text-error border border-error/20' },
  { level: 'Critical', colorClass: 'bg-error/20 text-error border border-error/30' }
];

const cropsData = cropsDataJSON.cropDetails || [];

function PestAlerts() {
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPest, setExpandedPest] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [pestsData, setPestsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pests from API
  useEffect(() => {
    const fetchPests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/info/pests');
        if (response && response.status === 'success' && response.data) {
          const pests = Array.isArray(response.data) ? response.data : [];
          if (pests.length > 0) {
            setPestsData(pests);
            return;
          }
        }
        setPestsData(localPests || []);
      } catch (error) {
        console.error('Error fetching pests:', error);
        setPestsData(localPests || []);
      } finally {
        setLoading(false);
      }
    };
    fetchPests();
  }, []);

  // Filter pests based on selections
  const filteredPests = useMemo(() => {
    let filtered = [...pestsData];
    
    if (selectedSeverity !== 'All') {
      filtered = filtered.filter(pest => pest.severity === selectedSeverity);
    }
    
    if (selectedCrop !== 'All') {
      filtered = filtered.filter(pest => 
        pest.affectedCrops.some(crop => crop.toLowerCase() === selectedCrop.toLowerCase())
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(pest => 
        pest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pest.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pest.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [selectedSeverity, selectedCrop, searchTerm, pestsData]);

  // Get unique crops from pests data
  const affectedCrops = useMemo(() => {
    const crops = new Set(['All']);
    pestsData.forEach(pest => {
      (pest.affectedCrops || []).forEach(crop => crops.add(crop));
    });
    return Array.from(crops);
  }, [pestsData]);

  const toggleExpand = (id) => {
    setExpandedPest(prev => (prev === id ? null : id));
  };

  const getSeverityStyle = (sev) => {
    const level = severityLevels.find(l => l.level === sev);
    return level ? level.colorClass : 'bg-surface-container text-on-surface-variant';
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6">
      {/* Header Banner */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">bug_report</span>
          Pest & Disease Alerts
        </h1>
        <p className="text-on-surface-variant max-w-[750px]">
          Track crop infestations, diagnostic symptoms, biological preventions, and regional outbreaks in real time.
        </p>
      </header>

      {/* Nav Tabs */}
      <div className="bg-white border border-surface-variant rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="flex border-b border-surface-variant bg-surface-container-low">
          {['Active Alerts', 'Prevention Core', 'Control Strategies'].map((label, idx) => (
            <button
              key={label}
              onClick={() => setSelectedTab(idx)}
              className={`flex-1 py-4 text-center font-bold text-xs md:text-sm border-b-2 transition-all ${
                selectedTab === idx
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-on-surface-variant hover:bg-white/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 0: Active Alerts */}
      {selectedTab === 0 && (
        <div className="space-y-6 animate-fade-in">
          {/* Filters Area */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Search */}
            <div className="col-span-full bg-white border border-surface-variant rounded-xl p-4 shadow-sm">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  type="text"
                  placeholder="Search by name, scientific terms, or symptom descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-surface-variant rounded-xl focus:ring-primary focus:border-primary focus:outline-none text-sm font-semibold"
                />
              </div>
            </div>

            {/* Severity Filter */}
            <div className="col-span-full md:col-span-6 bg-white border border-surface-variant rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-primary mb-3">Severity Threshold</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSeverity('All')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedSeverity === 'All'
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  All
                </button>
                {severityLevels.map(lvl => (
                  <button
                    key={lvl.level}
                    onClick={() => setSelectedSeverity(lvl.level)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedSeverity === lvl.level
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {lvl.level}
                  </button>
                ))}
              </div>
            </div>

            {/* Crop Filter */}
            <div className="col-span-full md:col-span-6 bg-white border border-surface-variant rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-primary mb-3">Target Crops</h3>
              <div className="flex flex-wrap gap-2">
                {affectedCrops.map(crop => (
                  <button
                    key={crop}
                    onClick={() => setSelectedCrop(crop)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                      selectedCrop === crop
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">agriculture</span>
                    {crop}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Alerts List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-surface-variant rounded-xl p-6 space-y-3 animate-pulse">
                  <div className="h-6 bg-surface-container-high rounded w-1/4"></div>
                  <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
                  <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredPests.length === 0 ? (
            <div className="text-center py-12 bg-white border border-surface-variant rounded-xl">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">check_circle</span>
              <p className="text-on-surface-variant mt-2">Zero active pest warnings match your filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPests.map((pest) => {
                const pestId = pest._id || pest.id;
                const isExpanded = expandedPest === pestId;

                return (
                  <div key={pestId} className="bg-white border border-surface-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* Header Info */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div className="flex gap-3 items-start">
                        <div className="w-12 h-12 rounded-xl bg-error-container/20 text-error flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-2xl">bug_report</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-primary leading-tight">{pest.name}</h3>
                          <span className="text-xs text-on-surface-variant italic block mt-0.5">{pest.scientificName || 'Scientific classification pending'}</span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {pest.affectedCrops?.map(crop => (
                              <span key={crop} className="bg-surface-container-high text-on-surface text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5 border">
                                <span className="material-symbols-outlined text-[10px]">agriculture</span>
                                {crop}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityStyle(pest.severity)}`}>
                        {pest.severity} Alert
                      </span>
                    </div>

                    {/* Diagnostic Symptoms */}
                    <div className="mb-4 bg-surface-container-low p-4 rounded-xl border">
                      <h4 className="text-xs font-extrabold uppercase text-primary tracking-wider mb-2.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">warning</span>
                        Identification Symptoms
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant font-semibold">
                        {pest.symptoms?.map((sym, i) => (
                          <li key={i} className="flex gap-1.5 items-start">
                            <span className="material-symbols-outlined text-amber-600 text-sm">check_circle</span>
                            {sym}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Collapsible Action Area */}
                    <div className="border-t border-surface-variant pt-3.5">
                      <button
                        onClick={() => toggleExpand(pestId)}
                        className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        <span>{isExpanded ? 'Hide Control Measures' : 'Expand Treatment Controls'}</span>
                        <span className="material-symbols-outlined text-xs">
                          {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                          <div className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
                            <h5 className="font-bold text-primary flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">park</span>
                              Cultural Control
                            </h5>
                            <p className="text-on-surface-variant leading-relaxed">
                              {pest.controlMeasures?.cultural?.join(', ') || pest.preventiveMeasures?.join(', ') || 'Practice crop rotation and seed sanitation.'}
                            </p>
                          </div>
                          
                          <div className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
                            <h5 className="font-bold text-secondary flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">eco</span>
                              Biological Control
                            </h5>
                            <p className="text-on-surface-variant leading-relaxed">
                              {pest.controlMeasures?.biological?.join(', ') || 'Introduce natural predatory insects or utilize bio-pesticides.'}
                            </p>
                          </div>

                          <div className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
                            <h5 className="font-bold text-error flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">skull</span>
                              Chemical Remedy
                            </h5>
                            <p className="text-on-surface-variant leading-relaxed">
                              {pest.controlMeasures?.chemical?.join(', ') || pest.treatment?.join(', ') || 'Apply organic neem sprays or targeted fungicides.'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Prevention Core */}
      {selectedTab === 1 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="bg-white border border-surface-variant rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">query_stats</span>
            </div>
            <h3 className="font-bold text-lg">Regular Field Surveys</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Examine the underside of foliage at least twice a week. Note discoloration, webbing, or stunted growth tips.
            </p>
          </div>

          <div className="bg-white border border-surface-variant rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/50 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">sync</span>
            </div>
            <h3 className="font-bold text-lg">Structured Crop Rotation</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Break host plant cycles by alternating nightshades with leguminous crops or field greens every season.
            </p>
          </div>

          <div className="bg-white border border-surface-variant rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/30 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">mop</span>
            </div>
            <h3 className="font-bold text-lg">Debris Sanitation</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Burn or deeply bury crop residues from the prior harvest to clear overwintering pupae or spore containers.
            </p>
          </div>
        </section>
      )}

      {/* Tab 2: Control Strategies */}
      {selectedTab === 2 && (
        <section className="bg-white border border-surface-variant rounded-xl p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-xl font-bold text-primary border-b border-surface-variant pb-3">Integrated Pest Management (IPM)</h2>
          <p className="text-sm text-on-surface-variant">
            AgriSmart champions IPM: integrating cultural, physical, biological controls before employing chemical interventions.
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start p-4 rounded-xl border border-surface-variant">
              <span className="material-symbols-outlined text-primary text-2xl">filter_vintage</span>
              <div>
                <h4 className="font-bold text-sm">Bio-Remediation</h4>
                <p className="text-xs text-on-surface-variant mt-1">
                  Employ bio-inoculants like Trichoderma viride or Bacillus thuringiensis to eliminate soil pathogens and larvae naturally.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-xl border border-surface-variant">
              <span className="material-symbols-outlined text-secondary text-2xl">science</span>
              <div>
                <h4 className="font-bold text-sm">Chemical Thresholds</h4>
                <p className="text-xs text-on-surface-variant mt-1">
                  Only use broad-spectrum chemical remedies when insect populations cross the critical Economic Injury Level (EIL).
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Emergency Advisory Box */}
      <section className="bg-error-container/10 border border-error-container rounded-xl p-6 mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="font-bold text-lg text-error flex items-center gap-2">
            <span className="material-symbols-outlined">phone_in_talk</span>
            Emergency Agronomist Advisory
          </h3>
          <p className="text-sm text-on-surface-variant mt-1 max-w-[650px]">
            If you detect rapid spread of late blight or crop damage exceeding safety margins, connect directly with regional extension specialists.
          </p>
        </div>
        <button
          onClick={() => window.open('tel:18001801551')}
          className="bg-error text-white font-bold py-3 px-6 rounded-xl hover:bg-error/90 transition-colors flex items-center gap-1 text-sm whitespace-nowrap"
        >
          Call Extension Office
        </button>
      </section>
    </div>
  );
}

export default PestAlerts;

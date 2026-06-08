import React, { useState, useMemo, useEffect } from 'react';
import api from '../services/api.service';

const schemeCategories = ['All', 'Income Support', 'Crop Insurance', 'Credit Facility', 'Irrigation', 'Marketing', 'Organic Farming', 'Soil Management', 'Development'];

const applySteps = [
  { step: 1, title: 'Check Eligibility', description: 'Verify you meet all eligibility criteria for the desired scheme.' },
  { step: 2, title: 'Gather Documents', description: 'Collect Aadhaar card, land records, bank passbook, and passport photos.' },
  { step: 3, title: 'Fill Application', description: 'Navigate to the official portal and complete the application details.' },
  { step: 4, title: 'Submit Application', description: 'Submit the form online or hand it in at the local block agriculture office.' },
  { step: 5, title: 'Track Status', description: 'Monitor application review updates through the portal using your application ID.' }
];

function GovernmentSchemes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [governmentSchemes, setGovernmentSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch schemes from API
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/info/schemes');
        if (response && response.status === 'success' && response.data) {
          const schemes = Array.isArray(response.data) ? response.data : [];
          setGovernmentSchemes(schemes);
        }
      } catch (error) {
        console.error('Error fetching schemes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  // Category Material Symbol mapping
  const categoryIcons = {
    'All': 'widgets',
    'Income Support': 'payments',
    'Crop Insurance': 'security',
    'Credit Facility': 'account_balance',
    'Irrigation': 'water',
    'Marketing': 'store',
    'Organic Farming': 'eco',
    'Soil Management': 'nature',
    'Development': 'school'
  };

  // Filter schemes based on search and category
  const filteredSchemes = useMemo(() => {
    let filtered = [...governmentSchemes];
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(scheme => scheme.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(scheme => {
        const name = (scheme.title || scheme.name || scheme.schemeName || '').toLowerCase();
        const fullName = (scheme.fullName || '').toLowerCase();
        const description = (scheme.description || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || fullName.includes(search) || description.includes(search);
      });
    }
    
    return filtered;
  }, [searchTerm, selectedCategory, governmentSchemes]);

  const toggleSchemeExpand = (id) => {
    setExpandedScheme(expandedScheme === id ? null : id);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 space-y-8">
      
      {/* Header Section */}
      <section className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-on-background">
          Government <span className="text-primary">Schemes</span>
        </h2>
        <p className="text-sm text-on-surface-variant max-w-2xl mx-auto">
          Access various government schemes and subsidies designed to support farmers and agricultural development.
        </p>
      </section>

      {/* Search Input */}
      <section className="w-full max-w-3xl mx-auto">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search schemes by name, benefits, or eligibility..."
            className="block w-full pl-12 pr-4 py-3.5 border border-outline-variant bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm hover:shadow-md transition-shadow font-semibold text-on-surface"
          />
        </div>
      </section>

      {/* Categories Tabs Scrollable Row */}
      <section className="border-b border-outline-variant/30 w-full overflow-x-auto pb-1 hide-scrollbar">
        <div className="flex gap-4">
          {schemeCategories.map((category) => {
            const iconName = categoryIcons[category] || 'widgets';
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-1.5 px-4 py-3 font-bold text-xs border-b-2 whitespace-nowrap transition-all active:scale-95 duration-200 ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{iconName}</span>
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col justify-center items-center py-12 gap-2">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-xs text-on-surface-variant font-semibold">Retrieving official schemes list...</p>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="col-span-full bg-primary/5 border border-primary/10 text-primary p-6 rounded-2xl text-center text-sm">
            <span className="material-symbols-outlined text-2xl mb-1">info</span>
            <p className="font-semibold">No government schemes match your criteria. Try updating filters.</p>
          </div>
        ) : (
          filteredSchemes.map((scheme) => {
            const id = scheme._id || scheme.id;
            const isExpanded = expandedScheme === id;
            return (
              <div
                key={id}
                className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-primary line-clamp-1">
                        {scheme.title || scheme.name || scheme.schemeName}
                      </h3>
                      {(scheme.fullName || scheme.description) && (
                        <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5">
                          {scheme.fullName || scheme.description}
                        </p>
                      )}
                    </div>
                    {scheme.status && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-secondary-container text-on-secondary-container">
                        {scheme.status}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-3 mb-4 leading-relaxed">
                    {scheme.description}
                  </p>

                  {/* Key Benefits Preview */}
                  {scheme.benefits && scheme.benefits.length > 0 && (
                    <div className="space-y-1.5 mb-4 text-[11px] text-on-surface-variant font-semibold">
                      <p className="text-xs font-bold text-primary">Key Benefits</p>
                      {(Array.isArray(scheme.benefits) ? scheme.benefits : []).slice(0, 2).map((benefit, idx) => (
                        <div key={idx} className="flex gap-1.5 items-start">
                          <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                          <span className="line-clamp-1">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Accordion Expandable Details */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-surface-variant/30 space-y-4 text-xs animate-fade-in">
                      {/* Eligibility list */}
                      <div>
                        <p className="font-bold text-primary mb-1">Eligibility Criteria</p>
                        <ul className="list-disc pl-4 space-y-1 text-on-surface-variant font-semibold">
                          {(Array.isArray(scheme.eligibility) ? scheme.eligibility : (scheme.eligibility ? [scheme.eligibility] : [])).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Required Documents */}
                      {scheme.documentsRequired && scheme.documentsRequired.length > 0 && (
                        <div>
                          <p className="font-bold text-primary mb-1">Documents Required</p>
                          <ul className="list-disc pl-4 space-y-1 text-on-surface-variant font-semibold">
                            {(Array.isArray(scheme.documentsRequired) ? scheme.documentsRequired : []).map((doc, idx) => (
                              <li key={idx}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Deadline Date */}
                      {scheme.lastDate && (
                        <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 text-[11px]">
                          <span className="font-bold text-primary">Deadline/Last Date:</span> {scheme.lastDate}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-surface-variant/20 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded border border-outline-variant/30 text-[9px] font-bold text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">widgets</span>
                      {scheme.category}
                    </span>
                    <button
                      onClick={() => toggleSchemeExpand(id)}
                      className="flex items-center text-primary font-bold text-xs hover:underline gap-0.5"
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'}
                      <span className="material-symbols-outlined text-base">
                        {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                      </span>
                    </button>
                  </div>

                  {(scheme.link || scheme.officialLink) && (
                    <a
                      href={scheme.link || scheme.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary text-white py-2 px-4 rounded-xl font-bold text-xs hover:bg-primary-container transition-all flex items-center justify-center gap-1 active:scale-95 duration-200 shadow-sm"
                    >
                      Apply for Scheme
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dynamic Stepper: How to Apply Guide */}
      <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6 border-b border-surface-variant/30 pb-4">
          <span className="material-symbols-outlined text-primary text-xl">assignment</span>
          <h3 className="font-bold text-lg text-primary">How to Apply for Government Schemes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {applySteps.map((step, idx) => {
            const isCompleted = activeStep >= idx;
            return (
              <div
                key={step.step}
                onClick={() => setActiveStep(idx)}
                className="cursor-pointer group flex flex-col items-center text-center space-y-2 relative"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors border ${
                  isCompleted 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40 group-hover:border-primary'
                }`}>
                  {step.step}
                </div>
                
                <h4 className="font-bold text-xs text-primary">{step.title}</h4>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Portals Alert Box */}
      <section className="bg-primary/5 border border-primary/10 rounded-2xl p-5 max-w-4xl mx-auto space-y-3">
        <h4 className="font-bold text-xs text-primary flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">info</span>
          Important Agricultural Portals
        </h4>
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { label: 'PM-KISAN Portal', url: 'https://pmkisan.gov.in' },
            { label: 'PMFBY Portal', url: 'https://pmfby.gov.in' },
            { label: 'e-NAM Portal', url: 'https://enam.gov.in' },
            { label: 'National India Portal', url: 'https://india.gov.in/category/agriculture-rural-environment' }
          ].map((portal) => (
            <a
              key={portal.label}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-white border border-outline-variant/40 rounded-xl text-xs font-bold hover:bg-primary/5 text-primary transition-all flex items-center gap-1 active:scale-95 duration-200"
            >
              {portal.label}
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          ))}
        </div>
      </section>

    </div>
  );
}

export default GovernmentSchemes;
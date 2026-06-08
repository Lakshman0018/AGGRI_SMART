import React, { useState, useMemo } from 'react';
import irrigationDataJSON from '../data/irrigation.json';
import cropsDataJSON from '../data/crops.json';

const irrigationSystems = irrigationDataJSON.irrigationMethods || [];
const irrigationScheduleData = irrigationDataJSON.irrigationSchedule || [];
const irrigationScheduleMap = irrigationScheduleData.reduce((acc, item) => {
  if (item?.crop) {
    acc[item.crop.toLowerCase()] = item;
  }
  return acc;
}, {});
const waterRequirements = irrigationScheduleData.map(s => ({
  crop: s.crop,
  totalWaterRequirement: s.totalWaterRequirement,
  frequency: s.frequency
}));
const irrigationTips = irrigationDataJSON.waterManagementTips || [];

function Irrigation() {
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [activeTab, setActiveTab] = useState(0); // 0: Systems, 1: Schedule, 2: Conservation
  const [expandedSystem, setExpandedSystem] = useState(new Set());
  const [area, setArea] = useState(1);

  // Get crop specific water requirements
  const cropWaterData = useMemo(() => {
    return waterRequirements.find(w => w.crop === selectedCrop) || waterRequirements[0] || { crop: selectedCrop, totalWaterRequirement: 'N/A', frequency: 'N/A' };
  }, [selectedCrop]);

  // Get irrigation schedule for selected crop
  const cropSchedule = useMemo(() => {
    const scheduleKey = selectedCrop.toLowerCase();
    return irrigationScheduleMap[scheduleKey]?.criticalStages || irrigationScheduleMap['wheat']?.criticalStages || [];
  }, [selectedCrop]);

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  const toggleSystemExpand = (id) => {
    setExpandedSystem(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Status mapping for systems to simulate mockups
  const getSystemStatus = (methodName) => {
    if (methodName.includes('Drip')) return { text: 'Optimal', style: 'bg-secondary-container text-on-secondary-container' };
    if (methodName.includes('Sprinkler')) return { text: 'Idle', style: 'bg-surface-container-high text-on-surface-variant' };
    return { text: 'Needs Review', style: 'bg-error-container text-on-error-container' };
  };

  const getSystemEfficiencyVal = (methodName) => {
    if (methodName.includes('Drip')) return 92;
    if (methodName.includes('Sprinkler')) return 80;
    return 50;
  };

  const getSystemIcon = (methodName) => {
    if (methodName.includes('Drip')) return 'opacity';
    if (methodName.includes('Sprinkler')) return 'shower';
    return 'waves';
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 space-y-6">
      
      {/* Header Section */}
      <header className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-2">Smart Irrigation</h2>
        <p className="text-sm text-on-surface-variant max-w-2xl">
          Optimize water usage with intelligent scheduling and conservation techniques based on real-time field data.
        </p>
      </header>

      {/* Tabbed Navigation */}
      <div className="flex border-b border-outline-variant/30 mb-6 overflow-x-auto pb-1 gap-4">
        {[
          { label: 'Irrigation Systems', icon: 'opacity' },
          { label: 'Crop Schedule', icon: 'schedule' },
          { label: 'Water Conservation', icon: 'savings' }
        ].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => handleTabChange(idx)}
            className={`flex items-center gap-1.5 px-4 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition-all ${
              activeTab === idx
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Areas */}
      {activeTab === 0 && (
        <div className="space-y-6">
          {/* Hero Image/Status Card & Global Water Savings Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active System Status Card */}
            <div className="lg:col-span-2 bg-surface border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between relative min-h-[320px] p-6">
              <div className="absolute inset-0 z-0 opacity-10">
                <img 
                  alt="Farm field" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU46XIGiFyMgEDdhkLQH_G7_PHJ_o1UUrA7ed1c7w5VHgBNIBZHJtoDgEpUtOsxqEztmONYnFrewD_WfkH1yhy-PUq_jGzZr02nHFOw0ZXGWrcLddTgi06xTjqnlc7f_ZKHAaPKG3c9Pzb1N2rcuYww8iYTxoiIvghsALq_QXk6LuPozaStIYTEYtgER3Z7-25-0Ll8AJ63OkQpkA4mZH1iWAIkCODwtEx31C5hWqnxTzLjvMhIbOtjfW8xPi3qeyFpSOkosOh7t0"
                />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-secondary font-bold text-sm">water_drop</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">System Active</span>
                  </div>
                  <h3 className="text-2xl font-bold text-primary">North Field Center Pivot</h3>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-lg">
                    Currently applying 12mm of water based on soil moisture sensor data. Estimated completion in 2 hours.
                  </p>
                </div>
                
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">Moisture Level</p>
                    <p className="text-xl font-black text-secondary">68%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">System Efficiency</p>
                    <p className="text-xl font-black text-secondary">92%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Water Savings Card */}
            <div className="bg-primary text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-4">
                  <h4 className="font-bold text-lg">Water Conserved</h4>
                  <span className="material-symbols-outlined text-secondary-fixed">eco</span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed mb-6">
                  Compared to traditional flood irrigation this season, precision agriculture has dramatically reduced consumption.
                </p>
                <div className="text-center py-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-4xl font-black text-secondary-fixed">1.2M Liters</p>
                  <p className="text-[10px] font-bold uppercase text-white/80 mt-1">Total Saved</p>
                </div>
              </div>
              <button className="w-full bg-white text-green-700 border border-green-300 py-2 rounded-xl text-xs font-bold hover:bg-green-50 transition-all active:scale-95 duration-200 mt-4">
                View Diagnostics Report
              </button>
            </div>

          </div>

          {/* List of Irrigation Systems */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Irrigation Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {irrigationSystems.map((system) => {
                const status = getSystemStatus(system.method);
                const efficiencyVal = getSystemEfficiencyVal(system.method);
                const iconName = getSystemIcon(system.method);
                const isExpanded = expandedSystem.has(system.id);
                
                return (
                  <div key={system.id} className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
                    <div>
                      {/* Header info */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <span className="material-symbols-outlined text-lg">{iconName}</span>
                          </div>
                          <h4 className="font-bold text-sm text-primary">{system.method}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.style}`}>
                          {status.text}
                        </span>
                      </div>

                      <p className="text-xs text-on-surface-variant line-clamp-2 mb-4">
                        {system.description}
                      </p>

                      {/* Efficiency indicator */}
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                          <span>Water Saving Efficiency</span>
                          <span className="text-secondary font-bold">{system.efficiency}</span>
                        </div>
                        <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-secondary h-full rounded-full" 
                            style={{ width: `${efficiencyVal}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Collapsible Details */}
                      {isExpanded && (
                        <div className="pt-4 border-t border-surface-variant/30 space-y-4 text-xs animate-fade-in">
                          <div>
                            <p className="font-bold text-primary mb-1">Advantages</p>
                            <ul className="list-disc pl-4 space-y-1 text-on-surface-variant">
                              {system.advantages?.map((adv, idx) => (
                                <li key={idx}>{adv}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <p className="font-bold text-primary mb-1">Disadvantages</p>
                            <ul className="list-disc pl-4 space-y-1 text-on-surface-variant">
                              {system.disadvantages?.map((dis, idx) => (
                                <li key={idx}>{dis}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-surface-container-low p-3 rounded-xl space-y-1 text-[11px] border border-outline-variant/20">
                            <p className="font-semibold text-primary">Cost &amp; Subsidy</p>
                            <p className="text-on-surface-variant"><span className="font-semibold">Est Cost:</span> {system.cost}</p>
                            <p className="text-on-surface-variant"><span className="font-semibold">Water Saving:</span> {system.waterSaving}</p>
                            <p className="text-secondary font-semibold">{system.subsidy}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => toggleSystemExpand(system.id)}
                      className="flex items-center text-primary font-bold text-xs hover:underline mt-4 gap-0.5"
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'}
                      <span className="material-symbols-outlined text-base">
                        {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Crop Schedule Controls */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-lg text-primary mb-2">Select Crop Type</h3>
              <p className="text-xs text-on-surface-variant">
                Configure your irrigation intervals depending on critical physiological stages.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {waterRequirements.map((req) => (
                <button
                  key={req.crop}
                  onClick={() => setSelectedCrop(req.crop)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 duration-200 border ${
                    selectedCrop === req.crop
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface hover:bg-surface-container-low text-on-surface-variant border-outline-variant/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">agriculture</span>
                  {req.crop}
                </button>
              ))}
            </div>

            {/* Dynamic Water Needs Calculator */}
            <div className="pt-6 border-t border-surface-variant/30 space-y-4">
              <h4 className="font-bold text-sm text-primary">Water Requirements Calculator</h4>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-grow w-full">
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Cultivated Land Area (Hectares)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={area}
                      min="0.1"
                      step="0.1"
                      onChange={(e) => setArea(parseFloat(e.target.value) || 1)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-bold text-on-surface"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-on-surface-variant">ha</span>
                  </div>
                </div>

                <div className="w-full sm:w-auto bg-primary/5 border border-primary/10 p-3 rounded-xl shrink-0 flex items-center gap-4">
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">Estimated Water Required</p>
                    <p className="text-lg font-black text-primary">
                      {cropWaterData.totalWaterRequirement !== 'N/A' 
                        ? `${(parseFloat(cropWaterData.totalWaterRequirement.split('-')[0]) * area).toFixed(0)} - ${(parseFloat(cropWaterData.totalWaterRequirement.split('-')[1]?.replace(' mm', '') || 600) * area).toFixed(0)} mm-ha`
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined">calculate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Schedules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Water requirement metrics */}
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-surface-variant/30 pb-4">
                <span className="material-symbols-outlined text-primary">water_drop</span>
                <h3 className="font-bold text-sm text-primary">General Crop Requirements</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15 text-center">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">Total Water Need</p>
                  <p className="text-xl font-black text-primary">{cropWaterData.totalWaterRequirement}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15 text-center">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">Optimal Frequency</p>
                  <p className="text-sm font-bold text-secondary mt-1">{cropWaterData.frequency}</p>
                </div>
              </div>
            </div>

            {/* Critical irrigation stages table */}
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 border-b border-surface-variant/30 pb-4 mb-4">
                <span className="material-symbols-outlined text-primary">event_note</span>
                <h3 className="font-bold text-sm text-primary">Critical Irrigation Stages</h3>
              </div>

              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-surface-variant/40 text-on-surface-variant font-bold">
                      <th className="pb-2">Physiological Stage</th>
                      <th className="pb-2">Days from Sowing</th>
                      <th className="pb-2 text-right">Requirement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/30">
                    {cropSchedule.map((stage, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-lowest">
                        <td className="py-2.5 font-semibold text-primary">{stage.stage}</td>
                        <td className="py-2.5 text-on-surface-variant">{stage.daysAfterSowing || stage.days || 'N/A'}</td>
                        <td className="py-2.5 text-right font-black text-on-surface">{stage.waterRequirement || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-6">
          {/* Techniques Grid */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Conservation Techniques</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Drip Irrigation', icon: 'water_drop', color: 'text-info bg-info/10', desc: 'Deliver water directly to plant root zones, preventing soil evaporation and runoff.' },
                { title: 'Organic Mulching', icon: 'forest', color: 'text-success bg-success/10', desc: 'Apply crop straw or husk layers to maintain soil moisture retention up to 40% longer.' },
                { title: 'Moisture Sensors', icon: 'sensors', color: 'text-tertiary-container bg-tertiary-container/10', desc: 'Deploy smart probes to feed local moisture logs to your advisor for responsive timing.' },
                { title: 'Atmospheric Timing', icon: 'schedule', color: 'text-secondary bg-secondary/10', desc: 'Water during early morning or sunset to bypass high transpiration rates.' },
                { title: 'Rainwater Storage', icon: 'cloud', color: 'text-primary bg-primary/10', desc: 'Collect and divert seasonal rainfall runoff to artificial farm ponds.' },
                { title: 'Laser Land Leveling', icon: 'architecture', color: 'text-error bg-error/10', desc: 'Smooth topography variations to ensure uniform flow without waterlogging.' }
              ].map((tech, idx) => (
                <div key={idx} className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className={`p-2.5 rounded-xl inline-block ${tech.color}`}>
                    <span className="material-symbols-outlined text-lg block">{tech.icon}</span>
                  </div>
                  <h4 className="font-bold text-sm text-primary">{tech.title}</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {tech.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick tips & resources */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto space-y-4">
            <div className="flex items-center gap-2 border-b border-surface-variant/30 pb-4">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              <h3 className="font-bold text-lg text-primary">Quick Irrigation Tips</h3>
            </div>
            
            <ul className="space-y-3 text-xs text-on-surface-variant list-none pl-0">
              {irrigationTips.map((tip, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="material-symbols-outlined text-secondary select-none">check_circle</span>
                  <div>
                    <p className="font-bold text-primary text-sm">{tip.tip}</p>
                    <p className="text-xs mt-0.5 leading-relaxed">{tip.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}

export default Irrigation;


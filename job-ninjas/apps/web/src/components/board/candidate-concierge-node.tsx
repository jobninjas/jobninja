import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PlaneTakeoff, Hotel, Utensils, MapPin, Loader2, CheckCircle2, AlertCircle,
  Clock, Star, ChevronRight, ChevronLeft, Shield, Zap, Activity, Code2,
  Plane, Calendar, DollarSign, User, ArrowRight, RefreshCw, X, Info,
  Building2, Check, Circle, AlertTriangle, ExternalLink, ChevronDown
} from 'lucide-react';
import { useBoardStore } from '@/store/board';
import { useDemoStore } from '@/lib/store';
import { ConciergeState, OpheliaHotelOption } from '@/lib/ophelia/types';

function StatusRow({ label, status }: { label: string, status: 'confirmed' | 'done' | 'action' | 'optional' | 'pending' }) {
  const colors = { confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200', done: 'bg-emerald-50 text-emerald-700 border-emerald-200', action: 'bg-amber-50 text-amber-700 border-amber-200', optional: 'bg-slate-50 text-slate-500 border-slate-200', pending: 'bg-slate-50 text-slate-500 border-slate-200' };
  const icons = { confirmed: <Check className="w-3 h-3" />, done: <Check className="w-3 h-3" />, action: <AlertTriangle className="w-3 h-3" />, optional: <Circle className="w-3 h-3" />, pending: <Circle className="w-3 h-3" /> };
  const labels = { confirmed: 'CONFIRMED', done: '✓', action: 'ACTION REQUIRED', optional: 'OPTIONAL', pending: 'NOT STARTED' };
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[12px] text-slate-700 font-medium">{label}</span>
      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[status]}`}>
        {icons[status]} {labels[status]}
      </span>
    </div>
  );
}

function HotelCard({ hotel, recommended, selected, onSelect, onApprove, disabled }: {
  hotel: OpheliaHotelOption;
  recommended?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  onApprove?: () => void;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border bg-white transition-all ${
      selected ? 'border-violet-500 ring-1 ring-violet-500 shadow-md' : 'border-slate-200 hover:border-slate-300'
    } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {recommended && (
        <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 flex items-center gap-1 z-10">
          <Zap className="w-3 h-3" /> AI RECOMMENDED
        </div>
      )}
      
      <div className="h-32 w-full bg-slate-100 relative">
        {hotel.image ? (
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full"><Building2 className="w-8 h-8 text-slate-300" /></div>
        )}
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-amber-600 font-bold text-[11px] px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {hotel.rating}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h4 className="font-bold text-slate-900 text-[14px]">{hotel.name}</h4>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {hotel.location}
            </p>
          </div>
          <div className="text-right">
            <p className="font-black text-slate-900 text-[16px]">${hotel.price}</p>
            <p className="text-[10px] text-slate-400">/ night</p>
          </div>
        </div>
        {recommended && (
          <div className="mt-3 bg-violet-50 text-violet-700 text-[11px] p-2 rounded-lg border border-violet-100 italic">
            Within candidate travel budget — selected as the strongest available option.
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
            {hotel.availability ? 'AVAILABLE' : 'UNAVAILABLE'}
          </span>
          {onApprove ? (
            <button
              onPointerDown={(e) => { e.stopPropagation(); onApprove(); }}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer pointer-events-auto"
            >
              Approve Booking <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onPointerDown={(e) => { e.stopPropagation(); if (onSelect) onSelect(); }}
              className="text-violet-600 hover:text-violet-700 font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors border border-violet-200 hover:bg-violet-50 cursor-pointer pointer-events-auto"
            >
              Select
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const CandidateConciergeNode = ({ layerId, layer, isSelected }: { layerId: string; layer: any; isSelected: boolean }) => {
  const candidateData = {
    name: layer.config?.candidateName || layer.value || 'Candidate',
    role: layer.config?.role || 'Candidate Onsite Logistics',
    fromCity: layer.config?.fromLocation || 'Candidate Location',
    toCity: layer.config?.toLocation || 'Company Office',
    fromCode: (layer.config?.fromLocation || 'NYC').substring(0, 3).toUpperCase(),
    toCode: (layer.config?.toLocation || 'NYC').substring(0, 3).toUpperCase(),
    checkIn: layer.config?.date || 'Scheduled Date',
    checkOut: layer.config?.checkOut || 'Next Day',
    budget: '$' + (layer.config?.budget || '1000'),
  };

  const updateLayer = useBoardStore(s => s.updateLayer);
  const updateCandidate = useDemoStore(s => s.updateCandidate);
  const [activeTab, setActiveTab] = useState<'overview' | 'stay' | 'flights' | 'dining' | 'itinerary' | 'activity'>('overview');
  const [spent, setSpent] = useState(0);

  const [flightsState, setFlightsState] = useState<'IDLE'|'SEARCHING'|'FOUND'>('IDLE');
  const [flights, setFlights] = useState<any[]>([]);

  const [diningState, setDiningState] = useState<'IDLE'|'SEARCHING'|'FOUND'>('IDLE');
  const [diningOptions, setDiningOptions] = useState<any[]>([]);

  const [conciergeState, setConciergeState] = useState<ConciergeState>('IDLE');
  const [hotels, setHotels] = useState<OpheliaHotelOption[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<any>(layer.config?.availability || null);
  const [booking, setBooking] = useState<any>(layer.config?.booking || null);
  const [error, setError] = useState<string | null>(null);

  const searchFlights = async () => {
    try {
      setFlightsState('SEARCHING');
      const res = await fetch('/api/ophelia/search', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ vertical: 'travel', providers: ['flights'], origin: candidateData.fromCode, destination: candidateData.toCode, date: candidateData.checkIn, _t: Date.now() })
      });
      const data = await res.json();
      setFlights(data.results || []);
      setFlightsState('FOUND');
    } catch (e) {
      console.error(e);
      setFlightsState('IDLE');
    }
  };

  const searchDining = async () => {
    try {
      setDiningState('SEARCHING');
      const res = await fetch('/api/ophelia/search', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ vertical: 'lifestyle', providers: ['dining'], location: candidateData.toCode, date: candidateData.checkIn, _t: Date.now() })
      });
      const data = await res.json();
      setDiningOptions(data.results || []);
      setDiningState('FOUND');
    } catch (e) {
      console.error(e);
      setDiningState('IDLE');
    }
  };

  const startConcierge = useCallback(async () => {
    setConciergeState('SEARCHING');
    setError(null);
    try {
      const res = await fetch('/api/ophelia/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          destination: candidateData.toCity,
          checkIn: candidateData.checkIn,
          checkOut: candidateData.checkOut,
          budget: parseFloat(candidateData.budget.replace('$', '')),
          rooms: 1,
          party_size: 1
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHotels(data.results);
      setConciergeState('RESULTS_READY');
      setActiveTab('stay');
    } catch (err: any) {
      setError(err.message);
      setConciergeState('IDLE');
    }
  }, []);

  const approveBooking = useCallback(async () => {
    if (!selectedHotelId) return;
    const hotel = hotels.find(h => h.id === selectedHotelId);
    if (!hotel) return;
    setConciergeState('CHECKING_AVAILABILITY');
    try {
      const res = await fetch('/api/ophelia/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'availability', hotelId: hotel.id, checkIn: candidateData.checkIn, checkOut: candidateData.checkOut })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvailability(data.result);
      setConciergeState('REQUIRES_PAYMENT');
    } catch (err: any) {
      setError(err.message);
      setConciergeState('RESULTS_READY');
    }
  }, [selectedHotelId, hotels]);

  const continueAfterPayment = useCallback(async () => {
    if (!availability) return;
    setConciergeState('BOOKING');
    try {
      const res = await fetch('/api/ophelia/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: availability.quoteId, guestName: candidateData.name, contactEmail: 'test@example.com' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBooking(data.result);
      setConciergeState('CONFIRMED');
      setSpent(data.result.totalAmount);
      updateLayer(layerId, { status: 'success' } as any);
      if (updateCandidate) updateCandidate('candidate-sarah', { status: 'Onsite Ready' });
      setActiveTab('overview');
    } catch (err: any) {
      setError(err.message);
      setConciergeState('REQUIRES_PAYMENT');
    }
  }, [availability, updateLayer, layerId, updateCandidate]);

  return (
    <div className={`w-full h-full bg-white rounded-2xl border-2 flex flex-col shadow-2xl overflow-hidden pointer-events-auto ${isSelected ? 'border-violet-500 ring-4 ring-violet-500/20' : 'border-slate-200'}`}>
      
      {/* ── HEADER ── */}
      <div className="bg-slate-900 text-white p-4 shrink-0 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-[13px] tracking-wide text-slate-200">OPHELIA</h3>
              <h2 className="font-bold text-[16px] leading-tight text-white">Candidate Experience Agent</h2>
              <p className="text-[11px] text-slate-400">Travel & onsite coordination</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 rounded-xl px-4 py-2 border border-slate-700 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-[12px]">{candidateData.name.substring(0, 2).toUpperCase()}</div>
              <div>
                <p className="font-bold text-[13px] text-white leading-tight">{candidateData.name}</p>
                <p className="text-[10px] text-slate-400">{candidateData.role}</p>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-xl px-4 py-2 border border-slate-700 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-[12px] font-bold text-white mb-0.5">
                {candidateData.fromCity} <ArrowRight className="w-3 h-3 text-slate-500" /> {candidateData.toCity}
              </div>
              <div className="text-[10px] text-slate-400">{candidateData.checkIn} — {candidateData.checkOut} • Budget: {candidateData.budget}</div>
            </div>

            <div className="flex flex-col gap-1 items-end ml-4">
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <div className={`w-2 h-2 rounded-full animate-pulse ${conciergeState === 'CONFIRMED' ? 'bg-emerald-400' : 'bg-violet-400'}`} />
                <span className="text-[10px] font-bold text-slate-200 tracking-wider">
                  {conciergeState.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 p-1 opacity-20 pointer-events-none">
          <Plane className="w-32 h-32 text-white -rotate-12 transform translate-x-8 -translate-y-8" />
        </div>
      </div>
      {/* ── TABS ── */}
      <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 pt-2 gap-2">
        {['overview', 'stay', 'flights', 'dining', 'itinerary', 'activity'].map(tab => (
          <button
            key={tab}
            onPointerDown={(e) => { e.stopPropagation(); setActiveTab(tab as any); }}
            className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide border-b-2 transition-colors cursor-pointer pointer-events-auto ${
              activeTab === tab
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white relative overflow-hidden flex pointer-events-auto">
        
        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="p-6 w-full flex gap-6 pointer-events-auto">
            <div className="flex-1">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Onsite Readiness</h3>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h4 className="font-bold text-slate-900 text-[18px]">Overall Readiness</h4>
                    <p className="text-[12px] text-slate-500">Candidate travel & interview logistics</p>
                  </div>
                  <div className="text-[32px] font-black text-emerald-600 leading-none">
                    {conciergeState === 'CONFIRMED' ? '100%' : '60%'}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <StatusRow label="Interview Scheduled" status="done" />
                  <StatusRow label="Travel Profile" status="done" />
                  <StatusRow label="Hotel Accommodation" status={conciergeState === 'CONFIRMED' ? 'confirmed' : 'action'} />
                  <StatusRow label="Flight Booking" status={flightsState === 'FOUND' ? 'done' : 'optional'} />
                  <StatusRow label="Candidate Dinner" status={diningState === 'FOUND' ? 'done' : 'pending'} />
                  <StatusRow label="Final Itinerary" status={conciergeState === 'CONFIRMED' ? 'done' : 'pending'} />
                </div>
              </div>

              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">AI Next Action</h3>
              {conciergeState === 'IDLE' && (
                <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                  <p className="text-[13px] text-slate-700 leading-relaxed mb-4">
                    {candidateData.name} needs accommodation for the night before their 10:00 AM interview. I can search options within the travel policy.
                  </p>
                  <button onPointerDown={(e) => { e.stopPropagation(); startConcierge(); }} className="text-[11px] bg-violet-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer pointer-events-auto">
                    Start Search <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
              {conciergeState === 'RESULTS_READY' && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-[13px] text-amber-900 font-medium mb-3">
                    I found 3 suitable hotel options. Please review and approve a booking.
                  </p>
                  <button onPointerDown={(e) => { e.stopPropagation(); setActiveTab('stay'); }} className="text-[11px] bg-amber-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer pointer-events-auto">
                    Review Hotels <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
              {conciergeState === 'CONFIRMED' && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <p className="text-[13px] text-emerald-900 font-medium mb-3">
                    Accommodation is booked! The candidate itinerary has been updated.
                  </p>
                  <button onPointerDown={(e) => { e.stopPropagation(); setActiveTab('itinerary'); }} className="text-[11px] bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer pointer-events-auto">
                    View Itinerary <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="w-64 flex flex-col gap-4">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Trip Summary</h3>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">FROM</p>
                    <p className="text-[13px] font-medium text-slate-900">{candidateData.fromCity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">TO</p>
                    <p className="text-[13px] font-medium text-slate-900">{candidateData.toCity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">INTERVIEW</p>
                    <p className="text-[13px] font-medium text-slate-900">Oct 15 • 10:00 AM</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Budget</h3>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[11px] text-slate-500 font-bold">TOTAL</p>
                    <p className="text-[13px] font-bold text-slate-900">{candidateData.budget}</p>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[11px] text-slate-500 font-bold">SPENT</p>
                    <p className="text-[13px] font-bold text-violet-600">${spent.toFixed(2)}</p>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-violet-500 h-full" style={{ width: `${Math.min(100, (spent / parseFloat(candidateData.budget.replace('$', ''))) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STAY TAB ── */}
        {activeTab === 'stay' && (
          <div className="p-5 flex flex-col h-full overflow-y-auto pointer-events-auto">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="font-bold text-[18px] text-slate-900">Stay in {candidateData.toCity.split(',')[0]}</h3>
                <p className="text-[12px] text-slate-500">{candidateData.checkIn} → {candidateData.checkOut} • 1 guest • 1 room</p>
              </div>
            </div>

            {conciergeState === 'IDLE' && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center max-w-sm">
                  <Hotel className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h4 className="font-bold text-slate-700 mb-2">Find Accommodation</h4>
                  <p className="text-[12px] text-slate-500 mb-6">Ophelia will search for hotels within the {candidateData.budget} budget near the {candidateData.toCity} office.</p>
                  <button onPointerDown={(e) => { e.stopPropagation(); startConcierge(); }} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl cursor-pointer pointer-events-auto">
                    Search Hotels
                  </button>
                </div>
              </div>
            )}

            {conciergeState === 'SEARCHING' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                <p className="text-slate-600 font-medium text-sm">Searching Ophelia...</p>
              </div>
            )}

            {conciergeState === 'RESULTS_READY' && (
              <div className="grid grid-cols-3 gap-4">
                {hotels.map((hotel, i) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    recommended={i === 0}
                    selected={selectedHotelId === hotel.id}
                    onSelect={() => setSelectedHotelId(hotel.id)}
                    onApprove={selectedHotelId === hotel.id ? approveBooking : undefined}
                  />
                ))}
              </div>
            )}

            {conciergeState === 'CHECKING_AVAILABILITY' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                <p className="text-slate-600 font-medium text-sm">Confirming availability...</p>
              </div>
            )}

            {conciergeState === 'REQUIRES_PAYMENT' && availability && (
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="font-bold text-xl text-slate-900 mb-2">Room Available!</h3>
                  <p className="text-slate-500 text-sm mb-6">The {availability.roomType} is available at {hotels.find(h => h.id === selectedHotelId)?.name}.</p>
                  <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 text-left">
                    <div className="flex justify-between text-sm mb-2"><span className="text-slate-500">Nightly Rate</span><span className="font-medium">${availability.priceBreakdown.base}</span></div>
                    <div className="flex justify-between text-sm mb-2"><span className="text-slate-500">Taxes & Fees</span><span className="font-medium">${availability.priceBreakdown.taxes}</span></div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200"><span className="text-slate-900">Total</span><span className="text-violet-600">${availability.priceBreakdown.total}</span></div>
                  </div>
                  <button onPointerDown={(e) => { e.stopPropagation(); continueAfterPayment(); }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md cursor-pointer pointer-events-auto">
                    Confirm & Pay Now
                  </button>
                </div>
              </div>
            )}

            {conciergeState === 'BOOKING' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                <p className="text-slate-600 font-medium text-sm">Processing booking...</p>
              </div>
            )}

            {conciergeState === 'CONFIRMED' && booking && (
              <div className="flex-1 flex flex-col">
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6 flex gap-6 items-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-1">Booking Confirmed</h3>
                    <p className="text-emerald-700 text-sm">Confirmation #{booking.confirmationCode}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FLIGHTS TAB ── */}
        {activeTab === 'flights' && (
          <div className="p-5 flex flex-col h-full w-full overflow-y-auto pointer-events-auto">
            {flightsState === 'IDLE' && (
              <div className="flex flex-col items-center justify-center h-full my-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center max-w-sm">
                  <Plane className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-700 mb-1">Flights</h4>
                  <div className="flex items-center justify-center gap-3 text-slate-600 font-bold text-[13px] mb-4">
                    <span>{candidateData.fromCode}</span> <ArrowRight className="w-4 h-4 text-slate-400" /> <span>{candidateData.toCode}</span>
                  </div>
                  <button onPointerDown={(e) => { e.stopPropagation(); searchFlights(); }} className="mt-4 w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl cursor-pointer pointer-events-auto">
                    Search Flights
                  </button>
                </div>
              </div>
            )}
            {flightsState === 'SEARCHING' && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                <p className="text-slate-600 font-medium">Searching Flights API...</p>
              </div>
            )}
            {flightsState === 'FOUND' && (
              <div className="space-y-3">
                <h4 className="font-bold text-[16px]">Available Flights</h4>
                {flights.map((f, i) => (
                  <div key={f.id} className={`p-4 border rounded-xl bg-white ${i===0?'border-violet-500 shadow-md ring-1 ring-violet-200':'border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{f.logo || '✈️'}</span>
                        <div>
                          <p className="font-bold text-[14px]">{f.airline}</p>
                          <p className="text-[11px] text-slate-400">{f.flight} • {f.aircraft}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xl text-slate-900">{f.price}</p>
                        {i === 0 && <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">BEST VALUE</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-2 mb-2">
                      <div className="text-center">
                        <p className="font-black text-[13px]">{f.origin}</p>
                        <p className="text-[10px] text-slate-400">Depart</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <p className="text-[10px] text-slate-500 font-medium">{f.duration}</p>
                        <div className="w-full h-px bg-slate-300 relative my-1">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500" />
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500" />
                        </div>
                        <p className="text-[10px] text-violet-600 font-bold">{f.type}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-[13px]">{f.dest}</p>
                        <p className="text-[10px] text-slate-400">Arrive</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-500">{f.time} • {f.cabin} • Gate {f.gate}</p>
                      <button onPointerDown={(e) => { e.stopPropagation(); }} className="bg-violet-600 text-white px-4 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer pointer-events-auto hover:bg-violet-700 transition-colors">
                        Select Flight
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── DINING TAB ── */}
        {activeTab === 'dining' && (
          <div className="p-5 flex flex-col h-full w-full overflow-y-auto pointer-events-auto">
            {diningState === 'IDLE' && (
              <div className="flex flex-col items-center justify-center h-full my-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center max-w-sm">
                  <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-700 mb-1">Candidate Dinner</h4>
                  <p className="text-sm text-slate-500 mb-4">{candidateData.toCity}</p>
                  <button onPointerDown={(e) => { e.stopPropagation(); searchDining(); }} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl cursor-pointer pointer-events-auto">
                    Find Dinner Options
                  </button>
                </div>
              </div>
            )}
            {diningState === 'SEARCHING' && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                <p className="text-slate-600 font-medium">Searching Dining API...</p>
              </div>
            )}
            {diningState === 'FOUND' && (
              <div className="space-y-3">
                <h4 className="font-bold text-[16px]">Dining Options Near Office</h4>
                {diningOptions.map((d, i) => (
                  <div key={d.id} className={`border rounded-xl overflow-hidden bg-white ${i===0?'border-violet-500 shadow-md ring-1 ring-violet-200':'border-slate-200'}`}>
                    {d.image && <img src={d.image} className="w-full h-28 object-cover" />}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-bold text-[14px]">{d.name}</p>
                          <p className="text-[11px] text-slate-500">{d.type}</p>
                        </div>
                        {i === 0 && <span className="text-[9px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold shrink-0">TOP PICK</span>}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                        <span className="font-bold text-amber-500">★ {d.rating}</span>
                        <span>{d.reviews} reviews</span>
                        <span>{d.dist}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{d.address} • {d.hours}</p>
                      <button onPointerDown={(e) => { e.stopPropagation(); }} className="mt-3 w-full bg-violet-600 text-white py-2 text-[11px] font-bold rounded-lg cursor-pointer pointer-events-auto hover:bg-violet-700 transition-colors">
                        Reserve Table
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
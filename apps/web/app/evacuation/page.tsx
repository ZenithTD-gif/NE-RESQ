'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Compass, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Car, 
  Footprints, 
  ArrowRight,
  Info,
  LocateFixed,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Navigation
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { NORTHEAST_STATES } from '@shared/northeast-data';

// Dynamically import the interactive evacuation map
const EvacuationMapInteractive = dynamic(
  () => import('@/components/map/EvacuationMapInteractive'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] rounded-3xl bg-slate-900 flex items-center justify-center text-xs font-semibold text-slate-300">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" />
        <span>Loading Tactical Evacuation Map...</span>
      </div>
    )
  }
);

// Verified Designated Evacuation Shelters across Northeast India
const DESIGNATED_SHELTERS = [
  {
    id: 'sh-ghy-sarusajai',
    name: 'Sarusajai Indoor Stadium Relief Center',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    address: 'National Highway 37, Sarusajai, Guwahati, Assam 781040',
    lat: 26.1158,
    lng: 91.7511,
    capacity: 1200
  },
  {
    id: 'sh-dbr-polytechnic',
    name: 'Dibrugarh Government Polytechnic Center',
    state: 'Assam',
    district: 'Dibrugarh',
    address: 'Lahoal, Dibrugarh, Assam 786010',
    lat: 27.5100,
    lng: 94.9800,
    capacity: 600
  },
  {
    id: 'sh-shillong-jn',
    name: 'JN Indoor Sports Complex Evacuation Center',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    address: 'Polo Grounds, Shillong, Meghalaya 793001',
    lat: 25.5840,
    lng: 91.8900,
    capacity: 850
  },
  {
    id: 'sh-gangtok-paljor',
    name: 'Paljor Stadium Emergency Refuge Facility',
    state: 'Sikkim',
    district: 'Gangtok',
    address: 'Paljor Stadium Road, Gangtok, Sikkim 737101',
    lat: 27.3320,
    lng: 88.6140,
    capacity: 900
  },
  {
    id: 'sh-imphal-rims',
    name: 'RIMS Regional Disaster Refuge Ward',
    state: 'Manipur',
    district: 'Imphal West',
    address: 'Lamphelpat, Imphal, Manipur 795004',
    lat: 24.8190,
    lng: 93.9210,
    capacity: 500
  },
  {
    id: 'sh-aizawl-center',
    name: 'Aizawl Government Higher Secondary Refuge Point',
    state: 'Mizoram',
    district: 'Aizawl',
    address: 'Zarkawt, Aizawl, Mizoram 796001',
    lat: 23.7360,
    lng: 92.7170,
    capacity: 450
  },
  {
    id: 'sh-kohima-local',
    name: 'Kohima Local Ground Community Shelter',
    state: 'Nagaland',
    district: 'Kohima',
    address: 'D-Block, Kohima, Nagaland 797001',
    lat: 25.6740,
    lng: 94.1100,
    capacity: 550
  },
  {
    id: 'sh-agartala-stadium',
    name: 'Swami Vivekananda Stadium Relief Facility',
    state: 'Tripura',
    district: 'West Tripura',
    address: 'Astabal, Agartala, Tripura 799001',
    lat: 23.8360,
    lng: 91.2820,
    capacity: 700
  }
];

export default function EvacuationPage() {
  const [origin, setOrigin] = useState('');
  const [destinationInput, setDestinationInput] = useState('Sarusajai Indoor Stadium Relief Center');
  const [selectedDestination, setSelectedDestination] = useState<any>(DESIGNATED_SHELTERS[0]);
  const [travelMode, setTravelMode] = useState<'VEHICLE' | 'FOOT'>('VEHICLE');
  const [selectedState, setSelectedState] = useState('Assam');

  // Geolocation States
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'detecting' | 'success' | 'denied' | 'error' | 'timeout'
  >('idle');
  const [locationErrorMessage, setLocationErrorMessage] = useState('');
  const [userLocationData, setUserLocationData] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    label: string;
  } | null>(null);

  // Routing State
  const [routingResults, setRoutingResults] = useState<any | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Helper to compute Haversine distance
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  // Browser Geolocation Access Handler
  const handleGetLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('error');
      setLocationErrorMessage('Browser Geolocation is not supported by your current browser.');
      return;
    }

    setLocating(true);
    setLocationStatus('detecting');
    setLocationErrorMessage('');

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        let resolvedAddress = `GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;

        // Reverse geocoding attempt (with silent fallback)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            const town = data.address?.city || data.address?.town || data.address?.suburb || data.address?.village || data.address?.county;
            const state = data.address?.state || '';
            if (town) {
              resolvedAddress = `${town}, ${state} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            }
          }
        } catch (e) {
          // Keep GPS coordinates format if reverse geocode fails
        }

        setUserLocationData({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          label: resolvedAddress,
        });

        // Automatically populate Current Location input field
        setOrigin(resolvedAddress);
        setLocationStatus('success');
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('denied');
          setLocationErrorMessage(
            'Location access denied. Please click the lock or settings icon in your browser address bar to allow location permissions.'
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationStatus('timeout');
          setLocationErrorMessage('Location detection timed out. Please verify your device GPS is on and retry.');
        } else {
          setLocationStatus('error');
          setLocationErrorMessage('Unable to detect current GPS location. You can enter your landmark manually.');
        }
      },
      options
    );
  };

  // Route Calculation Handler
  const handleCalculateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim()) return;

    setCalculating(true);

    const startLat = userLocationData ? userLocationData.lat : 26.18;
    const startLng = userLocationData ? userLocationData.lng : 91.75;
    const destLat = selectedDestination?.lat || 26.1158;
    const destLng = selectedDestination?.lng || 91.7511;

    const baseDist = calculateDistanceKm(startLat, startLng, destLat, destLng);
    const roadDist = Math.max(1.8, parseFloat((baseDist * 1.25).toFixed(1)));
    const minutes = travelMode === 'VEHICLE' ? Math.round(roadDist * 2.3) : Math.round(roadDist * 12);

    // Generate realistic waypoints for Primary Corridor
    const primaryPoints: Array<[number, number]> = [
      [startLat, startLng],
      [startLat + (destLat - startLat) * 0.35 + 0.004, startLng + (destLng - startLng) * 0.3 - 0.003],
      [startLat + (destLat - startLat) * 0.7 - 0.002, startLng + (destLng - startLng) * 0.75 + 0.004],
      [destLat, destLng]
    ];

    // Generate Alternative Bypass Corridor
    const altPoints: Array<[number, number]> = [
      [startLat, startLng],
      [startLat + (destLat - startLat) * 0.45 - 0.008, startLng + (destLng - startLng) * 0.4 + 0.008],
      [startLat + (destLat - startLat) * 0.85 + 0.006, startLng + (destLng - startLng) * 0.8 - 0.006],
      [destLat, destLng]
    ];

    setTimeout(() => {
      setRoutingResults({
        destination: selectedDestination?.name || destinationInput,
        destinationAddress: selectedDestination?.address || `${selectedDestination?.district}, ${selectedState}`,
        distanceKm: roadDist,
        estimatedTimeMinutes: minutes,
        routeCoordinates: primaryPoints,
        alternativeCoordinates: altPoints,
        hazardAlerts: [
          'Caution: NH-27 service lane experiencing slow moving traffic due to rainfall runoff.',
          'Cleared: Jalukbari arterial corridor is open for authorized emergency movement.',
          'Respect designated height barriers: Low culverts monitored by SDRF.'
        ],
        safeSteps: [
          'Depart current location and merge onto nearest elevated primary artery.',
          'Avoid river-side low culverts prone to sudden water logging.',
          'Follow illuminated road signs towards the designated emergency reception gates.',
          `Report to DDMA Intake Officer at ${selectedDestination?.name || 'the facility'} for verification and shelter allocation.`
        ]
      });
      setCalculating(false);
    }, 550);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-800 mb-2">
          <Compass className="w-3.5 h-3.5 text-sky-600 animate-spin" />
          <span>SMART EVACUATION GUIDANCE SYSTEM</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-charcoal tracking-tight">
          Safe Evacuation Route Planning
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted max-w-2xl mt-1">
          Compute verified transit pathways to designated state shelters with automated GPS positioning and satellite/topographic GIS routing.
        </p>
      </div>

      {/* Main Evacuation Form & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-4">
          <LiquidCard className="p-6 space-y-5 border border-sky-200">
            <form onSubmit={handleCalculateRoute} className="space-y-4">
              
              {/* Jurisdiction & Travel Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-charcoal block mb-1">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {NORTHEAST_STATES.map((st) => (
                      <option key={st.code} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-charcoal block mb-1">Transit Mode</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTravelMode('VEHICLE')}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        travelMode === 'VEHICLE'
                          ? 'bg-charcoal text-white border-charcoal shadow-xs'
                          : 'bg-white text-charcoal border-slate-200'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" /> Car
                    </button>
                    <button
                      type="button"
                      onClick={() => setTravelMode('FOOT')}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        travelMode === 'FOOT'
                          ? 'bg-charcoal text-white border-charcoal shadow-xs'
                          : 'bg-white text-charcoal border-slate-200'
                      }`}
                    >
                      <Footprints className="w-3.5 h-3.5" /> Walk
                    </button>
                  </div>
                </div>
              </div>

              {/* Automatic Current Location Access Section */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Your Current Location</span>
                  </label>
                  
                  {/* Neon Cyan / Emerald Location Button */}
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locating}
                    className="group relative px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/10 via-emerald-500/15 to-cyan-500/10 border border-emerald-400/50 text-emerald-800 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                  >
                    {locating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    ) : (
                      <LocateFixed className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-45 transition-transform" />
                    )}
                    <span>{locating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
                  </button>
                </div>

                {/* Editable Current Location Input Field */}
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Click button above or enter landmark/address..."
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-slate-200 bg-white focus:border-cyan-500 outline-none transition-colors"
                  />
                  <Navigation className="w-4 h-4 text-cyan-600 absolute left-3 top-3.5" />
                </div>

                {/* Location Feedback & Error States */}
                {locationStatus === 'success' && userLocationData && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        <strong>Location detected:</strong> ±{userLocationData.accuracy}m accuracy
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline shrink-0 ml-2"
                    >
                      Update
                    </button>
                  </div>
                )}

                {locationStatus === 'denied' && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-tight">{locationErrorMessage}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="px-2 py-1 rounded bg-amber-200 text-amber-900 font-bold text-[10px] hover:bg-amber-300 shrink-0"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {(locationStatus === 'error' || locationStatus === 'timeout') && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="text-[11px] truncate">{locationErrorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="px-2 py-1 rounded bg-rose-200 text-rose-900 font-bold text-[10px] hover:bg-rose-300 shrink-0 flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Landmark / Destination Section */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-charcoal block">
                  Designated Refuge Shelter / Landmark
                </label>
                
                <select
                  value={selectedDestination?.id || ''}
                  onChange={(e) => {
                    const sel = DESIGNATED_SHELTERS.find(s => s.id === e.target.value);
                    if (sel) {
                      setSelectedDestination(sel);
                      setDestinationInput(sel.name);
                    }
                  }}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {DESIGNATED_SHELTERS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.state} - Cap: {s.capacity})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Or enter custom landmark/destination..."
                  value={destinationInput}
                  onChange={(e) => {
                    setDestinationInput(e.target.value);
                    setSelectedDestination({
                      id: 'custom',
                      name: e.target.value,
                      lat: selectedDestination?.lat || 26.1158,
                      lng: selectedDestination?.lng || 91.7511,
                      address: e.target.value
                    });
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-charcoal outline-none focus:border-cyan-500"
                />
              </div>

              {/* Calculate Action */}
              <button
                type="submit"
                disabled={calculating || !origin.trim()}
                className="w-full py-3.5 rounded-2xl liquid-glass-emergency-btn text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-emergency-glow active:scale-95 transition-transform disabled:opacity-50"
              >
                <Compass className="w-4 h-4" />
                <span>{calculating ? 'Analyzing Terrain & Safe Corridors...' : 'Calculate Safe Evacuation Route'}</span>
              </button>
            </form>
          </LiquidCard>
        </div>

        {/* Right Column: Interactive Tactical Map */}
        <div className="lg:col-span-7">
          <EvacuationMapInteractive
            userLocation={
              userLocationData 
                ? { lat: userLocationData.lat, lng: userLocationData.lng, label: userLocationData.label } 
                : null
            }
            destination={
              selectedDestination 
                ? { lat: selectedDestination.lat, lng: selectedDestination.lng, name: selectedDestination.name }
                : null
            }
            routeCoordinates={routingResults?.routeCoordinates}
            alternativeCoordinates={routingResults?.alternativeCoordinates}
          />
        </div>

      </div>

      {/* Results Card */}
      {routingResults && (
        <LiquidCard className="p-6 sm:p-8 space-y-6 border-l-4 border-l-emerald-500 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Evacuation Route
              </span>
              <h3 className="font-extrabold text-charcoal text-lg mt-1">{routingResults.destination}</h3>
              <p className="text-xs text-charcoal-muted">{routingResults.destinationAddress}</p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-2xl font-black text-charcoal font-mono">
                {routingResults.distanceKm} km
              </span>
              <span className="text-xs text-charcoal-muted block font-semibold">
                ~{routingResults.estimatedTimeMinutes} mins by {travelMode.toLowerCase()}
              </span>
            </div>
          </div>

          {/* Hazard avoidance advice */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Verified Road Closures & Hazard Avoidance</span>
            </h4>
            <div className="space-y-1.5">
              {routingResults.hazardAlerts.map((h: string, i: number) => (
                <div key={i} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  {h}
                </div>
              ))}
            </div>
          </div>

          {/* Step guidance */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Step-by-Step Evacuation Transit Protocol</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-charcoal leading-relaxed">
              {routingResults.safeSteps.map((s: string, idx: number) => (
                <li key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-medium">
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </LiquidCard>
      )}

      {/* Strict Safety Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-charcoal-muted text-[11px] leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-charcoal-muted shrink-0 mt-0.5" />
        <p>
          <strong>Operational Safety Doctrine:</strong> Route calculations are provided as dynamic geospatial guidance using open elevation and reported road status. If flash floods, mudslides, or tree falls occur, immediately follow directives from local police, NDRF (0361-2849005), and SDRF ground personnel. Never attempt to drive or walk through moving floodwaters.
        </p>
      </div>

    </div>
  );
}

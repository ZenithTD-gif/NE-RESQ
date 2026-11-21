'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Radio, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  WifiOff, 
  HeartPulse,
  Accessibility
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { NORTHEAST_STATES, NORTHEAST_DISTRICTS } from '@shared/northeast-data';
import { queueOfflineSOS } from '@/lib/offline-sync';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const EmergencyOrb3D = dynamic(() => import('@/components/3d/EmergencyOrb3D'), {
  ssr: false,
  loading: () => (
    <div className="w-56 h-56 rounded-full liquid-glass-card flex items-center justify-center text-xs font-bold text-emergency">
      Loading 3D Emergency Radar...
    </div>
  )
});

const EMERGENCY_CATEGORIES = [
  { id: 'FLOOD_RESCUE', label: 'Flood Rescue (Stranded by Water)', priority: 'CRITICAL_LIFE_THREATENING' },
  { id: 'LANDSLIDE_RESCUE', label: 'Landslide / Debris Trapped', priority: 'CRITICAL_LIFE_THREATENING' },
  { id: 'MEDICAL_EMERGENCY', label: 'Severe Medical Trauma / Critical Patient', priority: 'CRITICAL_LIFE_THREATENING' },
  { id: 'STRANDED_PERSON', label: 'Stranded Resident / Cutoff Area', priority: 'HIGH' },
  { id: 'MISSING_PERSON', label: 'Missing Person Search Assistance', priority: 'HIGH' },
  { id: 'FOOD_REQUIREMENT', label: 'Emergency Food Shortage', priority: 'MEDIUM' },
  { id: 'DRINKING_WATER_REQUIREMENT', label: 'Potable Drinking Water Emergency', priority: 'HIGH' },
  { id: 'SHELTER_REQUIREMENT', label: 'Immediate Shelter / Relocation Needed', priority: 'HIGH' },
  { id: 'OTHER_EMERGENCY', label: 'Other Disaster Emergency', priority: 'HIGH' }
];

export default function EmergencySOSPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);

  // Form State
  const [citizenName, setCitizenName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [category, setCategory] = useState('FLOOD_RESCUE');
  const [state, setState] = useState('Assam');
  const [district, setDistrict] = useState('Kamrup Metropolitan');
  const [locationAddress, setLocationAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(26.1445);
  const [longitude, setLongitude] = useState<number>(91.7362);
  const [gpsDetected, setGpsDetected] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [affectedCount, setAffectedCount] = useState(1);
  const [hasMedicalEmergency, setHasMedicalEmergency] = useState(false);
  const [medicalDetails, setMedicalDetails] = useState('');
  const [hasAccessibilityNeeds, setHasAccessibilityNeeds] = useState(false);
  const [accessibilityDetails, setAccessibilityDetails] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [offlineNotice, setOfflineNotice] = useState<any | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    handleGetGPS();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleGetGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsDetected(true);
        setGpsLoading(false);
      },
      (err) => {
        console.warn('Geolocation access failed or denied:', err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!citizenName.trim() || !contactPhone.trim() || !locationAddress.trim()) {
      setErrorMessage('Please provide your name, phone number, and physical location address.');
      return;
    }

    const payload = {
      citizenName: citizenName.trim(),
      contactPhone: contactPhone.trim(),
      category,
      state,
      district,
      locationAddress: locationAddress.trim(),
      latitude,
      longitude,
      affectedCount: Number(affectedCount) || 1,
      hasMedicalEmergency,
      medicalDetails,
      hasAccessibilityNeeds,
      accessibilityDetails,
      additionalNotes
    };

    setSubmitting(true);

    if (!navigator.onLine) {
      const queued = queueOfflineSOS(payload);
      setOfflineNotice({
        tempId: queued.tempId,
        message: t('sos.offline', 'Pending synchronization — not yet delivered. Your SOS is saved locally on this device and will automatically transmit the moment network connection returns.')
      });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit emergency request.');
      }

      router.push(`/sos/track/${data.data.trackingId}`);
    } catch (err: any) {
      const queued = queueOfflineSOS(payload);
      setOfflineNotice({
        tempId: queued.tempId,
        message: t('sos.offline', 'Network connection lost during transmission. Saved locally: "Pending synchronization — not yet delivered".')
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 3D Dimensional Emergency Control Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emergency/10 border border-emergency/30 text-xs font-bold text-emergency">
          <Radio className="w-3.5 h-3.5 animate-ping" />
          <span>{t('sos.badge', 'OFFICIAL RESCUE DISPATCH INGESTION')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-charcoal tracking-tight">
          {t('sos.title', 'Emergency Assistance (SOS)')}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted max-w-lg mx-auto">
          {t('sos.desc', 'One-click emergency alert with automated GPS triangulation. Dispatched directly to authorized State & District Emergency Operation Centers (SEOC/DEOC).')}
        </p>

        {/* 3D Orb Interactive Visualization */}
        <div className="flex justify-center -my-2">
          <EmergencyOrb3D statusText={t('sos.standby', 'STAND BY FOR IMMEDIATE RESCUE COORDINATION')} />
        </div>
      </div>

      {!isOnline && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong>You are currently offline:</strong> Requests submitted while offline will display status <em>&quot;Pending synchronization — not yet delivered&quot;</em> and sync safely when your connection restores.
          </div>
        </div>
      )}

      {offlineNotice && (
        <LiquidCard className="p-6 border-l-4 border-l-amber-500 bg-amber-50/50 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>SOS Queued Locally (Offline Mode)</span>
          </div>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            {offlineNotice.message}
          </p>
          <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs font-mono font-bold text-charcoal">
            Temporary Reference ID: {offlineNotice.tempId}
          </div>
        </LiquidCard>
      )}

      <LiquidCard className="p-6 sm:p-10 border border-white/80 shadow-glass-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Emergency Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              {t('sos.step1', '1. Emergency Incident Category *')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EMERGENCY_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                    category === cat.id
                      ? 'bg-emergency/10 border-emergency text-emergency shadow-xs'
                      : 'bg-white/80 border-slate-200 text-charcoal hover:bg-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  {category === cat.id && <CheckCircle2 className="w-4 h-4 text-emergency" />}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-charcoal block mb-1">
                {t('sos.name', 'Your Full Name (Citizen) *')}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bhupen Hazarika"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-white/90 focus:border-emergency outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-charcoal block mb-1">
                {t('sos.phone', 'Active Contact Phone Number *')}
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 9876543210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-white/90 focus:border-emergency outline-none font-mono"
              />
            </div>
          </div>

          {/* Section 3: Location and Coordinates */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-charcoal block">
                {t('sos.step2', '2. Location & GPS Triangulation *')}
              </label>
              <button
                type="button"
                onClick={handleGetGPS}
                className="text-xs font-bold text-emergency hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{gpsLoading ? 'Detecting GPS...' : gpsDetected ? 'GPS Acquired ✓' : 'Detect GPS Coordinates'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-charcoal-muted uppercase block mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
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
                <label className="text-[11px] font-bold text-charcoal-muted uppercase block mb-1">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {NORTHEAST_DISTRICTS.filter(d => d.stateName.toLowerCase() === state.toLowerCase()).map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-charcoal-muted uppercase block mb-1">
                {t('sos.address', 'Landmark / Village / Street Address *')}
              </label>
              <textarea
                required
                rows={2}
                placeholder="Exact location details, landmark, building name, water depth, or road condition..."
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-white/90 focus:border-emergency outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-charcoal-muted font-mono">
                Latitude: <span className="font-bold text-charcoal">{latitude.toFixed(6)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-charcoal-muted font-mono">
                Longitude: <span className="font-bold text-charcoal">{longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Affected Count & Critical Flags */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-charcoal">
                {t('sos.affected', 'Number of Affected / Stranded Citizens:')}
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={affectedCount}
                onChange={(e) => setAffectedCount(Number(e.target.value))}
                className="w-20 text-center font-bold text-sm p-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal">
                <input
                  type="checkbox"
                  checked={hasMedicalEmergency}
                  onChange={(e) => setHasMedicalEmergency(e.target.checked)}
                  className="rounded text-emergency focus:ring-emergency"
                />
                <span className="flex items-center gap-1.5 text-emergency font-bold">
                  <HeartPulse className="w-4 h-4" />
                  {t('sos.medical', 'Contains Immediate Medical Emergency / Trauma Patient')}
                </span>
              </label>
              {hasMedicalEmergency && (
                <input
                  type="text"
                  placeholder="Specify medical condition: pregnant woman, cardiac, bleeding, elderly on oxygen..."
                  value={medicalDetails}
                  onChange={(e) => setMedicalDetails(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-red-200 bg-red-50/50 outline-none"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal">
                <input
                  type="checkbox"
                  checked={hasAccessibilityNeeds}
                  onChange={(e) => setHasAccessibilityNeeds(e.target.checked)}
                  className="rounded text-emergency focus:ring-emergency"
                />
                <span className="flex items-center gap-1.5 text-charcoal font-bold">
                  <Accessibility className="w-4 h-4 text-sky-600" />
                  {t('sos.accessibility', 'Persons with Disabilities / Wheelchair / Limited Mobility')}
                </span>
              </label>
              {hasAccessibilityNeeds && (
                <input
                  type="text"
                  placeholder="Specify mobility assistance equipment required..."
                  value={accessibilityDetails}
                  onChange={(e) => setAccessibilityDetails(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-sky-200 bg-sky-50/50 outline-none"
                />
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="w-full liquid-glass-emergency-btn text-white font-extrabold text-sm sm:text-base py-4 rounded-2xl flex items-center justify-center gap-2 shadow-emergency-glow hover:scale-[1.01] transition-transform"
            >
              <Radio className="w-5 h-5 animate-pulse" />
              <span>{submitting ? 'TRANSMITTING EMERGENCY DISPATCH...' : t('sos.submit', 'CONFIRM & SUBMIT EMERGENCY SOS')}</span>
            </button>
            <p className="text-[11px] text-center text-charcoal-muted mt-2">
              By submitting, your coordinates and contact details are securely transmitted to authorized control room dispatchers.
            </p>
          </div>

        </form>
      </LiquidCard>

    </div>
  );
}

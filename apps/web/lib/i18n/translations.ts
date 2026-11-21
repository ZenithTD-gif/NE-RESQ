export type SupportedLanguage = 
  | 'en' 
  | 'as' 
  | 'bn' 
  | 'hi' 
  | 'brx' 
  | 'kha' 
  | 'grt' 
  | 'mni' 
  | 'lus' 
  | 'ne';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  region: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'National / Official' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'Tripura, Assam, Bengal' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'National' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', region: 'BTR / Assam' },
  { code: 'kha', name: 'Khasi', nativeName: 'Khasi', region: 'Meghalaya' },
  { code: 'grt', name: 'Garo', nativeName: 'A·chik', region: 'Meghalaya' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', region: 'Manipur' },
  { code: 'lus', name: 'Mizo', nativeName: 'Mizo ṭawng', region: 'Mizoram' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'Sikkim, Assam' }
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Top Bar
    'topbar.notice': 'NORTHEAST EMERGENCY DISPATCH NETWORK — 8 STATES ACTIVE REGIONAL SURVEILLANCE',
    'topbar.helplines': 'SEOC Toll Free: 1070 | National: 112',

    // Navigation
    'nav.home': 'Home',
    'nav.liveMap': 'Live Map',
    'nav.alerts': 'Alerts',
    'nav.monitoring': 'Monitoring',
    'nav.shelters': 'Shelters',
    'nav.evacuation': 'Evacuation',
    'nav.reports': 'Reports',
    'nav.aiSafety': 'AI Safety',
    'nav.preparedness': 'Preparedness',
    'nav.about': 'About',
    'nav.portals': 'Portals',
    'nav.sosDispatch': 'SOS DISPATCH',

    // Hero
    'hero.badge': 'NORTHEAST INDIA REGIONAL SURVEILLANCE & RESCUE DISPATCH',
    'hero.tagline1': 'One Region. One Network.',
    'hero.tagline2': 'One Mission — Saving Lives.',
    'hero.desc': 'Integrated disaster intelligence, Brahmaputra & Barak river water monitoring, verified safe shelters, and emergency rescue management for all eight Northeast Indian states.',
    'hero.sosButton': 'DISPATCH EMERGENCY SOS',
    'hero.explore3D': 'Interactive 3D Regional Topography — Drag to rotate, scroll to zoom',
    'hero.stateSector': '8 Northeast State Sectors Active',

    // KPI Cards
    'kpi.activeAlerts': 'Active Alerts',
    'kpi.alertsDesc': 'Official IMD / SDMA verified notices',
    'kpi.verifiedShelters': 'Verified Shelters',
    'kpi.sheltersDesc': 'Designated relief & medical camps',
    'kpi.riverStations': 'River Stations',
    'kpi.stationsDesc': 'Brahmaputra & Barak CWC gauges',
    'kpi.registeredSOS': 'Registered SOS',
    'kpi.sosDesc': 'Tracked on regional dispatch ledger',

    // Sections
    'sec.alertsTitle': 'Official Broadcast Alerts',
    'sec.alertsSubtitle': 'Verified advisories from India Meteorological Department (IMD) & State Authorities',
    'sec.viewAllAlerts': 'View All Official Alerts',
    'sec.statesTitle': 'Northeast State Disaster Management Network',
    'sec.statesSubtitle': 'Click on any state to inspect verified district emergency hotlines and local shelter directories',
    'sec.sheltersCardTitle': 'Find Verified Shelters',
    'sec.sheltersCardDesc': 'Inspect relief camps, government facilities, capacity, and available medical stations.',
    'sec.evacuationCardTitle': 'Evacuation Route Guidance',
    'sec.evacuationCardDesc': 'Calculate safe routes avoiding verified flooded roads and landslide-blocked highways.',
    'sec.assistantCardTitle': 'AI Emergency Assistant',
    'sec.assistantCardDesc': 'Verified NDMA & SDMA disaster safety protocols with multi-language voice and zero hallucination.',

    // Common
    'action.searchFacilities': 'Search Facilities →',
    'action.planEvacuation': 'Plan Evacuation →',
    'action.askAssistant': 'Ask Assistant →',
    'action.call': 'Call Facility',
    'action.trackLive': 'Track Live →',
    'action.submit': 'Submit',
    'empty.title': 'No Active Alerts Currently Broadcast',
    'empty.desc': 'All official district channels are normal. When IMD or State Disaster Management Authorities issue warnings, they will appear here with strict verification.',
    'status.verified': 'VERIFIED',
    'status.submitted': 'SUBMITTED',
    'status.assigned': 'ASSIGNED',
    'status.inProgress': 'IN PROGRESS',
    'status.closed': 'CLOSED',
    'warning.notice': 'Official Safety Notice',
    'warning.disclaimer': 'NE-RESQ operates as an auxiliary emergency management and disaster intelligence platform. All official warnings, hydrographs, and meteorological updates are attributed directly to their issuing government agencies (IMD, CWC, NDMA, SDMAs).',

    // Map Page
    'map.title': 'Northeast Geospatial Disaster Intelligence Map',
    'map.desc': 'Verified postGIS coordinate layers for Brahmaputra & Barak river basins, shelters, and hazard boundaries.',
    'map.mode2d': '2D Tactical Map',
    'map.mode3d': '3D Terrain Elevation',
    'map.geoFilter': 'Geographic Filter',
    'map.dataLayers': 'Verified Data Layers',
    'map.allStates': 'All 8 Northeast States',
    'map.sheltersLayer': 'Designated Shelters',
    'map.riverGaugesLayer': 'River Water Gauges',
    'map.alertsLayer': 'Official Alerts',

    // SOS Page
    'sos.title': 'Emergency Assistance (SOS)',
    'sos.badge': 'OFFICIAL RESCUE DISPATCH INGESTION',
    'sos.desc': 'One-click emergency alert with automated GPS triangulation. Dispatched directly to authorized State & District Emergency Operation Centers (SEOC/DEOC).',
    'sos.standby': 'STAND BY FOR IMMEDIATE RESCUE COORDINATION',
    'sos.step1': '1. Emergency Incident Category *',
    'sos.step2': '2. Location & GPS Triangulation *',
    'sos.name': 'Your Full Name (Citizen) *',
    'sos.phone': 'Active Contact Phone Number *',
    'sos.address': 'Landmark / Village / Street Address *',
    'sos.affected': 'Number of Affected / Stranded Citizens:',
    'sos.medical': 'Contains Immediate Medical Emergency / Trauma Patient',
    'sos.accessibility': 'Persons with Disabilities / Wheelchair / Limited Mobility',
    'sos.submit': 'CONFIRM & SUBMIT EMERGENCY SOS',
    'sos.offline': 'Pending synchronization — not yet delivered. Your SOS is saved locally and will transmit automatically once connection returns.'
  },

  as: {
    // Top Bar
    'topbar.notice': 'উত্তৰ-পূব জৰুৰীকালীন সাহায্য নেটৱৰ্ক — ৮ খন ৰাজ্যত সক্ৰিয় প্ৰাকৃতিক দুৰ্যোগ নিৰীক্ষণ',
    'topbar.helplines': 'ৰাজ্যিক কন্ট্ৰোল ৰূম: ১০৭০ | ৰাষ্ট্ৰীয় জৰুৰীকালীন: ১১২',

    // Navigation
    'nav.home': 'মুখ্য পৃষ্ঠা',
    'nav.liveMap': 'লাইভ মানচিত্ৰ',
    'nav.alerts': 'সতৰ্কবাৰ্তা',
    'nav.monitoring': 'জলস্তৰ নিৰীক্ষণ',
    'nav.shelters': 'আশ্ৰয় শিবিৰ',
    'nav.evacuation': 'সুৰক্ষিত যাত্ৰা',
    'nav.reports': 'জনসাধাৰণৰ প্ৰতিবেদন',
    'nav.aiSafety': 'এআই সুৰক্ষা সহায়ক',
    'nav.preparedness': 'পূৰ্বপ্ৰস্তুতি',
    'nav.about': 'আমাৰ বিষয়ে',
    'nav.portals': 'পৰ্টেলসমূহ',
    'nav.sosDispatch': 'জৰুৰীকালীন SOS',

    // Hero
    'hero.badge': 'উত্তৰ-পূব ভাৰত দুৰ্যোগ প্ৰশমন আৰু উদ্ধাৰ সাহায্য ব্যৱস্থা',
    'hero.tagline1': 'এটা অঞ্চল। এটা নেটৱৰ্ক।',
    'hero.tagline2': 'এটা উদ্দেশ্য — জীৱন ৰক্ষা।',
    'hero.desc': 'ব্ৰহ্মপুত্ৰ আৰু বৰাক নদীৰ জলপৃষ্ঠ পৰ্যবেক্ষণ, প্ৰমাণিত আশ্ৰয় শিবিৰ, বতৰৰ আগজাননী আৰু উদ্ধাৰকাৰী দলসমূহৰ সমন্বয়ৰ বাবে একত্ৰিত ডিজিটেল প্লেটফৰ্ম।',
    'hero.sosButton': 'জৰুৰীকালীন SOS প্ৰেৰণ কৰক',
    'hero.explore3D': 'আন্তঃক্ৰিয়াশীল ৩ডি ভূ-প্ৰকৃতি — ঘূৰাবলৈ স্পৰ্শ কৰক',
    'hero.stateSector': '৮ খন উত্তৰ-পূব ৰাজ্য সক্ৰিয়',

    // KPI Cards
    'kpi.activeAlerts': 'সক্ৰিয় সতৰ্কবাৰ্তা',
    'kpi.alertsDesc': 'ভাৰতীয় বতৰ বিজ্ঞান বিভাগ আৰু ASDMA ৰ জাননী',
    'kpi.verifiedShelters': 'প্ৰমাণিত আশ্ৰয় শিবিৰ',
    'kpi.sheltersDesc': 'চৰকাৰী সাহায্য আৰু চিকিৎসা কেন্দ্ৰসমূহ',
    'kpi.riverStations': 'নদী জলস্তৰ কেন্দ্ৰ',
    'kpi.stationsDesc': 'ব্ৰহ্মপুত্ৰ আৰু বৰাকৰ CWC গেজ কেন্দ্ৰ',
    'kpi.registeredSOS': 'পঞ্জীয়নভুক্ত SOS',
    'kpi.sosDesc': 'উদ্ধাৰ ব্যৱস্থাত লিপিবদ্ধ অনুৰোধ',

    // Sections
    'sec.alertsTitle': 'চৰকাৰী সতৰ্কবাৰ্তা আৰু জাননী',
    'sec.alertsSubtitle': 'ভাৰতীয় বতৰ বিজ্ঞান কেন্দ্ৰ (IMD) আৰু ৰাজ্যিক দুৰ্যোগ প্ৰশমন প্ৰাধিকৰণৰ পৰা জাৰি কৰা',
    'sec.viewAllAlerts': 'সকলো সতৰ্কবাৰ্তা চাওক',
    'sec.statesTitle': 'উত্তৰ-পূব ৰাজ্যিক দুৰ্যোগ ব্যৱস্থাপনা নেটৱৰ্ক',
    'sec.statesSubtitle': 'জিলা হেল্পলাইন আৰু আশ্ৰয় শিবিৰৰ তথ্য চাবলৈ যিকোনো ৰাজ্যত ক্লিক কৰক',
    'sec.sheltersCardTitle': 'আশ্ৰয় শিবিৰ বিচাৰক',
    'sec.sheltersCardDesc': 'প্ৰমাণিত সাহায্য শিবিৰ, ক্ষমতা, আৰু উপলব্ধ চিকিৎসা সেৱাৰ তথ্য জানক।',
    'sec.evacuationCardTitle': 'সুৰক্ষিত নিৰ্গমন পথ',
    'sec.evacuationCardDesc': 'জলমগ্ন পথ আৰু ভূমিস্খলনৰ স্থান পৰিহাৰ কৰি সুৰক্ষিত স্থানলৈ যোৱাৰ নিৰ্দেশনা।',
    'sec.assistantCardTitle': 'এআই জৰুৰীকালীন সহায়ক',
    'sec.assistantCardDesc': 'NDMA আৰু ASDMA ৰ অনুমোদিত নিৰ্দেশনা অনুসৰি সঠিক সুৰক্ষা পৰামৰ্শ।',

    // Common
    'action.searchFacilities': 'আশ্ৰয় শিবিৰ চাওক →',
    'action.planEvacuation': 'নিৰ্গমন পথ চাওক →',
    'action.askAssistant': 'সহায়কক সোধক →',
    'action.call': 'কল কৰক',
    'action.trackLive': 'লাইভ ট্ৰেক কৰক →',
    'action.submit': 'দাখিল কৰক',
    'empty.title': 'কোনো সক্ৰিয় চৰকাৰী সতৰ্কবাৰ্তা নাই',
    'empty.desc': 'বৰ্তমান সকলো জিলাৰ পৰিস্থিতি স্বাভাৱিক। কোনো সতৰ্কবাৰ্তা জাৰি হ’লে ইয়াত তাৎক্ষণিকভাৱে দেখুওৱা হ’ব।',
    'status.verified': 'প্ৰমাণিত',
    'status.submitted': 'প্ৰেৰণ কৰা হ’ল',
    'status.assigned': 'দল নিযুক্ত কৰা হ’ল',
    'status.inProgress': 'উদ্ধাৰ অভিযান চলি আছে',
    'status.closed': 'সম্পূৰ্ণ হ’ল',
    'warning.notice': 'চৰকাৰী সুৰক্ষা নিৰ্দেশনা',
    'warning.disclaimer': 'NE-RESQ হৈছে এক সমন্বয়মূলক দুৰ্যোগ ব্যৱস্থাপনা প্ৰযুক্তি। সকলো জাননী আৰু নদীৰ জলস্তৰ তথ্য মূল চৰকাৰী উৎসৰ (IMD, CWC, ASDMA) দ্বাৰা নিয়ন্ত্ৰিত।',

    // Map Page
    'map.title': 'উত্তৰ-পূব ভৌগোলিক দুৰ্যোগ নিৰীক্ষণ মানচিত্ৰ',
    'map.desc': 'ব্ৰহ্মপুত্ৰ আৰু বৰাক নদী অৱবাহিকা, আশ্ৰয় শিবিৰ আৰু বিপদজনক অঞ্চলৰ প্ৰমাণিত তথ্য।',
    'map.mode2d': '২ডি মানচিত্ৰ',
    'map.mode3d': '৩ডি ভূ-প্ৰকৃতি দৃশ্য',
    'map.geoFilter': 'ভৌগোলিক বাছনি',
    'map.dataLayers': 'প্ৰমাণিত তথ্য স্তৰসমূহ',
    'map.allStates': 'সকলো ৮ খন উত্তৰ-পূব ৰাজ্য',
    'map.sheltersLayer': 'নিৰ্ধাৰিত আশ্ৰয় শিবিৰসমূহ',
    'map.riverGaugesLayer': 'নদী জলস্তৰ গেজসমূহ',
    'map.alertsLayer': 'চৰকাৰী সতৰ্কবাৰ্তা',

    // SOS Page
    'sos.title': 'জৰুৰীকালীন সাহায্য (SOS)',
    'sos.badge': 'চৰকাৰী উদ্ধাৰ প্ৰেৰণ ব্যৱস্থা',
    'sos.desc': 'স্বয়ংক্ৰিয় জিপিএছ স্থান নিৰ্ধাৰণেৰে ক্ষিপ্ৰ সতৰ্কবাৰ্তা। পোনপটীয়াকৈ জিলা আৰু ৰাজ্যিক কন্ট্ৰোল ৰূমলৈ প্ৰেৰণ কৰা হয়।',
    'sos.standby': 'তাৎক্ষণিক উদ্ধাৰ সমন্বয়ৰ বাবে অপেক্ষা কৰক',
    'sos.step1': '১. দুৰ্যোগৰ শ্ৰেণী নিৰ্বাচন কৰক *',
    'sos.step2': '২. স্থান আৰু জিপিএছ নিৰ্ধাৰণ *',
    'sos.name': 'আপোনাৰ সম্পূৰ্ণ নাম *',
    'sos.phone': 'সক্ৰিয় ফোন নম্বৰ *',
    'sos.address': 'গাঁও / চহৰ / স্থানৰ সবিশেষ ঠিকনা *',
    'sos.affected': 'ক্ষতিগ্ৰস্ত / আৱদ্ধ লোকৰ সংখ্যা:',
    'sos.medical': 'জৰুৰীকালীন চিকিৎসা / আঘাতপ্ৰাপ্ত ব্যক্তি আছে',
    'sos.accessibility': 'বিশেষভাৱে সক্ষম / চলনশক্তিহীন ব্যক্তি আছে',
    'sos.submit': 'নিশ্চিত কৰি SOS প্ৰেৰণ কৰক',
    'sos.offline': 'সংযোজন অপেক্ষাৰত — এতিয়াও প্ৰেৰণ হোৱা নাই। নেটৱৰ্ক ঘূৰি অহাৰ লগে লগে স্বয়ংক্ৰিয়ভাৱে প্ৰেৰণ হ’ব।'
  },

  bn: {
    // Top Bar
    'topbar.notice': 'উত্তর-পূর্ব জরুরি সহায়তা নেটওয়ার্ক — ৮টি রাজ্যে সক্রিয় দুর্যোগ নজরদারি',
    'topbar.helplines': 'রাজ্য হেল্পলাইন: ১০৭০ | জাতীয় জরুরি নম্বর: ১১২',

    // Navigation
    'nav.home': 'হোম',
    'nav.liveMap': 'লাইভ মানচিত্র',
    'nav.alerts': 'সতর্কবার্তা',
    'nav.monitoring': 'জলস্তর পর্যবেক্ষণ',
    'nav.shelters': 'আশ্রয় শিবির',
    'nav.evacuation': 'নিরাপদ নির্গমন',
    'nav.reports': 'জনগণের রিপোর্ট',
    'nav.aiSafety': 'এআই সুরক্ষা সহায়ক',
    'nav.preparedness': 'প্রস্তুতি',
    'nav.about': 'পরিচিতি',
    'nav.portals': 'পোর্টালসমূহ',
    'nav.sosDispatch': 'জরুরি SOS',

    // Hero
    'hero.badge': 'উত্তর-পূর্ব ভারত দুর্যোগ ব্যবস্থাপনা ও উদ্ধার সহায়তা ব্যবস্থা',
    'hero.tagline1': 'এক অঞ্চল। এক নেটওয়ার্ক।',
    'hero.tagline2': 'এক লক্ষ্য — জীবন রক্ষা।',
    'hero.desc': 'ব্রহ্মপুত্র ও বরাক নদীর জলস্তর পর্যবেক্ষণ, যাচাইকৃত আশ্রয় শিবির এবং সমস্ত উত্তর-পূর্ব ভারতীয় রাজ্যের জন্য সমন্বিত দুর্যোগ ব্যবস্থাপনা প্ল্যাটফর্ম।',
    'hero.sosButton': 'জরুরি SOS পাঠান',
    'hero.explore3D': 'ইন্টারেক্টিভ ৩ডি ভৌগোলিক ভূ-প্রকৃতি — জুম ও ঘোরাতে স্পর্শ করুন',
    'hero.stateSector': '৮টি রাজ্য সক্রিয়',

    // KPI Cards
    'kpi.activeAlerts': 'সক্রিয় সতর্কতা',
    'kpi.alertsDesc': 'আইএমডি ও রাজ্য দুর্যোগ কর্তৃপক্ষের যাচাইকৃত নোটিশ',
    'kpi.verifiedShelters': 'যাচাইকৃত আশ্রয়স্থল',
    'kpi.sheltersDesc': 'সরকারি ত্রাণ ও প্রাথমিক চিকিৎসা শিবির',
    'kpi.riverStations': 'নদী জলস্তর কেন্দ্র',
    'kpi.stationsDesc': 'ব্রহ্মপুত্র ও বরাক অববাহিকার CWC স্টেশন',
    'kpi.registeredSOS': 'নিবন্ধিত SOS',
    'kpi.sosDesc': 'উদ্ধার ট্র্যাকিং লেজারে সংরক্ষিত',

    // Sections
    'sec.alertsTitle': 'সরকারি সতর্কতা ও বিজ্ঞপ্তি',
    'sec.alertsSubtitle': 'ভারতীয় আবহাওয়া বিভাগ (IMD) এবং দুর্যোগ ব্যবস্থাপনা কর্তৃপক্ষ থেকে সম্প্রচারিত',
    'sec.viewAllAlerts': 'সকল সতর্কবার্তা দেখুন',
    'sec.statesTitle': 'উত্তর-পূর্ব রাজ্য দুর্যোগ ব্যবস্থাপনা নেটওয়ার্ক',
    'sec.statesSubtitle': 'যেকোনো রাজ্যের জেলা হেল্পলাইন ও আশ্রয়ের তথ্য দেখতে ক্লিক করুন',
    'sec.sheltersCardTitle': 'যাচাইকৃত আশ্রয় শিবির খুঁজুন',
    'sec.sheltersCardDesc': 'সরকারি আশ্রয় কেন্দ্র, ধারণক্ষমতা এবং জরুরি চিকিৎসা সুবিধার বিশদ জানুন।',
    'sec.evacuationCardTitle': 'নিরাপদ নির্গমন পথ',
    'sec.evacuationCardDesc': 'প্লাবিত রাস্তা ও ভূমিধস এলাকা এড়িয়ে নিরাপদ আশ্রয়কেন্দ্রে পৌঁছানোর দিকনির্দেশনা।',
    'sec.assistantCardTitle': 'এআই জরুরি সহায়ক',
    'sec.assistantCardDesc': 'এনডিএমএ অনুমোদিত নির্দেশিকা অনুযায়ী জরুরি নিরাপত্তা তথ্য ও দিকনির্দেশনা।',

    // Common
    'action.searchFacilities': 'আশ্রয়কেন্দ্র খুঁজুন →',
    'action.planEvacuation': 'নির্গমন পথ দেখুন →',
    'action.askAssistant': 'সহায়ককে জিজ্ঞাসা করুন →',
    'action.call': 'কল করুন',
    'action.trackLive': 'লাইভ ট্র্যাক করুন →',
    'action.submit': 'জমা দিন',
    'empty.title': 'কোনো সক্রিয় সতর্কতা নেই',
    'empty.desc': 'বর্তমানে নির্বাচিত জেলা বা রাজ্যে পরিস্থিতি স্বাভাবিক রয়েছে।',
    'status.verified': 'যাচাইকৃত',
    'status.submitted': 'জমা দেওয়া হয়েছে',
    'status.assigned': 'দল নিযুক্ত',
    'status.inProgress': 'উদ্ধারকাজ চলমান',
    'status.closed': 'সম্পন্ন',
    'warning.notice': 'সরকারি সুরক্ষা নোটিশ',
    'warning.disclaimer': 'NE-RESQ একটি আধুনিক সমন্বিত দুর্যোগ প্রযুক্তি প্ল্যাটফর্ম। সমস্ত সরকারি আবহাওয়া তথ্য সরাসরি মূল কর্তৃপক্ষ দ্বারা সরবরাহ করা হয়।',

    // Map Page
    'map.title': 'উত্তর-পূর্ব ভৌগোলিক দুর্যোগ বুদ্ধিমত্তা মানচিত্র',
    'map.desc': 'ব্রহ্মপুত্র ও বরাক নদী অববাহিকা, আশ্রয় কেন্দ্র এবং ক্ষয়ক্ষতি এলাকার বিশদ তথ্য।',
    'map.mode2d': '২ডি মানচিত্র',
    'map.mode3d': '৩ডি ভূ-প্রকৃতি',
    'map.geoFilter': 'ভৌগোলিক ফিল্টার',
    'map.dataLayers': 'যাচাইকৃত ডেটা স্তর',
    'map.allStates': 'সকল ৮টি রাজ্য',
    'map.sheltersLayer': 'নির্ধারিত আশ্রয়কেন্দ্র',
    'map.riverGaugesLayer': 'নদী জলস্তর পরিমাপক',
    'map.alertsLayer': 'সরকারি সতর্কতা',

    // SOS Page
    'sos.title': 'জরুরি সহায়তা (SOS)',
    'sos.badge': 'সরকারি উদ্ধার ব্যবস্থা',
    'sos.desc': 'স্বয়ংক্রিয় জিপিএস অবস্থানের মাধ্যমে সরাসরি জেলা ও রাজ্য নিয়ন্ত্রণ কক্ষে পাঠানো হয়।',
    'sos.standby': 'জরুরি উদ্ধার সমন্বয়ের জন্য প্রস্তুত থাকুন',
    'sos.step1': '১. জরুরি ঘটনার বিভাগ নির্বাচন করুন *',
    'sos.step2': '২. অবস্থান ও জিপিএস বিবরণ *',
    'sos.name': 'আপনার পুরো নাম *',
    'sos.phone': 'সক্রিয় মোবাইল নম্বর *',
    'sos.address': 'গ্রাম / শহর / সঠিক ঠিকানা *',
    'sos.affected': 'আটকে পড়া নাগরিকের সংখ্যা:',
    'sos.medical': 'জরুরি চিকিৎসা / আঘাতপ্রাপ্ত রোগী রয়েছে',
    'sos.accessibility': 'বিশেষ চাহিদাসম্পন্ন / অক্ষম ব্যক্তি রয়েছে',
    'sos.submit': 'নিশ্চিত করুন ও SOS পাঠান',
    'sos.offline': 'সিঙ্ক বাকি — এখনও পৌঁছায়নি। সংযোগ ফিরলে স্বয়ংক্রিয়ভাবে পাঠানো হবে।'
  },

  hi: {
    // Top Bar
    'topbar.notice': 'पूर्वोत्तर आपातकालीन प्रतिक्रिया नेटवर्क — 8 राज्यों में सक्रिय आपदा निगरानी',
    'topbar.helplines': 'राज्य नियंत्रण कक्ष: 1070 | राष्ट्रीय आपातकाल: 112',

    // Navigation
    'nav.home': 'होम',
    'nav.liveMap': 'लाइव मानचित्र',
    'nav.alerts': 'चेतावनी',
    'nav.monitoring': 'जल स्तर निगरानी',
    'nav.shelters': 'राहत शिविर',
    'nav.evacuation': 'निकासी मार्ग',
    'nav.reports': 'नागरिक रिपोर्ट',
    'nav.aiSafety': 'एआई सुरक्षा सहायक',
    'nav.preparedness': 'आपदा तैयारी',
    'nav.about': 'हमारे बारे में',
    'nav.portals': 'पोर्टल',
    'nav.sosDispatch': 'आपातकालीन SOS',

    // Hero
    'hero.badge': 'पूर्वोत्तर भारत आपदा खुफिया और बचाव नेटवर्क',
    'hero.tagline1': 'एक क्षेत्र। एक नेटवर्क।',
    'hero.tagline2': 'एक संकल्प — जीवन रक्षा।',
    'hero.desc': 'ब्रह्मपुत्र और बराक नदी जलस्तर निगरानी, सत्यापित सुरक्षित आश्रय, मौसम अलर्ट और सभी 8 पूर्वोत्तर राज्यों के लिए आपातकालीन बचाव प्रबंधन मंच।',
    'hero.sosButton': 'आपातकालीन SOS भेजें',
    'hero.explore3D': 'इंटरैक्टिव 3D भौगोलिक परिदृश्य — घुमाने और ज़ूम करने के लिए स्पर्श करें',
    'hero.stateSector': '8 पूर्वोत्तर राज्य सक्रिय',

    // KPI Cards
    'kpi.activeAlerts': 'सक्रिय चेतावनियां',
    'kpi.alertsDesc': 'मौसम विभाग और राज्य आपदा प्राधिकरण के नोटिस',
    'kpi.verifiedShelters': 'सत्यापित आश्रय स्थल',
    'kpi.sheltersDesc': 'नामित सरकारी राहत एवं चिकित्सा शिविर',
    'kpi.riverStations': 'नदी जलस्तर स्टेशन',
    'kpi.stationsDesc': 'ब्रह्मपुत्र और बराक CWC गेज स्टेशन',
    'kpi.registeredSOS': 'दर्ज आपातकालीन SOS',
    'kpi.sosDesc': 'क्षेत्रीय बचाव प्रेषण प्रणाली में पंजीकृत',

    // Sections
    'sec.alertsTitle': 'आधिकारिक आपदा चेतावनियां',
    'sec.alertsSubtitle': 'भारत मौसम विज्ञान विभाग (IMD) और राज्य आपदा प्रबंधन प्राधिकरण द्वारा जारी',
    'sec.viewAllAlerts': 'सभी चेतावनियां देखें',
    'sec.statesTitle': 'पूर्वोत्तर राज्य आपदा प्रबंधन नेटवर्क',
    'sec.statesSubtitle': 'जिले की हेल्पलाइन और स्थानीय आश्रय निर्देशिका देखने के लिए किसी भी राज्य पर क्लिक करें',
    'sec.sheltersCardTitle': 'सत्यापित आश्रय खोजें',
    'sec.sheltersCardDesc': 'राहत शिविरों, क्षमता, वर्तमान उपस्थिति और उपलब्ध चिकित्सा सुविधाओं की जांच करें।',
    'sec.evacuationCardTitle': 'सुरक्षित निकासी मार्गदर्शन',
    'sec.evacuationCardDesc': 'जलमग्न सड़कों और भूस्खलन अवरोधों से बचते हुए सुरक्षित मार्ग की योजना बनाएं।',
    'sec.assistantCardTitle': 'एआई आपातकालीन सहायक',
    'sec.assistantCardDesc': 'एनडीएमए और राज्य आपदा प्राधिकरणों के सत्यापित सुरक्षा नियमों पर आधारित वास्तविक सलाह।',

    // Common
    'action.searchFacilities': 'सुविधाएं खोजें →',
    'action.planEvacuation': 'निकासी योजना →',
    'action.askAssistant': 'सहायक से पूछें →',
    'action.call': 'कॉल करें',
    'action.trackLive': 'लाइव ट्रैक करें →',
    'action.submit': 'सबमिट करें',
    'empty.title': 'वर्तमान में कोई सक्रिय चेतावनी नहीं है',
    'empty.desc': 'सभी आधिकारिक जिला चैनल सामान्य स्थिति रिपोर्ट कर रहे हैं।',
    'status.verified': 'सत्यापित',
    'status.submitted': 'जमा किया गया',
    'status.assigned': 'दल आवंटित',
    'status.inProgress': 'बचाव कार्य प्रगति पर',
    'status.closed': 'समाप्त',
    'warning.notice': 'आधिकारिक सुरक्षा सूचना',
    'warning.disclaimer': 'NE-RESQ एक स्वतंत्र आपदा प्रबंधन और सुरक्षा प्रौद्योगिकी प्रणाली है। सभी चेतावनियां और नदी जल स्तर आधिकारिक एजेंसियों से सत्यापित हैं।',

    // Map Page
    'map.title': 'पूर्वोत्तर भू-स्थानिक आपदा मानचित्र',
    'map.desc': 'ब्रह्मपुत्र और बराक नदी बेसिन, आश्रय स्थल और खतरे वाले क्षेत्रों के सत्यापित निर्देशांक।',
    'map.mode2d': '2D सामरिक मानचित्र',
    'map.mode3d': '3D भूभाग ऊंचाई दृश्य',
    'map.geoFilter': 'भौगोलिक फ़िल्टर',
    'map.dataLayers': 'सत्यापित डेटा परतें',
    'map.allStates': 'सभी 8 पूर्वोत्तर राज्य',
    'map.sheltersLayer': 'नामित राहत शिविर',
    'map.riverGaugesLayer': 'नदी जलस्तर गेज',
    'map.alertsLayer': 'आधिकारिक चेतावनियां',

    // SOS Page
    'sos.title': 'आपातकालीन सहायता (SOS)',
    'sos.badge': 'आधिकारिक बचाव प्रेषण प्रणाली',
    'sos.desc': 'स्वचालित जीपीएस स्थान के साथ तत्काल अलर्ट। सीधे राज्य और जिला आपातकालीन नियंत्रण कक्षों को प्रेषित।',
    'sos.standby': 'तत्काल बचाव समन्वय के लिए तैयार रहें',
    'sos.step1': '1. आपातकालीन घटना श्रेणी चुनें *',
    'sos.step2': '2. स्थान और जीपीएस निर्देशांक *',
    'sos.name': 'आपका पूरा नाम (नागरिक) *',
    'sos.phone': 'सक्रिय संपर्क फोन नंबर *',
    'sos.address': 'सटीक पता, गांव या स्थान का विवरण *',
    'sos.affected': 'फंसे हुए नागरिकों की संख्या:',
    'sos.medical': 'तत्काल चिकित्सा आपात स्थिति / गंभीर रोगी उपस्थित',
    'sos.accessibility': 'दिव्यांग / सीमित गतिशीलता वाले व्यक्ति',
    'sos.submit': 'पुष्टि करें और SOS सबमिट करें',
    'sos.offline': 'सिंक बाकी है — अभी तक नहीं पहुंचा। नेटवर्क आते ही स्वचालित रूप से भेजा जाएगा।'
  },

  brx: {
    'topbar.notice': 'सा-सान्जा आफाद रैखाथि नेटवार्क — 8 राइजोआव थाखाय सावस्रायनाय',
    'topbar.helplines': 'राइजोनि खन्थ्रल रूम: 1070 | हादोरारि: 112',
    'nav.home': 'न’',
    'nav.liveMap': 'लाइभ नक्शा',
    'nav.alerts': 'सांग्रांथि',
    'nav.monitoring': 'दै बाना नयन',
    'nav.shelters': 'आশ্রय खाम्प',
    'nav.evacuation': 'रैखा लामा',
    'nav.reports': 'सुबुं फोरमायनाय',
    'nav.aiSafety': 'एआई रैखाथि',
    'nav.preparedness': 'सिगां थियारि',
    'nav.about': 'आथिखाल',
    'nav.portals': 'पर्टेलफोर',
    'nav.sosDispatch': 'गोख्रों SOS',
    'hero.badge': 'सा-सान्जा हादोरसा आफाद प्रबन्धन आरो उदां खालामनाय',
    'hero.tagline1': 'मोनसे ओनसोल। मोनसे नेटवार्क।',
    'hero.tagline2': 'मोनसे थांखि — जिउ रैखा।',
    'hero.desc': 'ब्रह्मपुत्र आरो बराक दैमा, रैखाथि आश्रय, आरो गासै 8 सा-सान्जा राइजोफोरनि गोख्रों रैखाथि थाखाय।',
    'hero.sosButton': 'गोख्रों SOS थिनहर',
    'hero.explore3D': '3D भुमखौ नयन खालाम',
    'hero.stateSector': '8 सा-सान्जा राइजोफोर'
  },

  kha: {
    'topbar.notice': 'Northeast Emergency Network — 8 tylli ki Jylla kiba don ha ka jingpeitngor',
    'topbar.helplines': 'SEOC Toll Free: 1070 | National: 112',
    'nav.home': 'Shnong',
    'nav.liveMap': 'Ka Map',
    'nav.alerts': 'Ki Jingmaham',
    'nav.monitoring': 'Pule Um',
    'nav.shelters': 'Ki Jakashong',
    'nav.evacuation': 'Luti Jingpynlait',
    'nav.reports': 'Kaiphod Shnong',
    'nav.aiSafety': 'AI Yarap',
    'nav.preparedness': 'Ka Jingkhreh',
    'nav.about': 'Shaphang',
    'nav.portals': 'Portals',
    'nav.sosDispatch': 'SOS Kynsan',
    'hero.badge': 'Northeast Disaster Intelligence & Rescue Network',
    'hero.tagline1': 'Kawei ka Ri-thaw. Kawei ka Network.',
    'hero.tagline2': 'Kawei ka Jingthmu — Pynim Jingim.',
    'hero.desc': 'Ka jingsumar ia ka jingshlei um, ki jakashong kiba shngain bad ka jingpyllait im ha baroh 8 tylli ki Jylla Northeast.',
    'hero.sosButton': 'Phah SOS Kynsan',
    'hero.explore3D': 'Peit 3D Topography',
    'hero.stateSector': '8 Tylli ki Jylla'
  },

  grt: {
    'topbar.notice': 'Northeast Emergency Network — Salgro-Salgipeng A·dokrang',
    'topbar.helplines': 'SEOC Helpline: 1070 | National: 112',
    'nav.home': 'Nok',
    'nav.liveMap': 'Live Map',
    'nav.alerts': 'Mikrakatgimin',
    'nav.monitoring': 'Chi Nambatgimin',
    'nav.shelters': 'Katnapram',
    'nav.evacuation': 'Gakatani Rama',
    'nav.reports': 'Manderangni Report',
    'nav.aiSafety': 'AI Dakchakang',
    'nav.preparedness': 'Tarisoani',
    'nav.about': 'Gimin',
    'nav.portals': 'Portals',
    'nav.sosDispatch': 'Jokani SOS',
    'hero.badge': 'Northeast A·dokni Disaster Rescue Network',
    'hero.tagline1': 'Ge·sa A·bachengani. Ge·sa Network.',
    'hero.tagline2': 'Ge·sa Kam — Janggi Jokani.',
    'hero.desc': 'Chi banani, a·gualani aro emergency rescue management salgro-salgipeng a·dokrangna.',
    'hero.sosButton': 'SOS Watatbo',
    'hero.explore3D': '3D Mapko Nibo',
    'hero.stateSector': '8 A·dokrang'
  },

  mni: {
    'topbar.notice': 'অৱাং-নোংপোক লমদমগী খুদোংথীবা ঙাকথোকপা নেটৱার্ক — রাজ্য ৮',
    'topbar.helplines': 'স্টেট কন্ত্রোল রুম: ১০৭০ | নেস্নেল: ১১২',
    'nav.home': 'য়ুম',
    'nav.liveMap': 'লাইভ মেপ',
    'nav.alerts': 'চেকশিনৱা',
    'nav.monitoring': 'ঈশিংগী মায়োল',
    'nav.shelters': 'কনফম লৈফম',
    'nav.evacuation': 'নান্থোকফম লাম্বি',
    'nav.reports': 'মীয়ামগী পাউ',
    'nav.aiSafety': 'এআই মতেংপাংবা',
    'nav.preparedness': 'শেম-শাবা',
    'nav.about': 'মরমদা',
    'nav.portals': 'পোর্তেলশিং',
    'nav.sosDispatch': 'অকুপ্পা SOS',
    'hero.badge': 'অৱাং-নোংপোক ভারত খুদোংথীবা ঙাকথোকপা অমসুং কন্নবা ব্যৱস্থা',
    'hero.tagline1': 'লমদম অমা। নেটৱার্ক অমা।',
    'hero.tagline2': 'পান্দম অমা — পুন্সি কনবা।',
    'hero.desc': 'ঈশিং ইচাও, চীংশিৎ তুকপা ঙাকথোকপা অমসুং রাজ্য ৮ গুম্না খুদোংথীবা মতমদা কনবা প্লেতফোর্ম।',
    'hero.sosButton': 'মতম চানা SOS থাবা',
    'hero.explore3D': '৩ডি লৈবাক মশক য়েংবা',
    'hero.stateSector': 'রাজ্য ৮ সক্ৰিয়'
  },

  lus: {
    'topbar.notice': 'Chhim-Chhak Emergency Network — State 8-ah Disaster Surveillance kalpui mek a ni',
    'topbar.helplines': 'SEOC Toll Free: 1070 | National: 112',
    'nav.home': 'Inpui',
    'nav.liveMap': 'Live Map',
    'nav.alerts': 'Hriattirna',
    'nav.monitoring': 'Tui San Lam',
    'nav.shelters': 'Bihrukna Hmun',
    'nav.evacuation': 'Tlan Chhuahna Kawng',
    'nav.reports': 'Mipui Report',
    'nav.aiSafety': 'AI Puihna',
    'nav.preparedness': 'Inbuatsaihna',
    'nav.about': 'Chanchin',
    'nav.portals': 'Portals',
    'nav.sosDispatch': 'SOS Chhanhimna',
    'hero.badge': 'Northeast Disaster Intelligence & Rescue Network',
    'hero.tagline1': 'Hmun Khatah. Network Pakhatah.',
    'hero.tagline2': 'Tum Khatah — Nun Chhanhim.',
    'hero.desc': 'Tui lian, leimin leh chhiatrupna laka nunna chhanhim tura Northeast state 8 huap tura buatsaih.',
    'hero.sosButton': 'Hmanhmawh SOS Thawn Rawh',
    'hero.explore3D': '3D Tlang leh Ram Hmelhmang',
    'hero.stateSector': 'State 8 Enkawlna'
  },

  ne: {
    'topbar.notice': 'पूर्वोत्तर आपतकालीन प्रतिक्रिया नेटवर्क — ८ राज्यहरूमा सक्रिय विपद् निगरानी',
    'topbar.helplines': 'राज्य नियन्त्रण कक्ष: १०७० | राष्ट्रिय आपतकाल: ११२',
    'nav.home': 'गृह पृष्ठ',
    'nav.liveMap': 'प्रत्यक्ष नक्सा',
    'nav.alerts': 'चेतावनीहरू',
    'nav.monitoring': 'जलस्तर निगरानी',
    'nav.shelters': 'राहत शिविर',
    'nav.evacuation': 'निकासी मार्ग',
    'nav.reports': 'सामुदायिक प्रतिवेदन',
    'nav.aiSafety': 'एआई सुरक्षा सहयोगी',
    'nav.preparedness': 'विपद् पूर्वतयारी',
    'nav.about': 'हाम्रो बारेमा',
    'nav.portals': 'पोर्टलहरू',
    'nav.sosDispatch': 'आपतकालीन SOS',
    'hero.badge': 'पूर्वोत्तर भारत विपद् व्यवस्थापन र उद्धार नेटवर्क',
    'hero.tagline1': 'एक क्षेत्र। एक सञ्जाल।',
    'hero.tagline2': 'एक लक्ष्य — जीवन रक्षा।',
    'hero.desc': 'बाढी र पहिरो निगरानी, प्रमाणित राहत शिविर र सबै ८ पूर्वोत्तर राज्यहरूका लागि आपतकालीन उद्धार व्यवस्थापन प्लेटफर्म।',
    'hero.sosButton': 'आपतकालीन SOS पठाउनुहोस्',
    'hero.explore3D': 'अन्तर्क्रियात्मक ३डी भौगोलिक दृश्य',
    'hero.stateSector': '८ राज्यहरू सक्रिय'
  }
};

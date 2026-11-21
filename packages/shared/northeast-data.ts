import { StateInfo, DistrictInfo, StateCode } from '../types';

export const NORTHEAST_STATES: StateInfo[] = [
  {
    id: 'as-01',
    code: 'AS',
    name: 'Assam',
    capital: 'Dispur (Guwahati)',
    eocHelpline: '1070 / 1079 (Toll Free ASDMA)',
    sdmaWebsite: 'https://asdma.assam.gov.in',
    latitude: 26.2006,
    longitude: 92.9376,
    districtsCount: 35
  },
  {
    id: 'ar-02',
    code: 'AR',
    name: 'Arunachal Pradesh',
    capital: 'Itanagar',
    eocHelpline: '1070 (Toll Free APSDMA)',
    sdmaWebsite: 'http://dmr.arunachal.gov.in',
    latitude: 28.2180,
    longitude: 94.7278,
    districtsCount: 26
  },
  {
    id: 'ml-03',
    code: 'ML',
    name: 'Meghalaya',
    capital: 'Shillong',
    eocHelpline: '1070 (Toll Free MSDMA)',
    sdmaWebsite: 'https://msdma.gov.in',
    latitude: 25.4670,
    longitude: 91.3662,
    districtsCount: 12
  },
  {
    id: 'mn-04',
    code: 'MN',
    name: 'Manipur',
    capital: 'Imphal',
    eocHelpline: '1070 / 0385-2443441',
    sdmaWebsite: 'https://reliefmanipur.nic.in',
    latitude: 24.6637,
    longitude: 93.9063,
    districtsCount: 16
  },
  {
    id: 'mz-05',
    code: 'MZ',
    name: 'Mizoram',
    capital: 'Aizawl',
    eocHelpline: '1070 / 0389-2342520',
    sdmaWebsite: 'https://dmr.mizoram.gov.in',
    latitude: 23.1645,
    longitude: 92.9376,
    districtsCount: 11
  },
  {
    id: 'nl-06',
    code: 'NL',
    name: 'Nagaland',
    capital: 'Kohima',
    eocHelpline: '1070 (Toll Free NSDMA)',
    sdmaWebsite: 'https://nsdma.nagaland.gov.in',
    latitude: 26.1584,
    longitude: 94.5624,
    districtsCount: 16
  },
  {
    id: 'tr-07',
    code: 'TR',
    name: 'Tripura',
    capital: 'Agartala',
    eocHelpline: '1070 (Toll Free TDMA)',
    sdmaWebsite: 'https://revenue.tripura.gov.in',
    latitude: 23.9408,
    longitude: 91.9882,
    districtsCount: 8
  },
  {
    id: 'sk-08',
    code: 'SK',
    name: 'Sikkim',
    capital: 'Gangtok',
    eocHelpline: '1070 / 1077 (Toll Free SSDMA)',
    sdmaWebsite: 'https://ssdma.nic.in',
    latitude: 27.5330,
    longitude: 88.5122,
    districtsCount: 6
  }
];

export const NORTHEAST_DISTRICTS: DistrictInfo[] = [
  // ASSAM (35 districts)
  { id: 'as-kamrup-m', stateCode: 'AS', stateName: 'Assam', name: 'Kamrup Metropolitan', headquarters: 'Guwahati', deocHelpline: '1077 / 0361-2733052', latitude: 26.1445, longitude: 91.7362, vulnerabilityLevel: 'HIGH' },
  { id: 'as-kamrup-r', stateCode: 'AS', stateName: 'Assam', name: 'Kamrup Rural', headquarters: 'Amingaon', deocHelpline: '1077', latitude: 26.2167, longitude: 91.6833, vulnerabilityLevel: 'HIGH' },
  { id: 'as-dibrugarh', stateCode: 'AS', stateName: 'Assam', name: 'Dibrugarh', headquarters: 'Dibrugarh', deocHelpline: '1077 / 0373-2312940', latitude: 27.4728, longitude: 94.9120, vulnerabilityLevel: 'CRITICAL' },
  { id: 'as-cachar', stateCode: 'AS', stateName: 'Assam', name: 'Cachar', headquarters: 'Silchar', deocHelpline: '1077 / 03842-245837', latitude: 24.8333, longitude: 92.7789, vulnerabilityLevel: 'CRITICAL' },
  { id: 'as-sonitpur', stateCode: 'AS', stateName: 'Assam', name: 'Sonitpur', headquarters: 'Tezpur', deocHelpline: '1077', latitude: 26.6338, longitude: 92.7926, vulnerabilityLevel: 'HIGH' },
  { id: 'as-jorhat', stateCode: 'AS', stateName: 'Assam', name: 'Jorhat', headquarters: 'Jorhat', deocHelpline: '1077', latitude: 26.7509, longitude: 94.2037, vulnerabilityLevel: 'HIGH' },
  { id: 'as-nagaon', stateCode: 'AS', stateName: 'Assam', name: 'Nagaon', headquarters: 'Nagaon', deocHelpline: '1077', latitude: 26.3466, longitude: 92.6840, vulnerabilityLevel: 'CRITICAL' },
  { id: 'as-barpeta', stateCode: 'AS', stateName: 'Assam', name: 'Barpeta', headquarters: 'Barpeta', deocHelpline: '1077', latitude: 26.3213, longitude: 91.0044, vulnerabilityLevel: 'CRITICAL' },
  { id: 'as-dhubri', stateCode: 'AS', stateName: 'Assam', name: 'Dhubri', headquarters: 'Dhubri', deocHelpline: '1077', latitude: 26.0207, longitude: 89.9742, vulnerabilityLevel: 'CRITICAL' },
  { id: 'as-tinsukia', stateCode: 'AS', stateName: 'Assam', name: 'Tinsukia', headquarters: 'Tinsukia', deocHelpline: '1077', latitude: 27.4922, longitude: 95.3468, vulnerabilityLevel: 'HIGH' },
  { id: 'as-golaghat', stateCode: 'AS', stateName: 'Assam', name: 'Golaghat', headquarters: 'Golaghat', deocHelpline: '1077', latitude: 26.5170, longitude: 93.9660, vulnerabilityLevel: 'HIGH' },
  { id: 'as-sivasagar', stateCode: 'AS', stateName: 'Assam', name: 'Sivasagar', headquarters: 'Sivasagar', deocHelpline: '1077', latitude: 26.9826, longitude: 94.6425, vulnerabilityLevel: 'HIGH' },
  { id: 'as-lakhimpur', stateCode: 'AS', stateName: 'Assam', name: 'Lakhimpur', headquarters: 'North Lakhimpur', deocHelpline: '1077', latitude: 27.2356, longitude: 94.1037, vulnerabilityLevel: 'CRITICAL' },
  { id: 'as-dhemaji', stateCode: 'AS', stateName: 'Assam', name: 'Dhemaji', headquarters: 'Dhemaji', deocHelpline: '1077', latitude: 27.4815, longitude: 94.5772, vulnerabilityLevel: 'CRITICAL' },
  { id: 'as-morigaon', stateCode: 'AS', stateName: 'Assam', name: 'Morigaon', headquarters: 'Morigaon', deocHelpline: '1077', latitude: 26.2570, longitude: 92.3420, vulnerabilityLevel: 'CRITICAL' },
  { id: 'as-goalpara', stateCode: 'AS', stateName: 'Assam', name: 'Goalpara', headquarters: 'Goalpara', deocHelpline: '1077', latitude: 26.1770, longitude: 90.6234, vulnerabilityLevel: 'HIGH' },
  { id: 'as-bongaigaon', stateCode: 'AS', stateName: 'Assam', name: 'Bongaigaon', headquarters: 'Bongaigaon', deocHelpline: '1077', latitude: 26.4789, longitude: 90.5594, vulnerabilityLevel: 'HIGH' },
  { id: 'as-nalbari', stateCode: 'AS', stateName: 'Assam', name: 'Nalbari', headquarters: 'Nalbari', deocHelpline: '1077', latitude: 26.4447, longitude: 91.4428, vulnerabilityLevel: 'HIGH' },
  { id: 'as-dima-hasao', stateCode: 'AS', stateName: 'Assam', name: 'Dima Hasao', headquarters: 'Haflong', deocHelpline: '1077', latitude: 25.1764, longitude: 93.0238, vulnerabilityLevel: 'CRITICAL' }, // Severe landslides
  { id: 'as-karbi-anglong', stateCode: 'AS', stateName: 'Assam', name: 'Karbi Anglong', headquarters: 'Diphu', deocHelpline: '1077', latitude: 25.8436, longitude: 93.4326, vulnerabilityLevel: 'HIGH' },
  { id: 'as-west-karbi', stateCode: 'AS', stateName: 'Assam', name: 'West Karbi Anglong', headquarters: 'Hamren', deocHelpline: '1077', latitude: 25.8667, longitude: 92.5667, vulnerabilityLevel: 'MODERATE' },
  { id: 'as-karimganj', stateCode: 'AS', stateName: 'Assam', name: 'Karimganj', headquarters: 'Karimganj', deocHelpline: '1077', latitude: 24.8690, longitude: 92.3590, vulnerabilityLevel: 'CRITICAL' },
  { id: 'as-hailakandi', stateCode: 'AS', stateName: 'Assam', name: 'Hailakandi', headquarters: 'Hailakandi', deocHelpline: '1077', latitude: 24.6833, longitude: 92.5667, vulnerabilityLevel: 'HIGH' },
  { id: 'as-kokrajhar', stateCode: 'AS', stateName: 'Assam', name: 'Kokrajhar', headquarters: 'Kokrajhar', deocHelpline: '1077', latitude: 26.4014, longitude: 90.2714, vulnerabilityLevel: 'HIGH' },
  { id: 'as-chirang', stateCode: 'AS', stateName: 'Assam', name: 'Chirang', headquarters: 'Kajalgaon', deocHelpline: '1077', latitude: 26.5400, longitude: 90.5800, vulnerabilityLevel: 'HIGH' },
  { id: 'as-baksa', stateCode: 'AS', stateName: 'Assam', name: 'Baksa', headquarters: 'Mushalpur', deocHelpline: '1077', latitude: 26.6500, longitude: 91.3500, vulnerabilityLevel: 'HIGH' },
  { id: 'as-udalguri', stateCode: 'AS', stateName: 'Assam', name: 'Udalguri', headquarters: 'Udalguri', deocHelpline: '1077', latitude: 26.7458, longitude: 92.0964, vulnerabilityLevel: 'HIGH' },
  { id: 'as-biswanath', stateCode: 'AS', stateName: 'Assam', name: 'Biswanath', headquarters: 'Biswanath Chariali', deocHelpline: '1077', latitude: 26.7333, longitude: 93.1500, vulnerabilityLevel: 'HIGH' },
  { id: 'as-charaideo', stateCode: 'AS', stateName: 'Assam', name: 'Charaideo', headquarters: 'Sonari', deocHelpline: '1077', latitude: 26.9744, longitude: 95.0289, vulnerabilityLevel: 'MODERATE' },
  { id: 'as-hojai', stateCode: 'AS', stateName: 'Assam', name: 'Hojai', headquarters: 'Sankardev Nagar', deocHelpline: '1077', latitude: 26.0000, longitude: 92.8667, vulnerabilityLevel: 'HIGH' },
  { id: 'as-south-salmara', stateCode: 'AS', stateName: 'Assam', name: 'South Salmara-Mankachar', headquarters: 'Hatsingimari', deocHelpline: '1077', latitude: 25.6833, longitude: 89.8833, vulnerabilityLevel: 'CRITICAL' },
  { id: 'as-majuli', stateCode: 'AS', stateName: 'Assam', name: 'Majuli', headquarters: 'Garamur', deocHelpline: '1077', latitude: 26.9500, longitude: 94.2167, vulnerabilityLevel: 'CRITICAL' }, // River island severe erosion
  { id: 'as-bajali', stateCode: 'AS', stateName: 'Assam', name: 'Bajali', headquarters: 'Pathsala', deocHelpline: '1077', latitude: 26.5000, longitude: 91.1833, vulnerabilityLevel: 'HIGH' },
  { id: 'as-tamulpur', stateCode: 'AS', stateName: 'Assam', name: 'Tamulpur', headquarters: 'Tamulpur', deocHelpline: '1077', latitude: 26.6333, longitude: 91.5667, vulnerabilityLevel: 'HIGH' },

  // ARUNACHAL PRADESH (Selected Core Districts)
  { id: 'ar-papum-pare', stateCode: 'AR', stateName: 'Arunachal Pradesh', name: 'Papum Pare', headquarters: 'Yupia / Itanagar', deocHelpline: '1077 / 0360-2212233', latitude: 27.1000, longitude: 93.6167, vulnerabilityLevel: 'HIGH' },
  { id: 'ar-west-kameng', stateCode: 'AR', stateName: 'Arunachal Pradesh', name: 'West Kameng', headquarters: 'Bomdila', deocHelpline: '1077', latitude: 27.2644, longitude: 92.4208, vulnerabilityLevel: 'CRITICAL' },
  { id: 'ar-tawang', stateCode: 'AR', stateName: 'Arunachal Pradesh', name: 'Tawang', headquarters: 'Tawang', deocHelpline: '1077', latitude: 27.5861, longitude: 91.8594, vulnerabilityLevel: 'CRITICAL' },
  { id: 'ar-east-siang', stateCode: 'AR', stateName: 'Arunachal Pradesh', name: 'East Siang', headquarters: 'Pasighat', deocHelpline: '1077', latitude: 28.0667, longitude: 95.3333, vulnerabilityLevel: 'CRITICAL' },
  { id: 'ar-changlang', stateCode: 'AR', stateName: 'Arunachal Pradesh', name: 'Changlang', headquarters: 'Changlang', deocHelpline: '1077', latitude: 27.1264, longitude: 95.7383, vulnerabilityLevel: 'HIGH' },
  { id: 'ar-lohit', stateCode: 'AR', stateName: 'Arunachal Pradesh', name: 'Lohit', headquarters: 'Tezu', deocHelpline: '1077', latitude: 27.9167, longitude: 96.1667, vulnerabilityLevel: 'HIGH' },

  // MEGHALAYA (12 districts)
  { id: 'ml-east-khasi', stateCode: 'ML', stateName: 'Meghalaya', name: 'East Khasi Hills', headquarters: 'Shillong', deocHelpline: '1077 / 0364-2225289', latitude: 25.5788, longitude: 91.8933, vulnerabilityLevel: 'CRITICAL' }, // Cherrapunji/Mawsynram heavy rainfall
  { id: 'ml-west-garo', stateCode: 'ML', stateName: 'Meghalaya', name: 'West Garo Hills', headquarters: 'Tura', deocHelpline: '1077', latitude: 25.5138, longitude: 90.2201, vulnerabilityLevel: 'HIGH' },
  { id: 'ml-ri-bhoi', stateCode: 'ML', stateName: 'Meghalaya', name: 'Ri-Bhoi', headquarters: 'Nongpoh', deocHelpline: '1077', latitude: 25.9036, longitude: 91.8804, vulnerabilityLevel: 'HIGH' },
  { id: 'ml-west-jaintia', stateCode: 'ML', stateName: 'Meghalaya', name: 'West Jaintia Hills', headquarters: 'Jowai', deocHelpline: '1077', latitude: 25.4500, longitude: 92.2000, vulnerabilityLevel: 'HIGH' },

  // MANIPUR (16 districts)
  { id: 'mn-imphal-west', stateCode: 'MN', stateName: 'Manipur', name: 'Imphal West', headquarters: 'Lamphelpat', deocHelpline: '1077 / 0385-2414664', latitude: 24.8170, longitude: 93.9368, vulnerabilityLevel: 'CRITICAL' },
  { id: 'mn-imphal-east', stateCode: 'MN', stateName: 'Manipur', name: 'Imphal East', headquarters: 'Porompat', deocHelpline: '1077', latitude: 24.8000, longitude: 93.9667, vulnerabilityLevel: 'CRITICAL' },
  { id: 'mn-churachandpur', stateCode: 'MN', stateName: 'Manipur', name: 'Churachandpur', headquarters: 'Churachandpur', deocHelpline: '1077', latitude: 24.3333, longitude: 93.6667, vulnerabilityLevel: 'HIGH' },
  { id: 'mn-senapati', stateCode: 'MN', stateName: 'Manipur', name: 'Senapati', headquarters: 'Senapati', deocHelpline: '1077', latitude: 25.2667, longitude: 94.0167, vulnerabilityLevel: 'HIGH' },

  // MIZORAM (11 districts)
  { id: 'mz-aizawl', stateCode: 'MZ', stateName: 'Mizoram', name: 'Aizawl', headquarters: 'Aizawl', deocHelpline: '1077 / 0389-2325372', latitude: 23.7271, longitude: 92.7176, vulnerabilityLevel: 'CRITICAL' },
  { id: 'mz-lunglei', stateCode: 'MZ', stateName: 'Mizoram', name: 'Lunglei', headquarters: 'Lunglei', deocHelpline: '1077', latitude: 22.8833, longitude: 92.7333, vulnerabilityLevel: 'HIGH' },
  { id: 'mz-champhai', stateCode: 'MZ', stateName: 'Mizoram', name: 'Champhai', headquarters: 'Champhai', deocHelpline: '1077', latitude: 23.4757, longitude: 93.3283, vulnerabilityLevel: 'HIGH' },

  // NAGALAND (16 districts)
  { id: 'nl-kohima', stateCode: 'NL', stateName: 'Nagaland', name: 'Kohima', headquarters: 'Kohima', deocHelpline: '1077 / 0370-2290028', latitude: 25.6751, longitude: 94.1086, vulnerabilityLevel: 'HIGH' },
  { id: 'nl-dimapur', stateCode: 'NL', stateName: 'Nagaland', name: 'Dimapur', headquarters: 'Dimapur', deocHelpline: '1077', latitude: 25.9060, longitude: 93.7270, vulnerabilityLevel: 'HIGH' },
  { id: 'nl-mokokchung', stateCode: 'NL', stateName: 'Nagaland', name: 'Mokokchung', headquarters: 'Mokokchung', deocHelpline: '1077', latitude: 26.3250, longitude: 94.5200, vulnerabilityLevel: 'MODERATE' },

  // TRIPURA (8 districts)
  { id: 'tr-west-tripura', stateCode: 'TR', stateName: 'Tripura', name: 'West Tripura', headquarters: 'Agartala', deocHelpline: '1077 / 0381-2323742', latitude: 23.8315, longitude: 91.2868, vulnerabilityLevel: 'CRITICAL' },
  { id: 'tr-south-tripura', stateCode: 'TR', stateName: 'Tripura', name: 'South Tripura', headquarters: 'Belonia', deocHelpline: '1077', latitude: 23.2500, longitude: 91.4500, vulnerabilityLevel: 'HIGH' },
  { id: 'tr-gomati', stateCode: 'TR', stateName: 'Tripura', name: 'Gomati', headquarters: 'Udaipur', deocHelpline: '1077', latitude: 23.5333, longitude: 91.4833, vulnerabilityLevel: 'HIGH' },

  // SIKKIM (6 districts)
  { id: 'sk-gangtok', stateCode: 'SK', stateName: 'Sikkim', name: 'Gangtok', headquarters: 'Gangtok', deocHelpline: '1077 / 03592-202664', latitude: 27.3389, longitude: 88.6065, vulnerabilityLevel: 'CRITICAL' },
  { id: 'sk-mangan', stateCode: 'SK', stateName: 'Sikkim', name: 'Mangan', headquarters: 'Mangan', deocHelpline: '1077', latitude: 27.5000, longitude: 88.5333, vulnerabilityLevel: 'CRITICAL' }, // Severe GLOF vulnerability
  { id: 'sk-namchi', stateCode: 'SK', stateName: 'Sikkim', name: 'Namchi', headquarters: 'Namchi', deocHelpline: '1077', latitude: 27.1667, longitude: 88.3500, vulnerabilityLevel: 'HIGH' }
];

export const OFFICIAL_EXTERNAL_PROVIDERS = [
  {
    providerName: 'IMD_WEATHER',
    displayName: 'India Meteorological Department (IMD)',
    organization: 'Ministry of Earth Sciences, Govt. of India',
    apiEndpoint: 'https://mausam.imd.gov.in/api',
    authType: 'API_KEY',
    documentationUrl: 'https://internal.imd.gov.in/section/nhac/dynamic/FAQ_RMC_Guwahati.pdf',
    instructions: 'Requires IMD Regional Meteorological Centre (RMC) Guwahati registered API credentials. Add IMD_API_KEY in .env.',
    statusMessage: 'Service not connected — configuration required.'
  },
  {
    providerName: 'NDMA_SACHET',
    displayName: 'NDMA SACHET National Early Warning Platform',
    organization: 'National Disaster Management Authority',
    apiEndpoint: 'https://sachet.ndma.gov.in/cap_public/v1',
    authType: 'OAUTH2 / CAP_TOKEN',
    documentationUrl: 'https://sachet.ndma.gov.in',
    instructions: 'Common Alerting Protocol (CAP) integration requires official SDMA/NDMA authorization token in NDMA_SACHET_TOKEN.',
    statusMessage: 'Service not connected — configuration required.'
  },
  {
    providerName: 'CWC_RIVER',
    displayName: 'Central Water Commission (CWC) Flood Forecast',
    organization: 'Ministry of Jal Shakti, Govt. of India',
    apiEndpoint: 'https://ffs.india-water.gov.in/api',
    authType: 'API_KEY',
    documentationUrl: 'https://cwc.gov.in/monitoring-brahmaputra-barak',
    instructions: 'Provides live Brahmaputra & Barak water levels and hydrographs. Configure CWC_API_KEY in .env.',
    statusMessage: 'Service not connected — configuration required.'
  },
  {
    providerName: 'ISRO_BHUVAN',
    displayName: 'ISRO / NRSC Disaster Management Support (Bhuvan)',
    organization: 'National Remote Sensing Centre (NRSC) / ISRO',
    apiEndpoint: 'https://bhuvan-app1.nrsc.gov.in/api/flood',
    authType: 'ENTERPRISE_GIS',
    documentationUrl: 'https://bhuvan-dms.nrsc.gov.in',
    instructions: 'Near-real-time satellite inundation layers require authorized NRSC Bhuvan WMS/WFS credentials.',
    statusMessage: 'Service not connected — configuration required.'
  }
];

export const OFFICIAL_EMERGENCY_HELPLINES = [
  { agency: 'National Emergency Response (All Emergencies)', number: '112', coverage: 'National / All 8 NE States' },
  { agency: 'State Emergency Operation Centre (SEOC Assam)', number: '1070 / 1079', coverage: 'Assam' },
  { agency: 'District Emergency Operation Centre (DEOC)', number: '1077', coverage: 'All Districts' },
  { agency: 'NDRF 1st Battalion Control Room (Guwahati)', number: '0361-2849005 / 9435117246', coverage: 'Assam, Meghalaya, Tripura, Mizoram' },
  { agency: 'NDRF 12th Battalion Control Room (Itanagar)', number: '0360-2284988 / 9436040850', coverage: 'Arunachal Pradesh, Nagaland, Manipur' },
  { agency: 'State Disaster Response Force (SDRF Assam)', number: '0361-2735747', coverage: 'Assam' },
  { agency: 'Ambulance Emergency Helpline', number: '108', coverage: 'Northeast Region' },
  { agency: 'Disaster Health Helpline', number: '104', coverage: 'Northeast Region' },
  { agency: 'Police Emergency Helpline', number: '100', coverage: 'National' },
  { agency: 'Fire Emergency Helpline', number: '101', coverage: 'National' },
  { agency: 'Women Emergency Helpline', number: '1091 / 181', coverage: 'National' },
  { agency: 'Childline Emergency Helpline', number: '1098', coverage: 'National' }
];

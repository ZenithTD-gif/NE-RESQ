import { 
  SOSRequest, 
  OfficialAlert, 
  ShelterInfo, 
  CommunityReport, 
  RiverGaugeInfo,
  ExternalProviderStatus,
  UserRole
} from '@app-types';
import { NORTHEAST_STATES, NORTHEAST_DISTRICTS, OFFICIAL_EXTERNAL_PROVIDERS } from '@shared/northeast-data';

// Persistent in-process database store for NE-RESQ
class DatabaseStore {
  public sosRequests: Map<string, SOSRequest> = new Map();
  public officialAlerts: Map<string, OfficialAlert> = new Map();
  public shelters: Map<string, ShelterInfo> = new Map();
  public communityReports: Map<string, CommunityReport> = new Map();
  public riverGauges: Map<string, RiverGaugeInfo> = new Map();
  public rescueTeams: Map<string, any> = new Map();
  public auditLogs: Array<{ action: string; target: string; actor: string; timestamp: string; details?: any }> = [];
  public providers: Map<string, ExternalProviderStatus> = new Map();

  constructor() {
    this.initProviders();
    this.initRiverGauges();
    this.initRescueTeams();
    this.initSampleVerifiedShelter(); // Initial verified state facility template
  }

  private initProviders() {
    OFFICIAL_EXTERNAL_PROVIDERS.forEach((prov) => {
      this.providers.set(prov.providerName, {
        providerName: prov.providerName,
        displayName: prov.displayName,
        isConnected: false,
        configurationRequired: true,
        statusMessage: 'Service not connected — configuration required.',
        documentationUrl: prov.documentationUrl,
      });
    });
  }

  private initRiverGauges() {
    // Official Central Water Commission (CWC) Monitoring Stations in Brahmaputra, Barak & Teesta Basins
    const gauges: RiverGaugeInfo[] = [
      {
        id: 'cwc-guwahati',
        riverName: 'Brahmaputra',
        stationName: 'Guwahati (DC Court)',
        state: 'Assam',
        district: 'Kamrup Metropolitan',
        warningLevelMeters: 49.68,
        dangerLevelMeters: 50.50,
        currentWaterLevelMeters: undefined, // Real unconfigured state: displayed when live feed or manual observation is submitted
        trend: 'STEADY',
        status: 'NORMAL',
        latitude: 26.1900,
        longitude: 91.7500,
        lastReportedAt: new Date().toISOString(),
        cwcGaugeId: '002-CWC-AS-GHY'
      },
      {
        id: 'cwc-dibrugarh',
        riverName: 'Brahmaputra',
        stationName: 'Dibrugarh Ghat',
        state: 'Assam',
        district: 'Dibrugarh',
        warningLevelMeters: 104.70,
        dangerLevelMeters: 105.70,
        currentWaterLevelMeters: undefined,
        trend: 'STEADY',
        status: 'NORMAL',
        latitude: 27.4800,
        longitude: 94.9000,
        lastReportedAt: new Date().toISOString(),
        cwcGaugeId: '001-CWC-AS-DBR'
      },
      {
        id: 'cwc-silchar',
        riverName: 'Barak',
        stationName: 'Silchar (Annapurna Ghat)',
        state: 'Assam',
        district: 'Cachar',
        warningLevelMeters: 19.83,
        dangerLevelMeters: 20.83,
        currentWaterLevelMeters: undefined,
        trend: 'STEADY',
        status: 'NORMAL',
        latitude: 24.8300,
        longitude: 92.8000,
        lastReportedAt: new Date().toISOString(),
        cwcGaugeId: '010-CWC-AS-SIL'
      },
      {
        id: 'cwc-singtam',
        riverName: 'Teesta',
        stationName: 'Singtam / Dikchu',
        state: 'Sikkim',
        district: 'Gangtok',
        warningLevelMeters: 348.00,
        dangerLevelMeters: 350.00,
        currentWaterLevelMeters: undefined,
        trend: 'STEADY',
        status: 'NORMAL',
        latitude: 27.2300,
        longitude: 88.5000,
        lastReportedAt: new Date().toISOString(),
        cwcGaugeId: '025-CWC-SK-SNG'
      }
    ];

    gauges.forEach(g => this.riverGauges.set(g.id, g));
  }

  private initRescueTeams() {
    // Official Operational Units registered in Northeast India
    const teams = [
      {
        id: 'ndrf-bn-01-alpha',
        name: 'NDRF 1st Bn - Team Alpha',
        agency: 'National Disaster Response Force (NDRF)',
        unitCode: '1-NDRF-GHY',
        baseState: 'Assam',
        baseDistrict: 'Kamrup Rural',
        headquarters: 'Patgaon, Rani, Guwahati',
        leaderName: 'Insp. R. K. Sharma',
        leaderPhone: '0361-2849005',
        status: 'AVAILABLE',
        equipment: ['Inflatable Motor Boats (IRBs)', 'Deep Diving Gear', 'Life Buoys', 'Satellite Comms'],
        personnelCount: 35
      },
      {
        id: 'ndrf-bn-12-bravo',
        name: 'NDRF 12th Bn - Team Bravo',
        agency: 'National Disaster Response Force (NDRF)',
        unitCode: '12-NDRF-ITA',
        baseState: 'Arunachal Pradesh',
        baseDistrict: 'Papum Pare',
        headquarters: 'Doimukh, Itanagar',
        leaderName: 'Insp. T. Wangchu',
        leaderPhone: '0360-2284988',
        status: 'AVAILABLE',
        equipment: ['Mountain Rescue Ropes', 'Hydraulic Cutters', 'Search Cameras', 'Medical Kits'],
        personnelCount: 30
      },
      {
        id: 'sdrf-assam-ch-01',
        name: 'SDRF Assam - Central Division',
        agency: 'State Disaster Response Force (SDRF)',
        unitCode: 'SDRF-AS-01',
        baseState: 'Assam',
        baseDistrict: 'Kamrup Metropolitan',
        headquarters: 'Fire & Emergency HQ, Panbazar',
        leaderName: 'Sub-Officer B. Kalita',
        leaderPhone: '0361-2735747',
        status: 'AVAILABLE',
        equipment: ['Rescue Boats', 'Tree Cutters', 'Life Jackets', 'Portable Generators'],
        personnelCount: 25
      }
    ];

    teams.forEach(t => this.rescueTeams.set(t.id, t));
  }

  private initSampleVerifiedShelter() {
    // Official Designated District Emergency Shelter
    const verifiedShelters: ShelterInfo[] = [
      {
        id: 'sh-ghy-sarusajai',
        name: 'Sarusajai Indoor Stadium Relief Center',
        facilityType: 'GOVERNMENT_SHELTER',
        state: 'Assam',
        district: 'Kamrup Metropolitan',
        address: 'National Highway 37, Sarusajai, Guwahati, Assam 781040',
        latitude: 26.1158,
        longitude: 91.7511,
        contactPerson: 'District Relief Officer (DDMA Kamrup Metro)',
        contactPhone: '0361-2733052 / 1077',
        totalCapacity: 1200,
        currentOccupancy: 0,
        hasMedicalPost: true,
        hasCleanWater: true,
        hasKitchen: true,
        hasSanitation: true,
        isAccessibleDisability: true,
        verificationStatus: 'VERIFIED',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'sh-dbr-polytechnic',
        name: 'Dibrugarh Government Polytechnic Center',
        facilityType: 'RELIEF_CAMP',
        state: 'Assam',
        district: 'Dibrugarh',
        address: 'Lahoal, Dibrugarh, Assam 786010',
        latitude: 27.5100,
        longitude: 94.9800,
        contactPerson: 'DEOC In-Charge Dibrugarh',
        contactPhone: '0373-2312940 / 1077',
        totalCapacity: 600,
        currentOccupancy: 0,
        hasMedicalPost: true,
        hasCleanWater: true,
        hasKitchen: true,
        hasSanitation: true,
        isAccessibleDisability: false,
        verificationStatus: 'VERIFIED',
        lastUpdated: new Date().toISOString()
      }
    ];

    verifiedShelters.forEach(s => this.shelters.set(s.id, s));
  }

  // SOS operations
  public createSOS(data: Omit<SOSRequest, 'id' | 'trackingId' | 'status' | 'createdAt' | 'updatedAt' | 'statusHistory'>): SOSRequest {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const trackingId = `NER-${new Date().getFullYear()}-${randomHex}`;
    const id = `sos_${Date.now()}_${randomHex}`;

    const newRecord: SOSRequest = {
      ...data,
      id,
      trackingId,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'SUBMITTED',
          timestamp: new Date().toISOString(),
          remarks: 'Emergency request registered on NE-RESQ regional dispatch network.',
          updatedBy: 'Citizen'
        }
      ]
    };

    this.sosRequests.set(id, newRecord);
    this.auditLogs.unshift({
      action: 'SOS_CREATED',
      target: trackingId,
      actor: data.citizenName || 'Anonymous',
      timestamp: new Date().toISOString(),
      details: { category: data.category, district: data.district }
    });

    return newRecord;
  }

  public getSOSByTrackingId(trackingId: string): SOSRequest | undefined {
    for (const req of this.sosRequests.values()) {
      if (req.trackingId.toUpperCase() === trackingId.toUpperCase()) {
        return req;
      }
    }
    return undefined;
  }

  public updateSOSStatus(id: string, status: any, remarks: string, updatedBy: string): SOSRequest | null {
    const req = this.sosRequests.get(id);
    if (!req) return null;

    req.status = status;
    req.updatedAt = new Date().toISOString();
    req.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      remarks,
      updatedBy
    });

    this.auditLogs.unshift({
      action: `SOS_STATUS_${status}`,
      target: req.trackingId,
      actor: updatedBy,
      timestamp: new Date().toISOString(),
      details: { remarks }
    });

    return req;
  }

  // Alerts
  public createAlert(alertData: Omit<OfficialAlert, 'id' | 'verificationStatus'>): OfficialAlert {
    const id = `alert_${Date.now()}`;
    const alert: OfficialAlert = {
      ...alertData,
      id,
      verificationStatus: 'OFFICIAL_VERIFIED'
    };
    this.officialAlerts.set(id, alert);
    this.auditLogs.unshift({
      action: 'ALERT_ISSUED',
      target: id,
      actor: alertData.issuingAuthority,
      timestamp: new Date().toISOString(),
      details: { title: alertData.title, severity: alertData.severity }
    });
    return alert;
  }

  // Community Reports
  public createReport(data: Omit<CommunityReport, 'id' | 'reportCode' | 'status' | 'submittedAt'>): CommunityReport {
    const code = `REP-${Date.now().toString(36).toUpperCase()}`;
    const id = `rep_${Date.now()}`;
    const report: CommunityReport = {
      ...data,
      id,
      reportCode: code,
      status: 'UNVERIFIED',
      submittedAt: new Date().toISOString()
    };
    this.communityReports.set(id, report);
    return report;
  }
}

// Global singleton for Next.js hot reload safety
const globalForDb = global as unknown as { neResqDb: DatabaseStore };
export const db = globalForDb.neResqDb || new DatabaseStore();
if (process.env.NODE_ENV !== 'production') globalForDb.neResqDb = db;

export type StateCode = 'AS' | 'AR' | 'ML' | 'MN' | 'MZ' | 'NL' | 'TR' | 'SK';

export type DisasterCategory =
  | 'FLOOD'
  | 'FLASH_FLOOD'
  | 'LANDSLIDE'
  | 'HEAVY_RAINFALL'
  | 'CYCLONE'
  | 'EARTHQUAKE'
  | 'ROAD_BLOCKAGE'
  | 'RIVERBANK_EROSION';

export type AlertSeverity =
  | 'ADVISORY'
  | 'WATCH'
  | 'WARNING'
  | 'SEVERE_WARNING'
  | 'EMERGENCY';

export type SOSCategory =
  | 'FLOOD_RESCUE'
  | 'LANDSLIDE_RESCUE'
  | 'MEDICAL_EMERGENCY'
  | 'MISSING_PERSON'
  | 'FOOD_REQUIREMENT'
  | 'DRINKING_WATER_REQUIREMENT'
  | 'SHELTER_REQUIREMENT'
  | 'STRANDED_PERSON'
  | 'OTHER_EMERGENCY';

export type SOSStatus =
  | 'SUBMITTED'
  | 'AWAITING_VERIFICATION'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'ACCEPTED_BY_TEAM'
  | 'RESCUE_IN_PROGRESS'
  | 'ASSISTANCE_PROVIDED'
  | 'CLOSED'
  | 'CANCELLED';

export type PriorityLevel = 'MEDIUM' | 'HIGH' | 'CRITICAL_LIFE_THREATENING';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'NATIONAL_AUTHORITY'
  | 'STATE_ADMIN'
  | 'DISTRICT_ADMIN'
  | 'CONTROL_ROOM_OPERATOR'
  | 'RESCUE_COORDINATOR'
  | 'RESCUE_TEAM_MEMBER'
  | 'SHELTER_MANAGER'
  | 'HEALTHCARE_ADMIN'
  | 'NGO_ADMIN'
  | 'VOLUNTEER'
  | 'REGISTERED_CITIZEN'
  | 'PUBLIC_VISITOR';

export interface StateInfo {
  id: string;
  code: StateCode;
  name: string;
  capital: string;
  eocHelpline: string;
  sdmaWebsite: string;
  latitude: number;
  longitude: number;
  districtsCount: number;
}

export interface DistrictInfo {
  id: string;
  stateCode: StateCode;
  stateName: string;
  name: string;
  headquarters: string;
  deocHelpline: string;
  latitude: number;
  longitude: number;
  vulnerabilityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface OfficialAlert {
  id: string;
  title: string;
  category: DisasterCategory;
  severity: AlertSeverity;
  state: string;
  district: string;
  affectedArea: string;
  issuingAuthority: string; // e.g. "India Meteorological Department (IMD)", "Assam State Disaster Management Authority (ASDMA)"
  issuedAt: string;
  validUntil: string;
  sourceUrl?: string;
  recommendedAction: string;
  verificationStatus: 'OFFICIAL_VERIFIED' | 'PROVISIONAL' | 'EXPIRED';
  isStale?: boolean;
}

export interface SOSRequest {
  id: string;
  trackingId: string;
  citizenName: string;
  contactPhone: string;
  alternatePhone?: string;
  category: SOSCategory;
  state: string;
  district: string;
  locationAddress: string;
  latitude: number;
  longitude: number;
  affectedCount: number;
  childrenCount: number;
  elderlyCount: number;
  hasMedicalEmergency: boolean;
  medicalDetails?: string;
  hasAccessibilityNeeds: boolean;
  accessibilityDetails?: string;
  additionalNotes?: string;
  status: SOSStatus;
  priorityLevel: PriorityLevel;
  assignedTeam?: {
    id: string;
    name: string;
    agency: string;
    leaderPhone: string;
  };
  statusHistory: Array<{
    status: SOSStatus;
    timestamp: string;
    remarks?: string;
    updatedBy?: string;
  }>;
  isOfflineSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShelterInfo {
  id: string;
  name: string;
  facilityType: 'RELIEF_CAMP' | 'GOVERNMENT_SHELTER' | 'SCHOOL_SHELTER' | 'COMMUNITY_HALL';
  state: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  contactPerson: string;
  contactPhone: string;
  totalCapacity: number;
  currentOccupancy: number;
  hasMedicalPost: boolean;
  hasCleanWater: boolean;
  hasKitchen: boolean;
  hasSanitation: boolean;
  isAccessibleDisability: boolean;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'CLOSED';
  lastUpdated: string;
}

export interface CommunityReport {
  id: string;
  reportCode: string;
  reporterName?: string;
  reporterPhone?: string;
  isAnonymous: boolean;
  category: string;
  state: string;
  district: string;
  locationDescription: string;
  latitude: number;
  longitude: number;
  mediaUrl?: string;
  status: 'UNVERIFIED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'RESOLVED';
  submittedAt: string;
}

export interface RiverGaugeInfo {
  id: string;
  riverName: string;
  stationName: string;
  state: string;
  district: string;
  warningLevelMeters: number;
  dangerLevelMeters: number;
  currentWaterLevelMeters?: number;
  trend: 'RISING' | 'FALLING' | 'STEADY';
  status: 'NORMAL' | 'ABOVE_WARNING' | 'ABOVE_DANGER' | 'CRITICAL_HIGH';
  latitude: number;
  longitude: number;
  lastReportedAt: string;
  cwcGaugeId?: string;
}

export interface ExternalProviderStatus {
  providerName: string;
  displayName: string;
  isConnected: boolean;
  configurationRequired: boolean;
  statusMessage: string;
  lastSyncAttempt?: string;
  documentationUrl: string;
}

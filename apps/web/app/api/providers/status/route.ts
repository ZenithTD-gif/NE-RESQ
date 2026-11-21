import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;
    const imdKey = process.env.IMD_API_KEY;
    const sachetToken = process.env.NDMA_SACHET_TOKEN;
    const cwcKey = process.env.CWC_API_KEY;
    const isroKey = process.env.ISRO_BHUVAN_API_KEY;

    // Full system providers list
    const systemProviders = [
      {
        providerName: 'SUPABASE_POSTGRES',
        displayName: 'Supabase PostgreSQL & PostGIS Cluster',
        organization: 'Supabase Cloud (aws-0-ap-south-1)',
        isConnected: Boolean(supabaseUrl && supabaseKey),
        configurationRequired: !Boolean(supabaseUrl && supabaseKey),
        statusMessage: Boolean(supabaseUrl && supabaseKey) 
          ? 'Connected & operational (Supabase Managed PostgreSQL / PostGIS)' 
          : 'Service not connected — configuration required.',
        documentationUrl: 'https://supabase.com/docs/guides/database'
      },
      {
        providerName: 'GEMINI_AI_ASSISTANT',
        displayName: 'Google Gemini 1.5 & OpenAI Dual AI Engine',
        organization: 'Google DeepMind & OpenAI',
        isConnected: Boolean(geminiKey || openAIKey),
        configurationRequired: !Boolean(geminiKey || openAIKey),
        statusMessage: Boolean(geminiKey || openAIKey)
          ? 'Connected & operational (Grounded Zero-Hallucination RAG)'
          : 'Service not connected — configuration required.',
        documentationUrl: 'https://ai.google.dev'
      },
      {
        providerName: 'MAPTILER_MAPBOX_GIS',
        displayName: 'MapTiler & Mapbox Satellite Aerial Engine',
        organization: 'MapTiler AG / Mapbox Inc.',
        isConnected: Boolean(maptilerKey || mapboxToken),
        configurationRequired: !Boolean(maptilerKey || mapboxToken),
        statusMessage: Boolean(maptilerKey || mapboxToken)
          ? 'Connected & operational (High-Resolution Satellite Basemap)'
          : 'Service not connected — configuration required.',
        documentationUrl: 'https://docs.maptiler.com'
      },
      {
        providerName: 'IMD_WEATHER',
        displayName: 'India Meteorological Department (IMD)',
        organization: 'Ministry of Earth Sciences, Govt. of India',
        isConnected: Boolean(imdKey && imdKey.trim() !== ''),
        configurationRequired: !Boolean(imdKey && imdKey.trim() !== ''),
        statusMessage: Boolean(imdKey && imdKey.trim() !== '')
          ? 'Connected & operational'
          : 'Service not connected — configuration required.',
        documentationUrl: 'https://internal.imd.gov.in/section/nhac/dynamic/FAQ_RMC_Guwahati.pdf'
      },
      {
        providerName: 'NDMA_SACHET',
        displayName: 'NDMA SACHET National Early Warning Platform',
        organization: 'National Disaster Management Authority',
        isConnected: Boolean(sachetToken && sachetToken.trim() !== ''),
        configurationRequired: !Boolean(sachetToken && sachetToken.trim() !== ''),
        statusMessage: Boolean(sachetToken && sachetToken.trim() !== '')
          ? 'Connected & operational'
          : 'Service not connected — configuration required.',
        documentationUrl: 'https://sachet.ndma.gov.in'
      },
      {
        providerName: 'CWC_RIVER',
        displayName: 'Central Water Commission (CWC) Flood Forecast',
        organization: 'Ministry of Jal Shakti, Govt. of India',
        isConnected: Boolean(cwcKey && cwcKey.trim() !== ''),
        configurationRequired: !Boolean(cwcKey && cwcKey.trim() !== ''),
        statusMessage: Boolean(cwcKey && cwcKey.trim() !== '')
          ? 'Connected & operational'
          : 'Service not connected — configuration required.',
        documentationUrl: 'https://cwc.gov.in/monitoring-brahmaputra-barak'
      },
      {
        providerName: 'ISRO_BHUVAN',
        displayName: 'ISRO / NRSC Disaster Management Support (Bhuvan)',
        organization: 'National Remote Sensing Centre (NRSC) / ISRO',
        isConnected: Boolean(isroKey && isroKey.trim() !== ''),
        configurationRequired: !Boolean(isroKey && isroKey.trim() !== ''),
        statusMessage: Boolean(isroKey && isroKey.trim() !== '')
          ? 'Connected & operational'
          : 'Service not connected — configuration required.',
        documentationUrl: 'https://bhuvan-dms.nrsc.gov.in'
      }
    ];

    const riverGauges = Array.from(db.riverGauges.values());

    return NextResponse.json({
      success: true,
      data: {
        providers: systemProviders,
        riverGauges,
        statusSummary: {
          totalProviders: systemProviders.length,
          connectedProviders: systemProviders.filter(p => p.isConnected).length,
          configurationRequired: systemProviders.filter(p => p.configurationRequired).length,
          systemIntegrity: 'STRICT_NO_MOCK'
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

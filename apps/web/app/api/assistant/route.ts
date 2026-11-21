import { NextResponse } from 'next/server';

// Grounded Safety Doctrine Base (NDMA & ASDMA Official Guidelines)
const SAFETY_KNOWLEDGE_BASE = [
  {
    category: 'GREETING',
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'nomoshkar', 'khorumjari', 'khublei'],
    answer: 'Hello! I am the NE-RESQ AI Emergency Safety & Preparedness Assistant for Northeast India.\n\nI can help you with:\n1. Immediate disaster survival steps (floods, landslides, earthquakes, storms).\n2. 72-Hour emergency survival kit checklists.\n3. Safe evacuation route guidance and nearest designated relief shelters.\n4. Verified regional emergency helplines across all 8 Northeast states.\n\nHow can I assist you with your safety and preparedness today?',
    citations: ['NE-RESQ Regional Emergency Operations Protocol']
  },
  {
    category: 'IDENTITY',
    keywords: ['who are you', 'what are you', 'what is ne-resq', 'what can you do', 'your purpose', 'about you', 'help me'],
    answer: 'I am NE-RESQ AI, an intelligent disaster preparedness and emergency safety assistant dedicated to the 8 Northeast Indian states (Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, and Sikkim).\n\nMy recommendations are strictly grounded in official guidelines from the National Disaster Management Authority (NDMA), State Disaster Management Authorities (such as ASDMA), Central Water Commission (CWC), and India Meteorological Department (IMD).\n\nFor active life-threatening distress, submit an emergency SOS on the platform or dial National Emergency 112.',
    citations: ['NDMA Disaster Management Framework', 'NE-RESQ Emergency Charter']
  },
  {
    category: 'HELPLINES',
    keywords: ['helpline', 'phone number', 'contact number', 'emergency number', 'call', 'who to call', 'telephone', 'control room', 'police', 'ambulance', 'fire'],
    answer: 'Verified Emergency Helplines across Northeast India:\n• National Emergency Response: 112 (All Emergencies / 24x7)\n• State Emergency Operation Centre (SEOC): 1070\n• District Emergency Operation Centre (DEOC): 1077 (Connects to your local district control desk)\n• Ambulance / Medical Emergency: 108\n• Disaster Health / Telemedicine: 104\n• NDRF 1st Battalion Control Room (Guwahati): 0361-2849005 / 9435117246\n• NDRF 12th Battalion Control Room (Itanagar): 0360-2284988 / 9436040850\n• Fire Emergency: 101 | Police: 100',
    citations: ['Ministry of Home Affairs (MHA) Official Directory', 'NDMA Emergency Directory']
  },
  {
    category: 'FLOOD',
    keywords: ['flood', 'flash flood', 'water rising', 'inundation', 'river surge', 'brahmaputra', 'barak', 'teesta', 'subansiri'],
    answer: 'During a flood or flash flood:\n1. Immediately move to pre-identified highlands, designated flood shelters, or upper floors.\n2. Turn off the main electrical breaker switch and gas cylinder regulator valve before evacuating.\n3. Never walk, swim, or drive through moving water. 15 cm (6 inches) of moving water can sweep a person, and 60 cm can carry away vehicles.\n4. Do not drink tap or flood water; consume only boiled or chemically chlorinated water.\n5. Keep your waterproof 72-hour survival kit and identity papers sealed.\n6. For emergency rescue dispatch, call State EOC (1070) or District EOC (1077).',
    citations: ['NDMA Guidelines on Management of Floods (Section 4.3)', 'ASDMA Community Safety Standard']
  },
  {
    category: 'LANDSLIDE',
    keywords: ['landslide', 'hill', 'mud', 'slope', 'debris', 'rockfall', 'erosion'],
    answer: 'During impending or active landslide conditions:\n1. Watch for sudden cracking in masonry, tilting trees, or sudden muddy streams on hill slopes.\n2. Evacuate immediately perpendicular to the debris flow direction towards stable rock formations.\n3. Stay awake and alert during intense rainfall events exceeding 100mm/24h.\n4. Avoid river valleys and low culverts prone to sudden mud and debris flash surges.\n5. Report slope movement immediately to your local DEOC at 1077 or NDRF at 112.',
    citations: ['NDMA National Landslide Risk Management Strategy', 'Geological Survey of India (GSI) Slope Advisory']
  },
  {
    category: 'EARTHQUAKE',
    keywords: ['earthquake', 'shaking', 'tremor', 'zone v', 'seismic', 'quake'],
    answer: 'In Seismic Zone V (Northeast India):\n1. DROP to your hands and knees.\n2. COVER your head and neck under a sturdy table, desk, or against an interior wall.\n3. HOLD ON until shaking stops completely.\n4. Avoid doorways, exterior walls, and glass facades.\n5. If outdoors, move to an open clearing away from power lines, brick chimneys, and flyovers.\n6. Expect aftershocks; inspect gas and electrical lines before re-entering buildings.',
    citations: ['NDMA Guidelines: Management of Earthquakes (Drop, Cover & Hold)']
  },
  {
    category: 'SURVIVAL_KIT',
    keywords: ['kit', 'bag', 'supplies', 'survival', '72 hour', 'emergency kit', 'essentials', 'food', 'water'],
    answer: 'A standard 72-hour emergency survival bag must contain:\n1. 3 liters of drinking water per person/day (min 9L per person for 3 days).\n2. Non-perishable ready-to-eat dry food (roasted gram, biscuits, nuts, oral rehydration salts).\n3. Waterproof battery or solar torch with spare cells.\n4. High-decibel signaling whistle.\n5. First aid trauma kit and essential 7-day prescription medicines.\n6. Power bank with charging cords in a sealed plastic bag.\n7. Original government photo IDs (Aadhaar, Voter ID) and family documents sealed in plastic.',
    citations: ['NDMA Standard Household Disaster Survival Kit Checklist']
  },
  {
    category: 'STORM_LIGHTNING',
    keywords: ['cyclone', 'storm', 'wind', 'gust', 'thunderstorm', 'lightning', 'norwester', 'bardoisila'],
    answer: 'During severe storms, Norwesters (Bardoisila), and lightning advisories:\n1. Inspect and secure loose roof sheets, tin sheds, and solar panels.\n2. In lightning events, avoid open fields, hilltops, tall trees, and metal fences.\n3. Keep mobile phones, battery lamps, and power banks fully charged.\n4. Disconnect high-voltage household electrical appliances.\n5. If caught outdoors, adopt the lightning squat position with feet together and hands covering ears.',
    citations: ['IMD Cyclone & Severe Weather Preparedness Manual', 'NDMA Lightning Safety Guidelines']
  }
];

const EMERGENCY_DIRECTIVE_SYSTEM_PROMPT = `You are NE-RESQ AI, the official Emergency Safety & Disaster Intelligence Assistant for the 8 Northeast Indian states (Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Sikkim).

YOUR ROLE:
1. GREETINGS & CASUAL INTERACTION: Respond warmly, politely, and helpfully to greetings (e.g. "Hello", "Hi", "Good morning", "How are you"), introduce your capabilities, and invite safety questions.
2. DISASTER & PREPAREDNESS QUESTIONS: Provide clear, structured, actionable advice for floods, landslides, earthquakes, storms, first-aid, evacuation, and emergency survival kits.
3. CITATIONS & HELPLINES: Ground safety guidance in NDMA, ASDMA, CWC, and IMD guidelines. Mention relevant helplines (112, 1070 SEOC, 1077 DEOC, 108 Ambulance, 0361-2849005 NDRF) when appropriate.
4. ZERO HALLUCINATION FOR REAL-TIME TELEMETRY: If asked for current minute-by-minute unverified water levels or casualties that require live sensor data, clearly advise the user to consult the local DEOC (1077) or the platform's Live Monitoring section.
5. FORMAT: Keep answers concise, calm, authoritative, and structured with bullet points or numbered lists.`;

async function callGemini(apiKey: string, query: string): Promise<{ answer: string; citations: string[] } | null> {
  // Try available Gemini models in order of priority
  const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest'];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6500);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${EMERGENCY_DIRECTIVE_SYSTEM_PROMPT}\n\nUser Query: "${query}"` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 600
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return {
            answer: text.trim(),
            citations: ['NDMA Safety Doctrine', 'Google Gemini AI Disaster Engine (Connected)']
          };
        }
      }
    } catch (err) {
      // Continue to next model or fallback
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return NextResponse.json({
        answer: 'Hello! I am NE-RESQ AI. How can I help you with disaster safety, evacuation guidelines, or emergency helplines today?',
        citations: ['NE-RESQ Emergency Safety Assistant']
      });
    }

    const trimmedQuery = query.trim();
    const qLower = trimmedQuery.toLowerCase();

    // 1. Check Gemini AI Engine if key is configured
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim() !== '') {
      const geminiResult = await callGemini(geminiKey, trimmedQuery);
      if (geminiResult) {
        return NextResponse.json({
          answer: geminiResult.answer,
          citations: geminiResult.citations,
          provider: 'Google Gemini AI (Connected)',
          disclaimer: 'Official disaster safety guidance. In active life-threatening distress, dial 112 or submit an SOS request.'
        });
      }
    }

    // 2. Intelligent Grounded Knowledge Base Match (Handles greetings, identity, helplines, disasters)
    const matched = SAFETY_KNOWLEDGE_BASE.find(item => 
      item.keywords.some(k => {
        // Match whole word or phrase
        if (k.length <= 4) {
          const regex = new RegExp(`\\b${k}\\b`, 'i');
          return regex.test(qLower);
        }
        return qLower.includes(k);
      })
    );

    if (matched) {
      return NextResponse.json({
        answer: matched.answer,
        citations: matched.citations,
        provider: 'NE-RESQ Grounded Safety Protocol Engine',
        disclaimer: 'Official disaster safety guidance. For active distress, submit an Emergency SOS request.'
      });
    }

    // 3. Courteous General Guidance (Never throw a harsh error message)
    return NextResponse.json({
      answer: `Thank you for reaching out to NE-RESQ AI.\n\nRegarding "${trimmedQuery}": As an emergency safety system for Northeast India, I specialize in disaster preparedness, survival kits, flood/landslide/earthquake safety protocols, and emergency helplines.\n\nFor localized live updates or emergency assistance:\n• National Emergency Helpline: 112\n• State EOC (SEOC): 1070\n• District EOC (DEOC): 1077\n• Medical Emergency: 108\n\nPlease let me know if you need specific safety advice or evacuation procedures.`,
      citations: ['NE-RESQ Safety Doctrine', 'NDMA Emergency Preparedness Guidelines'],
      provider: 'NE-RESQ Safety Core',
      disclaimer: 'For active physical distress, immediately submit an SOS request on the portal or dial 112.'
    });

  } catch (error: any) {
    return NextResponse.json({ 
      answer: 'Hello! I am currently operating in resilient offline safety mode. You can ask me about flood safety, landslide warnings, earthquake protocols, or dial 112 / 1070 for immediate emergency dispatch.',
      citations: ['NE-RESQ Safety Core']
    });
  }
}

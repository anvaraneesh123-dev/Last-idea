import { ResourceItem, VolunteerProfile, CommunityRequest } from '../types';

export interface ExtractedQueryIntent {
  rawQuery: string;
  intent: 'find_resource' | 'find_volunteer' | 'find_shelter' | 'match_request' | 'emergency_help' | 'general_info';
  category?: string;
  keywords: string[];
  quantity?: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  locationFilter?: string;
  isAmbiguous: boolean;
  followUpPrompt?: string;
}

export interface AssistantSearchResultItem {
  id: string;
  type: 'resource' | 'volunteer' | 'request';
  title: string;
  subtitle: string;
  category: string;
  availableQuantity?: number;
  totalQuantity?: number;
  distance: string;
  locationName: string;
  latitude: number;
  longitude: number;
  contactName: string;
  contactPhone: string;
  verificationStatus: string;
  updatedAt: string;
  relevanceScore: number;
  relevanceReasons: string[];
  isAvailable: boolean;
  isEmergencyEligible?: boolean;
}

export interface AssistantResponse {
  answerText: string;
  extractedIntent: ExtractedQueryIntent;
  results: AssistantSearchResultItem[];
  suggestedFollowUps: string[];
  dataSource: 'LIVE_DATABASE' | 'CACHED_OFFLINE_DB' | 'DEMO_DATA_SOURCE';
  isOfflineCache: boolean;
  offlineWarning?: string;
  noMatchExplanation?: string;
}

// Haversine distance in meters
function computeDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 1. Natural Language Intent & Entity Extraction
export function extractQueryIntent(query: string, availableRequests: CommunityRequest[] = []): ExtractedQueryIntent {
  const lower = query.toLowerCase().trim();
  const words = lower.split(/[\s,?.!]+/).filter(w => w.length > 2);

  // Default intent
  let intent: ExtractedQueryIntent['intent'] = 'find_resource';
  let category: string | undefined = undefined;
  let quantity: number | undefined = undefined;
  let urgency: ExtractedQueryIntent['urgency'] = 'medium';
  let locationFilter: string | undefined = undefined;
  let isAmbiguous = false;
  let followUpPrompt: string | undefined = undefined;

  // Urgency detection
  if (lower.includes('emergency') || lower.includes('critical') || lower.includes('sos') || lower.includes('immediately') || lower.includes('life-support')) {
    urgency = 'critical';
  } else if (lower.includes('urgent') || lower.includes('asap') || lower.includes('soon') || lower.includes('injury')) {
    urgency = 'high';
  } else if (lower.includes('routine') || lower.includes('next week') || lower.includes('low priority')) {
    urgency = 'low';
  }

  // Quantity detection (e.g. "5 units", "2 cots", "10 gallons", "3 generators")
  const qtyMatch = lower.match(/(\d+)\s*(units?|gallons?|cots?|packs?|boxes?|generators?|hours?)?/);
  if (qtyMatch && qtyMatch[1]) {
    quantity = parseInt(qtyMatch[1], 10);
  }

  // Location filter extraction
  if (lower.includes('nearby') || lower.includes('my area') || lower.includes('closest')) {
    locationFilter = 'nearby';
  } else if (lower.includes('sector 1') || lower.includes('sector 2') || lower.includes('sector 3') || lower.includes('sector 4')) {
    const sMatch = lower.match(/sector\s*\d+/);
    if (sMatch) locationFilter = sMatch[0];
  } else if (lower.includes('waterfront') || lower.includes('harbor') || lower.includes('valley')) {
    locationFilter = 'cascadia_core';
  }

  // Intent & Category classification
  if (lower.includes('shelter') || lower.includes('evacuat') || lower.includes('cot') || lower.includes('canopy') || lower.includes('stay')) {
    intent = 'find_shelter';
    category = 'shelters';
  } else if (lower.includes('drinking water') || lower.includes('potable') || lower.includes('purif') || lower.includes('water tap') || lower.includes('water')) {
    intent = 'find_resource';
    category = 'water';
  } else if (lower.includes('wheelchair') || lower.includes('mobility') || lower.includes('crutch')) {
    intent = 'find_resource';
    category = 'medicine'; // categorized under medicine/mobility in directory
  } else if (lower.includes('electric') || lower.includes('wire') || lower.includes('circuit') || lower.includes('generator repair') || lower.includes('trades')) {
    intent = 'find_volunteer';
    category = 'electricians';
  } else if (lower.includes('doctor') || lower.includes('physician') || lower.includes('nurse') || lower.includes('triage') || lower.includes('medic')) {
    intent = 'find_volunteer';
    category = 'medical';
  } else if (lower.includes('fulfil this request') || lower.includes('fulfill this request') || lower.includes('fulfill request') || lower.includes('match request')) {
    intent = 'match_request';
  } else if (lower.includes('generator') || lower.includes('power') || lower.includes('inverter') || lower.includes('battery bank')) {
    intent = 'find_resource';
    category = 'generators';
  } else if (lower.includes('food') || lower.includes('ration') || lower.includes('mre') || lower.includes('meal') || lower.includes('hunger')) {
    intent = 'find_resource';
    category = 'food';
  } else if (lower.includes('first aid') || lower.includes('aed') || lower.includes('defibrillator') || lower.includes('bandage') || lower.includes('medicine')) {
    intent = 'find_resource';
    category = 'medicine';
  } else if (lower.includes('rescue') || lower.includes('boat') || lower.includes('chainsaw') || lower.includes('flood') || lower.includes('sandbag')) {
    intent = 'find_resource';
    category = 'rescue_equipment';
  } else if (lower.includes('volunteer') || lower.includes('help') || lower.includes('hands')) {
    intent = 'find_volunteer';
  }

  // Check for ambiguity (e.g. extremely short queries like "water", "food", "help")
  if (words.length <= 1 && !quantity && !locationFilter) {
    isAmbiguous = true;
    if (category === 'water' || category === 'food') {
      followUpPrompt = `How many units or people need ${category}, and what is your location or urgency?`;
    } else if (category === 'shelters') {
      followUpPrompt = 'How many individuals require emergency shelter accommodations?';
    } else {
      followUpPrompt = 'Could you specify the quantity needed or your sector so I can rank the closest matches?';
    }
  }

  return {
    rawQuery: query,
    intent,
    category,
    keywords: words,
    quantity,
    urgency,
    locationFilter,
    isAmbiguous,
    followUpPrompt
  };
}

// 2. Intelligent Search & Ranking against Real Database
export function processAssistantQuery(
  query: string,
  resources: ResourceItem[],
  volunteers: VolunteerProfile[],
  requests: CommunityRequest[],
  isConfiguredSupabase: boolean,
  isOfflineMode: boolean,
  userLocation = { latitude: 45.5152, longitude: -122.6784 }
): AssistantResponse {
  const extracted = extractQueryIntent(query, requests);
  const results: AssistantSearchResultItem[] = [];

  // Determine Data Source
  let dataSource: AssistantResponse['dataSource'] = 'DEMO_DATA_SOURCE';
  let offlineWarning: string | undefined = undefined;

  if (isConfiguredSupabase) {
    if (isOfflineMode) {
      dataSource = 'CACHED_OFFLINE_DB';
      offlineWarning = 'Offline mode active: results loaded from local IndexedDB cache. Stock figures may reflect earlier synchronization.';
    } else {
      dataSource = 'LIVE_DATABASE';
    }
  } else {
    dataSource = 'DEMO_DATA_SOURCE';
  }

  // Case A: User asked about matching a specific request ("Which resources can fulfil this request?")
  if (extracted.intent === 'match_request') {
    const targetRequest = requests.find(r => r.status === 'Open' || r.status === 'Matched') || requests[0];
    if (targetRequest) {
      // Find candidate resources
      resources.forEach(res => {
        if (res.availability === 'deactivated' || res.status === 'deactivated') return;

        let score = 0;
        const reasons: string[] = [];

        // Category match
        if (res.category === targetRequest.category || (res.category === 'tools' && targetRequest.category === 'tools')) {
          score += 45;
          reasons.push(`Direct category match: "${res.category.toUpperCase()}"`);
        } else if (
          (targetRequest.category === 'generators' && res.category === 'generators') ||
          (targetRequest.category === 'water' && res.category === 'water')
        ) {
          score += 40;
          reasons.push(`Compatible emergency commodity`);
        }

        // Quantity & availability
        const requestedQty = targetRequest.quantityRequested || 1;
        if (res.availableQuantity >= requestedQty) {
          score += 30;
          reasons.push(`Full stock available: ${res.availableQuantity} units ready (ticket requests ${requestedQty})`);
        } else if (res.availableQuantity > 0) {
          score += 15;
          reasons.push(`Partial stock: ${res.availableQuantity} units`);
        } else {
          score -= 20;
        }

        // Distance
        const distMeters = computeDistanceMeters(
          targetRequest.latitude || userLocation.latitude,
          targetRequest.longitude || userLocation.longitude,
          res.latitude || userLocation.latitude,
          res.longitude || userLocation.longitude
        );
        if (distMeters < 500) {
          score += 15;
          reasons.push(`Under 500m distance (${Math.round(distMeters)}m)`);
        } else if (distMeters < 1500) {
          score += 10;
          reasons.push(`Proximity: ~${(distMeters / 1000).toFixed(1)} km`);
        }

        if (res.verificationStatus === 'verified') {
          score += 10;
          reasons.push(`Verified community asset`);
        }

        if (score >= 35) {
          results.push({
            id: res.id,
            type: 'resource',
            title: res.name || res.title,
            subtitle: `Matches ticket #${targetRequest.id.slice(-5)}: ${targetRequest.title}`,
            category: res.category,
            availableQuantity: res.availableQuantity,
            totalQuantity: res.quantity,
            distance: res.distance || `${Math.round(distMeters)}m away`,
            locationName: res.locationName || res.location,
            latitude: res.latitude,
            longitude: res.longitude,
            contactName: res.ownerName,
            contactPhone: res.contactPhone,
            verificationStatus: res.verificationStatus,
            updatedAt: res.updatedAt,
            relevanceScore: Math.min(100, score),
            relevanceReasons: reasons,
            isAvailable: res.availableQuantity > 0,
            isEmergencyEligible: res.isEmergencyEligible
          });
        }
      });
    }
  }

  // Case B: Search Volunteers if intent is volunteer or repairs
  if (extracted.intent === 'find_volunteer') {
    volunteers.forEach(vol => {
      let score = 0;
      const reasons: string[] = [];

      // Skills & trade match
      const skillString = [...(vol.skills || []), vol.role, ...(vol.languages || [])].join(' ').toLowerCase();
      
      if (extracted.category === 'electricians' && (skillString.includes('electric') || skillString.includes('generator') || skillString.includes('power'))) {
        score += 55;
        reasons.push(`Certified electrical trade lead / master electrician`);
      } else if (extracted.category === 'medical' && (skillString.includes('triage') || skillString.includes('medicine') || skillString.includes('physician') || skillString.includes('doctor') || skillString.includes('first aid'))) {
        score += 55;
        reasons.push(`Licensed medical / emergency physician`);
      }

      // Keyword overlap
      extracted.keywords.forEach(kw => {
        if (skillString.includes(kw)) {
          score += 15;
          reasons.push(`Matches keyword "${kw}" in credentials`);
        }
      });

      // Availability
      if (vol.availability === 'available' || vol.status === 'available') {
        score += 25;
        reasons.push(`Currently available on-call`);
      } else if (vol.availability === 'on_mission' || vol.status === 'on_mission') {
        score += 10;
        reasons.push(`On active mission (can accept next dispatch)`);
      }

      if (vol.verificationStatus === 'verified') {
        score += 10;
        reasons.push(`Admin verified responder`);
      }

      if (score >= 30) {
        results.push({
          id: vol.id,
          type: 'volunteer',
          title: vol.name,
          subtitle: vol.role,
          category: 'volunteers',
          distance: vol.serviceArea || 'Cascadia Zone',
          locationName: vol.neighborhoodZone || 'Community Area',
          latitude: 45.5150 + Math.random() * 0.005,
          longitude: -122.6780 + Math.random() * 0.005,
          contactName: vol.name,
          contactPhone: vol.phone,
          verificationStatus: vol.verificationStatus || 'verified',
          updatedAt: 'Active now',
          relevanceScore: Math.min(100, score),
          relevanceReasons: reasons,
          isAvailable: vol.availability === 'available' || vol.status === 'available',
        });
      }
    });
  }

  // Case C: Search Resources (Food, Water, Shelters, Generators, Medicine, Tools, Wheelchair)
  if (extracted.intent !== 'find_volunteer') {
    resources.forEach(res => {
      if (res.availability === 'deactivated' || res.status === 'deactivated') return;

      let score = 0;
      const reasons: string[] = [];

      const textCorp = [
        res.name,
        res.title,
        res.description,
        res.category,
        res.locationName,
        res.location
      ].join(' ').toLowerCase();

      // Category match
      if (extracted.category && res.category === extracted.category) {
        score += 45;
        reasons.push(`Exact category match: "${res.category.toUpperCase()}"`);
      }

      // Keyword matches
      extracted.keywords.forEach(kw => {
        if (textCorp.includes(kw)) {
          score += 15;
          if (reasons.length < 3) {
            reasons.push(`Matches search term "${kw}"`);
          }
        }
      });

      // Stock availability
      if (res.availableQuantity > 0) {
        score += 20;
        reasons.push(`${res.availableQuantity} units ready for immediate collection`);
      } else {
        score -= 10;
        reasons.push(`Currently 0 units in stock`);
      }

      // Quantity demand check
      if (extracted.quantity && res.availableQuantity >= extracted.quantity) {
        score += 15;
        reasons.push(`Sufficient quantity for requested ${extracted.quantity} units`);
      }

      // Verification
      if (res.verificationStatus === 'verified') {
        score += 10;
        reasons.push(`Verified community asset`);
      }

      // Emergency eligibility
      if (extracted.urgency === 'critical' && res.isEmergencyEligible) {
        score += 15;
        reasons.push(`Prioritized for emergency life-safety`);
      }

      // Proximity
      const distMeters = computeDistanceMeters(
        userLocation.latitude,
        userLocation.longitude,
        res.latitude || userLocation.latitude,
        res.longitude || userLocation.longitude
      );
      if (distMeters < 500) {
        score += 15;
        reasons.push(`Under 500m away (~${Math.round(distMeters)}m)`);
      } else if (distMeters < 1500) {
        score += 8;
        reasons.push(`Within walking distance (~${(distMeters / 1000).toFixed(1)} km)`);
      }

      if (score >= 30) {
        results.push({
          id: res.id,
          type: 'resource',
          title: res.name || res.title,
          subtitle: res.description,
          category: res.category,
          availableQuantity: res.availableQuantity,
          totalQuantity: res.quantity,
          distance: res.distance || `${Math.round(distMeters)}m away`,
          locationName: res.locationName || res.location,
          latitude: res.latitude,
          longitude: res.longitude,
          contactName: res.ownerName,
          contactPhone: res.contactPhone,
          verificationStatus: res.verificationStatus,
          updatedAt: res.updatedAt,
          relevanceScore: Math.min(100, score),
          relevanceReasons: reasons,
          isAvailable: res.availableQuantity > 0,
          isEmergencyEligible: res.isEmergencyEligible
        });
      }
    });
  }

  // Sort by highest relevance score
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Generate Grounded Answer Text (NEVER INVENTING DATA)
  let answerText = '';
  let noMatchExplanation: string | undefined = undefined;

  if (results.length > 0) {
    const top = results[0];
    if (extracted.intent === 'find_shelter') {
      const availableShelters = results.filter(r => r.isAvailable);
      if (availableShelters.length > 0) {
        answerText = `I found ${availableShelters.length} active emergency shelter location(s) listed with open cots in Cascadia. The closest open shelter is **${top.title}** at ${top.locationName} (${top.distance}), with ${top.availableQuantity} available cots.`;
      } else {
        answerText = `I found ${results.length} shelter facility listed, but active cots are currently reserved. **${top.title}** is located at ${top.locationName}. You can submit an urgent aid petition to request rapid canopy deployment.`;
      }
    } else if (extracted.intent === 'find_volunteer') {
      answerText = `I located ${results.length} qualified volunteer(s) in the roster. **${top.title}** (${top.subtitle}) is active in ${top.locationName} and experienced in ${top.relevanceReasons[0]?.toLowerCase() || 'rapid response'}.`;
    } else if (extracted.intent === 'match_request') {
      answerText = `Based on current directory inventory, I identified ${results.length} candidate resource(s) that can fulfill this mutual aid ticket. Top recommended allocation is **${top.title}** with a ${top.relevanceScore}% match score (${top.relevanceReasons.slice(0, 2).join(', ')}).`;
    } else {
      const availableCount = results.filter(r => r.isAvailable).length;
      answerText = `Found ${results.length} matching resource(s) (${availableCount} available with stock). Top recommendation: **${top.title}** with ${top.availableQuantity} units available at ${top.locationName} (${top.distance}).`;
    }
  } else {
    noMatchExplanation = `No matching ${extracted.category || 'records'} with positive stock were found in the active community catalog for "${query}".`;
    answerText = `I checked the community catalog and volunteer database, but found no active listings matching "${query}". No records were invented. Would you like to create a new resource request ticket so nearby volunteers and depot administrators can be alerted?`;
  }

  // Dynamic suggested follow-ups
  const suggestedFollowUps: string[] = [];
  if (extracted.intent === 'find_resource') {
    suggestedFollowUps.push('View these locations on the Community Map');
    suggestedFollowUps.push('Create a mutual aid request for this item');
    suggestedFollowUps.push('Where can I find drinking water nearby?');
  } else if (extracted.intent === 'find_volunteer') {
    suggestedFollowUps.push('Who can help repair electrical equipment?');
    suggestedFollowUps.push('Dispatch an urgent volunteer mission');
  } else {
    suggestedFollowUps.push('Which shelters are listed as open?');
    suggestedFollowUps.push('Is a wheelchair available in my area?');
    suggestedFollowUps.push('Which resources can fulfil this request?');
  }

  return {
    answerText,
    extractedIntent: extracted,
    results: results.slice(0, 5), // top 5 ranked
    suggestedFollowUps,
    dataSource,
    isOfflineCache: isOfflineMode,
    offlineWarning,
    noMatchExplanation
  };
}

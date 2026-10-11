import { ResourceItem, CommunityRequest, ResourceMatchRecommendation } from '../types';

/**
 * Calculates the great-circle distance between two points on Earth using the Haversine formula
 * Returns distance in kilometers (km)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // rounded to 2 decimals
}

/**
 * Maps categories for soft compatibility (e.g. medicine <-> hospitals)
 */
const COMPATIBLE_CATEGORIES: Record<string, string[]> = {
  medicine: ['hospitals', 'rescue_equipment'],
  hospitals: ['medicine', 'shelters'],
  generators: ['tools', 'other_services'],
  tools: ['generators', 'rescue_equipment'],
  rescue_equipment: ['tools', 'volunteers', 'medicine'],
  food: ['water', 'shelters'],
  water: ['food', 'shelters'],
  shelters: ['food', 'water'],
  volunteers: ['rescue_equipment', 'other_services'],
  other_services: ['volunteers', 'tools'],
};

/**
 * Intelligent Resource Matching Engine
 * Matches a request against all available resources based on:
 * 1. Category relevance
 * 2. Geo-distance
 * 3. Stock availability & non-double allocation
 * 4. Urgency & emergency suitability
 * 5. Verification status
 */
export function matchRequestToResources(
  request: CommunityRequest,
  resources: ResourceItem[]
): ResourceMatchRecommendation[] {
  const reqLat = request.latitude ?? 45.5152;
  const reqLon = request.longitude ?? -122.6784;
  const reqQty = request.quantityRequested || 1;

  const recommendations: ResourceMatchRecommendation[] = [];

  for (const resource of resources) {
    // Exclude deactivated items or items completely out of stock
    if (resource.availability === 'deactivated' || resource.status === 'deactivated') {
      continue;
    }

    if (resource.availableQuantity <= 0) {
      continue; // Prevent double-allocation of exhausted inventory
    }

    let score = 0;
    const reasons: string[] = [];

    // 1. Category matching
    const isExactCategory = resource.category === request.category;
    const isCompatibleCategory = COMPATIBLE_CATEGORIES[request.category]?.includes(resource.category);

    if (isExactCategory) {
      score += 40;
      reasons.push(`Exact category match: "${resource.category.replace('_', ' ').toUpperCase()}"`);
    } else if (isCompatibleCategory) {
      score += 20;
      reasons.push(`Adjacent operational category match: ${resource.category.replace('_', ' ')}`);
    } else {
      // Incompatible category
      continue;
    }

    // 2. Quantity & Stock Availability
    const sufficientQuantity = resource.availableQuantity >= reqQty;
    if (sufficientQuantity) {
      score += 25;
      reasons.push(`Full stock available: ${resource.availableQuantity} units ready (requested ${reqQty})`);
    } else {
      score += 10;
      reasons.push(`Partial stock available: ${resource.availableQuantity} of ${reqQty} units ready`);
    }

    // 3. Distance scoring
    const resLat = resource.latitude || 45.5152;
    const resLon = resource.longitude || -122.6784;
    const distanceKm = calculateHaversineDistance(reqLat, reqLon, resLat, resLon);

    if (distanceKm <= 0.5) {
      score += 20;
      reasons.push(`Ultra-close proximity: ~${Math.round(distanceKm * 1000)}m away (under 500m)`);
    } else if (distanceKm <= 1.5) {
      score += 15;
      reasons.push(`Fast response range: ${distanceKm} km away`);
    } else if (distanceKm <= 3.0) {
      score += 10;
      reasons.push(`Moderate proximity: ${distanceKm} km away`);
    } else {
      score += 5;
      reasons.push(`Extended perimeter: ${distanceKm} km away`);
    }

    // 4. Urgency & Emergency Alignment
    if (request.urgency === 'critical' || request.urgency === 'high') {
      if (resource.isEmergencyEligible) {
        score += 10;
        reasons.push('Elevated disaster asset: Verified for high-urgency deployment');
      }
    }

    // 5. Verification status
    if (resource.verificationStatus === 'verified') {
      score += 5;
      reasons.push('Custodian identity and equipment status verified');
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.max(10, score));

    recommendations.push({
      resource,
      score: finalScore,
      reasons,
      distanceKm,
      sufficientQuantity,
    });
  }

  // Sort by highest score first, then closest distance
  return recommendations.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.distanceKm - b.distanceKm;
  });
}

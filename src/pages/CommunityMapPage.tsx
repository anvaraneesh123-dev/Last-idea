import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { ResourceItem, ResourceCategory, HazardReport, VerificationTier } from '../types';
import { AddResourceModal } from '../components/resources/AddResourceModal';
import { 
  Utensils, 
  Droplet, 
  HeartPulse, 
  Home, 
  Zap, 
  Users, 
  ShieldAlert, 
  AlertTriangle,
  AlertCircle,
  Search, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  MapPin, 
  Navigation, 
  Phone, 
  ShieldCheck, 
  Clock, 
  RadioTower, 
  Plus, 
  CheckCircle2, 
  Crosshair, 
  Wifi, 
  WifiOff, 
  Eye, 
  EyeOff,
  SlidersHorizontal,
  ChevronRight,
  Construction,
  Radio,
  HelpCircle,
  Check,
  Shield
} from 'lucide-react';

export type MapFilterCategory = 
  | 'food' 
  | 'water' 
  | 'healthcare' 
  | 'shelters' 
  | 'generators' 
  | 'volunteers' 
  | 'hazards';

export const CommunityMapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { 
    currentCommunity, 
    isEmergencyMode, 
    toggleEmergencyMode, 
    resources, 
    borrowResource,
    hazardReports,
    verifyHazardReport,
    clearHazardReport,
    setIsReportHazardModalOpen,
    volunteers,
    deviceGps,
    detectDeviceGps
  } = useCommunity();

  const { currentUser, isAdmin, isVolunteer } = useAuth();
  const isPrivileged = isAdmin || isVolunteer;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tempPinMarkerRef = useRef<L.Marker | null>(null);

  // Active Map Filters
  const [selectedCategories, setSelectedCategories] = useState<Record<MapFilterCategory, boolean>>({
    food: true,
    water: true,
    healthcare: true,
    shelters: true,
    generators: true,
    volunteers: true,
    hazards: true,
  });

  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available_only' | 'emergency_only'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(null);

  // Map Click Registration Mode
  const [isPinningMode, setIsPinningMode] = useState(false);
  const [pinnedCoords, setPinnedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [mapTileOnline, setMapTileOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setMapTileOnline(true);
    const handleOffline = () => setMapTileOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper to determine if a report is potentially stale (> 2h)
  const isStale = (timeStr?: string) => {
    if (!timeStr) return false;
    const lower = timeStr.toLowerCase();
    return lower.includes('2 hour') || lower.includes('3 hour') || lower.includes('4 hour') || lower.includes('day') || lower.includes('yesterday');
  };

  // Map category classifier
  const getResourceMapCategory = (r: ResourceItem): MapFilterCategory => {
    if (r.category === 'food') return 'food';
    if (r.category === 'water') return 'water';
    if (r.category === 'medicine' || r.category === 'hospitals') return 'healthcare';
    if (r.category === 'shelters') return 'shelters';
    if (r.category === 'generators') return 'generators';
    if (r.category === 'volunteers') return 'volunteers';
    if (r.category === 'rescue_equipment' || r.isEmergencyEligible || r.status === 'critical_reserve') return 'hazards';
    return 'hazards';
  };

  // Category visual metadata
  const categoryConfig: Record<MapFilterCategory, { label: string; icon: any; color: string; border: string; bgBadge: string; pinBg: string }> = {
    food: {
      label: 'Food Distribution',
      icon: Utensils,
      color: 'text-amber-500',
      border: 'border-amber-500/30',
      bgBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      pinBg: '#f59e0b',
    },
    water: {
      label: 'Potable Water Taps',
      icon: Droplet,
      color: 'text-cyan-500',
      border: 'border-cyan-500/30',
      bgBadge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      pinBg: '#06b6d4',
    },
    healthcare: {
      label: 'Healthcare & Medical',
      icon: HeartPulse,
      color: 'text-rose-500',
      border: 'border-rose-500/30',
      bgBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      pinBg: '#f43f5e',
    },
    shelters: {
      label: 'Emergency Shelters',
      icon: Home,
      color: 'text-indigo-500',
      border: 'border-indigo-500/30',
      bgBadge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      pinBg: '#6366f1',
    },
    generators: {
      label: 'Power & Microgrids',
      icon: Zap,
      color: 'text-blue-500',
      border: 'border-blue-500/30',
      bgBadge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      pinBg: '#3b82f6',
    },
    volunteers: {
      label: 'First Responders & Squads',
      icon: Users,
      color: 'text-emerald-500',
      border: 'border-emerald-500/30',
      bgBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      pinBg: '#10b981',
    },
    hazards: {
      label: 'Reported Hazards & Roadblocks',
      icon: Construction,
      color: 'text-red-500',
      border: 'border-red-500/30',
      bgBadge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      pinBg: '#ef4444',
    },
  };

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      if (res.availability === 'deactivated' || res.status === 'deactivated') return false;

      const mapCat = getResourceMapCategory(res);
      if (!selectedCategories[mapCat]) return false;

      if (availabilityFilter === 'available_only' && res.availableQuantity <= 0) return false;
      if (availabilityFilter === 'emergency_only' && !res.isEmergencyEligible) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          (res.name && res.name.toLowerCase().includes(q)) ||
          (res.title && res.title.toLowerCase().includes(q)) ||
          (res.description && res.description.toLowerCase().includes(q)) ||
          (res.locationName && res.locationName.toLowerCase().includes(q)) ||
          (res.category && res.category.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [resources, selectedCategories, availabilityFilter, searchQuery]);

  // Selected Resource
  const selectedResource = useMemo(() => {
    if (selectedResourceId) {
      const found = resources.find(r => r.id === selectedResourceId);
      if (found) return found;
    }
    return null;
  }, [resources, selectedResourceId]);

  // Selected Hazard
  const selectedHazard = useMemo(() => {
    if (selectedHazardId) {
      return hazardReports.find(h => h.id === selectedHazardId) || null;
    }
    return null;
  }, [hazardReports, selectedHazardId]);

  // Handle URL Query Params on Load
  useEffect(() => {
    const urlAssetId = searchParams.get('assetId');
    const urlLat = searchParams.get('lat');
    const urlLng = searchParams.get('lng');

    if (urlAssetId) {
      setSelectedResourceId(urlAssetId);
      setSelectedHazardId(null);
    }

    if (mapInstanceRef.current && urlLat && urlLng) {
      const lat = parseFloat(urlLat);
      const lng = parseFloat(urlLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
      }
    }
  }, [searchParams]);

  // Selected Volunteer
  const selectedVolunteer = useMemo(() => {
    if (selectedVolunteerId) {
      return volunteers.find(v => v.id === selectedVolunteerId) || null;
    }
    return null;
  }, [volunteers, selectedVolunteerId]);

  // Real Haversine Distance Calculation from User's Physical Device GPS
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getFormattedDistance = (lat?: number, lng?: number, fallbackDistance?: string) => {
    if (!deviceGps || !lat || !lng) return fallbackDistance || 'Local Zone';
    const km = calculateDistanceKm(deviceGps.latitude, deviceGps.longitude, lat, lng);
    if (km < 1) {
      return `${Math.round(km * 1000)}m away (from Device GPS)`;
    }
    return `${km.toFixed(1)} km away (from Device GPS)`;
  };

  // Default selection if nothing selected
  useEffect(() => {
    if (!selectedResource && !selectedHazard && !selectedVolunteer) {
      if (filteredResources.length > 0) {
        setSelectedResourceId(filteredResources[0].id);
      } else if (hazardReports.length > 0) {
        setSelectedHazardId(hazardReports[0].id);
      }
    }
  }, [filteredResources, hazardReports, selectedResource, selectedHazard, selectedVolunteer]);

  // When device GPS is acquired, smoothly pan/fly to user's real physical coordinates
  useEffect(() => {
    if (deviceGps && deviceGps.isAcquired && mapInstanceRef.current && !searchParams.get('assetId') && !searchParams.get('lat')) {
      mapInstanceRef.current.flyTo([deviceGps.latitude, deviceGps.longitude], 15, { duration: 1.2 });
    }
  }, [deviceGps?.isAcquired]);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Use device GPS if already detected, otherwise default Cascadia coordinates
    const initialLat = deviceGps?.latitude || 45.5152;
    const initialLng = deviceGps?.longitude || -122.6784;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: deviceGps ? 15 : 14,
      zoomControl: false,
    });

    // Genuine OpenStreetMap Raster Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Map Click Listener for "Pin Resource Location"
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (isPinningMode) {
        setPinnedCoords({ latitude: lat, longitude: lng });
        
        // Add temporary preview pin
        if (tempPinMarkerRef.current) {
          tempPinMarkerRef.current.setLatLng([lat, lng]);
        } else {
          const tempIcon = L.divIcon({
            className: 'custom-leaflet-temp-pin',
            html: `
              <div style="background-color: #3b82f6; width: 34px; height: 34px; border-radius: 9999px; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(59,130,246,0.6); animation: bounce 1s infinite;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
              </div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 34],
          });
          tempPinMarkerRef.current = L.marker([lat, lng], { icon: tempIcon }).addTo(map);
        }

        // Open registration modal with captured coordinates
        setIsPinningMode(false);
        setAddModalOpen(true);
      }
    });

    // Invalidate map size after mounting
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isPinningMode]);

  // 2. Render Custom Leaflet Markers for both Resources and Hazards
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;

    const layerGroup = markersLayerGroupRef.current;
    layerGroup.clearLayers();

    // A. Render Resources Markers
    filteredResources.forEach(res => {
      const lat = res.latitude || 45.5152;
      const lng = res.longitude || -122.6784;
      const mapCat = getResourceMapCategory(res);
      const cfg = categoryConfig[mapCat];
      const isSelected = selectedResource?.id === res.id;
      const isCritical = res.isEmergencyEligible && isEmergencyMode;

      // Custom HTML Marker Icon
      const markerHtml = `
        <div style="position: relative; width: 38px; height: 38px; cursor: pointer; transition: transform 0.2s;">
          ${isSelected || isCritical ? `
            <div style="position: absolute; inset: -6px; border-radius: 9999px; background-color: ${isCritical ? '#ef4444' : cfg.pinBg}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          ` : ''}
          <div style="
            width: 38px; 
            height: 38px; 
            border-radius: 14px; 
            background: ${cfg.pinBg}; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            box-shadow: 0 10px 20px rgba(0,0,0,0.35);
            border: ${isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.7)'};
            transform: ${isSelected ? 'scale(1.18)' : 'scale(1)'};
          ">
            <span style="font-size: 16px; font-weight: bold;">
              ${mapCat === 'food' ? '🍲' : mapCat === 'water' ? '💧' : mapCat === 'healthcare' ? '🩺' : mapCat === 'shelters' ? '🏠' : mapCat === 'generators' ? '⚡' : mapCat === 'volunteers' ? '👥' : '⚠️'}
            </span>
          </div>
          <div style="
            position: absolute; 
            top: -6px; 
            right: -6px; 
            background: ${res.availableQuantity > 0 ? '#10b981' : '#f43f5e'}; 
            color: white; 
            font-size: 10px; 
            font-weight: 800; 
            border-radius: 9999px; 
            padding: 1px 5px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${res.availableQuantity}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: markerHtml,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Click Marker to Select and View Details
      marker.on('click', () => {
        setSelectedResourceId(res.id);
        setSelectedHazardId(null);
        mapInstanceRef.current?.flyTo([lat, lng], 16, { duration: 0.8 });
      });

      // Bind Tooltip
      marker.bindTooltip(
        `<div style="font-weight: 700; font-size: 11px;">${res.name || res.title}</div><div style="font-size: 10px; color: #94a3b8;">${res.availableQuantity} available • ${res.locationName}</div>`,
        { direction: 'top', offset: [0, -12], opacity: 0.95 }
      );

      layerGroup.addLayer(marker);
    });

    // B. Render Reported Hazards & Roadblocks on Map
    if (selectedCategories.hazards) {
      hazardReports.forEach(h => {
        const lat = h.latitude || 45.5170;
        const lng = h.longitude || -122.6770;
        const isSelected = selectedHazard?.id === h.id;
        const isOfficial = h.verificationTier === 'official_alert';
        const isVerified = h.verificationTier === 'community_verified';
        const pinColor = isOfficial ? '#dc2626' : isVerified ? '#f59e0b' : '#eab308';

        const hazardMarkerHtml = `
          <div style="position: relative; width: 42px; height: 42px; cursor: pointer; transition: transform 0.2s;">
            <div style="position: absolute; inset: -6px; border-radius: 9999px; background-color: ${pinColor}; opacity: 0.45; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="
              width: 42px; 
              height: 42px; 
              border-radius: 9999px; 
              background: ${pinColor}; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              box-shadow: 0 10px 25px rgba(220,38,38,0.5);
              border: ${isSelected ? '4px solid white' : '2.5px solid rgba(255,255,255,0.9)'};
              transform: ${isSelected ? 'scale(1.22)' : 'scale(1)'};
            ">
              <span style="font-size: 18px;">
                ${h.isRoadBlocked ? '🚧' : '⚠️'}
              </span>
            </div>
            ${h.isRoadBlocked ? `
              <div style="
                position: absolute; 
                bottom: -8px; 
                left: 50%;
                transform: translateX(-50%);
                background: #991b1b; 
                color: white; 
                font-size: 8px; 
                font-weight: 900; 
                border-radius: 4px; 
                padding: 1px 4px; 
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.4);
                border: 1px solid rgba(255,255,255,0.6);
              ">
                BLOCKED
              </div>
            ` : ''}
          </div>
        `;

        const customHazardIcon = L.divIcon({
          className: 'custom-leaflet-hazard-marker',
          html: hazardMarkerHtml,
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        });

        const hazardMarker = L.marker([lat, lng], { icon: customHazardIcon });

        hazardMarker.on('click', () => {
          setSelectedHazardId(h.id);
          setSelectedResourceId(null);
          setSelectedVolunteerId(null);
          mapInstanceRef.current?.flyTo([lat, lng], 16, { duration: 0.8 });
        });

        hazardMarker.bindTooltip(
          `<div style="font-weight: 800; font-size: 11px; color: ${pinColor};">${h.isRoadBlocked ? '🚧 ROAD BLOCKED: ' : '⚠️ '}${h.title}</div><div style="font-size: 10px; color: #cbd5e1;">${h.locationName} • ${h.reportedAt}</div>`,
          { direction: 'top', offset: [0, -14], opacity: 0.95 }
        );

        layerGroup.addLayer(hazardMarker);
      });
    }

    // C. Render User Physical Device GPS Marker & Sensor Accuracy Radius
    if (deviceGps && deviceGps.isAcquired) {
      const accuracyRadius = Math.max(15, deviceGps.accuracy || 25);
      const gpsAccuracyCircle = L.circle([deviceGps.latitude, deviceGps.longitude], {
        radius: accuracyRadius,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.14,
        weight: 2,
        dashArray: '5, 5',
      });
      layerGroup.addLayer(gpsAccuracyCircle);

      const userGpsIcon = L.divIcon({
        className: 'custom-leaflet-user-gps',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: #3b82f6; opacity: 0.55; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 24px; height: 24px; border-radius: 9999px; background: #2563eb; border: 3.5px solid white; box-shadow: 0 4px 18px rgba(37,99,235,0.8); display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; border-radius: 9999px; background: white;"></div>
            </div>
            <div style="position: absolute; bottom: -20px; white-space: nowrap; background: #0f172a; color: #38bdf8; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); border: 1px solid #1e293b;">
              🎯 My Device GPS (±${Math.round(deviceGps.accuracy)}m)
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const userMarker = L.marker([deviceGps.latitude, deviceGps.longitude], { icon: userGpsIcon });
      userMarker.bindTooltip(
        `<div style="font-weight: 800; font-size: 11px; color: #2563eb;">🎯 Your Live Device Location</div>
         <div style="font-size: 10px; color: #64748b;">GPS: ${deviceGps.latitude.toFixed(5)}°, ${deviceGps.longitude.toFixed(5)}°</div>
         <div style="font-size: 9px; color: #059669; font-weight: 700;">Sensor Accuracy: ±${Math.round(deviceGps.accuracy)} meters</div>`,
        { direction: 'top', offset: [0, -18], opacity: 0.98 }
      );

      userMarker.on('click', () => {
        mapInstanceRef.current?.flyTo([deviceGps.latitude, deviceGps.longitude], 16, { duration: 0.8 });
      });

      layerGroup.addLayer(userMarker);
    }

    // D. Render Registered Volunteers on Map (Multi-Device Live Sync)
    if (selectedCategories.volunteers) {
      volunteers.forEach((v, index) => {
        let vLat = v.latitude;
        let vLng = v.longitude;

        if (!vLat || !vLng) {
          const baseLat = deviceGps?.latitude || 45.5152;
          const baseLng = deviceGps?.longitude || -122.6784;
          const angle = (index * 2 * Math.PI) / Math.max(1, volunteers.length);
          vLat = baseLat + 0.0035 * Math.cos(angle);
          vLng = baseLng + 0.0035 * Math.sin(angle);
        }

        const isSelected = selectedVolunteer?.id === v.id;
        const isReady = v.availability === 'available';
        const volColor = isReady ? '#10b981' : '#64748b';

        const volIcon = L.divIcon({
          className: 'custom-leaflet-volunteer-marker',
          html: `
            <div style="position: relative; width: 38px; height: 38px; cursor: pointer; transition: transform 0.2s;">
              ${isSelected ? `
                <div style="position: absolute; inset: -5px; border-radius: 9999px; background-color: ${volColor}; opacity: 0.45; animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              ` : ''}
              <div style="
                width: 38px; 
                height: 38px; 
                border-radius: 14px; 
                background: ${volColor}; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                box-shadow: 0 8px 18px rgba(16,185,129,0.4);
                border: ${isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.8)'};
                transform: ${isSelected ? 'scale(1.18)' : 'scale(1)'};
              ">
                <span style="font-size: 16px;">🙋</span>
              </div>
              <div style="
                position: absolute; 
                top: -6px; 
                right: -6px; 
                background: #0f172a; 
                color: #34d399; 
                font-size: 8px; 
                font-weight: 800; 
                border-radius: 9999px; 
                padding: 1px 4px; 
                border: 1px solid #10b981;
              ">
                LIVE
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const volMarker = L.marker([vLat, vLng], { icon: volIcon });
        volMarker.on('click', () => {
          setSelectedVolunteerId(v.id);
          setSelectedResourceId(null);
          setSelectedHazardId(null);
          mapInstanceRef.current?.flyTo([vLat!, vLng!], 16, { duration: 0.8 });
        });

        volMarker.bindTooltip(
          `<div style="font-weight: 800; font-size: 11px; color: #10b981;">🙋 Volunteer: ${v.name}</div>
           <div style="font-size: 10px; color: #94a3b8;">${v.role} • ${v.serviceArea || 'Local Sector'}</div>
           <div style="font-size: 9px; color: #38bdf8;">Skills: ${v.skills.slice(0, 2).join(', ')}</div>`,
          { direction: 'top', offset: [0, -12], opacity: 0.95 }
        );

        layerGroup.addLayer(volMarker);
      });
    }

  }, [
    filteredResources, 
    hazardReports, 
    volunteers, 
    deviceGps, 
    selectedResource, 
    selectedHazard, 
    selectedVolunteer, 
    isEmergencyMode, 
    selectedCategories.hazards, 
    selectedCategories.volunteers
  ]);

  // Center on resource
  const handleFlyToResource = (res: ResourceItem) => {
    setSelectedResourceId(res.id);
    setSelectedHazardId(null);
    if (mapInstanceRef.current && res.latitude && res.longitude) {
      mapInstanceRef.current.flyTo([res.latitude, res.longitude], 16, { duration: 1.0 });
    }
  };

  // Center on hazard
  const handleFlyToHazard = (h: HazardReport) => {
    setSelectedHazardId(h.id);
    setSelectedResourceId(null);
    if (mapInstanceRef.current && h.latitude && h.longitude) {
      mapInstanceRef.current.flyTo([h.latitude, h.longitude], 16, { duration: 1.0 });
    }
  };

  // Center on volunteer
  const handleFlyToVolunteer = (v: any) => {
    setSelectedVolunteerId(v.id);
    setSelectedResourceId(null);
    setSelectedHazardId(null);
    if (mapInstanceRef.current && v.latitude && v.longitude) {
      mapInstanceRef.current.flyTo([v.latitude, v.longitude], 16, { duration: 1.0 });
    }
  };

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleRecenterDeviceGps = async () => {
    let coords = deviceGps;
    if (!coords || !coords.isAcquired) {
      coords = await detectDeviceGps();
    }
    if (coords && coords.isAcquired && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([coords.latitude, coords.longitude], 16, { duration: 1.2 });
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([45.5152, -122.6784], 14, { duration: 1.0 });
    }
  };

  const handleResetView = () => {
    if (deviceGps && deviceGps.isAcquired) {
      mapInstanceRef.current?.flyTo([deviceGps.latitude, deviceGps.longitude], 15, { duration: 1.0 });
    } else {
      mapInstanceRef.current?.flyTo([45.5152, -122.6784], 14, { duration: 1.0 });
    }
  };

  const toggleCategory = (cat: MapFilterCategory) => {
    setSelectedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const selectAll = () => {
    setSelectedCategories({
      food: true,
      water: true,
      healthcare: true,
      shelters: true,
      generators: true,
      volunteers: true,
      hazards: true,
    });
  };

  const clearAll = () => {
    setSelectedCategories({
      food: false,
      water: false,
      healthcare: false,
      shelters: false,
      generators: false,
      volunteers: false,
      hazards: false,
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Interactive Community Map & GIS Telemetry
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Live GIS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real coordinates for mutual aid distribution, shelter capacity, and community hazard telemetry in {currentCommunity.name}.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Report Hazard Button */}
          <button
            onClick={() => setIsReportHazardModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            title="Submit hazard or road blockage report"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Hazard</span>
          </button>

          {/* Map Click Registration Toggle */}
          <button
            onClick={() => setIsPinningMode(!isPinningMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm cursor-pointer ${
              isPinningMode
                ? 'bg-amber-500 text-white border-amber-400 ring-2 ring-amber-400/50 animate-pulse'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Crosshair className="w-4 h-4 text-blue-500" />
            <span>{isPinningMode ? 'Click Map to Choose Location...' : 'Pin Resource on Map'}</span>
          </button>

          {/* Emergency Mode Toggle */}
          <button
            onClick={() => toggleEmergencyMode()}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
              isEmergencyMode
                ? 'bg-red-600 text-white border border-red-500 shadow-red-500/30 pulse-emergency-indicator'
                : 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-500/30'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${isEmergencyMode ? 'text-white animate-pulse' : 'text-blue-500'}`} />
            <span>{isEmergencyMode ? 'DISASTER MODE ACTIVE' : 'Emergency Mode'}</span>
            <span className={`w-2 h-2 rounded-full ${isEmergencyMode ? 'bg-white' : 'bg-blue-400'}`} />
          </button>
        </div>
      </div>

      {/* Pinning Instructions Alert Bar */}
      {isPinningMode && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-amber-500 shrink-0 animate-spin" />
            <span>
              <strong>Map Click Mode Active:</strong> Click anywhere on the map to set exact coordinates and open the Resource Registration form.
            </span>
          </div>
          <button
            onClick={() => setIsPinningMode(false)}
            className="text-xs font-bold underline cursor-pointer hover:text-amber-900"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Offline Tile Source Clarification Notice & Emergency Service Protocol */}
      <div className="p-2.5 px-3.5 rounded-2xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {mapTileOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          )}
          <span>
            {mapTileOnline
              ? 'OpenStreetMap raster tiles connected. Stored coordinates, resources, and hazard telemetry are cached in local IndexedDB.'
              : 'Network offline: raster tiles show previously loaded grid. Stored coordinates and offline outbox work without connectivity.'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold shrink-0">
          OSM Leaflet v1.9 • IndexedDB v2
        </span>
      </div>

      {/* THREE-COLUMN MAP LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[660px]">
        
        {/* LEFT SIDEBAR: Filters (Col Span 3) */}
        <div className="lg:col-span-3 glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Category Filters
              </h3>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">
              <button onClick={selectAll} className="hover:underline cursor-pointer">All</button>
              <span>•</span>
              <button onClick={clearAll} className="text-slate-400 hover:text-slate-600 cursor-pointer">Clear</button>
            </div>
          </div>

          {/* Availability Filter Chips */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Stock Availability:
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
              <button
                onClick={() => setAvailabilityFilter('all')}
                className={`py-1.5 px-2 rounded-xl border transition-all cursor-pointer ${
                  availabilityFilter === 'all'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAvailabilityFilter('available_only')}
                className={`py-1.5 px-2 rounded-xl border transition-all cursor-pointer ${
                  availabilityFilter === 'available_only'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                Ready Stock
              </button>
              <button
                onClick={() => setAvailabilityFilter('emergency_only')}
                className={`py-1.5 px-2 rounded-xl border transition-all cursor-pointer ${
                  availabilityFilter === 'emergency_only'
                    ? 'bg-red-600 text-white border-red-500 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                Life Safety
              </button>
            </div>
          </div>

          {/* Distinct Category Checkboxes */}
          <div className="space-y-1.5 pt-1">
            {(Object.keys(categoryConfig) as MapFilterCategory[]).map(catKey => {
              const cfg = categoryConfig[catKey];
              const Icon = cfg.icon;
              const isChecked = selectedCategories[catKey];
              const resourceCount = resources.filter(r => getResourceMapCategory(r) === catKey && r.availability !== 'deactivated').length;
              const count = catKey === 'hazards' ? resourceCount + hazardReports.length : resourceCount;

              return (
                <button
                  key={catKey}
                  onClick={() => toggleCategory(catKey)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${
                    isChecked
                      ? 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/30 text-blue-900 dark:text-blue-100 shadow-sm'
                      : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                      style={{ backgroundColor: cfg.pinBg }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{cfg.label}</span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isChecked 
                      ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hazards & Roadblocks Quick Sub-list */}
          <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-amber-900 dark:text-amber-200">
              <span className="flex items-center gap-1.5">
                <Construction className="w-3.5 h-3.5 text-amber-600" />
                Active Hazards ({hazardReports.length})
              </span>
              <button
                onClick={() => setIsReportHazardModalOpen(true)}
                className="text-[10px] text-amber-600 font-bold hover:underline cursor-pointer"
              >
                + Report
              </button>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto">
              {hazardReports.map(h => (
                <button
                  key={h.id}
                  onClick={() => handleFlyToHazard(h)}
                  className={`w-full text-left p-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-start gap-1.5 cursor-pointer ${
                    selectedHazard?.id === h.id
                      ? 'bg-amber-500/20 text-amber-950 dark:text-amber-100 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="mt-0.5">{h.isRoadBlocked ? '🚧' : '⚠️'}</span>
                  <span className="truncate">{h.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mesh Telemetry Notice */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <RadioTower className="w-3.5 h-3.5 text-teal-500" />
              <span>Mesh Coordinates Cache</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              GPS positions are verified by neighborhood volunteers and stored in offline storage.
            </p>
          </div>

        </div>

        {/* CENTER: INTERACTIVE MAP (Col Span 6) */}
        <div className="lg:col-span-6 space-y-3">
          
          {/* Floating Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter pins by name, equipment, medical tags, or neighborhood zone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Leaflet Map Frame */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-2xl bg-slate-100 dark:bg-slate-900 h-[580px]">
            
            <div 
              ref={mapContainerRef} 
              className="w-full h-full z-0" 
              style={{ minHeight: '580px' }}
            />

            {/* Custom Floating Map Overlay Controls */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
              <button
                onClick={handleRecenterDeviceGps}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl border border-blue-400 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                title="Lock on and Center to My Physical Device GPS"
              >
                <Crosshair className="w-4 h-4 text-white animate-pulse" />
                <span className="font-sans">🎯 My Device GPS</span>
              </button>
              <button
                onClick={handleZoomIn}
                className="w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetView}
                className="w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Reset Center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Floating Marker Count Badge */}
            <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md text-white border border-white/20 text-[10px] font-mono font-bold flex flex-wrap items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{filteredResources.length} Resources</span>
              <span>•</span>
              <span className="text-amber-400">{hazardReports.length} Hazards</span>
              <span>•</span>
              <span className="text-emerald-300">{volunteers.length} Volunteers</span>
              {deviceGps && deviceGps.isAcquired && (
                <>
                  <span>•</span>
                  <span className="text-sky-300">
                    🎯 GPS: {deviceGps.latitude.toFixed(3)}°, {deviceGps.longitude.toFixed(3)}° (±{Math.round(deviceGps.accuracy)}m)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Safety Rule Footer */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="leading-relaxed text-[11px]">
              <strong>Safety Mandate:</strong> Nexus strictly visualizes confirmed obstacles. It never calculates automated safe routes or claims uninspected roads are safe. Check with on-ground volunteers before dispatch.
            </p>
          </div>

        </div>

        {/* RIGHT SIDEBAR: Selected Details (Col Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* A. If a Hazard / Roadblock is selected */}
          {selectedHazard ? (
            <div className="glass-card rounded-3xl p-5 border-2 border-amber-500/40 space-y-4 shadow-xl relative overflow-hidden bg-amber-500/[0.03]">
              <div className="flex items-start justify-between gap-2">
                {selectedHazard.verificationTier === 'official_alert' ? (
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    Official Civil Alert
                  </span>
                ) : selectedHazard.verificationTier === 'community_verified' ? (
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Community Verified
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-amber-500" />
                    Unverified Report
                  </span>
                )}

                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  selectedHazard.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {selectedHazard.severity}
                </span>
              </div>

              {/* Title & Coordinates */}
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {selectedHazard.title}
                </h3>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{selectedHazard.locationName}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  GPS: {selectedHazard.latitude.toFixed(4)}, {selectedHazard.longitude.toFixed(4)}
                </div>
              </div>

              {/* Roadblock Status Box */}
              {selectedHazard.isRoadBlocked && (
                <div className="p-3.5 rounded-2xl bg-red-600/10 border border-red-600/30 text-xs space-y-1">
                  <div className="text-[10px] uppercase font-black tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Construction className="w-3.5 h-3.5" />
                    <span>ROAD IMPASSABLE / BLOCKED</span>
                  </div>
                  {selectedHazard.detourNotes && (
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Detour Advisory: {selectedHazard.detourNotes}
                    </div>
                  )}
                  <p className="text-[10px] text-red-700 dark:text-red-300 italic pt-0.5">
                    Nexus never synthesizes automated safe routing. Ground verification is mandatory.
                  </p>
                </div>
              )}

              {/* Stale Data Warning */}
              {isStale(selectedHazard.reportedAt) && (
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-[11px] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>⚠️ Potentially Stale: Reported over 2h ago without ground re-verification.</span>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1 text-xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Ground Situation:
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedHazard.description}
                </p>
              </div>

              {/* Metadata */}
              <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
                <div>Reported by: <strong>{selectedHazard.reportedBy}</strong> ({selectedHazard.reportedAt})</div>
                {selectedHazard.verifiedBy && (
                  <div className="text-emerald-600 font-semibold">
                    Verified by: {selectedHazard.verifiedBy} ({selectedHazard.verifiedAt})
                  </div>
                )}
              </div>

              {/* Actions for Privileged Roles */}
              <div className="pt-2 flex flex-col gap-2">
                {selectedHazard.verificationTier === 'unverified_report' && isPrivileged && (
                  <button
                    onClick={() => verifyHazardReport(selectedHazard.id, currentUser?.fullName || 'Search Lead')}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Hazard on Ground</span>
                  </button>
                )}

                {selectedHazard.status !== 'cleared' && isPrivileged && (
                  <button
                    onClick={() => clearHazardReport(selectedHazard.id)}
                    className="w-full py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Cleared / Reopen Road</span>
                  </button>
                )}

                <button
                  onClick={() => handleFlyToHazard(selectedHazard)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-500" />
                  <span>Center on Hazard</span>
                </button>
              </div>

            </div>
          ) : selectedResource ? (
            /* B. If a Resource is selected */
            <div className="glass-card rounded-3xl p-5 border border-blue-500/30 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Category & Status */}
              <div className="flex items-start justify-between gap-2">
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${categoryConfig[getResourceMapCategory(selectedResource)].bgBadge}`}>
                  {categoryConfig[getResourceMapCategory(selectedResource)].label}
                </span>

                <span className={`text-[10px] font-bold flex items-center gap-1 ${
                  selectedResource.availableQuantity > 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-amber-500'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{selectedResource.availableQuantity > 0 ? 'Operational' : 'Reserved'}</span>
                </span>
              </div>

              {/* Title & Coordinates */}
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {selectedResource.name || selectedResource.title}
                </h3>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{getFormattedDistance(selectedResource.latitude, selectedResource.longitude, selectedResource.distance)}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 dark:text-slate-400 truncate">{selectedResource.locationName}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  GPS: {selectedResource.latitude.toFixed(4)}, {selectedResource.longitude.toFixed(4)}
                </div>
              </div>

              {/* Capacity / Available Stock Box */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-500/20 text-xs space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-300">
                  Stock & Availability:
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Available Stock:</span>
                  <strong className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                    {selectedResource.availableQuantity} of {selectedResource.quantity} units
                  </strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Condition: {selectedResource.condition} • {selectedResource.isEmergencyEligible ? 'Life-Safety Eligible' : 'Standard Mutual Aid'}
                </div>
              </div>

              {/* Stale Warning on Resource */}
              {isStale(selectedResource.updatedAt) && (
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-[11px] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>⚠️ Inventory updated over 2h ago.</span>
                </div>
              )}

              {/* Contact Lead Details with Privacy Protection */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Custodian / Owner:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedResource.ownerName}</strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px] capitalize">
                    {selectedResource.verificationStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Contact Line:</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-mono">
                    {isPrivileged ? selectedResource.contactPhone : `${selectedResource.contactPhone.slice(0, 8)}••••`}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Last Updated:</span>
                  </span>
                  <span>{selectedResource.updatedAt}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Access Protocol & Specifications:
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedResource.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (selectedResource.availableQuantity > 0) {
                      borrowResource(selectedResource.id);
                    } else {
                      alert('Item is currently at 0 available stock. You can submit an aid request to queue when restocked.');
                    }
                  }}
                  disabled={selectedResource.availableQuantity <= 0}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedResource.availableQuantity > 0 ? 'Request / Borrow Unit' : 'Stock Reserved'}</span>
                </button>

                <button
                  onClick={() => handleFlyToResource(selectedResource)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-500" />
                  <span>Center Marker on Map</span>
                </button>
              </div>
            </div>
          ) : selectedVolunteer ? (
            /* C. If a Live Volunteer is selected */
            <div className="glass-card rounded-3xl p-5 border border-emerald-500/30 space-y-4 shadow-xl relative overflow-hidden bg-emerald-500/[0.03]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Status & Badge */}
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Live Registered Volunteer
                </span>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {selectedVolunteer.availability === 'available' ? '● On Standby / Ready' : 'On Mission'}
                </span>
              </div>

              {/* Title & Coordinates */}
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {selectedVolunteer.name}
                </h3>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>
                    {getFormattedDistance(
                      selectedVolunteer.latitude, 
                      selectedVolunteer.longitude, 
                      selectedVolunteer.serviceArea || selectedVolunteer.neighborhoodZone
                    )}
                  </span>
                </div>
                {selectedVolunteer.latitude && selectedVolunteer.longitude && (
                  <div className="text-[10px] font-mono text-slate-400">
                    GPS: {selectedVolunteer.latitude.toFixed(4)}, {selectedVolunteer.longitude.toFixed(4)}
                  </div>
                )}
              </div>

              {/* Role & Skills */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300">
                  Role & Assigned Squad
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedVolunteer.role}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedVolunteer.skills.map((s, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Button */}
              <div className="space-y-2 pt-1">
                {selectedVolunteer.phone && (
                  <a
                    href={`tel:${selectedVolunteer.phone}`}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Volunteer: {selectedVolunteer.phone}</span>
                  </a>
                )}

                <button
                  onClick={() => handleFlyToVolunteer(selectedVolunteer)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Center Volunteer on Map</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-6 text-center text-xs text-slate-500">
              Select any map marker or hazard pin to inspect live specifications.
            </div>
          )}

          {/* Quick Disclaimer Card */}
          <div className="p-4 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Civil Defense Complements</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Nexus complements municipal emergency response. In life-threatening emergencies, call 911 immediately.
            </p>
          </div>

        </div>

      </div>

      {/* Resource Registration Modal triggered by clicking the map */}
      <AddResourceModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setPinnedCoords(null);
        }}
        initialCoordinates={pinnedCoords}
      />

    </div>
  );
};

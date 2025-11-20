import React, { useRef, useEffect, useCallback, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L, { LatLngBounds, Map } from 'leaflet';
import 'leaflet-draw';
import parseGeoraster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';

// Fix Leaflet's default icon issues with module bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface GeoTiffLayerProps {
  url: string;
  map: Map | null;
}

const GeoTiffLayer: React.FC<GeoTiffLayerProps> = ({ url, map }) => {
  const layerRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!url || !map) return;

    const fetchAndAddLayer = async () => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(url, {
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch GeoTIFF: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const georaster = await parseGeoraster(arrayBuffer);

        layerRef.current = new GeoRasterLayer({
          georaster,
          opacity: 0.9,
          resolution: 256,
        });

        layerRef.current.addTo(map);

        // Only fit bounds if this is the first layer and we're at default zoom
        if (map.getZoom() === 13) {
          const bounds = layerRef.current.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [20, 20] });
          }
        }

      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error loading GeoTIFF:', error);
        }
      }
    };

    fetchAndAddLayer();

    return () => {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clean up layer
      if (layerRef.current && map) {
        try {
          map.removeLayer(layerRef.current);
        } catch (e) {
          // Layer might already be removed, ignore error
        }
        layerRef.current = null;
      }
    };
  }, [url, map]);

  return null;
};

interface DrawControlProps {
  onAoiSelect: (bounds: number[][]) => void;
  isProcessing: boolean;
  sharedDrawLayerRef: React.MutableRefObject<L.FeatureGroup | null>;
  sharedDrawControlRef: React.MutableRefObject<any>;
  mapId: string;
}

const DrawControl: React.FC<DrawControlProps> = ({
  onAoiSelect,
  isProcessing,
  sharedDrawLayerRef,
  sharedDrawControlRef,
  mapId
}) => {
  const map = useMap();

  useEffect(() => {
    // Create or reuse the shared drawn items layer
    if (!sharedDrawLayerRef.current) {
      sharedDrawLayerRef.current = new L.FeatureGroup();
    }

    const drawnItems = sharedDrawLayerRef.current;
    map.addLayer(drawnItems);

    // Create or reuse the shared draw control
    if (!sharedDrawControlRef.current) {
      sharedDrawControlRef.current = new L.Control.Draw({
        draw: {
          polygon: false,
          marker: false,
          circlemarker: false,
          polyline: false,
          circle: false,
          rectangle: {
            shapeOptions: {
              color: '#0891b2',
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.2
            }
          },
        },
        edit: {
          featureGroup: drawnItems,
          remove: true,
        },
      });
    }

    const drawControl = sharedDrawControlRef.current;

    if (!isProcessing) {
      map.addControl(drawControl);
    }

    // Handle rectangle creation
    const handleDrawCreated = (event: any) => {
      const layer = event.layer;

      // Clear existing rectangles
      drawnItems.clearLayers();

      // Add the new rectangle to the shared layer
      drawnItems.addLayer(layer);

      // Get bounds and notify parent
      const bounds = layer.getBounds();
      onAoiSelect([
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng]
      ]);
    };

    // Handle rectangle deletion
    const handleDrawDeleted = () => {
      onAoiSelect([]);
    };

    map.on(L.Draw.Event.CREATED, handleDrawCreated);
    map.on(L.Draw.Event.DELETED, handleDrawDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleDrawCreated);
      map.off(L.Draw.Event.DELETED, handleDrawDeleted);

      // Only remove control if this is the primary map (map A)
      if (mapId === 'A') {
        try {
          if (map.hasControl(drawControl)) {
            map.removeControl(drawControl);
          }
        } catch (e) {
          /* ignore */
        }
      }

      // Don't remove the shared layer as it's used by both maps
    };
  }, [map, isProcessing, onAoiSelect, sharedDrawLayerRef, sharedDrawControlRef, mapId]);

  return null;
};

interface MapViewProps {
  imageAUrl: string | null;
  imageBUrl: string | null;
  processedImageUrls: { a: string, b: string } | null;
  onAoiSelect: (bounds: number[][]) => void;
  isProcessing: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  imageAUrl,
  imageBUrl,
  processedImageUrls,
  onAoiSelect,
  isProcessing
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const mapARef = useRef<Map>(null);
  const mapBRef = useRef<Map>(null);

  const [mapA, setMapA] = useState<Map | null>(null);
  const [mapB, setMapB] = useState<Map | null>(null);

  // Shared references for drawing layer and control
  const sharedDrawLayerRef = useRef<L.FeatureGroup | null>(null);
  const sharedDrawControlRef = useRef<any>(null);

  // Sync flags to prevent infinite loops
  const syncFlagsRef = useRef({ syncAtoB: false, syncBtoA: false });

  // Debounced map synchronization
  const syncMaps = useCallback((source: Map, target: Map) => {
    const center = source.getCenter();
    const zoom = source.getZoom();
    target.setView(center, zoom, { animate: false });
  }, []);

  const handleMapSync = useCallback((sourceMap: Map, targetMap: Map, direction: 'AtoB' | 'BtoA') => {
    const flags = syncFlagsRef.current;

    // Prevent infinite sync loops
    if (direction === 'AtoB' && flags.syncAtoB) return;
    if (direction === 'BtoA' && flags.syncBtoA) return;

    if (direction === 'AtoB') {
      flags.syncAtoB = true;
    } else {
      flags.syncBtoA = true;
    }

    syncMaps(sourceMap, targetMap);

    // Reset flag after a short delay
    setTimeout(() => {
      if (direction === 'AtoB') {
        flags.syncAtoB = false;
      } else {
        flags.syncBtoA = false;
      }
    }, 150);
  }, [syncMaps]);

  useEffect(() => {
    const mapAInstance = mapARef.current;
    const mapBInstance = mapBRef.current;

    if (!mapAInstance || !mapBInstance) return;

    const syncHandlerA = () => handleMapSync(mapAInstance, mapBInstance, 'AtoB');
    const syncHandlerB = () => handleMapSync(mapBInstance, mapAInstance, 'BtoA');

    // Add sync events
    mapAInstance.on('moveend zoomend', syncHandlerA);
    mapBInstance.on('moveend zoomend', syncHandlerB);

    // Initial sync
    if (!mapAInstance.getCenter().equals(mapBInstance.getCenter()) ||
      mapAInstance.getZoom() !== mapBInstance.getZoom()) {
      handleMapSync(mapAInstance, mapBInstance, 'AtoB');
    }

    return () => {
      mapAInstance.off('moveend zoomend', syncHandlerA);
      mapBInstance.off('moveend zoomend', syncHandlerB);
    };
  }, [mapA, mapB, handleMapSync]);

  // Handle map initialization
  useEffect(() => {
    if (mapA && mapB) {
      // Small delay to ensure maps are fully rendered
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mapA, mapB]);

  const displayUrlA = processedImageUrls?.a || imageAUrl;
  const displayUrlB = processedImageUrls?.b || imageBUrl;

  return (
    <div className="split-view-container relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-300 text-sm">Initializing maps...</p>
          </div>
        </div>
      )}
      <div className="map-panel">
        <MapContainer
          ref={(instance) => {
            mapARef.current = instance;
            setMapA(instance);
          }}
          center={[51.505, -0.09]}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          {displayUrlA && <GeoTiffLayer url={displayUrlA} map={mapA} />}
          <DrawControl
            onAoiSelect={onAoiSelect}
            isProcessing={isProcessing}
            sharedDrawLayerRef={sharedDrawLayerRef}
            sharedDrawControlRef={sharedDrawControlRef}
            mapId="A"
          />
        </MapContainer>
        <div className="map-overlay">
          {processedImageUrls ? 'Image A (Clipped)' : 'Image A (Reference)'}
        </div>
      </div>
      <div className="map-panel">
        <MapContainer
          ref={(instance) => {
            mapBRef.current = instance;
            setMapB(instance);
          }}
          center={[51.505, -0.09]}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          {displayUrlB && <GeoTiffLayer url={displayUrlB} map={mapB} />}
          <DrawControl
            onAoiSelect={onAoiSelect}
            isProcessing={isProcessing}
            sharedDrawLayerRef={sharedDrawLayerRef}
            sharedDrawControlRef={sharedDrawControlRef}
            mapId="B"
          />
        </MapContainer>
        <div className="map-overlay">
          {processedImageUrls ? 'Image B (Clipped & Aligned)' : 'Image B (To Align)'}
        </div>
      </div>
    </div>
  );
};

export default MapView;

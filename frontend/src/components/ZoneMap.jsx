import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Using dark map tiles for the techy theme style
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const zoneCoordinates = {
    'Zone A': [22.7196, 75.8577], // Indore
    'Zone B': [19.0760, 72.8777], // Mumbai
    'Zone C': [12.9716, 77.5946], // Bangalore
};

export const ZoneMap = ({ role = 'admin', zoneFilter = 'All', externalReports = null }) => {
    const [reports, setReports] = useState([]);
    const [zoneStatuses, setZoneStatuses] = useState({});

    useEffect(() => {
        if (externalReports) {
            setReports(externalReports);
        }

        const fetchGeoData = async () => {
            try {
                const repRoute = role === 'engineer' ? '/reports/engineer' : '/reports';
                const [repRes, zoneRes] = await Promise.all([
                    api.get(repRoute),
                    api.get('/sensor-data/zones')
                ]);

                if (!externalReports) setReports(repRes.data);

                // Map the backend Zone collection into a status dictionary
                const statuses = {};
                zoneRes.data.forEach(z => {
                    statuses[z.zoneName] = z.status;
                });
                setZoneStatuses(statuses);

            } catch (err) {
                console.error("Map data load failed", err);
            }
        };
        fetchGeoData();

        socket.on('zone_update', (data) => {
            setZoneStatuses(prev => ({
                ...prev,
                [data.zoneName]: data.status
            }));
        });

        return () => socket.off('zone_update');
    }, [role, externalReports]);

    const center = (zoneFilter !== 'All' && zoneCoordinates[zoneFilter]) ? zoneCoordinates[zoneFilter] : [20.5937, 78.9629];
    const zoom = zoneFilter !== 'All' ? 12 : 5;

    const allKnownZones = Object.keys(zoneCoordinates);

    const getZoneColor = (status) => {
        if (status === 'Critical') return '#ff4d6d'; // Red
        if (status === 'Warning') return '#ffd166'; // Yellow
        return '#00f5d4'; // Normal Green
    };

    return (
        <div style={{ height: '400px', width: '100%', position: 'relative', zIndex: 0 }}>
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />

                {/* Render Zone Status Regions */}
                {allKnownZones.map(zoneName => {
                    const coords = zoneCoordinates[zoneName];
                    const currentStatus = zoneStatuses[zoneName] || 'Normal';
                    const color = getZoneColor(currentStatus);

                    return (
                        <Circle
                            key={`zone-status-${zoneName}`}
                            center={coords}
                            radius={40000} // Radius large enough to be clearly visible
                            pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 2 }}
                        >
                            <Popup>
                                <div style={{ color: '#fff', fontSize: '13px' }}>
                                    <strong style={{ color }}>{zoneName}</strong><br />
                                    Risk Status: <strong style={{ color }}>{currentStatus}</strong>
                                </div>
                            </Popup>
                        </Circle>
                    );
                })}

                {/* Render Specific Incident Markers */}
                {reports.filter(r => r.status !== 'Resolved' && (zoneFilter === 'All' || r.location === zoneFilter)).map((report) => {
                    const base = zoneCoordinates[report.location] || [20, 78];
                    const offsetLat = base[0] + (Math.random() - 0.5) * 0.2;
                    const offsetLng = base[1] + (Math.random() - 0.5) * 0.2;

                    return (
                        <Marker key={report._id} position={[offsetLat, offsetLng]}>
                            <Popup>
                                <div style={{ color: '#fff', fontSize: '12px' }}>
                                    <strong style={{ color: '#ff4d6d' }}>Anomaly:</strong> {report.problemType}<br />
                                    <strong>Sector:</strong> {report.location} <br />
                                    <strong>Status:</strong> {report.status} <br />
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default ZoneMap;

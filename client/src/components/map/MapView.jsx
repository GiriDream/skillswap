import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const tutorIcon = new L.DivIcon({
  className: '',
  html: `<div style="background:#E8A33D;width:16px;height:16px;border-radius:50%;border:3px solid #F2EFE6;box-shadow:0 0 0 2px #20292B;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const meIcon = new L.DivIcon({
  className: '',
  html: `<div style="background:#6B8F71;width:18px;height:18px;border-radius:50%;border:3px solid #F2EFE6;box-shadow:0 0 0 2px #20292B;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

function MapView({ userCoords, matches }) {
  if (!userCoords) return null;

  return (
    <div className="h-[320px] md:h-[500px] w-full">
      <MapContainer
        center={[userCoords.latitude, userCoords.longitude]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />

        <Marker position={[userCoords.latitude, userCoords.longitude]} icon={meIcon}>
          <Popup>You are here</Popup>
        </Marker>

        {matches.map((m) => (
          <Marker
            key={m._id}
            position={[m.location.coordinates[1], m.location.coordinates[0]]}
            icon={tutorIcon}
          >
            <Popup>
              <strong>{m.name}</strong><br />
              Teaches: {m.skillsToTeach.join(', ')}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configuración de íconos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const HospitalMap = () => {
  const [data, setData] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showSpecialties, setShowSpecialties] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [hospitalsData, setHospitalsData] = useState({});
  const mapRef = useRef(null);

  // Datos ficticios de especialidades (sin coordenadas)
  const specialtiesTemplate = {
    "SISOL Salud Ate": [
      { name: "Cardiología", doctorsNeeded: 2 },
      { name: "Pediatría", doctorsNeeded: 3 },
      { name: "Ginecología", doctorsNeeded: 1 },
      { name: "Traumatología", doctorsNeeded: 4 },
      { name: "Neurología", doctorsNeeded: 2 }
    ],
    "Hospital Nacional Edgardo Rebagliati Martins": [
      { name: "Oncología", doctorsNeeded: 3 },
      { name: "Dermatología", doctorsNeeded: 1 },
      { name: "Oftalmología", doctorsNeeded: 2 },
      { name: "Psiquiatría", doctorsNeeded: 1 },
      { name: "Urología", doctorsNeeded: 2 }
    ]
  };

  // Procesar datos GEOJSON y combinar con especialidades
  const processHospitalData = useCallback((geoJsonData) => {
    const processedData = {};
    
    geoJsonData.features.forEach(feature => {
      const name = feature.properties.name;
      processedData[name] = {
        specialties: specialtiesTemplate[name] || [],
        coordinates: [
          feature.geometry.coordinates[1], // Lat
          feature.geometry.coordinates[0]  // Lng
        ]
      };
    });
    
    return processedData;
  }, []);

  useEffect(() => {
    fetch('/data/lima_hospitals.geojson')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setHospitalsData(processHospitalData(json));
      });
  }, [processHospitalData]);

  // Buscador
  useEffect(() => {
    if (searchTerm.length > 2) {
      const results = Object.keys(hospitalsData).filter(name =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, hospitalsData]); // Ahora incluye hospitalsData

  const handleMarkerClick = useCallback((feature) => {
    const hospitalName = feature.properties.name;
    updateSelectedHospital(hospitalName);
  }, [hospitalsData]);

  const updateSelectedHospital = (hospitalName) => {
    if (hospitalsData[hospitalName]) {
      setSelectedHospital({
        name: hospitalName,
        specialties: hospitalsData[hospitalName].specialties,
        coordinates: hospitalsData[hospitalName].coordinates
      });
      setShowSpecialties(false);
      setSearchTerm(hospitalName);
      setSuggestions([]);
    }
  };

  const handleSearchSelect = useCallback((hospitalName) => {
    updateSelectedHospital(hospitalName);
    
    if (mapRef.current && hospitalsData[hospitalName]?.coordinates) {
      mapRef.current.flyTo(hospitalsData[hospitalName].coordinates, 16, {
        duration: 1
      });
    }
  }, [hospitalsData]);

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* Barra de búsqueda */}
      <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Buscar hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '25px',
              outline: 'none',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          />
          {suggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '0 0 5px 5px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              margin: 0,
              padding: 0,
              listStyle: 'none',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
              {suggestions.map((hospital, index) => (
                <li
                  key={index}
                  onClick={() => handleSearchSelect(hospital)}
                  style={{
                    padding: '10px 20px',
                    cursor: 'pointer',
                    ':hover': {
                      backgroundColor: '#f0f0f0'
                    }
                  }}
                >
                  {hospital}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Mapa */}
        <div style={{ flex: 2, border: '1px solid #ccc', margin: '10px' }}>
          <MapContainer 
            center={[-12.0464, -77.0428]} 
            zoom={11} 
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {data?.features?.map((feature) => {
              const { coordinates } = feature.geometry;
              const { name, id } = feature.properties;
              return (
                <Marker
                  key={id || name}
                  position={[coordinates[1], coordinates[0]]}
                  eventHandlers={{
                    click: () => handleMarkerClick(feature),
                  }}
                >
                  <Popup>{name}</Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Información del Centro de Salud */}
        <div style={{ 
          flex: 1, 
          border: '1px solid #ccc', 
          margin: '10px', 
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflowY: 'auto'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Información del Centro de Salud</h2>
          
          {selectedHospital ? (
            <div>
              <h3 style={{ 
                color: '#3498db',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px'
              }}>
                {selectedHospital.name}
              </h3>
              
              <button
                onClick={() => setShowSpecialties(!showSpecialties)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  margin: '15px 0',
                  transition: 'all 0.3s'
                }}
              >
                {showSpecialties ? 'Ocultar Especialidades ▲' : 'Mostrar Especialidades ▼'}
              </button>
              
              {showSpecialties && (
                <div style={{ 
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '5px',
                  marginTop: '10px'
                }}>
                  <h4 style={{ marginTop: '0', color: '#2c3e50' }}>Especialidades:</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {selectedHospital.specialties.map((specialty, index) => (
                      <li key={index} style={{ 
                        padding: '10px',
                        marginBottom: '8px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ fontWeight: 'bold', color: '#3498db' }}>{specialty.name}</div>
                        <div style={{ color: '#e74c3c', marginTop: '5px' }}>
                          Doctores faltantes: {specialty.doctorsNeeded}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
              Seleccione un hospital en el mapa o búsquelo arriba
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalMap;
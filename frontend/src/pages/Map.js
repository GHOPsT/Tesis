import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPrediction } from '../services/api';

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
  const [prediction, setPrediction] = useState(null); // 2. Estado para la predicción
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

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

  // Cargar datos desde el backend
  useEffect(() => {
    fetch('http://localhost:5000/api/centro/geojson')  // Nuevo endpoint
      .then(res => res.json())
      .then(json => {
        setData(json);
        setHospitalsData(json.features.reduce((acc, feature) => ({
          ...acc,
          [feature.properties.name]: {
            coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
            district: feature.properties.district  // Asegúrate de que el GeoJSON incluya esto
          }
        }), {}));
      });
  }, []);

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

  // Manejar clic en marcador
  const handleMarkerClick = useCallback(async (feature) => {
    const hospitalName = feature.properties.name;
    const response = await fetch(`/api/predicciones/${hospitalName}/specialties`);
    const specialties = await response.json();
    
    setSelectedHospital({
      name: hospitalName,
      specialties,
      coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
      district: feature.properties.district
    });
  }, []);

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
  }, [hospitalsData, updateSelectedHospital]);

   // Nueva función para manejar la tecla Enter
   const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      e.preventDefault();
      
      // Buscar el hospital que mejor coincida
      const matchedHospital = Object.keys(hospitalsData).find(name =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (matchedHospital) {
        handleSearchSelect(matchedHospital);
      } else {
        // Mostrar mensaje si no se encuentra
        alert('Hospital no encontrado. Intente con otro nombre.');
      }
    }
  }, [searchTerm, hospitalsData, handleSearchSelect]);

  const handleShowSpecialties = async () => {
    setShowSpecialties(!showSpecialties);
    if (!showSpecialties && selectedHospital) {
      setLoadingPrediction(true);

      // LOG: Verifica qué datos envías al backend
      console.log('Enviando al backend:', {
        year: selectedYear,
        month: selectedMonth,
        centro_salud: selectedHospital.name
      });

      try {
        const result = await fetchPrediction({
          year: selectedYear,
          month: selectedMonth,
          centro_salud: selectedHospital.name
        });

      // LOG: Verifica la respuesta del backend
      console.log('Respuesta del backend:', result);

        setPrediction(result.prediction);
      } catch (e) {
        setPrediction('Error al obtener predicción');

      // LOG: Verifica si hubo un error en la petición
      console.error('Error en la petición de predicción:', e);
      
      }
      setLoadingPrediction(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      flexDirection: 'column',
      fontFamily: '"Segoe UI", Roboto, sans-serif'
    }}>
      {/* Cabecera mejorada */}
      <div style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '15px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ 
            backgroundColor: '#3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
            fontSize: '20px'
          }}>🏥</span>
          Localizador de Hospitales
        </h1>
      </div>
  
      {/* Barra de búsqueda mejorada */}
      <div style={{ 
        padding: '15px',
        backgroundColor: '#3498db',
        borderBottom: '1px solid #2980b9'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="🔍 Buscar hospital por nombre, distrito o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '12px 20px 12px 45px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '30px',
              outline: 'none',
              boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
              background: 'white'
            }}
          />
          {suggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '0 0 10px 10px',
              maxHeight: '250px',
              overflowY: 'auto',
              zIndex: 1000,
              margin: 0,
              padding: 0,
              listStyle: 'none',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}>
              {suggestions.map((hospital, index) => (
                <li
                  key={index}
                  onClick={() => handleSearchSelect(hospital)}
                  style={{
                    padding: '12px 20px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.2s',
                    ':hover': {
                      backgroundColor: '#f5f5f5'
                    },
                    ':last-child': {
                      borderBottom: 'none'
                    }
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#2c3e50' }}>{hospital}</div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#7f8c8d',
                    marginTop: '3px'
                  }}>
                    {hospitalsData[hospital]?.district || 'Lima'} • {hospitalsData[hospital]?.specialties?.length || 0} especialidades
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
  
      <div style={{ 
        display: 'flex', 
        flex: 1,
        backgroundColor: '#f5f7fa'
      }}>
        {/* Mapa mejorado */}
        <div style={{ 
          flex: 2, 
          margin: '15px',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
        }}>
          <MapContainer 
            center={[-12.0464, -77.0428]} 
            zoom={11} 
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                  <Popup style={{
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>{name}</Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
  
        {/* Panel de información mejorado */}
        <div style={{ 
          flex: 1, 
          margin: '15px',
          borderRadius: '10px',
          backgroundColor: 'white',
          boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #eee'
          }}>
            <h2 style={{ 
              color: '#2c3e50',
              margin: '0 0 15px 0',
              paddingBottom: '10px',
              borderBottom: '2px solid #3498db',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '10px' }}>🏥</span>
              Información del Centro
            </h2>
            
            {selectedHospital ? (
              <div>
                <div style={{ 
                  backgroundColor: '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <h3 style={{ 
                    color: '#3498db',
                    margin: '0 0 10px 0',
                    fontSize: '20px'
                  }}>
                    {selectedHospital.name}
                  </h3>
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '15px'
                  }}>
                    <span style={{
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      padding: '5px 10px',
                      borderRadius: '15px',
                      fontSize: '13px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}>
                      📍 {selectedHospital.district || 'Lima'}
                    </span>
                  </div>
                </div>
            {/* AQUÍ AGREGA EL SELECTOR DE AÑO Y MES */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ fontWeight: 500, marginRight: 5 }}>Año:</label>
                    <input
                      type="number"
                      min="2000"
                      max={new Date().getFullYear() + 2}
                      value={selectedYear}
                      onChange={e => setSelectedYear(Number(e.target.value))}
                      style={{ width: 80, padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, marginRight: 5 }}>Mes:</label>
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(Number(e.target.value))}
                      style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleShowSpecialties}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: showSpecialties ? '#e74c3c' : '#2ecc71',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    marginBottom: '15px',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ':hover': {
                      opacity: 0.9
                    }
                  }}
                >
                  {showSpecialties ? (
                    <>
                      <span style={{ marginRight: '8px' }}>▲</span> Ocultar Especialidades
                    </>
                  ) : (
                    <>
                      <span style={{ marginRight: '8px' }}>▼</span> Ver Especialidades ({selectedHospital.specialties?.length || 0})
                    </>
                  )}
                </button>
                
                {showSpecialties && (
                  <div style={{ 
                    backgroundColor: '#f8fafc',
                    padding: '15px',
                    borderRadius: '8px'
                  }}>
                    <h4 style={{ 
                      color: '#2c3e50',
                      margin: '0 0 15px 0',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '8px' }}>🩺</span>
                      Especialidades Médicas
                    </h4>
                    {/* 4. Mostrar la predicción */}
                    <div style={{ marginBottom: '10px', color: '#1976d2', fontWeight: 'bold' }}>
                      {loadingPrediction
                        ? 'Cargando predicción...'
                        : prediction !== null
                          ? `Predicción de especialistas necesarios: ${prediction}`
                          : ''}
                    </div>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0,
                      margin: 0,
                      display: 'grid',
                      gap: '10px'
                    }}>
                      {(selectedHospital.specialties || []).map((specialty, index) => (
                        <li key={index} style={{ 
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          padding: '12px 15px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                          borderLeft: '4px solid #3498db'
                        }}>
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span style={{ 
                              fontWeight: '600', 
                              color: '#2c3e50',
                              fontSize: '15px'
                            }}>
                              {specialty.name}
                            </span>
                            <span style={{
                              backgroundColor: '#ffebee',
                              color: '#e74c3c',
                              padding: '3px 8px',
                              borderRadius: '10px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {specialty.doctorsNeeded} {specialty.doctorsNeeded === 1 ? 'médico faltante' : 'médicos faltantes'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#7f8c8d'
              }}>
                <div style={{ 
                  fontSize: '60px', 
                  marginBottom: '20px',
                  opacity: 0.7
                }}>🏥</div>
                <h3 style={{ 
                  color: '#95a5a6',
                  marginBottom: '15px'
                }}>
                  Información de Hospitales
                </h3>
                <p style={{ 
                  lineHeight: '1.6',
                  marginBottom: '25px'
                }}>
                  Seleccione un hospital en el mapa o realice una búsqueda para ver información detallada sobre especialidades disponibles y necesidades de personal médico.
                </p>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'left'
                }}>
                  <p style={{ 
                    fontWeight: '500',
                    color: '#2c3e50',
                    marginBottom: '10px'
                  }}>
                    Consejo útil:
                  </p>
                  <p style={{ margin: 0 }}>
                    Puede buscar hospitales por nombre, distrito o especialidad médica. Presione Enter para realizar la búsqueda.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalMap;
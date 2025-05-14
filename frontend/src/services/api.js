export const fetchHospitals = async () => {
    const response = await fetch('/api/hospitals');
    return response.json();
};

export const fetchSpecialties = async (hospitalName) => {
    const response = await fetch(`/api/hospitals/${hospitalName}/specialties`);
    return response.json();
};

export const fetchPrediction = async ({ year, month, centro_salud }) => {
    const response = await fetch('/api/predicciones/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year, month, centro_salud }),
    });
    return response.json();
};
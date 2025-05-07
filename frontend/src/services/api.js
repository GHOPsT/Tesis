export const fetchHospitals = async () => {
    const response = await fetch('/api/hospitals');
    return response.json();
};

export const fetchSpecialties = async (hospitalName) => {
    const response = await fetch(`/api/hospitals/${hospitalName}/specialties`);
    return response.json();
};
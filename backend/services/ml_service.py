import json
import os
from models.predictor import predict_specialists, le_centro

print(le_centro.classes_)

def get_centro_by_id(centro_id):
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'lima_hospitals.geojson')
    with open(data_path, encoding='utf-8') as f:
        data = json.load(f)
    for feature in data['features']:
        if (
            feature.get('id') == centro_id or
            feature.get('properties', {}).get('@id') == centro_id or
            feature.get('properties', {}).get('id') == centro_id or
            feature.get('properties', {}).get('name') == centro_id
        ):
            return feature
    return None

def predecir_necesidades(centro_id, especialidad, year, month):
    centro = get_centro_by_id(centro_id)
    if not centro:
        return {"error": "Centro de salud no encontrado."}

    nombre_centro = centro['properties']['ipress']

    # Validar si el centro está en el encoder
    if nombre_centro not in le_centro.classes_:
        return {"error": f"El centro '{nombre_centro}' no está registrado en el modelo."}

    necesidades = predict_specialists(year, month, nombre_centro, especialidad)
    return necesidades
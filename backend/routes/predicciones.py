from flask import Blueprint, request, jsonify
from services.ml_service import predecir_necesidades
import json
import os

predicciones_bp = Blueprint('predicciones', __name__)

@predicciones_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    print("DEBUG DATA:", data)  # Debugging line to check incoming data
    year = data.get('year')
    month = data.get('month')
    centro_salud = data.get('centro_salud')
    especialidad = data.get('especialidad')

    # Validación de campos requeridos
    if None in (year, month, centro_salud, especialidad):
        return jsonify({'error': 'Faltan campos requeridos en la petición'}), 400

    try:
        result = predecir_necesidades(centro_salud, especialidad, year, month)
        if 'error' in result:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@predicciones_bp.route('/especialidades', methods=['GET'])
def listar_especialidades():
    ruta = os.path.join(os.path.dirname(__file__), '..', 'data', 'especialidades.json')
    with open(ruta, encoding='utf-8') as f:
        listar_especialidades = json.load(f)
    return jsonify({'especialidades': listar_especialidades}), 200
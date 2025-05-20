from flask import Blueprint, request, jsonify
from services.ml_service import predecir_necesidades

predicciones_bp = Blueprint('predicciones', __name__)

@predicciones_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    year = data.get('year')
    month = data.get('month')
    centro_salud = data.get('centro_salud')

    result = predecir_necesidades(centro_salud, year, month)
    if 'error' in result:
        return jsonify(result), 400
    return jsonify({'prediction': result})
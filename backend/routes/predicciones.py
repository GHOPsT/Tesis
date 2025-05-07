from flask import Blueprint, jsonify
from services.ml_service import predecir_necesidades

predicciones_bp = Blueprint('predicciones', __name__)

# Endpoint 4: Predecir necesidades para un centro
@predicciones_bp.route('/<int:centro_id>', methods=['GET'])
def predecir(centro_id):
    resultado = predecir_necesidades(centro_id)
    return jsonify({"prediccion": resultado})

# Endpoint 5: Reentrenar modelo (POST con nuevos datos)
@predicciones_bp.route('/entrenar', methods=['POST'])
def entrenar_modelo():
    # ... lógica para retraining
    return jsonify({"status": "Modelo actualizado"})
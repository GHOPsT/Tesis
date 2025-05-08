from flask import Blueprint, jsonify
from services.ml_service import predecir_necesidades

predicciones_bp = Blueprint('predicciones', __name__)

@predicciones_bp.route('/<string:hospital_name>/specialties', methods=['GET'])
def get_specialties(hospital_name):
    """Devuelve especialidades predichas por ML."""
    return jsonify(predecir_necesidades(hospital_name))
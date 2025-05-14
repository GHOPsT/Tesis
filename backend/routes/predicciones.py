from flask import Blueprint, request, jsonify
from models.predictor import predict_specialists

predicciones_bp = Blueprint('predicciones', __name__)

@predicciones_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    year = data.get('year')
    month = data.get('month')
    centro_salud = data.get('centro_salud')

    result = predict_specialists(year, month, centro_salud)
    return jsonify({'prediction': result})
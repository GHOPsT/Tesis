from flask import Blueprint, jsonify
from services.especialidades_service import listar_especialidades

especialidades_bp = Blueprint('especialidades', __name__)

@especialidades_bp.route('/especialidades', methods=['GET'])
def get_especialidades():
    especialidades = listar_especialidades()
    return jsonify({'especialidades': especialidades})
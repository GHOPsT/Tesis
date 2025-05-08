from flask import Blueprint, jsonify, request
import json

centros_bp = Blueprint('centro', __name__)

@centros_bp.route('/geojson', methods=['GET'])
def get_geojson():
    """Devuelve datos GeoJSON de hospitales."""
    try:
        # Cargar el archivo GeoJSON
        with open('data/lima_hospitals.geojson', 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except FileNotFoundError:
        return jsonify({"error": "Archivo GeoJSON no encontrado"}), 404
    except UnicodeDecodeError:
        return jsonify({"error": "Problema de codificación en el archivo"}), 500

@centros_bp.route('/buscar', methods=['GET'])
def buscar_centros():
    """Búsqueda por nombre/distrito (opcional)."""
    query = request.args.get('q')
    # ... lógica de búsqueda en DB
    return jsonify(results)
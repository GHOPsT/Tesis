from flask import Blueprint, jsonify
from services.geo_service import get_centros_cercanos

centros_bp = Blueprint('centros', __name__)

# Endpoint 1: Obtener todos los centros (GeoJSON)
@centros_bp.route('/', methods=['GET'])
def obtener_centros():
    with open('static/data/lima_hospitals.geojson') as f:
        return jsonify(json.load(f))

# Endpoint 2: Buscar centros por nombre
@centros_bp.route('/buscar', methods=['GET'])
def buscar_centros():
    nombre = request.args.get('nombre')
    # ... lógica de búsqueda en DB
    return jsonify(results)

# Endpoint 3: Centros en un radio (Geoespacial)
@centros_bp.route('/cercanos', methods=['POST'])
def centros_cercanos():
    lat = request.json.get('lat')
    lng = request.json.get('lng')
    radio_km = request.json.get('radio')
    centros = get_centros_cercanos(lat, lng, radio_km)
    return jsonify(centros)
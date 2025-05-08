from flask import Flask
from routes.centros import centros_bp
from flask_cors import CORS  # Importar CORS
#from routes.predicciones import predicciones_bp

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas las rutas

# Registrar blueprints
app.register_blueprint(centros_bp, url_prefix='/api/centro')
#app.register_blueprint(predicciones_bp, url_prefix='/api/predicciones')

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Puerto 5000 por defecto
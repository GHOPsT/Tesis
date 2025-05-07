from flask import Flask
from routes.centros import centros_bp
from routes.predicciones import predicciones_bp

app = Flask(__name__)

# Registrar blueprints
app.register_blueprint(centros_bp, url_prefix='/api/centros')
app.register_blueprint(predicciones_bp, url_prefix='/api/predicciones')

if __name__ == '__main__':
    app.run(debug=True)
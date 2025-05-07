from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class CentroSalud(db.Model):
    __tablename__ = 'centros_salud'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    latitud = db.Column(db.Float)
    longitud = db.Column(db.Float)
    historico_pacientes = db.Column(db.JSON)  # Ej: {"2023": 5000, "2022": 4800}
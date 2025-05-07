import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DB_URI', 'postgresql://user:pass@localhost:5432/centros_salud')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
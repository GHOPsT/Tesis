import joblib
import pandas as pd
from models.centro_salud import CentroSalud

# Cargar modelo entrenado
modelo_rf = joblib.load('ml/models/random_forest_model.pkl')

def predecir_necesidades(centro_id):
    # 1. Obtener datos del centro desde DB
    centro = CentroSalud.query.get(centro_id)
    
    # 2. Preparar features para el modelo
    features = pd.DataFrame([{
        'ubicacion': centro.ubicacion,
        'historico_pacientes': centro.historico_pacientes,
        # ... más features
    }])
    
    # 3. Predecir con Random Forest + Algoritmo Genético
    necesidades = modelo_rf.predict(features)
    
    return necesidades
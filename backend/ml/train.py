import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from genetic_algorithm import optimizar_features  # (Implementar aparte)
import joblib

def entrenar_modelo():
    data = pd.read_csv('static/data/dataset_centros.csv')
    
    # Algoritmo genético para selección de features
    features_optimas = optimizar_features(data)
    
    # Entrenar Random Forest
    X = data[features_optimas]
    y = data['necesidades']
    modelo = RandomForestClassifier()
    modelo.fit(X, y)
    
    # Guardar modelo
    joblib.dump(modelo, 'ml/models/random_forest_model.pkl')
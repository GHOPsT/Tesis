from joblib import load

# Carga el modelo y los codificadores de etiquetas guardados
model = load('./ml/modeloRF/modelo_random_forest.pkl')
le_centro = load('./ml/modeloRF/label_encoder_centro.pkl')
le_esp = load('./ml/modeloRF/label_encoder_especialidad.pkl')

def predict_specialists(year, month, centro_salud, especialidad):
    """
    Predice la cantidad de especialistas y especialidades necesarias para un centro de salud,
    dado el año, mes y centro de salud.
    """
    # Codifica el centro de salud usando el label encoder
    centro_encoded = le_centro.transform([centro_salud])[0]
    especialidad_encoded = le_esp.transform([especialidad])[0]
    
    # Prepara los datos de entrada para el modelo
    input_data = [[centro_encoded, especialidad_encoded, month, year]]
    
    # Realiza la predicción
    prediction = model.predict(input_data)
    
    # Si el modelo predice dos valores (especialistas y especialidades)
    # puedes devolver ambos, por ejemplo:
    # return {'especialistas': prediction[0][0], 'especialidades': prediction[0][1]}
    # Si solo predice uno, ajusta según corresponda:
    return prediction[0]
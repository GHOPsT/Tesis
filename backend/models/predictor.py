from joblib import load
import pandas as pd

# Carga el modelo y los codificadores de etiquetas guardados
model = load('./ml/modeloRF/modelo_random_forest.pkl')
le_centro = load('./ml/modeloRF/label_encoder_centro.pkl')
le_esp = load('./ml/modeloRF/label_encoder_especialidad.pkl')

def predict_specialists(year, month, centro_salud, especialidad):
    print("Especialidaddes reconocidas:", le_esp.classes_)
    print("Centros de salud reconocidos:", le_centro.classes_)
    """
    Predice la cantidad de especialistas y especialidades necesarias para un centro de salud,
    dado el año, mes y centro de salud.
    """
    # Validar que los valores existen en los encoders
    if centro_salud not in le_centro.classes_:
        return {'error': f'Centro de salud desconocido: {centro_salud}'}
    if especialidad not in le_esp.classes_:
        return {'error': f'Especialidad desconocida: {especialidad}'}

    # Codifica el centro de salud usando el label encoder
    centro_encoded = le_centro.transform([centro_salud])[0]
    especialidad_encoded = le_esp.transform([especialidad])[0]
    
    # Prepara los datos de entrada para el modelo
    input_df = pd.DataFrame([{
        'COD_IPRESS': centro_encoded,
        'DESC_SERVICIO': especialidad_encoded,
        'MES': month,
        'AÑO': year
    }])
    
    # Realiza la predicción
    prediction = model.predict(input_df)
    
    # Si el modelo predice dos valores (especialistas y especialidades)
    # puedes devolver ambos, por ejemplo:
    # return {'especialistas': prediction[0][0], 'especialidades': prediction[0][1]}
    # Si solo predice uno, ajusta según corresponda:
    return {'prediction': int(prediction[0])}
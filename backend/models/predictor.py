from joblib import load
import pandas as pd
import numpy as np

# Carga los modelos y encoders
model_att = load("ml/modeloRFv4/modelo_rf_atenciones.joblib")
model_prof = load("ml/modeloRFv4/modelo_rf_profesionales_cascada.joblib")
le_ipress = load("ml/modeloRFv4/le_ipress_simple.joblib")
le_especialidad = load("ml/modeloRFv4/le_especialidad_simple.joblib")

def predict_specialists(year, month, centro_salud, especialidad):
    # Validar si el centro y la especialidad existen en los encoders
    if centro_salud not in le_ipress.classes_:
        return {"error": f"El centro '{centro_salud}' no está registrado en el modelo."}
    if especialidad not in le_especialidad.classes_:
        return {"error": f"La especialidad '{especialidad}' no está registrada en el modelo."}

    cod_ipress = le_ipress.transform([centro_salud])[0]
    cod_esp = le_especialidad.transform([especialidad])[0]
    X_att = np.array([[year, month, cod_ipress, cod_esp]])
    pred_atenciones = model_att.predict(X_att)[0]
    X_prof = np.array([[year, month, cod_ipress, cod_esp, pred_atenciones]])
    pred_prof = model_prof.predict(X_prof)[0]
    return {"prediction": int(round(pred_prof))}

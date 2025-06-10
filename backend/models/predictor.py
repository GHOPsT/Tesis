from joblib import load
import pandas as pd
import numpy as np

# Carga los modelos y encoders
model_att = load("modeloRFv3/modelo_rf_atenciones.joblib")
model_prof = load("modeloRFv3/modelo_rf_profesionales_cascada.joblib")
le_ipress = load("modeloRFv3/le_ipress_simple.joblib")
le_especialidad = load("modeloRFv3/le_especialidad_simple.joblib")

def predecir_profesionales(anio, mes, ipress, especialidad):
    cod_ipress = le_ipress.transform([ipress])[0]
    cod_esp = le_especialidad.transform([especialidad])[0]
    X_att = np.array([[anio, mes, cod_ipress, cod_esp]])
    pred_atenciones = model_att.predict(X_att)[0]
    X_prof = np.array([[anio, mes, cod_ipress, cod_esp, pred_atenciones]])
    pred_prof = model_prof.predict(X_prof)[0]
    return round(pred_prof)
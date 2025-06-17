from models.predictor import le_especialidad

def listar_especialidades():
    # Devuelve una lista de especialidades únicas, ordenadas alfabéticamente
    return sorted(list(le_especialidad.classes_))
export function formatType(tipo) {
    if (tipo === 'servicio_social') return 'Servicio Social'
    if (tipo === 'practica_profesional') return 'Práctica Profesional'
    if (tipo === 'servicio_y_practica') return 'Servicio y Práctica'
}

export function formatJSON(alumnos) {
    const data = alumnos.map(alumno => ({
        "MATRICULA": alumno.matricula,
        "NOMBRE(S)": alumno.nombres,
        "APELLIDO PATERNO": alumno.apellido_p,
        "APELLIDO MATERNO": alumno.apellido_m,
        "PRESTADOR DE": formatType(alumno.tipo),
        "CARRERA": alumno.carrera,
        "TOTAL DE HORAS": alumno.total_horas
    }))

    return data
}
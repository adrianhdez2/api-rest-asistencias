import { Router } from 'express'
import { AlumnosController } from '../controllers/alumnos.js'

export const alumnosRouter = Router()

alumnosRouter.get('/', AlumnosController.getStudents) // --> Obtener todos los alumnos
alumnosRouter.patch('/', AlumnosController.updateStateById) // --> Actualizar el estado del alumno
alumnosRouter.post('/generate', AlumnosController.generatePasswordAndSend) // --> Generar contraseña y enviar al correo electronico
alumnosRouter.post('/add', AlumnosController.addStudent) // --> Agregar nuevo alumno
alumnosRouter.post('/save', AlumnosController.saveHoursByStudent) // Guardar las horas por alumno
alumnosRouter.post('/update', AlumnosController.insertFinalHour) // Guardar hora final
alumnosRouter.post('/activities', AlumnosController.saveActivities) // --> Guardar actividad del alumno por día
alumnosRouter.get('/get', AlumnosController.getAllDatesStudents) // --> Obtener horas de alumnos activos
alumnosRouter.get('/search', AlumnosController.getStudentsSearchByMatricula) // --> Busqueda de alumnos por matricula
alumnosRouter.post('/hours', AlumnosController.saveHoursByStudentDay) // --> Guardar horas por alumno
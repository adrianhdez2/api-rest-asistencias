import { Router } from 'express'
import { AlumnosController } from '../controllers/alumnos.js'

export const alumnosRouter = Router()

alumnosRouter.get('/', AlumnosController.getStudents) // --> Obtener todos los alumnos
alumnosRouter.patch('/', AlumnosController.updateStateById) // --> Actualizar el estado del alumno
alumnosRouter.post('/generate', AlumnosController.generatePasswordAndSend) // --> Generar contraseña y enviar al correo electronico
alumnosRouter.post('/add', AlumnosController.addStudent) // --> Agregar nuevo alumno
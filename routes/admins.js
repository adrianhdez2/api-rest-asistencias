import { Router } from "express";
import { AdminsControllers } from "../controllers/admins.js";

export const adminsRouter = Router()

adminsRouter.get('/', AdminsControllers.getAdmins) // --> Obtener todos los administradores
adminsRouter.post('/login', AdminsControllers.getLoginToken) // --> Login de administrador
adminsRouter.post('/update', AdminsControllers.updatePasswordAdmin) // --> Actualizar la contraseña de administrador
adminsRouter.get('/verify', AdminsControllers.verifyToken) // --> Verificar el token de usuario
adminsRouter.get('/logout', AdminsControllers.logOut) // --> Cerrar sesion de usuario
adminsRouter.post('/generate', AdminsControllers.generatePasswordAndSend) // --> Generar contraseña y enviar al correo electronico
adminsRouter.get('/admin', AdminsControllers.getIdByToken) // --> Obtener id de sesion de administrador
adminsRouter.post('/add', AdminsControllers.addAdmin) // --> Agregar administrador
adminsRouter.post('/image', AdminsControllers.getImagenById) // --> Obtener imagen de administrador

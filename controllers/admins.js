import { AdminsModel } from "../models/mysql/admins.js";
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { formatJSON } from "../utils/format.js";
import { generatePassword } from '../utils/generate.js'

dotenv.config()

export class AdminsControllers {
    static async getAdmins(req, res) {
        const admins = await AdminsModel.getAll()
        return res.status(200).json(admins)
    }

    static async getAdminByToken(req, res) {
        try {
            const token = req.cookies.token

            const decoded = jwt.verify(token, process.env.KEY)
            const id_admin = decoded.id

            const admin = await AdminsModel.getStateById({ id_admin })

            if (!admin) return res.status(401).json({ error: "No existe administrador." })

            return res.status(200).json(admin)

        } catch (error) {
            return res.status(401).json({ error: "No existe token de usuario." })
        }
    }

    static async getLoginToken(req, res) {
        const { correo, password } = req.body
        const admin = await AdminsModel.getUserByEmail({ correo })

        if (!admin) return res.status(401).json({ error: "Este correo electrónico no existe." })

        const passwordMatch = await bcrypt.compare(password, admin.password)
        if (!passwordMatch) return res.status(401).json({ error: 'La contraseña no es correcta' })

        const token = jwt.sign({ id: admin.id_admin }, process.env.KEY, { expiresIn: '1h' });
        res.cookie("token", token, { httpOnly: true, maxAge: 1 * 60 * 60 * 1000, secure: true });


        return res.status(200).json({ status: true, message: 'Autorizado' })
    }

    static async updatePasswordAdmin(req, res) {
        const { correo, password } = req.body

        const admin = await AdminsModel.getUserByEmail({ correo })

        if (!admin) return res.status(401).json({ error: "Este correo electrónico no existe." })

        const id_admin = admin.id_admin

        const hashedPassword = await bcrypt.hash(password, 10)

        const adminP = await AdminsModel.updatePassword({ hashedPassword, id_admin })

        if (!adminP) return res.status(401).json({ error: "Error al actualizar la contraseña." })

        return res.status(200).json({ status: true, message: "Se actualizó la contraseña correctamente." })

    }

    static async verifyToken(req, res) {
        try {
            const token = req.cookies.token
            if (!token) {
                return res.json({ status: false, message: 'No hay sesión iniciada' })
            }

            return res.json({ status: true, message: "Autorizado" });
        } catch (error) {
            return res.json(error)
        }
    }

    static async logOut(req, res) {
        try {
            const token = req.cookies.token
            if (token) {
                res.clearCookie("token");
                return res.json({ status: true, message: 'Se cerró la sesión' })
            }

            return res.json({ status: false, message: 'Ocurrió un error al cerrar sesión.' })
        } catch (error) {
            return res.status(401).json({ error: "Ocurrió un error al cerrar sesión." })
        }
    }

    static async generatePasswordAndSend(req, res) {
        try {
            const { correo } = req.body
            const admin = await AdminsModel.getUserByEmail({ correo })

            if (!admin) return res.status(401).json({ error: "Este correo electrónico no existe." })

            const password = generatePassword()
            const hashedPassword = await bcrypt.hash(password, 10)
            const id_admin = admin.id_admin

            try {
                await AdminsModel.sendEmail({ correo, password })

                const adminP = await AdminsModel.updatePassword({ hashedPassword, id_admin })

                if (!adminP) return res.status(401).json({ error: "Error al actualizar la contraseña." })

                return res.json({ status: true, message: "Se envió correctamente" });
            } catch (emailError) {
                return res.status(500).json({ error: emailError.message });
            }

        } catch (error) {
            return res.status(404).json({ error: "Ocurrió un error." })
        }
    }


    static async getIdByToken(req, res) {
        try {
            const token = req.cookies.token

            if (!token) return res.status(401).json({ error: "No hay token de usuario" })

            const decoded = jwt.verify(token, process.env.KEY)
            const id_admin = decoded.id

            return res.status(200).json({ id_admin })
        } catch (error) {
            return res.status(404).json({ error: "Ocurrió un error" })
        }
    }

    static async addAdmin(req, res) {
        const { names, last_name_p, last_name_m, correo, imagen } = req.body

        if (!names || !last_name_m || !last_name_p || !correo) return res.status(401).json({ error: "Datos no validos." })

        const admin = await AdminsModel.insertNewAdmin({ names, last_name_p, last_name_m, correo, imagen })

        if (!admin) return res.status(401).json({ error: "Error al insertar los datos del administrador." })

        return res.status(200).json({ status: true, message: "Se guardó correctamente." })
    }

    static async getImagenById(req, res) {
        const { id_admin } = req.body

        if (!id_admin) return res.status(401).json({ error: "No hay id de administrador" })

        const admin = await AdminsModel.getImageById({ id_admin })

        return res.status(200).json(admin)
    }

    static async updateState(req, res) {
        const { estado, id_admin } = req.body

        if (estado < 0 || estado > 1 || estado === undefined || id_admin == undefined) return res.status(401).json({ error: "Los datos no son válidos." })

        const admin = await AdminsModel.getStateById({ id_admin })

        if (!admin) return res.status(401).json({ error: "El valor parece que no es válido." })

        const notifications = AdminsModel.updateState({ estado, id_admin })

        if (!notifications) return res.status(401).json({ error: "Ocurrió un errror al actualizar el estado de notificationes." })

        if (estado === 1) return res.status(200).json({ status: true, message: "Ahora recibirás notificationes." })
        if (estado === 0) return res.status(200).json({ status: true, message: "Dejarás de recibir notificationes." })
    }

    static async getReports(req, res) {
        const { alumno_id, tipo_reporte, alumno_tipo } = req.body

        if (!tipo_reporte || !alumno_id || !alumno_tipo) return res.status(401).json({ error: "Los datos no son validos." })

        if (tipo_reporte === 'lista') {

            if (alumno_tipo === 'servicio_social' || alumno_tipo === 'practica_profesional') {
                const alumnos = await AdminsModel.getStudentsByType({ alumno_tipo })

                if (!alumnos) return res.status(401).json({ error: "No hay estudiantes disponibles." })

                return res.status(200).json({ status: true, message: "Generado", nombre: `Lista_de_alumnos_de_${alumno_tipo}`, tipo: tipo_reporte, data: alumnos })
            }

            if (alumno_tipo === 'servicio_y_practica') {
                const alumnos = await AdminsModel.getAllStudents()
                if (!alumnos) return res.status(401).json({ error: "No hay estudiantes disponibles." })
                return res.status(200).json({ status: true, message: "Generado", nombre: "Lista_general_de_alumnos", tipo: tipo_reporte, data: alumnos })
            }


            return res.status(401).json({ error: "El tipo no existe." })
        }

        if (tipo_reporte === 'horas') {

            if (alumno_tipo === 'servicio_social' || alumno_tipo === 'practica_profesional') {
                const alumnos = await AdminsModel.getHoursStudentsByType({ alumno_tipo })

                if (!alumnos) return res.status(401).json({ error: "No hay estudiantes disponibles." })
                const data = formatJSON(alumnos)
                return res.status(200).json({ status: true, message: "Generado", nombre: `Reporte_de_horas_de_${alumno_tipo}`, tipo: tipo_reporte, data: data })
            }

            if (alumno_tipo === 'servicio_y_practica') {
                const alumnos = await AdminsModel.getAllHoursStudents()
                if (!alumnos) return res.status(401).json({ error: "No hay estudiantes disponibles." })
                const data = formatJSON(alumnos)
                return res.status(200).json({ status: true, message: "Generado", nombre: "Reporte_general_de_horas", tipo: tipo_reporte, data: data })
            }


            return res.status(401).json({ error: "El tipo no existe." })
        }

        if (tipo_reporte === 'actividades') {
            const alumno = await AdminsModel.getStudentById({ alumno_id })
            if (!alumno) return res.status(401).json({ error: "El id de usuario no es valido." })

            const actividades = await AdminsModel.getActivitiesByStudentId({ alumno_id })
            if (!actividades) return res.status(401).json({ error: "El alumno aún no ha generado actividades." })

            const fileName = `${alumno.matricula}_${alumno.nombres}_${alumno.apellido_p}_${alumno.apellido_m}`



            return res.status(200).json({ status: true, message: "Generado", nombre: fileName, tipo: tipo_reporte, data: actividades });
        }

        return res.status(401).json({ error: "El tipo no existe." })
    }
}


import { AlumnosModel } from "../models/mysql/alumnos.js";
import bcrypt from 'bcrypt'
import Randomstring from 'randomstring'

function generatePassword() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*()_+?';
    return Randomstring.generate({
        length: 10,
        charset: caracteres
    });
}

export class AlumnosController {
    static async getStudents(req, res) {
        const { estado, limite, pagina } = req.query

        if (estado && limite && pagina) {
            const page = parseInt(pagina)
            const limit = parseInt(limite)
            const offset = (page - 1) * limit

            const count = await AlumnosModel.counttStudents()
            const alumnos = await AlumnosModel.getStudentsByPaginationAndState({ estado, limit, offset })
            const totalPages = Math.ceil(count[0].total / limit)
            return res.status(200).json({ alumnos, totalPages })
        }

        if (estado && limite) {
            const limit = parseInt(limite)
            const alumnos = await AlumnosModel.getStudenByLimitAndState({ estado, limit })
            return res.status(200).json(alumnos)
        }

        if (pagina && limite) {
            const page = parseInt(pagina)
            const limit = parseInt(limite)
            const offset = (page - 1) * limit
            const alumnos = await AlumnosModel.getStudentsByPagination({ limit, offset })
            return res.status(200).json(alumnos)
        }

        if (estado) {
            const alumnos = await AlumnosModel.getStudentByState({ estado })
            return res.status(200).json(alumnos)
        }

        if (limite) {
            const limit = parseInt(limite)
            const alumnos = await AlumnosModel.getStudentLimit({ limit })
            return res.status(200).json(alumnos)
        }

        const alumnos = await AlumnosModel.getStudents()
        return res.status(200).json(alumnos)
    }

    static async updateStateById(req, res) {
        const { id_estudiante, estado } = req.body

        if (!id_estudiante || estado === undefined) return res.status(401).json({ error: 'Los datos solicitados son incorrectos.' })

        const alumno = await AlumnosModel.updateState({ id_estudiante, estado })

        if (!alumno) return res.status(401).json({ error: 'Ocurrió un error al actualizar el estado del alumno.' })

        return res.status(200).json({ status: true, message: 'Se actualizó correctamente.' })
    }

    static async generatePasswordAndSend(req, res) {
        try {
            const { id_estudiante } = req.body

            if (!id_estudiante) return res.status(401).json({ error: "No hay id valido." })

            const alumno = await AlumnosModel.getStudentById({ id_estudiante })

            if (alumno.length === 0) return res.status(404).json({ error: "No hay alumnos disponibles." })



            const password = generatePassword()
            const hashedPassword = await bcrypt.hash(password, 10)
            const correo = alumno.matricula + '@alumno.ujat.mx'

            try {
                await AlumnosModel.sendEmail({ correo, password })

                const adminP = await AlumnosModel.updatePassword({ hashedPassword, id_estudiante })

                if (!adminP) return res.status(401).json({ error: "Error al actualizar la contraseña." })

                return res.json({ status: true, message: "Se envió correctamente" });
            } catch (emailError) {
                return res.status(500).json({ error: emailError.message });
            }

        } catch (error) {
            return res.status(404).json({ error: "Ocurrió un error." })
        }
    }

    static async addStudent(req, res) {
        const { names, last_name_p, last_name_m, matricula, carrera, tipo } = req.body

        if (!names || !last_name_m || !last_name_p || !matricula || !carrera || !tipo) return res.status(401).json({ error: "Datos no validos." })

        const alumno = await AlumnosModel.insertNewStudent({ names, last_name_p, last_name_m, matricula, carrera, tipo })

        if (!alumno) return res.status(401).json({ error: "Error al insertar los datos del alumno." })

        return res.status(200).json({ status: true, message: "Se guardó correctamente." })
    }
}
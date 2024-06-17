import { AlumnosModel } from "../models/mysql/alumnos.js";
import bcrypt from 'bcrypt'
import { validateHours } from "../utils/validateHours.js";
import { generateDate, generateHour, generatePassword, generateOTP } from "../utils/generate.js";
import { validateExpiresOTP } from "../utils/validateExpiresOTP.js";

function getRandomNumber(total) {
    return Math.floor(Math.random() * total);
}

export class AlumnosController {
    static async getStudents(req, res) {
        const { estado, limite, pagina } = req.query

        if (estado && limite && pagina) {
            const page = parseInt(pagina)
            const limit = parseInt(limite)
            const offset = (page - 1) * limit

            const count = await AlumnosModel.countStudents()
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

    static async saveHoursByStudent(req, res) {
        const { matricula, password } = req.body

        if (!matricula || !password) return res.status(401).json({ error: "Datos incompletos." })

        const newMatricula = matricula.toUpperCase()

        const alumno = await AlumnosModel.getStudentByMatricula({ newMatricula })

        if (!alumno) return res.status(401).json({ error: "No existe la matrícula solicitada." })

        if (alumno.estado === 0) return res.status(401).json({ error: "La matrícula no esta activa. Acércate con un administrador." })

        if (!alumno.password) return res.status(401).json({ error: "Esta matrícula no tiene un contraseña asociada. Acércate a un administrador y solicitala." })

        const passwordMatch = await bcrypt.compare(password, alumno.password)

        if (!passwordMatch) return res.status(401).json({ error: "La contraseña no es correcta." })

        const id_estudiante = alumno.id_estudiante

        const horas = await AlumnosModel.getHoursById({ id_estudiante }) // --> Obtener horas si la fecha es de hoy y corresponde al alumno
        const nombre = alumno.nombres + " " + alumno.apellido_p + " " + alumno.apellido_m
        const correo = await AlumnosModel.getEmailAdminsActive()
        const correoRandom = await correo[getRandomNumber(correo.length)].correo
        console.log(correoRandom);

        if (horas) {

            if (horas.hora_salida) return res.status(404).json({ error: "Ya haz registrado tu hora de salida." })

            const { hours, minutes, seconds } = validateHours(horas.hora_entrada) // --> Obtener tiempo transcurrido

            if (hours >= 4) {
                try {
                    const OTP = generateOTP()
                    const expires_at = new Date(Date.now() + 20 * 60 * 1000);
                    const userInf = await AlumnosModel.saveOTP({ newMatricula, OTP, expires_at })

                    if (!userInf) return res.status(401).json({ error: "Ocurrio un error al guardar el código" })

                    await AlumnosModel.sendEmailOTP({ correoRandom, OTP, newMatricula, nombre })

                    const admin = await AlumnosModel.getAdminNameByEmail({ correoRandom })
                    const nombreAdmin = admin.nombres + " " + admin.apellido_p + " " + admin.apellido_m

                    return res.status(200).json({ status: 200, id_hora: horas.id_hora, message_email: `El código de validación para ${newMatricula} fue enviado a ${nombreAdmin}` })
                } catch (error) {
                    return res.status(404).json({ error: "Ocurrió un error." })
                }
            }

            const newHours = hours < 10 ? '0' + hours : hours
            const newMinutes = minutes < 10 ? '0' + minutes : minutes
            const newSeconds = seconds < 10 ? '0' + seconds : seconds


            return res.status(401).json({ error: `Aún no haz cumplido las horas establecidas del día. Hasta el momento llevas: ${newHours}:${newMinutes}:${newSeconds}` })
        }

        const { year, month, day } = generateDate()
        const { hours, minutes, seconds } = generateHour()
        const fecha = year + '-' + month + '-' + day
        const hora_entrada = hours + ':' + minutes + ':' + seconds

        const horaEntrada = await AlumnosModel.insertHourEnter({ id_estudiante, fecha, hora_entrada })

        if (!horaEntrada) return res.status(404).json({ error: "Ocurrió un errror al guarda la hora." })

        const emailsAdmins = await AlumnosModel.getAllEmailAdmins()

        await emailsAdmins.forEach(email => {
            let correoAdmin = email.correo
            AlumnosModel.sendEmailNotification({ correoAdmin, nombre, newMatricula, hora_entrada, fecha })
        })

        return res.status(200).json({ status: true, message: `Se guardó correctamente la hora de entrada: ${hora_entrada}` })
    }

    static async insertFinalHour(req, res) {
        const { id_hora, hora_salida, matricula } = req.body.studentValues
        const { otp } = req.body
        const newMatricula = matricula.toUpperCase()
        const otpAdmin = await AlumnosModel.getOTP({ newMatricula, otp })

        if (!otpAdmin) return res.status(401).json({ error: "El código no es valido." })

        const { has_expire } = validateExpiresOTP(`${otpAdmin.expires_at}`)

        if (has_expire) return res.status(401).json({ status: 'resend', error: "El código ha expirado." })

        const alumno = await AlumnosModel.getStudentByMatricula({ newMatricula })

        if (!alumno) return res.status(401).json({ error: "La matricula no es correcta." })

        const id_estudiante = alumno.id_estudiante

        const horas = await AlumnosModel.getHoursById({ id_estudiante })

        if (!horas) res.status(401).json({ error: "No hay horas disponibles." })

        if (!horas.hora_entrada) return res.status(401).json({ error: "Por favor registra tu entrada." })

        const { hours } = validateHours(horas.hora_entrada)
        const total_horas = hours

        const newHours = await AlumnosModel.updateFinalHour({ id_hora, hora_salida, total_horas })

        if (!newHours) return res.status(401).json({ error: "Ocurrió un error al guardar tu hora de salida." })

        const id_otp = otpAdmin.id_otp

        const otp_code = await AlumnosModel.deleteOTP({ id_otp })

        if (!otp_code) return res.status(401).json({ error: "Ocurrio error al eliminar el codigo otp." })

        return res.status(200).json({ status: true, message: "Se verificó correctamente." });
    }

    static async saveActivities(req, res) {
        const { detalles, matricula } = req.body

        if (!detalles || !matricula) return res.status(401).json({ error: "Los datos no son correctos." })

        const newMatricula = matricula.toUpperCase()

        const alumno = await AlumnosModel.getStudentByMatricula({ newMatricula })

        if (!alumno) return res.status(401).json({ error: "La matrícula no es correcta." })

        const { year, month, day } = generateDate()
        const fecha = year + '-' + month + '-' + day
        const id_estudiante = alumno.id_estudiante

        const actividades = await AlumnosModel.getActivityByStudent({ id_estudiante })

        if (actividades) return res.status(401).json({ error: "Ya tienes tu actividad diaria guadada." })

        const actividad = await AlumnosModel.saveActivity({ detalles, id_estudiante, fecha })

        if (!actividad) return res.status(401).json({ error: "Ocurrió un errro al guardar la actividad." })

        return res.status(200).json({ status: true, message: "Se guardó correctamente tu actividad." })
    }

    static async getAllDatesStudents(req, res) {
        const alumnos = await AlumnosModel.getDate()

        if (!alumnos) return res.status(200).json({})

        return res.status(200).json(alumnos)
    }

    static async getStudentsSearchByMatricula(req, res) {
        const { matricula } = req.query

        if (!matricula) return res.status(401).json({ error: "No hay matricula." })

        const newMatricula = matricula.toUpperCase()

        const alumnos = await AlumnosModel.getSearchTerms({ newMatricula })

        return res.status(200).json(alumnos)
    }

    static async saveHoursByStudentDay(req, res) {
        const { id_estudiante, fecha, hora_entrada, hora_salida, total_horas } = req.body

        if (total_horas <= 0) return res.status(401).json({ error: "Ingresa el menos 1 hora." })

        if (!id_estudiante || !fecha || !hora_entrada || !hora_salida) return res.status(401).json({ error: "Los datos son incorrectos." })

        const alumno = await AlumnosModel.getStudentById({ id_estudiante })

        if (!alumno) return res.status(401).json({ error: "El alumno no existe." })

        const new_total_horas = parseInt(total_horas)

        const horas = await AlumnosModel.saveHours({ id_estudiante, fecha, hora_entrada, hora_salida, new_total_horas })

        if (!horas) return res.status(401).json({ error: "Ocurrió un error al guardar las horas." })

        return res.status(200).json({ status: true, message: "Se guardó correctamente." })
    }
}
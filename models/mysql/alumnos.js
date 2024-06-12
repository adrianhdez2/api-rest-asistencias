import connection from "../../config/db.js";
import { sendPersonalEmail } from '../../utils/sendEmail.js'

export class AlumnosModel {
    static async getStudents() {
        const [alumno] = await connection.query(
            'SELECT id_estudiante, nombres, apellido_p, apellido_m, matricula, carrera, tipo, estado, password from estudiantes'
        )

        if (!alumno) return []

        return alumno
    }

    static async getStudentByState({ estado }) {
        const [alumno] = await connection.query(
            'SELECT id_estudiante, nombres, apellido_p, apellido_m, matricula, carrera, tipo, estado FROM estudiantes WHERE estado = ?',
            [estado]
        )

        if (!alumno) return []

        return alumno
    }

    static async updateState({ id_estudiante, estado }) {
        const [alumno] = await connection.query(
            'UPDATE estudiantes SET estado = ? WHERE id_estudiante = ?',
            [estado, id_estudiante]
        )

        return alumno
    }

    static async getStudentLimit({ limit }) {
        const [alumno] = await connection.query(
            'SELECT id_estudiante, nombres, apellido_p, apellido_m, matricula, carrera, tipo, estado FROM estudiantes LIMIT ?',
            [limit]
        )

        if (!alumno) return []

        return alumno
    }

    static async getStudenByLimitAndState({ estado, limit }) {
        const [alumno] = await connection.query(
            'SELECT id_estudiante, nombres, apellido_p, apellido_m, matricula, carrera, tipo, estado FROM estudiantes WHERE estado = ? LIMIT ?',
            [estado, limit]
        )

        if (!alumno) return []

        return alumno
    }

    static async getStudentsByPagination({ limit, offset }) {
        const [alumno] = await connection.query(
            'SELECT id_estudiante, nombres, apellido_p, apellido_m, matricula, carrera, tipo, estado FROM estudiantes LIMIT ? OFFSET ?',
            [limit, offset]
        )

        if (!alumno) return []

        return alumno
    }

    static async getStudentsByPaginationAndState({ estado, limit, offset }) {
        const [alumno] = await connection.query(
            'SELECT id_estudiante, nombres, apellido_p, apellido_m, matricula, carrera, tipo, estado FROM estudiantes WHERE estado = ? LIMIT ? OFFSET ?',
            [estado, limit, offset]
        )

        if (!alumno) return []

        return alumno
    }

    static async counttStudents() {
        const [count] = await connection.query(
            'SELECT COUNT(*) AS total FROM estudiantes'
        )

        return count
    }

    static async getStudentById({ id_estudiante }) {
        const [alumno] = await connection.query(
            'SELECT nombres, apellido_p, apellido_m, matricula FROM estudiantes WHERE id_estudiante = ?',
            [id_estudiante]
        )
        if (!alumno) return []

        return alumno[0]
    }

    static async getStudentByMatricula({ newMatricula }) {
        const [alumno] = await connection.query(
            'SELECT id_estudiante, nombres, apellido_p, apellido_m, password, estado FROM estudiantes WHERE matricula = ? ',
            [newMatricula]
        )

        if (!alumno) return null

        return alumno[0]
    }

    static async insertNewStudent({ names, last_name_p, last_name_m, matricula, carrera, tipo }) {
        const [alumno] = await connection.query(
            'INSERT INTO estudiantes (nombres, apellido_p, apellido_m, matricula, carrera, tipo) VALUES (?, ?, ?, ?, ?, ?)',
            [names, last_name_p, last_name_m, matricula, carrera, tipo]
        )
        return alumno
    }

    static async updatePassword({ hashedPassword, id_estudiante }) {
        const [alumno] = await connection.query('UPDATE estudiantes SET password = ? WHERE id_estudiante = ?', [hashedPassword, id_estudiante])
        return alumno
    }

    static async sendEmail({ correo, password }) {
        const year = new Date()
        const body = `
        <!DOCTYPE html>
        <html lang="es">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verificar correo electrónico</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }

                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border: 1px solid #dddddd;
                }

                .email-header {
                    text-align: center;
                    padding: 10px 0;
                    background-color: #2B2B2B;
                    color: #ffffff;
                }

                .email-header h1 {
                    margin: 0;
                    font-size: 24px;
                }

                .email-body {
                    padding: 20px;
                    color: #333333;
                }

                .password {
                    text-align: center;
                    padding: 20px 10px;
                    letter-spacing: 2px;
                    font-size: 32px;
                    font-weight: 800;
                }

                .email-footer {
                    text-align: center;
                    padding: 10px;
                    background-color: #f4f4f4;
                    font-size: 14px;
                    color: #888888;
                }

                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    color: #ffffff;
                    background-color: #f68e41;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-bottom: 10px;
                }

                .button:visited {
                    color: #ffffff;
                }

                small {
                    display: block;
                    margin-bottom: 30px;
                }

                .note {
                    color: gray;
                }
            </style>
        </head>

        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>X DevLab</h1>
                </div>
                <div class="email-body">
                    <p>Contraseña para registro de asistencias:</p>
                    <h2 class="password">${password}</h2>
                    <small>Recuerda: tu usuario es tu matrícula.</small>
                    <small>En caso de haber olvidado la contraseña ponerse en contacto con los administradores.</small>
                    <small class="note">Esta contraseña es valida únicamente para el laboratorio.</small>
                </div>
                <div class="email-footer">
                    <p>&copy; ${year.getFullYear()} X DevLab. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>

        </html>
        `
        try {
            const response = await sendPersonalEmail(correo, 'Contraseña para acceso.', body)
            return response
        } catch (error) {
            throw new Error(`Error al enviar el correo: ${error.message}`)
        }
    }

    static async getHoursById({ id_estudiante }) {
        const [horas] = await connection.query(
            'SELECT id_hora, fecha, hora_entrada, hora_salida FROM horas WHERE id_estudiante = ? AND fecha = CURDATE()',
            [id_estudiante]
        )

        if (!horas) return null

        return horas[0]
    }

    static async updateFinalHour({ id_hora, hora_salida, total_horas }) {
        const [hora] = await connection.query(
            'UPDATE horas SET hora_salida = ?, total_horas = ? WHERE id_hora = ?',
            [hora_salida, total_horas, id_hora]
        )

        return hora
    }

    static async insertHourEnter({ id_estudiante, fecha, hora_entrada }) {
        const [hora] = await connection.query(
            'INSERT INTO horas (id_estudiante, fecha, hora_entrada) VALUES (?, ?, ?)',
            [id_estudiante, fecha, hora_entrada]
        )

        return hora
    }

    static async sendEmailOTP({ correo, OTP, newMatricula, nombre }) {
        // const year = new Date()
        const subject = `Código para ${newMatricula} - ${nombre}`
        const body = `<p>El código de validación es: <strong>${OTP}</strong></p>`
        try {
            const response = await sendPersonalEmail(correo, subject, body)
            return response
        } catch (error) {
            throw new Error(`Error al enviar el correo: ${error.message}`)
        }
    }

    static async saveOTP({ newMatricula, OTP, expires_at }) {
        const [alumno] = await connection.query(
            'INSERT INTO otps (matricula, otp, expires_at) VALUES (?, ?, ?)',
            [newMatricula, OTP, expires_at]
        )
        return alumno
    }

    static async getOTP({ newMatricula, otp }) {
        const [otp_code] = await connection.query(
            'SELECT * FROM otps WHERE matricula = ? AND otp = ?',
            [newMatricula, otp]
        )
        if (otp_code.length === 0) return null
        return otp_code[0]
    }

    static async deleteOTP({ id_otp }) {
        const [otp_code] = await connection.query(
            'DELETE FROM otps WHERE id_otp = ?',
            [id_otp]
        )
        return otp_code
    }

    static async saveActivity({ detalles, id_estudiante, fecha }) {
        const [actividad] = await connection.query(
            'INSERT INTO actividades (detalles, id_estudiante, fecha) VALUES (?, ?, ?)',
            [detalles, id_estudiante, fecha]
        )
        return actividad
    }

    static async getActivityByStudent({ id_estudiante }) {
        const [actividades] = await connection.query(
            'SELECT * FROM actividades WHERE id_estudiante = ? AND fecha = CURDATE()',
            [id_estudiante]
        )

        if (!actividades) return null

        return actividades[0]
    }

    static async getDate() {
        const [horas] = await connection.query(
            'SELECT estudiantes.id_estudiante AS id_estudiante_estudiantes, estudiantes.nombres, estudiantes.apellido_p, estudiantes.matricula,estudiantes.apellido_m, estudiantes.tipo, horas.hora_entrada FROM estudiantes JOIN horas	ON estudiantes.id_estudiante = horas.id_estudiante WHERE horas.fecha = CURDATE() AND horas.hora_salida IS NULL'
        )

        if (!horas) return null

        return horas
    }

    static async getSearchTerms({ newMatricula }) {
        const [alumno] = await connection.query(
            'SELECT id_estudiante, nombres, apellido_p, apellido_m, matricula, password, tipo FROM estudiantes WHERE estado = 1 AND matricula LIKE ?',
            [`%${newMatricula}%`]
        )

        if (!alumno) return null

        return alumno
    }

    static async saveHours({id_estudiante, fecha, hora_entrada, hora_salida, new_total_horas}){
        const [horas] = await connection.query(
            'INSERT INTO horas (id_estudiante, fecha, hora_entrada, hora_salida, total_horas) VALUES (?, ?, ?, ?, ?)',
            [id_estudiante, fecha, hora_entrada, hora_salida, new_total_horas]
        )
        return horas 
    }
}
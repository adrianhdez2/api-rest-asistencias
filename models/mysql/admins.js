import connection from '../../config/db.js'
import { sendPersonalEmail } from '../../utils/sendEmail.js'

export class AdminsModel {
    static async getAll() {
        const [admins] = await connection.query('SELECT * FROM admins')
        if (!admins) return []
        return admins
    }

    static async getUserByEmail({ correo }) {
        const [admin] = await connection.query('SELECT id_admin, correo, password FROM admins WHERE correo = ?', [correo])
        if (!admin) return null
        return admin[0];
    }

    static async updatePassword({ hashedPassword, id_admin }) {
        const [admin] = await connection.query('UPDATE admins SET password = ? WHERE id_admin = ?', [hashedPassword, id_admin])
        return admin
    }

    static async insertNewAdmin({ names, last_name_p, last_name_m, correo, imagen }) {
        const [admin] = await connection.query(
            'INSERT INTO admins (nombres, apellido_p, apellido_m, correo, imagen) VALUES (?, ?, ?, ?, ?)',
            [names, last_name_p, last_name_m, correo, imagen ? imagen : null]
        )
        return admin
    }

    static async sendEmail({ correo, password }) {
        const body = `<h1>Tu contraseña de acceso: <strong>${password}</strong></h1>`
        try {
            const response = await sendPersonalEmail(correo, 'Contraseña para acceso', body)
            return response
        } catch (error) {
            throw new Error(`Error al enviar el correo: ${error.message}`)
        }
    }

    static async getImageById({ id_admin }) {
        const [admin] = await connection.query(
            'SELECT imagen FROM admins WHERE id_admin = ?',
            [id_admin]
        )

        if (!admin) return []

        return admin[0]
    }

    static async getStateById({ id_admin }) {
        const [admin] = await connection.query('SELECT id_admin, estado FROM admins WHERE id_admin = ?', [id_admin])
        if (admin.length === 0) return null

        return admin[0]
    }

    static async updateState({ estado, id_admin }) {
        const [admin] = await connection.query('UPDATE admins SET estado = ? WHERE id_admin = ?', [estado, id_admin])

        return admin
    }

    static async getAllStudents() {
        const [alumnos] = await connection.query('SELECT matricula AS MATRICULA, nombres AS "NOMBRE(S)", apellido_p AS "APELLIDO PATERNO", apellido_m AS "APELLIDO MATERNO", carrera AS CARRERA FROM estudiantes WHERE tipo = "practica_profesional" OR estudiantes.tipo = "servicio_social" ORDER BY matricula')
        if (alumnos.length === 0) return null
        return alumnos
    }

    static async getAllHoursStudents() {
        const [alumnos] = await connection.query('SELECT estudiantes.id_estudiante AS id_estudiante_estudiantes, estudiantes.nombres, estudiantes.apellido_p, estudiantes.apellido_m, estudiantes.matricula, estudiantes.tipo, estudiantes.carrera, IFNULL(suma_horas.total_horas, 0) AS total_horas FROM estudiantes LEFT JOIN (SELECT id_estudiante, SUM(total_horas) AS total_horas FROM horas GROUP BY id_estudiante) AS suma_horas ON estudiantes.id_estudiante = suma_horas.id_estudiante WHERE estudiantes.tipo = "practica_profesional" OR estudiantes.tipo = "servicio_social"')
        if (alumnos.length === 0) return null
        return alumnos
    }

    static async getStudentsByType({ alumno_tipo }) {
        const [alumnos] = await connection.query('SELECT matricula AS MATRICULA, nombres AS "NOMBRE(S)", apellido_p AS "APELLIDO PATERNO", apellido_m AS "APELLIDO MATERNO", carrera AS "CARRERA" FROM estudiantes WHERE tipo = ?', [alumno_tipo])
        if (alumnos.length === 0) return null
        return alumnos
    }
    static async getHoursStudentsByType({ alumno_tipo }) {
        const [alumnos] = await connection.query('SELECT estudiantes.id_estudiante AS id_estudiante_estudiantes, estudiantes.nombres, estudiantes.apellido_p, estudiantes.apellido_m, estudiantes.matricula, estudiantes.tipo, estudiantes.carrera, IFNULL(suma_horas.total_horas, 0) AS total_horas FROM estudiantes LEFT JOIN (SELECT id_estudiante, SUM(total_horas) AS total_horas FROM horas GROUP BY id_estudiante) AS suma_horas ON estudiantes.id_estudiante = suma_horas.id_estudiante WHERE estudiantes.tipo = ?', [alumno_tipo])
        if (alumnos.length === 0) return null
        return alumnos
    }

    static async getActivitiesByStudentId({ alumno_id }) {
        const [actividades] = await connection.query('SELECT id_actividad AS "ID ACTIVIDAD", fecha AS FECHA, detalles AS DETALLES FROM actividades WHERE actividades.id_estudiante = ? ORDER BY fecha', [alumno_id])
        if (actividades.length === 0) return null
        return actividades
    }

    static async getStudentById({ alumno_id }) {
        const [alumno] = await connection.query('SELECT matricula, nombres, apellido_p, apellido_m FROM estudiantes WHERE id_estudiante = ?', [alumno_id])
        if (alumno.length === 0) return null
        return alumno[0]
    }
}
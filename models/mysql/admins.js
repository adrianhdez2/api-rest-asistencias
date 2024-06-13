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
        const [admin] = await connection.query('SELECT estado FROM admins WHERE id_admin = ?', [id_admin])
        if (admin.length === 0) return null

        return admin[0]
    }

    static async updateState({ estado, id_admin }) {
        const [admin] = await connection.query('UPDATE admins SET estado = ? WHERE id_admin = ?', [estado, id_admin])

        return admin
    }

}
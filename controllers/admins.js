import { AdminsModel } from "../models/mysql/admins.js";
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { json } from "express";
import jwt from 'jsonwebtoken'
import Randomstring from 'randomstring'

dotenv.config()

function generatePassword() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*()_+?';
    return Randomstring.generate({
        length: 10,
        charset: caracteres
    });
}

export class AdminsControllers {
    static async getAdmins(req, res) {
        const admins = await AdminsModel.getAll()
        return res.status(200).json(admins)
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

            return res.json({ status: false, message: 'Error al cerrar sesión' })
        } catch (error) {
            return res.json(error)
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

        if (!names || !last_name_m || !last_name_p || !correo || !imagen) return res.status(401).json({ error: "Datos no validos." })

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
}
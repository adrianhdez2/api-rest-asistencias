import Randomstring from 'randomstring'

export const generateHour = () => {
    const d = new Date()

    const hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours()
    const minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()
    const seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()

    return { hours, minutes, seconds }
}

export const generateDate = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = d.getMonth() < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
    const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()

    return { year, month, day }
}

export function generatePassword() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*()_+?';
    return Randomstring.generate({
        length: 10,
        charset: caracteres
    });
}

export function generateOTP() {
    return Randomstring.generate({
        length: 6,
        charset: 'numeric'
    });
}
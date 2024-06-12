export const validateHours = (startTime) => {
    const now = new Date();

    // Crear un objeto Date para la hora inicial (hoy a las 15:30:10)
    const start = new Date();
    const [hours, minutes, seconds] = startTime.split(':').map(Number);
    start.setHours(hours, minutes, seconds, 0);  // Establece horas, minutos y segundos

    // Calcular la diferencia en milisegundos
    const diffMilliseconds = now - start;

    // Convertir la diferencia de milisegundos a horas, minutos y segundos
    const diffHours = Math.floor(diffMilliseconds / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMilliseconds % (1000 * 60)) / 1000);

    return {
        hours: diffHours,
        minutes: diffMinutes,
        seconds: diffSeconds
    };
}
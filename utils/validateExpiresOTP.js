export const validateExpiresOTP = (storedDateTime) => {
    const storedDate = new Date(storedDateTime)
    const currentDate = new Date();
    return { has_expire: currentDate > storedDate }
}
import { Buffer } from 'buffer';
import crypto from 'crypto';

export function encryptId(id) {
    const idSecret = import.meta.env.VITE_SECRET_KEY;
    const secretKey = Buffer.from(idSecret, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encrypted = cipher.update(id, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}
export function encryptUserData(userData) {
    const idSecret = import.meta.env.VITE_SECRET_KEY;
    const secretKey = Buffer.from(idSecret, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

    let encrypted = cipher.update(JSON.stringify(userData), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}
export function decryptUserData(encryptedData) {
    const idSecret = import.meta.env.VITE_SECRET_KEY;
    const secretKey = Buffer.from(idSecret, 'hex');

    // Separar el IV de los datos encriptados
    const [ivHex, encryptedHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    // Convertir la cadena JSON de vuelta a un objeto
    return JSON.parse(decrypted);
}
export function decryptId(encryptedId) {
    const idSecret = import.meta.env.VITE_SECRET_KEY;
    if (!idSecret) throw new Error("Secret key is not defined in environment variables.");

    const secretKey = Buffer.from(idSecret, 'hex');
    if (secretKey.length !== 32) throw new Error("Invalid secret key length. Expected 32 bytes.");

    const [ivHex, encryptedText] = encryptedId.split(':');
    if (!ivHex || !encryptedText) throw new Error("Invalid encrypted ID format.");

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
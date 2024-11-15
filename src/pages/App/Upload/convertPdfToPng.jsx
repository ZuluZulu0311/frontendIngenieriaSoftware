
import axios from 'axios';


const convertPdfToPng = async (pdfUrl, apiKey) => {
    try {
        // Primera solicitud para iniciar la conversión
        const response = await axios.post('https://api.pdf.co/v1/pdf/convert/to/png', {
            url: pdfUrl,
            inline: true,
            pages: '0',
            async: true
        }, {
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            }
        });

        console.log('Respuesta inicial:', response.data);

        if (response.data.error) {
            throw new Error(response.data.message);
        }

        const jobId = response.data.jobId;

        // Función para verificar el estado del trabajo
        const checkJobStatus = async () => {
            const statusResponse = await axios.get(`https://api.pdf.co/v1/job/check?jobid=${jobId}`, {
                headers: { 'x-api-key': apiKey }
            });

            console.log('Estado del trabajo:', statusResponse.data);

            if (statusResponse.data.status === 'working') {
                // Espera antes de volver a comprobar el estado
                return new Promise(resolve => setTimeout(resolve, 2000)).then(checkJobStatus);
            } else if (statusResponse.data.status === 'success') {
                // Si está completo, obtenemos la URL de la imagen
                return statusResponse.data.body[0]; // Aquí se obtiene la URL de la imagen
            } else {
                throw new Error('La conversión falló');
            }
        };

        // Iniciamos la verificación del estado
        const imageSrc = await checkJobStatus();
        return imageSrc; // Retornamos la URL de la imagen

    } catch (error) {
        console.error('Error detallado:', error);
        throw new Error(`Error en la conversión: ${error.message}`);
    }
};
export default convertPdfToPng;

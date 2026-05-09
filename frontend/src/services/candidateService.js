import axios from 'axios';

export const uploadCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post('http://localhost:3010/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Devuelve la ruta del archivo y el tipo
    } catch (error) {
        throw new Error('Error al subir el archivo:', error.response.data);
    }
};

export const sendCandidateData = async (candidateData) => {
    try {
        const response = await axios.post('http://localhost:3010/candidates', candidateData);
        return response.data;
    } catch (error) {
        throw new Error('Error al enviar datos del candidato:', error.response.data);
    }
};

// Search candidates by partial first/last name or email match (client-side filter on top of GET /candidates)
export const searchCandidates = async (query) => {
    const response = await axios.get('http://localhost:3010/candidates');
    const body = response.data;
    const candidates = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
            ? body.data
            : [];
    const trimmed = (query ?? '').trim().toLowerCase();
    if (!trimmed) {
        return candidates;
    }
    return candidates.filter((c) => {
        const fullName = `${c.firstName ?? ''} ${c.lastName ?? ''}`.toLowerCase();
        const email = (c.email ?? '').toLowerCase();
        return fullName.includes(trimmed) || email.includes(trimmed);
    });
};
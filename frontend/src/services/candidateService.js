import axios from 'axios';

const API_BASE_URL = 'http://localhost:3010';

export const uploadCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
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
        const response = await axios.post(`${API_BASE_URL}/candidates`, candidateData);
        return response.data;
    } catch (error) {
        throw new Error('Error al enviar datos del candidato:', error.response.data);
    }
};

export const getCandidates = async ({ page = 1, limit = 10, search = '' } = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/candidates`, {
            params: {
                page,
                limit,
                ...(search ? { search } : {})
            }
        });

        const payload = response.data || {};
        return {
            data: Array.isArray(payload.data) ? payload.data : [],
            metadata: payload.metadata || {
                total: 0,
                page,
                limit,
                totalPages: 1
            }
        };
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data?.error || 'Failed to retrieve candidates');
        }
        throw new Error('Network error: Could not retrieve candidates');
    }
};

export const getCandidateById = async (candidateId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/candidates/${candidateId}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data?.error || 'Failed to retrieve candidate details');
        }
        throw new Error('Network error: Could not retrieve candidate details');
    }
};

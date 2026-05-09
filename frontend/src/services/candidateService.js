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

/**
 * Fetch a paginated list of candidates with optional search, sort, and order.
 * Propagates non-2xx errors by re-throwing.
 * @param {{ page?: number, limit?: number, search?: string, sort?: string, order?: string }} params
 * @returns {Promise<{ data: Array, metadata: { total: number, page: number, limit: number, totalPages: number } }>}
 */
export const getCandidates = async ({ page = 1, limit = 10, search = '', sort = 'firstName', order = 'asc' } = {}) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    if (order) params.append('order', order);

    const response = await axios.get(`http://localhost:3010/candidates?${params.toString()}`);
    return response.data;
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
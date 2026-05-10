import axios from 'axios';

const API_BASE_URL = 'http://localhost:3010';

const LEGACY_STATUS_MAP = {
  Contratado: 'Hired',
  Cerrado: 'Closed',
  Borrador: 'Draft',
};

const normalizeStatus = (status) => LEGACY_STATUS_MAP[status] ?? status;

const normalizePosition = (pos) => ({
  ...pos,
  status: normalizeStatus(pos.status),
});

export const positionService = {
  // Get all positions
  getAllPositions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/positions`);
      return response.data.map(normalizePosition);
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  },

  // Get position by ID
  getPositionById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/positions/${id}`);
      return normalizePosition(response.data);
    } catch (error) {
      console.error('Error fetching position:', error);
      throw error;
    }
  },

  // Update position (partial update)
  updatePosition: async (id, positionData) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/positions/${id}`, positionData);
      return response.data;
    } catch (error) {
      console.error('Error updating position:', error);
      const message = error.response?.data?.error ?? error.response?.data?.message ?? error.message ?? 'Error updating position';
      const err = new Error(message);
      throw err;
    }
  },

  removeCandidateFromPosition: async (positionId, candidateId) => {
    try {
      await axios.delete(`${API_BASE_URL}/positions/${positionId}/candidates/${candidateId}`);
    } catch (error) {
      console.error('Error removing candidate from position:', error);
      const message = error.response?.data?.error ?? error.response?.data?.message ?? error.message ?? 'Error removing candidate from position';
      const err = new Error(message);
      throw err;
    }
  },

  // Assign existing candidate to a position
  assignCandidateToPosition: async (positionId, payload) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/positions/${positionId}/candidates`, payload);
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const code = data?.code ?? 'unknown';
      const message = data?.error ?? data?.message ?? error.message ?? 'Error assigning candidate';
      const err = new Error(message);
      err.code = code;
      err.status = error.response?.status;
      throw err;
    }
  },

  // Get candidate ids currently assigned to a position
  getAssignedCandidateIds: async (positionId) => {
    const response = await axios.get(`${API_BASE_URL}/positions/${positionId}/candidates/names`);
    const body = response.data;
    const rows = Array.isArray(body) ? body : [];
    return rows
      .map((row) => Number(row?.candidateId))
      .filter((candidateId) => Number.isInteger(candidateId));
  }
};

export const assignCandidateToPosition = (positionId, payload) =>
  positionService.assignCandidateToPosition(positionId, payload);

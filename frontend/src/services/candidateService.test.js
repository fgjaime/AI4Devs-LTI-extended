jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

const axios = require('axios').default;
const { getCandidateById, getCandidates } = require('./candidateService');

describe('candidateService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns normalized candidate list payload', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        data: [{ id: 1, firstName: 'Ada', lastName: 'Lovelace' }],
        metadata: { total: 1, page: 1, limit: 10, totalPages: 1 }
      }
    });

    const result = await getCandidates({ page: 1, limit: 10, search: 'Ada' });

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3010/candidates', {
      params: { page: 1, limit: 10, search: 'Ada' }
    });
    expect(result.data).toHaveLength(1);
    expect(result.metadata.total).toBe(1);
  });

  it('throws normalized error for candidate list API errors', async () => {
    axios.get.mockRejectedValueOnce({
      response: { data: { error: 'Invalid page number' } }
    });

    await expect(getCandidates({ page: 0 })).rejects.toThrow('Invalid page number');
  });

  it('returns candidate details by id', async () => {
    axios.get.mockResolvedValueOnce({
      data: { id: 5, firstName: 'Grace', lastName: 'Hopper', applications: [] }
    });

    const result = await getCandidateById(5);

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3010/candidates/5');
    expect(result.id).toBe(5);
  });
});

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CandidateProcessDetail from './CandidateProcessDetail';
import { getCandidateById, getCandidates } from '../services/candidateService';

const PAGE_SIZE = 10;

const getProcessStatus = (application) => {
  const interviews = [...(application?.interviews || [])];
  if (!interviews.length) {
    if (application?.currentInterviewStep != null) return 'In Progress';
    return 'No Interviews Yet';
  }

  interviews.sort((a, b) => new Date(b.interviewDate) - new Date(a.interviewDate));
  const lastResult = interviews[0]?.result;

  if (lastResult === 'Passed') return 'Passed';
  if (lastResult === 'Failed') return 'Failed';
  return 'In Progress';
};

const statusVariant = (status) => {
  if (status === 'Passed') return 'success';
  if (status === 'Failed') return 'danger';
  if (status === 'In Progress') return 'primary';
  return 'secondary';
};

const CandidateProcessConsultation = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [metadata, setMetadata] = useState({ page: 1, totalPages: 1, total: 0, limit: PAGE_SIZE });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const [selectedProcess, setSelectedProcess] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getCandidates({ page, limit: PAGE_SIZE, search });
        setCandidates(response.data);
        setMetadata(response.metadata);
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [page, retryCount, search]);

  const openProcessDetail = async (candidateId, applicationId) => {
    setSelectedProcess({ candidateId, applicationId });
    setDetailLoading(true);
    setDetailError(null);
    setSelectedApplication(null);
    setSelectedCandidate(null);

    try {
      const detail = await getCandidateById(candidateId);
      const targetApplication = (detail.applications || []).find(
        (application) => Number(application.id) === Number(applicationId)
      );

      if (!targetApplication) {
        setDetailError('Process detail is not available for this candidate.');
        return;
      }

      setSelectedCandidate(detail);
      setSelectedApplication(targetApplication);
    } catch (fetchError) {
      setDetailError(fetchError.message || 'Failed to load process detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeProcessDetail = () => {
    setSelectedProcess(null);
    setDetailError(null);
    setSelectedApplication(null);
    setSelectedCandidate(null);
  };

  const filteredCandidates = useMemo(() => {
    if (statusFilter === 'all') return candidates;

    return candidates.filter((candidate) =>
      (candidate.applications || []).some((application) => getProcessStatus(application) === statusFilter)
    );
  }, [candidates, statusFilter]);

  const totalCandidatesLabel = useMemo(() => {
    const total = filteredCandidates.length;
    return `${total} ${total === 1 ? 'candidate' : 'candidates'} in view`;
  }, [filteredCandidates]);

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-1">Candidate Process Consultation</h2>
          <small className="text-muted">{totalCandidatesLabel}</small>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate('/')}>
          Back to dashboard
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Search candidates</Form.Label>
                <Form.Control
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name or email"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by process status</Form.Label>
                <Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="No Interviews Yet">No Interviews Yet</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={() => setRetryCount((previous) => previous + 1)}>
            Retry
          </Button>
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Alert variant="info">No candidates found for the current filters.</Alert>
      ) : (
        <Row className="g-3">
          {filteredCandidates.map((candidate) => (
            <Col xs={12} key={candidate.id}>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <h5 className="mb-1">
                        {candidate.firstName} {candidate.lastName}
                      </h5>
                      <div className="text-muted small">{candidate.email}</div>
                      <div className="text-muted small">{candidate.phone || 'No phone number'}</div>
                    </div>
                    <Badge bg="dark">{(candidate.applications || []).length} processes</Badge>
                  </div>

                  <hr />

                  {candidate.applications?.length ? (
                    candidate.applications.map((application) => {
                      const summaryStatus = getProcessStatus(application);
                      return (
                        <div
                          key={application.id}
                          className="border rounded p-2 mb-2 d-flex justify-content-between align-items-start flex-wrap gap-2"
                        >
                          <div>
                            <div>
                              <strong>Position:</strong> {application.position?.title || 'Unknown position'}
                            </div>
                            <div className="small text-muted">
                              <strong>Application date:</strong>{' '}
                              {application.applicationDate
                                ? new Date(application.applicationDate).toLocaleDateString()
                                : '-'}
                            </div>
                            <div className="small text-muted">
                              <strong>Current step:</strong>{' '}
                              {application.currentInterviewStep != null
                                ? `Step #${application.currentInterviewStep}`
                                : 'Not assigned'}
                            </div>
                          </div>

                          <div className="d-flex flex-column align-items-end gap-2">
                            <Badge bg={statusVariant(summaryStatus)}>{summaryStatus}</Badge>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => openProcessDetail(candidate.id, application.id)}
                            >
                              View detail
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <Alert variant="secondary" className="mb-0">
                      This candidate has no process participation yet.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="d-flex justify-content-between align-items-center mt-4">
        <Button variant="outline-secondary" disabled={page <= 1} onClick={() => setPage((previous) => previous - 1)}>
          Previous
        </Button>
        <span className="small text-muted">
          Page {metadata.page || page} of {metadata.totalPages || 1}
        </span>
        <Button
          variant="outline-secondary"
          disabled={(metadata.page || page) >= (metadata.totalPages || 1)}
          onClick={() => setPage((previous) => previous + 1)}
        >
          Next
        </Button>
      </div>

      <CandidateProcessDetail
        show={!!selectedProcess}
        onHide={closeProcessDetail}
        loading={detailLoading}
        error={detailError}
        candidate={selectedCandidate}
        application={selectedApplication}
        processStatus={selectedApplication ? getProcessStatus(selectedApplication) : 'No Interviews Yet'}
      />
    </Container>
  );
};

export default CandidateProcessConsultation;

import React from 'react';
import { Alert, Badge, Card, Modal, Spinner } from 'react-bootstrap';

const statusVariant = (status) => {
  if (status === 'Passed') return 'success';
  if (status === 'Failed') return 'danger';
  if (status === 'In Progress') return 'primary';
  return 'secondary';
};

const CandidateProcessDetail = ({
  show,
  onHide,
  loading,
  error,
  candidate,
  application,
  processStatus
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Process detail</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : application ? (
          <>
            <h5 className="mb-1">
              {candidate?.firstName} {candidate?.lastName}
            </h5>
            <p className="text-muted mb-3">{application.position?.title || 'Unknown position'}</p>

            <p className="mb-2">
              <strong>Current status:</strong> <Badge bg={statusVariant(processStatus)}>{processStatus}</Badge>
            </p>

            <p className="mb-3">
              <strong>Current step:</strong>{' '}
              {application.currentInterviewStep != null
                ? `Step #${application.currentInterviewStep}`
                : 'Not assigned'}
            </p>

            <h6>Interview timeline</h6>
            {application.interviews?.length ? (
              [...application.interviews]
                .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
                .map((interview) => {
                  const interviewStatus = interview.result || 'Pending';
                  return (
                    <Card className="mb-2" key={interview.id}>
                      <Card.Body className="py-2">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                          <div>
                            <div>
                              <strong>{interview.interviewStep?.name || 'Interview step'}</strong>
                            </div>
                            <div className="small text-muted">
                              {new Date(interview.interviewDate).toLocaleString()}
                            </div>
                            <div className="small text-muted">
                              Score: {interview.score != null ? `${interview.score}/5` : '-'}
                            </div>
                            <div className="small text-muted">Notes: {interview.notes || '-'}</div>
                          </div>
                          <Badge bg={statusVariant(interviewStatus)}>{interviewStatus}</Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })
            ) : (
              <Alert variant="secondary" className="mb-0">
                No interviews registered for this process.
              </Alert>
            )}
          </>
        ) : (
          <Alert variant="secondary">Process detail is not available.</Alert>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CandidateProcessDetail;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Form, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { searchCandidates } from '../services/candidateService';
import { positionService } from '../services/positionService';

interface CandidateOption {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

interface Props {
    show: boolean;
    positionId: number | string;
    onClose: () => void;
    onSuccess?: () => void;
}

const NOTES_MAX = 500;
const SEARCH_DEBOUNCE_MS = 300;

const ERROR_CODE_TO_KEY: Record<string, string> = {
    DUPLICATE_APPLICATION: 'duplicate',
    POSITION_CLOSED: 'positionClosed',
    NO_INTERVIEW_STEPS: 'noInterviewSteps',
    POSITION_NOT_FOUND: 'positionNotFound',
    CANDIDATE_NOT_FOUND: 'candidateNotFound',
    VALIDATION_ERROR: 'validation',
};

const AddCandidateToPositionModal: React.FC<Props> = ({ show, positionId, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [allAssignableCandidates, setAllAssignableCandidates] = useState<CandidateOption[]>([]);
    const [results, setResults] = useState<CandidateOption[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [selected, setSelected] = useState<CandidateOption | null>(null);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ variant: 'success' | 'danger'; messageKey: string } | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const reset = useCallback(() => {
        setQuery('');
        setAllAssignableCandidates([]);
        setResults([]);
        setSelected(null);
        setNotes('');
        setSubmitting(false);
        setToast(null);
        setLoadingCandidates(false);
    }, []);

    useEffect(() => {
        if (!show) {
            reset();
        }
    }, [show, reset]);

    useEffect(() => {
        if (!show) return;
        let cancelled = false;
        setLoadingCandidates(true);
        setToast(null);
        Promise.all([
            searchCandidates(''),
            positionService.getAssignedCandidateIds(positionId),
        ])
            .then(([candidates, assignedCandidateIds]) => {
                if (cancelled) return;
                const assignedIdSet = new Set(assignedCandidateIds);
                const assignableCandidates = (candidates as CandidateOption[]).filter(
                    (candidate) => !assignedIdSet.has(candidate.id),
                );
                setAllAssignableCandidates(assignableCandidates);
                setResults(assignableCandidates);
            })
            .catch(() => {
                if (cancelled) return;
                setAllAssignableCandidates([]);
                setResults([]);
                setToast({ variant: 'danger', messageKey: 'positions.addCandidate.errors.unknown' });
            })
            .finally(() => {
                if (!cancelled) setLoadingCandidates(false);
            });

        return () => {
            cancelled = true;
        };
    }, [show, positionId]);

    useEffect(() => {
        if (!show) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const trimmed = query.trim().toLowerCase();
            if (trimmed.length === 0) {
                setResults(allAssignableCandidates);
                return;
            }
            const filtered = allAssignableCandidates.filter((candidate) => {
                const fullName = `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`.toLowerCase();
                const email = (candidate.email ?? '').toLowerCase();
                return fullName.includes(trimmed) || email.includes(trimmed);
            });
            setResults(filtered);
            if (selected && !filtered.some((candidate) => candidate.id === selected.id)) {
                setSelected(null);
            }
        }, SEARCH_DEBOUNCE_MS);
        return () => {
            try {
                if (debounceRef.current) clearTimeout(debounceRef.current);
            } catch (_error) {
                // no-op
            }
        };
    }, [query, show, allAssignableCandidates, selected]);

    const notesTooLong = notes.length > NOTES_MAX;
    const canSubmit = !!selected && !notesTooLong && !submitting;

    const handleSubmit = async () => {
        if (!selected) return;
        if (notesTooLong) return;
        setSubmitting(true);
        setToast(null);
        try {
            const payload: { candidateId: number; notes?: string } = { candidateId: selected.id };
            if (notes.trim().length > 0) payload.notes = notes;
            await positionService.assignCandidateToPosition(positionId, payload);
            setToast({ variant: 'success', messageKey: 'positions.addCandidate.successToast' });
            if (onSuccess) onSuccess();
            // Close shortly after success so user sees the toast
            setTimeout(() => {
                onClose();
            }, 600);
        } catch (err: any) {
            const code = err?.code as string | undefined;
            const key = code && ERROR_CODE_TO_KEY[code] ? ERROR_CODE_TO_KEY[code] : 'unknown';
            setToast({ variant: 'danger', messageKey: `positions.addCandidate.errors.${key}` });
        } finally {
            setSubmitting(false);
        }
    };

    const titleId = useMemo(() => `add-candidate-modal-title-${positionId}`, [positionId]);

    return (
        <Modal
            show={show}
            onHide={onClose}
            centered
            backdrop="static"
            keyboard
            aria-labelledby={titleId}
            role="dialog"
        >
            <Modal.Header closeButton>
                <Modal.Title id={titleId}>{t('positions.addCandidate.modalTitle')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {toast && (
                    <Alert variant={toast.variant} dismissible onClose={() => setToast(null)}>
                        {t(toast.messageKey)}
                    </Alert>
                )}

                <Form.Group className="mb-3" controlId="addCandidate-search">
                    <Form.Label>{t('positions.addCandidate.searchLabel')}</Form.Label>
                    <Form.Control
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelected(null);
                        }}
                        placeholder={t('positions.addCandidate.searchPlaceholder') as string}
                        autoFocus
                    />
                    {loadingCandidates && (
                        <div className="mt-2 d-flex align-items-center">
                            <Spinner size="sm" animation="border" className="me-2" />
                            <span>{t('positions.addCandidate.searchLoading')}</span>
                        </div>
                    )}
                    {!loadingCandidates && (
                        <ListGroup className="mt-2" style={{ maxHeight: 220, overflowY: 'auto' }}>
                            {results.length === 0 && (
                                <ListGroup.Item disabled>
                                    {t('positions.addCandidate.searchEmpty')}
                                </ListGroup.Item>
                            )}
                            {results.map((c) => (
                                <ListGroup.Item
                                    key={c.id}
                                    action
                                    active={selected?.id === c.id}
                                    onClick={() => setSelected(c)}
                                >
                                    {c.firstName} {c.lastName} {c.email ? `(${c.email})` : ''}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                    {selected && (
                        <Form.Text className="text-success">
                            {t('positions.addCandidate.selected')}: {selected.firstName} {selected.lastName}
                        </Form.Text>
                    )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="addCandidate-notes">
                    <Form.Label>{t('positions.addCandidate.notesLabel')}</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t('positions.addCandidate.notesPlaceholder') as string}
                        isInvalid={notesTooLong}
                        maxLength={NOTES_MAX + 50}
                    />
                    <div className="d-flex justify-content-between mt-1">
                        <Form.Text className={notesTooLong ? 'text-danger' : 'text-muted'}>
                            {t('positions.addCandidate.notesCounter', { current: notes.length, max: NOTES_MAX })}
                        </Form.Text>
                        {notesTooLong && (
                            <Form.Text className="text-danger">
                                {t('positions.addCandidate.notesTooLong')}
                            </Form.Text>
                        )}
                    </div>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={submitting}>
                    {t('positions.addCandidate.cancel')}
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
                    {submitting
                        ? t('positions.addCandidate.submitting')
                        : t('positions.addCandidate.submit')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddCandidateToPositionModal;

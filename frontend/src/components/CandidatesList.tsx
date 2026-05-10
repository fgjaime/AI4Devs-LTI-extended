import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Container,
    Table,
    Button,
    Form,
    Spinner,
    Alert,
    Row,
    Col,
    Pagination,
} from 'react-bootstrap';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCandidates } from '../services/candidateService';
import CandidateDetails from './CandidateDetails';

// ---- Types ----------------------------------------------------------------

interface Company {
    id: number;
    name: string;
}

interface Position {
    id: number;
    title: string;
    status: string;
    company: Company;
}

interface CurrentStep {
    id: number;
    name: string;
    orderIndex: number;
}

interface ActiveProcess {
    applicationId: number;
    applicationDate: string;
    position: Position;
    currentStep: CurrentStep;
    totalSteps: number;
}

interface CandidateListItem {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    activeProcesses: ActiveProcess[];
}

interface PaginationMetadata {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface CandidatesResponse {
    data: CandidateListItem[];
    metadata: PaginationMetadata;
}

type SortField = 'firstName' | 'lastName' | 'email';
type SortOrder = 'asc' | 'desc';

// ---- Debounce hook --------------------------------------------------------

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

// ---- Helpers --------------------------------------------------------------

function formatApplicationDate(iso: string): string {
    return iso.slice(0, 10); // YYYY-MM-DD
}

function renderActivePosition(activeProcesses: ActiveProcess[], noActiveProcessLabel: string): React.ReactNode {
    if (activeProcesses.length === 0) return noActiveProcessLabel;
    const first = activeProcesses[0];
    const label = `${first.position.title} - ${first.position.company.name}`;
    if (activeProcesses.length === 1) return label;
    return (
        <span>
            {label}{' '}
            <span style={{ fontSize: '0.75em', background: '#e0e0e0', borderRadius: '3px', padding: '1px 5px' }}>
                +{activeProcesses.length - 1} more
            </span>
        </span>
    );
}

function renderCurrentStep(activeProcesses: ActiveProcess[]): string {
    if (activeProcesses.length === 0) return '-';
    const first = activeProcesses[0];
    const { name, orderIndex } = first.currentStep;
    return `${name} (${orderIndex}/${first.totalSteps})`;
}

// ---- Component ------------------------------------------------------------

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const CandidatesList: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id: candidateIdParam } = useParams<{ id?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialPage = parseInt(searchParams.get('page') || '1', 10);
    const initialLimit = parseInt(searchParams.get('limit') || '10', 10);
    const initialSort = (searchParams.get('sort') || 'firstName') as SortField;
    const initialOrder = (searchParams.get('order') || 'asc') as SortOrder;
    const initialSearch = searchParams.get('search') || '';

    const [page, setPage] = useState<number>(initialPage);
    const [limit, setLimit] = useState<number>(initialLimit);
    const [sort, setSort] = useState<SortField>(initialSort);
    const [order, setOrder] = useState<SortOrder>(initialOrder);
    const [search, setSearch] = useState<string>(initialSearch);

    const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
    const [metadata, setMetadata] = useState<PaginationMetadata | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedSearch = useDebounce(search, 300);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const fetchCandidates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response: CandidatesResponse = await getCandidates({
                page,
                limit,
                search: debouncedSearch,
                sort,
                order,
            });
            if (!isMounted.current) return;
            setCandidates(response.data);
            setMetadata(response.metadata);
        } catch (err: unknown) {
            if (!isMounted.current) return;
            const message = err instanceof Error ? err.message : t('candidates.list.errorTitle');
            setError(message);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, [page, limit, debouncedSearch, sort, order, t]);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    // Sync query params to URL (best-effort)
    useEffect(() => {
        const params: Record<string, string> = {
            page: String(page),
            limit: String(limit),
            sort,
            order,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        setSearchParams(params, { replace: true });
    }, [page, limit, sort, order, debouncedSearch, setSearchParams]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const handleSortToggle = (field: SortField) => {
        if (sort === field) {
            setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSort(field);
            setOrder('asc');
        }
        setPage(1);
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLimit(parseInt(e.target.value, 10));
        setPage(1);
    };

    const sortIcon = (field: SortField) => {
        if (sort !== field) return ' ↕';
        return order === 'asc' ? ' ↑' : ' ↓';
    };

    const noActiveProcessLabel = t('candidates.list.noActiveProcess');
    const selectedCandidate = candidateIdParam ? { id: candidateIdParam } : null;

    return (
        <Container className="mt-5">
            <Button variant="link" onClick={() => navigate('/')} className="mb-3">
                {t('candidates.list.backToDashboard')}
            </Button>
            <h2 className="text-center mb-4">{t('candidates.list.title')}</h2>

            {/* Search */}
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder={t('candidates.list.searchPlaceholder')}
                        aria-label={t('candidates.list.searchAriaLabel')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Col>
                <Col xs="auto" className="d-flex align-items-center gap-2">
                    <Form.Label htmlFor="page-size-select" className="mb-0 me-1">
                        {t('candidates.list.pageSize')}
                    </Form.Label>
                    <Form.Select
                        id="page-size-select"
                        aria-label={t('candidates.list.pageSizeAriaLabel')}
                        value={limit}
                        onChange={handleLimitChange}
                        style={{ width: 'auto' }}
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {/* Loading */}
            {loading && (
                <div className="text-center my-5" aria-label={t('candidates.list.loading')}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">{t('candidates.list.loading')}</span>
                    </Spinner>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <Alert variant="danger">
                    <Alert.Heading>{t('candidates.list.errorTitle')}</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={fetchCandidates}>
                        {t('candidates.list.retry')}
                    </Button>
                </Alert>
            )}

            {/* Empty state */}
            {!loading && !error && candidates.length === 0 && (
                <div className="text-center my-5">
                    <h5>{t('candidates.list.emptyTitle')}</h5>
                    <p className="text-muted">{t('candidates.list.emptyDescription')}</p>
                    <Link to="/add-candidate">
                        <Button variant="primary">{t('candidates.list.addCandidate')}</Button>
                    </Link>
                </div>
            )}

            {/* Table */}
            {!loading && !error && candidates.length > 0 && (
                <>
                    <Table
                        striped
                        bordered
                        hover
                        responsive
                        aria-label={t('candidates.list.title')}
                    >
                        <thead>
                            <tr>
                                <th>
                                    <Button
                                        variant="link"
                                        className="p-0 text-decoration-none text-dark fw-bold"
                                        onClick={() => handleSortToggle('firstName')}
                                        aria-label={`${t('candidates.list.columns.fullName')}${sortIcon('firstName')}`}
                                    >
                                        {t('candidates.list.columns.fullName')}{sortIcon('firstName')}
                                    </Button>
                                </th>
                                <th>
                                    <Button
                                        variant="link"
                                        className="p-0 text-decoration-none text-dark fw-bold"
                                        onClick={() => handleSortToggle('email')}
                                        aria-label={`${t('candidates.list.columns.email')}${sortIcon('email')}`}
                                    >
                                        {t('candidates.list.columns.email')}{sortIcon('email')}
                                    </Button>
                                </th>
                                <th>{t('candidates.list.columns.phone')}</th>
                                <th>{t('candidates.list.columns.activePosition')}</th>
                                <th>{t('candidates.list.columns.currentStep')}</th>
                                <th>{t('candidates.list.columns.applicationDate')}</th>
                                <th>{t('candidates.list.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map((candidate) => (
                                <tr key={candidate.id}>
                                    <td>{`${candidate.firstName} ${candidate.lastName}`}</td>
                                    <td>{candidate.email}</td>
                                    <td>{candidate.phone || '-'}</td>
                                    <td>{renderActivePosition(candidate.activeProcesses, noActiveProcessLabel)}</td>
                                    <td>{renderCurrentStep(candidate.activeProcesses)}</td>
                                    <td>
                                        {candidate.activeProcesses.length > 0
                                            ? formatApplicationDate(candidate.activeProcesses[0].applicationDate)
                                            : '-'}
                                    </td>
                                    <td>
                                        <Link
                                            to={`/candidates/${candidate.id}`}
                                            aria-label={`${t('candidates.list.viewDetails')} ${candidate.firstName} ${candidate.lastName}`}
                                        >
                                            <Button variant="outline-primary" size="sm">
                                                {t('candidates.list.viewDetails')}
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* Pagination */}
                    {metadata && metadata.totalPages > 1 && (
                        <Pagination aria-label="Candidates pagination">
                            <Pagination.Prev
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                aria-label={t('candidates.list.prevPage')}
                            />
                            {Array.from({ length: metadata.totalPages }, (_, i) => i + 1).map((p) => (
                                <Pagination.Item
                                    key={p}
                                    active={p === page}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next
                                disabled={page >= metadata.totalPages}
                                onClick={() => setPage((p) => Math.min(metadata.totalPages, p + 1))}
                                aria-label={t('candidates.list.nextPage')}
                            />
                        </Pagination>
                    )}
                </>
            )}

            <CandidateDetails
                candidate={selectedCandidate}
                onClose={() => navigate('/candidates')}
                onApplicationRemoved={fetchCandidates}
            />
        </Container>
    );
};

export default CandidatesList;

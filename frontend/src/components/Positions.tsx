import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

type Position = {
    id: number;
    title: string;
    contactInfo: string;
    applicationDeadline: string;
    status: 'Draft' | 'Open' | 'Closed' | 'Hired';
};

const statusBadgeClass: Record<Position['status'], string> = {
    Open: 'bg-warning',
    Hired: 'bg-success',
    Draft: 'bg-secondary',
    Closed: 'bg-danger',
};

const Positions: React.FC = () => {
    const { t } = useTranslation();
    const [positions, setPositions] = useState<Position[]>([]);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const response = await axios.get('http://localhost:3010/positions');
                const formattedPositions = response.data.map((pos: Position) => ({
                    ...pos,
                    applicationDeadline: formatDate(pos.applicationDeadline)
                }));
                setPositions(formattedPositions);
            } catch (error) {
                console.error('Failed to fetch positions', error);
            }
        };

        fetchPositions();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredPositions = positions.filter(position =>
        position.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container className="mt-5">
            <Button variant="link" onClick={() => navigate('/')} className="mb-3">
                {t('positions.backToDashboard')}
            </Button>
            <h2 className="text-center mb-4">{t('positions.title')}</h2>
            <Row className="mb-4">
                <Col md={3}>
                    <Form.Control
                        type="text"
                        placeholder={t('positions.search.byTitle')}
                        value={searchTerm}
                        onChange={handleSearch}
                        aria-label={t('positions.search.ariaLabel')}
                    />
                </Col>
                <Col md={3}>
                    <Form.Control type="date" placeholder={t('positions.search.byDate')} />
                </Col>
                <Col md={3}>
                    <Form.Control as="select">
                        <option value="">{t('positions.filter.status')}</option>
                        <option value="Open">{t('status.open')}</option>
                        <option value="Hired">{t('status.hired')}</option>
                        <option value="Closed">{t('status.closed')}</option>
                        <option value="Draft">{t('status.draft')}</option>
                    </Form.Control>
                </Col>
                <Col md={3}>
                    <Form.Control as="select">
                        <option value="">{t('positions.filter.manager')}</option>
                        <option value="john_doe">John Doe</option>
                        <option value="jane_smith">Jane Smith</option>
                        <option value="alex_jones">Alex Jones</option>
                    </Form.Control>
                </Col>
            </Row>
            <Row>
                {filteredPositions.map((position, index) => (
                    <Col md={4} key={index} className="mb-4">
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title>{position.title}</Card.Title>
                                <Card.Text>
                                    <strong>{t('positions.card.manager')}:</strong> {position.contactInfo}<br />
                                    <strong>{t('positions.card.deadline')}:</strong> {position.applicationDeadline}
                                </Card.Text>
                                <span className={`badge ${statusBadgeClass[position.status] ?? 'bg-secondary'} text-white`}>
                                    {t(`status.${position.status.toLowerCase()}`)}
                                </span>
                                <div className="d-flex justify-content-between mt-3">
                                    <Button variant="outline-secondary" onClick={() => navigate(`/positions/${position.id}/edit`)} className="me-2">{t('positions.card.edit')}</Button>
                                    <Button variant="primary" onClick={() => navigate(`/positions/${position.id}`)}>{t('positions.card.viewProcess')}</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Positions;

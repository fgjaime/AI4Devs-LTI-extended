import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Briefcase, PersonBadge } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/lti-logo.png';

const RecruiterDashboard = () => {
    const { t } = useTranslation();

    return (
        <Container className="mt-5">
            <div className="text-center">
                <img src={logo} alt={t('dashboard.logoAlt')} style={{ width: '150px' }} />
            </div>
            <h1 className="mb-4 text-center">{t('dashboard.title')}</h1>
            <Row className="g-4 gx-md-5 justify-content-center">
                <Col xs={12} md={6} lg={5}>
                    <section aria-labelledby="dashboard-section-candidates-heading">
                        <h2
                            id="dashboard-section-candidates-heading"
                            className="h4 fw-semibold d-flex align-items-center gap-2 mb-2"
                        >
                            <PersonBadge className="text-primary flex-shrink-0" aria-hidden size={26} />
                            {t('dashboard.sections.candidates.heading')}
                        </h2>
                        <p className="text-muted small mb-3">{t('dashboard.sections.candidates.lead')}</p>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body className="p-4">
                                <p className="fw-semibold text-secondary mb-3 mb-md-4">
                                    {t('dashboard.candidates.title')}
                                </p>
                                <Link to="/add-candidate" className="text-decoration-none">
                                    <Button variant="primary" className="w-100">
                                        {t('dashboard.candidates.button')}
                                    </Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </section>
                </Col>
                <Col xs={12} md={6} lg={5}>
                    <section aria-labelledby="dashboard-section-positions-heading">
                        <h2
                            id="dashboard-section-positions-heading"
                            className="h4 fw-semibold d-flex align-items-center gap-2 mb-2"
                        >
                            <Briefcase className="text-primary flex-shrink-0" aria-hidden size={26} />
                            {t('dashboard.sections.positions.heading')}
                        </h2>
                        <p className="text-muted small mb-3">{t('dashboard.sections.positions.lead')}</p>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body className="p-4">
                                <p className="fw-semibold text-secondary mb-3 mb-md-4">
                                    {t('dashboard.positions.title')}
                                </p>
                                <Link to="/positions" className="text-decoration-none">
                                    <Button variant="primary" className="w-100">
                                        {t('dashboard.positions.button')}
                                    </Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </section>
                </Col>
            </Row>
        </Container>
    );
};

export default RecruiterDashboard;

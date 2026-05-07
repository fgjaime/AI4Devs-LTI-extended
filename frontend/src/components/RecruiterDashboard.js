import React from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
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
            <Row>
                <Col md={6}>
                    <Card className="shadow p-4">
                        <h5 className="mb-4">{t('dashboard.candidates.title')}</h5>
                        <Link to="/add-candidate">
                            <Button variant="primary" className="btn-block">{t('dashboard.candidates.button')}</Button>
                        </Link>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow p-4">
                        <h5 className="mb-4">{t('dashboard.positions.title')}</h5>
                        <Link to="/positions">
                            <Button variant="primary" className="btn-block">{t('dashboard.positions.button')}</Button>
                        </Link>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RecruiterDashboard;

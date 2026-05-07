import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { positionService } from '../services/positionService';

const VALID_STATUSES = ['Draft', 'Open', 'Closed', 'Hired'];

const EditPositionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Draft',
        isVisible: false,
        location: '',
        jobDescription: '',
        requirements: '',
        responsibilities: '',
        salaryMin: '',
        salaryMax: '',
        employmentType: '',
        benefits: '',
        companyDescription: '',
        applicationDeadline: '',
        contactInfo: ''
    });
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const fetchPosition = async () => {
            try {
                setFetching(true);
                const position = await positionService.getPositionById(parseInt(id));

                let formattedDeadline = '';
                if (position.applicationDeadline) {
                    const date = new Date(position.applicationDeadline);
                    formattedDeadline = date.toISOString().slice(0, 16);
                }

                setFormData({
                    title: position.title || '',
                    description: position.description || '',
                    status: position.status || 'Draft',
                    isVisible: position.isVisible || false,
                    location: position.location || '',
                    jobDescription: position.jobDescription || '',
                    requirements: position.requirements || '',
                    responsibilities: position.responsibilities || '',
                    salaryMin: position.salaryMin || '',
                    salaryMax: position.salaryMax || '',
                    employmentType: position.employmentType || '',
                    benefits: position.benefits || '',
                    companyDescription: position.companyDescription || '',
                    applicationDeadline: formattedDeadline,
                    contactInfo: position.contactInfo || ''
                });
            } catch (error) {
                console.error('Error fetching position:', error);
                setError(t('positions.edit.loadError'));
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchPosition();
        }
    }, [id, t]);

    const validateForm = () => {
        const errors = {};

        if (!formData.title || formData.title.trim() === '') {
            errors.title = t('validation.title.required');
        } else if (formData.title.length > 100) {
            errors.title = t('validation.title.tooLong');
        }

        if (!formData.description || formData.description.trim() === '') {
            errors.description = t('validation.description.required');
        }

        if (!formData.location || formData.location.trim() === '') {
            errors.location = t('validation.location.required');
        }

        if (!formData.jobDescription || formData.jobDescription.trim() === '') {
            errors.jobDescription = t('validation.jobDescription.required');
        }

        if (formData.status && !VALID_STATUSES.includes(formData.status)) {
            errors.status = t('validation.status.invalid');
        }

        if (formData.salaryMin !== '' && (isNaN(formData.salaryMin) || parseFloat(formData.salaryMin) < 0)) {
            errors.salaryMin = t('validation.salaryMin.invalid');
        }

        if (formData.salaryMax !== '' && (isNaN(formData.salaryMax) || parseFloat(formData.salaryMax) < 0)) {
            errors.salaryMax = t('validation.salaryMax.invalid');
        }

        if (formData.salaryMin !== '' && formData.salaryMax !== '') {
            const min = parseFloat(formData.salaryMin);
            const max = parseFloat(formData.salaryMax);
            if (max < min) {
                errors.salaryMax = t('validation.salaryMax.ltMin');
            }
        }

        if (formData.applicationDeadline) {
            const deadline = new Date(formData.applicationDeadline);
            if (isNaN(deadline.getTime())) {
                errors.applicationDeadline = t('validation.applicationDeadline.invalid');
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const updateData = {};

            if (formData.title) updateData.title = formData.title;
            if (formData.description) updateData.description = formData.description;
            if (formData.status) updateData.status = formData.status;
            if (formData.isVisible !== undefined) updateData.isVisible = formData.isVisible;
            if (formData.location) updateData.location = formData.location;
            if (formData.jobDescription) updateData.jobDescription = formData.jobDescription;
            if (formData.requirements) updateData.requirements = formData.requirements;
            if (formData.responsibilities) updateData.responsibilities = formData.responsibilities;
            if (formData.salaryMin !== '') updateData.salaryMin = parseFloat(formData.salaryMin);
            if (formData.salaryMax !== '') updateData.salaryMax = parseFloat(formData.salaryMax);
            if (formData.employmentType) updateData.employmentType = formData.employmentType;
            if (formData.benefits) updateData.benefits = formData.benefits;
            if (formData.companyDescription) updateData.companyDescription = formData.companyDescription;
            if (formData.applicationDeadline) {
                const date = new Date(formData.applicationDeadline);
                updateData.applicationDeadline = date.toISOString();
            }
            if (formData.contactInfo) updateData.contactInfo = formData.contactInfo;

            await positionService.updatePosition(parseInt(id), updateData);

            setSuccess(true);

            setTimeout(() => {
                navigate('/positions');
            }, 1500);
        } catch (error) {
            console.error('Error updating position:', error);
            setError(error.message || 'Error updating position. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Container className="mt-5">
                <div>{t('positions.edit.loadingData')}</div>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Button variant="link" onClick={() => navigate('/positions')} className="mb-3">
                {t('positions.edit.backToPositions')}
            </Button>
            <Card>
                <Card.Header>
                    <h2>{t('positions.edit.title')}</h2>
                </Card.Header>
                <Card.Body>
                    {success && (
                        <Alert variant="success">
                            {t('positions.edit.success')}
                        </Alert>
                    )}
                    {error && (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.title')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.title}
                                maxLength={100}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.title}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.description')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.description}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.description}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.status')}</Form.Label>
                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.status}
                            >
                                <option value="Draft">{t('status.draft')}</option>
                                <option value="Open">{t('status.open')}</option>
                                <option value="Closed">{t('status.closed')}</option>
                                <option value="Hired">{t('status.hired')}</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.status}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="isVisible"
                                label={t('common.visible')}
                                checked={formData.isVisible}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.location')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.location}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.location}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.jobDescription')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="jobDescription"
                                value={formData.jobDescription}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.jobDescription}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.jobDescription}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.requirements')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.responsibilities')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="responsibilities"
                                value={formData.responsibilities}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.salaryMin')}</Form.Label>
                            <Form.Control
                                type="number"
                                name="salaryMin"
                                value={formData.salaryMin}
                                onChange={handleChange}
                                min="0"
                                isInvalid={!!validationErrors.salaryMin}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.salaryMin}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.salaryMax')}</Form.Label>
                            <Form.Control
                                type="number"
                                name="salaryMax"
                                value={formData.salaryMax}
                                onChange={handleChange}
                                min="0"
                                isInvalid={!!validationErrors.salaryMax}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.salaryMax}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.employmentType')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="employmentType"
                                value={formData.employmentType}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.benefits')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="benefits"
                                value={formData.benefits}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.companyDescription')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="companyDescription"
                                value={formData.companyDescription}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.applicationDeadline')}</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="applicationDeadline"
                                value={formData.applicationDeadline}
                                onChange={handleChange}
                                isInvalid={!!validationErrors.applicationDeadline}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.applicationDeadline}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('positions.edit.form.contactInfo')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="contactInfo"
                                value={formData.contactInfo}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-between">
                            <Button variant="secondary" onClick={() => navigate('/positions')}>
                                {t('positions.edit.form.cancel')}
                            </Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? t('positions.edit.form.updating') : t('positions.edit.form.updatePosition')}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EditPositionForm;

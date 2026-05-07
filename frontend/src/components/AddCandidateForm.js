import React, { useState } from 'react';
import { Form, Button, Alert, InputGroup, FormControl, Card, Container, Row, Col } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import FileUploader from './FileUploader';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AddCandidateForm = () => {
    const { t } = useTranslation();
    const [candidate, setCandidate] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        educations: [],
        workExperiences: [],
        cv: null
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (e, index, section) => {
        const updatedSection = [...candidate[section]];
        if (updatedSection[index]) {
            updatedSection[index][e.target.name] = e.target.value;
            setCandidate({ ...candidate, [section]: updatedSection });
        }
    };

    const handleDateChange = (date, index, section, field) => {
        const updatedSection = [...candidate[section]];
        if (updatedSection[index]) {
            updatedSection[index][field] = date;
            setCandidate({ ...candidate, [section]: updatedSection });
        }
    };

    const handleAddSection = (section) => {
        const newSection = section === 'educations'
            ? { institution: '', title: '', startDate: '', endDate: '' }
            : { company: '', position: '', description: '', startDate: '', endDate: '' };
        setCandidate({ ...candidate, [section]: [...candidate[section], newSection] });
    };

    const handleRemoveSection = (index, section) => {
        const updatedSection = [...candidate[section]];
        updatedSection.splice(index, 1);
        setCandidate({ ...candidate, [section]: updatedSection });
    };

    const handleCVUpload = (fileData) => {
        setCandidate({ ...candidate, cv: fileData });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const candidateData = {
                ...candidate,
                cv: candidate.cv ? {
                    filePath: candidate.cv.filePath,
                    fileType: candidate.cv.fileType
                } : null
            };

            candidateData.educations = candidateData.educations.map(education => ({
                ...education,
                startDate: education.startDate ? education.startDate.toISOString().slice(0, 10) : '',
                endDate: education.endDate ? education.endDate.toISOString().slice(0, 10) : ''
            }));
            candidateData.workExperiences = candidateData.workExperiences.map(experience => ({
                ...experience,
                startDate: experience.startDate ? experience.startDate.toISOString().slice(0, 10) : '',
                endDate: experience.endDate ? experience.endDate.toISOString().slice(0, 10) : ''
            }));

            const res = await fetch('http://localhost:3010/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(candidateData)
            });

            if (res.status === 201) {
                setSuccessMessage(t('candidates.form.success'));
                setError('');
            } else if (res.status === 400) {
                const errorData = await res.json();
                throw new Error(t('candidates.form.errors.invalidData', { message: errorData.message }));
            } else if (res.status === 500) {
                throw new Error(t('candidates.form.errors.serverError'));
            } else {
                throw new Error(t('candidates.form.errors.sendError'));
            }
        } catch (error) {
            setError(t('candidates.form.errors.addError', { message: error.message }));
            setSuccessMessage('');
        }
    };

    return (
        <Container className="mt-5">
            <h1 className="mb-4">{t('candidates.form.title')}</h1>
            <Card className="shadow p-4">
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="firstName">
                                <Form.Label>{t('candidates.form.firstName')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    required
                                    onChange={(e) => setCandidate({ ...candidate, firstName: e.target.value })}
                                    className="form-control shadow-sm"
                                />
                            </Form.Group>
                            <Form.Group controlId="lastName">
                                <Form.Label>{t('candidates.form.lastName')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    required
                                    onChange={(e) => setCandidate({ ...candidate, lastName: e.target.value })}
                                    className="form-control shadow-sm"
                                />
                            </Form.Group>
                            <Form.Group controlId="email">
                                <Form.Label>{t('candidates.form.email')}</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    required
                                    onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
                                    className="form-control shadow-sm"
                                />
                            </Form.Group>
                            <Form.Group controlId="phone">
                                <Form.Label>{t('candidates.form.phone')}</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    onChange={(e) => setCandidate({ ...candidate, phone: e.target.value })}
                                    className="form-control shadow-sm"
                                />
                            </Form.Group>
                            <Form.Group controlId="address">
                                <Form.Label>{t('candidates.form.address')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    onChange={(e) => setCandidate({ ...candidate, address: e.target.value })}
                                    className="form-control shadow-sm"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="cv">
                                <Form.Label>{t('candidates.form.cv')}</Form.Label>
                                <FileUploader
                                    onChange={handleCVUpload}
                                    onUpload={handleCVUpload}
                                    className="shadow-sm"
                                />
                            </Form.Group>
                            <Row className="mt-4">
                                <Button onClick={() => handleAddSection('educations')} className="btn btn-primary btn-sm mr-2">{t('candidates.form.addEducation')}</Button>
                            </Row>
                            {candidate.educations.map((education, index) => (
                                <div key={index} className="mb-3">
                                    <Row className="mt-4">
                                        <Col md={6}>
                                            <FormControl
                                                placeholder={t('candidates.form.institution')}
                                                name="institution"
                                                value={education.institution}
                                                onChange={(e) => handleInputChange(e, index, 'educations')}
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-2">
                                        <Col md={6}>
                                            <FormControl
                                                placeholder={t('candidates.form.degree')}
                                                name="title"
                                                value={education.title}
                                                onChange={(e) => handleInputChange(e, index, 'educations')}
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-2">
                                        <Col md={6}>
                                            <DatePicker
                                                selected={education.startDate}
                                                onChange={(date) => handleDateChange(date, index, 'educations', 'startDate')}
                                                dateFormat="yyyy-MM-dd"
                                                placeholderText={t('candidates.form.startDate')}
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <DatePicker
                                                selected={education.endDate}
                                                onChange={(date) => handleDateChange(date, index, 'educations', 'endDate')}
                                                dateFormat="yyyy-MM-dd"
                                                placeholderText={t('candidates.form.endDate')}
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                    <Button variant="danger" onClick={() => handleRemoveSection(index, 'educations')} className="mt-2">
                                        <Trash /> {t('candidates.form.remove')}
                                    </Button>
                                </div>
                            ))}
                            <Row className="mt-4">
                                <Button onClick={() => handleAddSection('workExperiences')} className="btn btn-primary btn-sm mr-2">{t('candidates.form.addWorkExperience')}</Button>
                            </Row>
                            {candidate.workExperiences.map((experience, index) => (
                                <div key={index} className="mb-3">
                                    <Row className="mt-4">
                                        <Col md={6}>
                                            <FormControl
                                                placeholder={t('candidates.form.company')}
                                                name="company"
                                                value={experience.company}
                                                onChange={(e) => handleInputChange(e, index, 'workExperiences')}
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-2">
                                        <Col md={6}>
                                            <FormControl
                                                placeholder={t('candidates.form.positionField')}
                                                name="position"
                                                value={experience.position}
                                                onChange={(e) => handleInputChange(e, index, 'workExperiences')}
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-2">
                                        <Col md={6}>
                                            <DatePicker
                                                selected={experience.startDate}
                                                onChange={(date) => handleDateChange(date, index, 'workExperiences', 'startDate')}
                                                dateFormat="yyyy-MM-dd"
                                                placeholderText={t('candidates.form.startDate')}
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <DatePicker
                                                selected={experience.endDate}
                                                onChange={(date) => handleDateChange(date, index, 'workExperiences', 'endDate')}
                                                dateFormat="yyyy-MM-dd"
                                                placeholderText={t('candidates.form.endDate')}
                                                className="form-control shadow-sm"
                                            />
                                        </Col>
                                    </Row>
                                    <Button variant="danger" onClick={() => handleRemoveSection(index, 'workExperiences')} className="mt-2">
                                        <Trash /> {t('candidates.form.remove')}
                                    </Button>
                                </div>
                            ))}
                        </Col>
                    </Row>
                    <Button type="submit" className="btn btn-primary btn-block shadow-sm mt-5">{t('candidates.form.submit')}</Button>
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                    {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}
                </Form>
            </Card>
        </Container>
    );
};

export default AddCandidateForm;

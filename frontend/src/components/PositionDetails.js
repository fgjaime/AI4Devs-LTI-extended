import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Offcanvas, Button } from 'react-bootstrap';
import { DragDropContext } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import StageColumn from './StageColumn';
import CandidateDetails from './CandidateDetails';
import AddCandidateToPositionModal from './AddCandidateToPositionModal';
import { useNavigate } from 'react-router-dom';

const PositionsDetails = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const [stages, setStages] = useState([]);
    const [positionName, setPositionName] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showAddCandidate, setShowAddCandidate] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const navigate = useNavigate();

    const fetchInterviewFlow = useCallback(async () => {
            try {
                const response = await fetch(`http://localhost:3010/positions/${id}/interviewFlow`);
                const data = await response.json();
                const interviewSteps = data.interviewFlow.interviewFlow.interviewSteps.map(step => ({
                    title: step.name,
                    id: step.id,
                    candidates: []
                }));
                setStages(interviewSteps);
                setPositionName(data.interviewFlow.positionName);
                return interviewSteps;
            } catch (error) {
                console.error('Error fetching interview flow:', error);
                return [];
            }
        }, [id]);

    const fetchCandidates = useCallback(async (baseStages) => {
            try {
                const response = await fetch(`http://localhost:3010/positions/${id}/candidates`);
                const candidates = await response.json();
                const mapCandidatesToStages = (stagesToPopulate) =>
                    stagesToPopulate.map(stage => ({
                        ...stage,
                        candidates: candidates
                            .filter(candidate => candidate.currentInterviewStep === stage.title)
                            .map(candidate => ({
                                id: candidate.candidateId.toString(),
                                name: candidate.fullName,
                                rating: candidate.averageScore,
                                applicationId: candidate.applicationId
                            }))
                    }));

                if (Array.isArray(baseStages) && baseStages.length > 0) {
                    setStages(mapCandidatesToStages(baseStages));
                    return;
                }

                setStages(prevStages => mapCandidatesToStages(prevStages));
            } catch (error) {
                console.error('Error fetching candidates:', error);
            }
        }, [id]);

useEffect(() => {
        const loadBoard = async () => {
            const interviewStages = await fetchInterviewFlow();
            await fetchCandidates(interviewStages);
        };
        loadBoard();
    }, [fetchInterviewFlow, fetchCandidates, refreshKey]);

    const updateCandidateStep = async (candidateId, applicationId, newStep) => {
        try {
            const response = await fetch(`http://localhost:3010/candidates/${candidateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    applicationId: Number(applicationId),
                    currentInterviewStep: Number(newStep)
                })
            });

            if (!response.ok) {
                throw new Error('Error updating candidate step');
            }
        } catch (error) {
            console.error('Error updating candidate step:', error);
        }
    };

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) {
            return;
        }

        // Convert droppableId to number since it's stored as string in StageColumn
        const sourceStageIndex = Number(source.droppableId);
        const destStageIndex = Number(destination.droppableId);

        const sourceStage = stages[sourceStageIndex];
        const destStage = stages[destStageIndex];

        // Find the candidate by draggableId instead of using index
        // This ensures we get the correct candidate even when the array is sorted
        const candidateIndex = sourceStage.candidates.findIndex(
            candidate => candidate.id === draggableId
        );

        if (candidateIndex === -1) {
            console.error('Candidate not found in source stage');
            return;
        }

        // Remove the candidate from source stage
        const [movedCandidate] = sourceStage.candidates.splice(candidateIndex, 1);
        
        // Insert at the destination index (ensure it's within bounds)
        // Note: destination.index is from the sorted view, but we insert into unsorted array
        // The array will be re-sorted on next render, so position is approximate
        const insertIndex = Math.min(destination.index, destStage.candidates.length);
        destStage.candidates.splice(insertIndex, 0, movedCandidate);

        setStages([...stages]);

        const destStageId = destStage.id;

        updateCandidateStep(movedCandidate.id, movedCandidate.applicationId, destStageId);
    };

    const handleCardClick = (candidate) => {
        setSelectedCandidate(candidate);
    };

    const closeSlide = () => {
        setSelectedCandidate(null);
    };

    const handleApplicationRemoved = async () => {
        setSelectedCandidate(null);
        await fetchCandidates();
    };

    return (
        <Container className="mt-5">
            <Button variant="link" onClick={() => navigate('/positions')} className="mb-3">
                {t('positions.backToPositions')}
            </Button>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">{positionName}</h2>
                <Button variant="primary" onClick={() => setShowAddCandidate(true)}>
                    {t('positions.addCandidate.button')}
                </Button>
            </div>
            <AddCandidateToPositionModal
                show={showAddCandidate}
                positionId={id}
                onClose={() => setShowAddCandidate(false)}
                onSuccess={() => setRefreshKey((k) => k + 1)}
            />
            <DragDropContext onDragEnd={onDragEnd}>
                <Row>
                    {stages.map((stage, index) => (
                        <StageColumn key={index} stage={stage} index={index} onCardClick={handleCardClick} />
                    ))}
                </Row>
            </DragDropContext>
            <CandidateDetails
                candidate={selectedCandidate}
                onClose={closeSlide}
                onApplicationRemoved={handleApplicationRemoved}
            />
        </Container>
    );
};

export default PositionsDetails;


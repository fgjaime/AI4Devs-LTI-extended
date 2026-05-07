import React from 'react';
import { Card } from 'react-bootstrap';
import { Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';

const CandidateCard = ({ candidate, index, onClick }) => {
    const { t } = useTranslation();

    return (
        <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
            {(provided) => (
                <Card
                    className="mb-2"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(candidate)}
                >
                    <Card.Body>
                        <Card.Title>{candidate.name}</Card.Title>
                        <div>
                            {Array.from({ length: candidate.rating }).map((_, i) => (
                                <span key={i} role="img" aria-label={t('common.ratingLabel')}>🟢</span>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            )}
        </Draggable>
    );
};

export default CandidateCard;

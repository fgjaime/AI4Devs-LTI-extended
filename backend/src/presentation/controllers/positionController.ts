import { Request, Response } from 'express';
import { getCandidatesByPositionService, getInterviewFlowByPositionService, getAllPositionsService, getCandidateNamesByPositionService, getPositionByIdService, updatePositionService, assignCandidateToPositionService, AssignCandidateError } from '../../application/services/positionService';
import { validatePositionUpdateData, validateAssignCandidateToPositionData } from '../../application/validator';


export const getAllPositions = async (req: Request, res: Response) => {
    try {
        const positions = await getAllPositionsService();
        res.status(200).json(positions);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving positions', error: error instanceof Error ? error.message : String(error) });
    }
};

export const getPositionById = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        
        // Validate position ID format
        if (isNaN(positionId)) {
            return res.status(400).json({ 
                message: 'Invalid position ID format',
                error: 'Position ID must be a valid number'
            });
        }

        const position = await getPositionByIdService(positionId);
        res.status(200).json(position);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Position not found') {
                res.status(404).json({ 
                    message: 'Position not found', 
                    error: error.message 
                });
            } else {
                res.status(500).json({ 
                    message: 'Error retrieving position', 
                    error: error.message 
                });
            }
        } else {
            res.status(500).json({ 
                message: 'Error retrieving position', 
                error: 'Unknown error occurred' 
            });
        }
    }
};

export const getCandidatesByPosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        const candidates = await getCandidatesByPositionService(positionId);
        res.status(200).json(candidates);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error retrieving candidates', error: error.message });
        } else {
            res.status(500).json({ message: 'Error retrieving candidates', error: String(error) });
        }
    }
};

export const getInterviewFlowByPosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        const interviewFlow = await getInterviewFlowByPositionService(positionId);
        res.status(200).json({ interviewFlow });
    } catch (error) {
        if (error instanceof Error) {
            res.status(404).json({ message: 'Position not found', error: error.message });
        } else {
            res.status(500).json({ message: 'Server error', error: String(error) });
        }
    }
};

export const getCandidateNamesByPosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        const candidateNames = await getCandidateNamesByPositionService(positionId);
        res.status(200).json(candidateNames);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error retrieving candidate names', error: error.message });
        } else {
            res.status(500).json({ message: 'Error retrieving candidate names', error: String(error) });
        }
    }
};

const ASSIGN_CANDIDATE_STATUS_MAP: Record<string, number> = {
    POSITION_NOT_FOUND: 404,
    CANDIDATE_NOT_FOUND: 404,
    POSITION_CLOSED: 409,
    DUPLICATE_APPLICATION: 409,
    NO_INTERVIEW_STEPS: 422,
};

export const addCandidateToPosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        if (isNaN(positionId)) {
            return res.status(400).json({
                code: 'VALIDATION_ERROR',
                message: 'Invalid position ID format',
                error: 'Position ID must be a valid number',
            });
        }

        try {
            validateAssignCandidateToPositionData(req.body);
        } catch (validationError) {
            const message = validationError instanceof Error ? validationError.message : String(validationError);
            return res.status(400).json({
                code: 'VALIDATION_ERROR',
                message: 'Validation error',
                error: message,
            });
        }

        const created = await assignCandidateToPositionService(positionId, {
            candidateId: req.body.candidateId,
            notes: req.body.notes,
        });
        return res.status(201).json(created);
    } catch (error) {
        if (error instanceof AssignCandidateError) {
            const status = ASSIGN_CANDIDATE_STATUS_MAP[error.code] ?? 500;
            return res.status(status).json({
                code: error.code,
                message: error.message,
                error: error.message,
            });
        }
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: 'Error assigning candidate to position',
            error: message,
        });
    }
};

export const updatePosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        if (isNaN(positionId)) {
            return res.status(400).json({
                message: 'Invalid position ID format',
                error: 'Position ID must be a valid number'
            });
        }

        try {
            validatePositionUpdateData(req.body);
        } catch (validationError) {
            const message = validationError instanceof Error ? validationError.message : String(validationError);
            return res.status(400).json({
                message: 'Validation error',
                error: message
            });
        }

        const updated = await updatePositionService(positionId, req.body);
        res.status(200).json(updated);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Position not found') {
                return res.status(404).json({
                    message: 'Position not found',
                    error: error.message
                });
            }
            return res.status(500).json({
                message: 'Error updating position',
                error: error.message
            });
        }
        res.status(500).json({
            message: 'Error updating position',
            error: String(error)
        });
    }
};
import { Router } from 'express';
import { getCandidatesByPosition, getInterviewFlowByPosition, getAllPositions, getCandidateNamesByPosition, getPositionById, updatePosition, addCandidateToPosition } from '../presentation/controllers/positionController';

const router = Router();

router.get('/', getAllPositions);
router.get('/:id', getPositionById);
router.patch('/:id', updatePosition);
router.get('/:id/candidates', getCandidatesByPosition);
router.post('/:id/candidates', addCandidateToPosition);
router.get('/:id/candidates/names', getCandidateNamesByPosition);
router.get('/:id/interviewflow', getInterviewFlowByPosition);

export default router;

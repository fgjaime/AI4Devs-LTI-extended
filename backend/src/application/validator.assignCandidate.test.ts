import { validateAssignCandidateToPositionData } from './validator';

describe('validateAssignCandidateToPositionData', () => {
    it('accepts minimal payload { candidateId: 1 }', () => {
        expect(() => validateAssignCandidateToPositionData({ candidateId: 1 })).not.toThrow();
    });

    it('accepts payload with notes { candidateId: 1, notes: "ok" }', () => {
        expect(() => validateAssignCandidateToPositionData({ candidateId: 1, notes: 'ok' })).not.toThrow();
    });

    it('rejects missing candidateId', () => {
        expect(() => validateAssignCandidateToPositionData({})).toThrow(/candidateId/);
        expect(() => validateAssignCandidateToPositionData({ notes: 'abc' })).toThrow(/candidateId/);
    });

    it('rejects non-integer / negative / zero candidateId', () => {
        expect(() => validateAssignCandidateToPositionData({ candidateId: '1' })).toThrow(/candidateId/);
        expect(() => validateAssignCandidateToPositionData({ candidateId: 1.5 })).toThrow(/candidateId/);
        expect(() => validateAssignCandidateToPositionData({ candidateId: 0 })).toThrow(/candidateId/);
        expect(() => validateAssignCandidateToPositionData({ candidateId: -3 })).toThrow(/candidateId/);
    });

    it('rejects notes not-a-string', () => {
        expect(() => validateAssignCandidateToPositionData({ candidateId: 1, notes: 123 })).toThrow(/notes/);
        expect(() => validateAssignCandidateToPositionData({ candidateId: 1, notes: {} })).toThrow(/notes/);
    });

    it('rejects notes length > 500', () => {
        const longNotes = 'a'.repeat(501);
        expect(() => validateAssignCandidateToPositionData({ candidateId: 1, notes: longNotes })).toThrow(/500/);
    });

    it('rejects unknown fields like applicationDate or interviewStepId', () => {
        expect(() =>
            validateAssignCandidateToPositionData({ candidateId: 1, applicationDate: '2026-01-01' }),
        ).toThrow(/Unexpected/);
        expect(() =>
            validateAssignCandidateToPositionData({ candidateId: 1, interviewStepId: 5 }),
        ).toThrow(/Unexpected/);
    });

    it('rejects null/undefined body', () => {
        expect(() => validateAssignCandidateToPositionData(null)).toThrow();
        expect(() => validateAssignCandidateToPositionData(undefined)).toThrow();
    });
});

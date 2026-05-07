describe('Positions API - Update', () => {
  const API_URL = Cypress.env('API_URL') || 'http://localhost:3010';
  let testPositionId: number;

  before(() => {
    cy.request({
      method: 'GET',
      url: `${API_URL}/positions`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      if (response.body.length > 0) {
        testPositionId = response.body[0].id;
      } else {
        throw new Error('No positions available for testing. Please ensure test data exists.');
      }
    });
  });

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  describe('PATCH /positions/:id', () => {
    it('should update a position successfully with all valid fields', () => {
      const updateData = {
        title: 'Updated Test Position',
        description: 'Updated description',
        status: 'Open',
        isVisible: true,
        location: 'Updated Location',
        jobDescription: 'Updated job description',
        requirements: 'Updated requirements',
        responsibilities: 'Updated responsibilities',
        salaryMin: 60000,
        salaryMax: 90000,
        employmentType: 'Part-time',
        benefits: 'Updated benefits',
        companyDescription: 'Updated company description',
        contactInfo: 'updated@example.com'
      };

      cy.request({
        method: 'PATCH',
        url: `${API_URL}/positions/${testPositionId}`,
        body: updateData
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('title', updateData.title);
        expect(response.body).to.have.property('status', updateData.status);
        expect(response.body).to.have.property('isVisible', updateData.isVisible);
        expect(response.body).to.have.property('location', updateData.location);
      });
    });

    it('should return error when trying to update non-existent position', () => {
      const nonExistentId = 99999;

      cy.request({
        method: 'PATCH',
        url: `${API_URL}/positions/${nonExistentId}`,
        body: { title: 'Updated Title' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('message', 'Position not found');
      });
    });

    it('should return error when trying to update with invalid data', () => {
      const invalidData = {
        title: '',
        salaryMin: -1000,
        status: 'InvalidStatus'
      };

      cy.request({
        method: 'PATCH',
        url: `${API_URL}/positions/${testPositionId}`,
        body: invalidData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', 'Validation error');
      });
    });

    it('should validate that required fields cannot be empty strings', () => {
      const emptyFieldsData = {
        title: ''
      };

      cy.request({
        method: 'PATCH',
        url: `${API_URL}/positions/${testPositionId}`,
        body: emptyFieldsData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', 'Validation error');
        expect(response.body).to.have.property('error', 'Invalid title');
      });
    });

    it('should return updated position with new data in response', () => {
      const updateData = {
        title: 'Verified Updated Position',
        status: 'Open',
        salaryMin: 55000,
        salaryMax: 85000
      };

      cy.request({
        method: 'PATCH',
        url: `${API_URL}/positions/${testPositionId}`,
        body: updateData
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('title', updateData.title);
        expect(response.body).to.have.property('status', updateData.status);
        expect(response.body).to.have.property('salaryMin', updateData.salaryMin);
        expect(response.body).to.have.property('salaryMax', updateData.salaryMax);
      });
    });

    it('should return error when trying to update with invalid ID format', () => {
      const invalidId = 'not-a-number';

      cy.request({
        method: 'GET',
        url: `${API_URL}/positions/${invalidId}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', 'Invalid position ID format');
        expect(response.body).to.have.property('error', 'Position ID must be a valid number');
      });
    });

    it('should verify that unmodified fields maintain their original values', () => {
      cy.request({
        method: 'GET',
        url: `${API_URL}/positions`
      }).then((originalResponse) => {
        const originalData = originalResponse.body.find((pos: any) => pos.id === testPositionId);
        expect(originalData).to.exist;

        const partialUpdate = {
          title: 'Partially Updated Position',
          status: 'Open'
        };

        cy.request({
          method: 'PATCH',
          url: `${API_URL}/positions/${testPositionId}`,
          body: partialUpdate
        }).then((updateResponse) => {
          expect(updateResponse.status).to.eq(200);
          const updatedData = updateResponse.body;

          expect(updatedData.title).to.eq(partialUpdate.title);
          expect(updatedData.status).to.eq(partialUpdate.status);
          expect(updatedData.description).to.eq(originalData.description);
          expect(updatedData.location).to.eq(originalData.location);
        });
      });
    });

    it('should validate salary range constraints', () => {
      const invalidSalaryData = {
        salaryMin: 100000,
        salaryMax: 50000
      };

      cy.request({
        method: 'PATCH',
        url: `${API_URL}/positions/${testPositionId}`,
        body: invalidSalaryData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', 'Validation error');
        expect(response.body.error).to.include('salaryMax');
      });
    });

    it('empty body PATCH returns 200 with the current position unchanged', () => {
      cy.request({
        method: 'PATCH',
        url: `${API_URL}/positions/${testPositionId}`,
        body: {}
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', testPositionId);
      });
    });

    it('should validate status enum values', () => {
      const validStatuses = ['Draft', 'Open', 'Closed', 'Hired'];

      validStatuses.forEach((status) => {
        cy.request({
          method: 'PATCH',
          url: `${API_URL}/positions/${testPositionId}`,
          body: { status }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.status).to.eq(status);
        });
      });
    });

    it('should reject legacy Spanish status values', () => {
      const legacyStatuses = ['Contratado', 'Cerrado', 'Borrador'];

      legacyStatuses.forEach((status) => {
        cy.request({
          method: 'PATCH',
          url: `${API_URL}/positions/${testPositionId}`,
          body: { status },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
        });
      });
    });

    it('should return error when trying to update protected fields (companyId, interviewFlowId)', () => {
      const invalidReferenceData = {
        companyId: 99999,
        interviewFlowId: 99999
      };

      cy.request({
        method: 'PATCH',
        url: `${API_URL}/positions/${testPositionId}`,
        body: invalidReferenceData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', 'Validation error');
      });
    });

    it('should handle partial updates correctly', () => {
      const partialUpdates = [
        { title: 'Only Title Updated' },
        { status: 'Open' },
        { isVisible: true },
        { salaryMin: 65000 },
        { location: 'New Location Only' }
      ];

      partialUpdates.forEach((updateData) => {
        cy.request({
          method: 'PATCH',
          url: `${API_URL}/positions/${testPositionId}`,
          body: updateData
        }).then((response) => {
          expect(response.status).to.eq(200);
          const fieldName = Object.keys(updateData)[0];
          const fieldValue = Object.values(updateData)[0];
          expect(response.body[fieldName]).to.eq(fieldValue);
        });
      });
    });
  });
});

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let exampleID;

suite('Functional Tests', () => {
  test('1. Create an issue with every field', (done) => {
    chai.request(server)
        .post('/api/issues/apitest/')
        .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Every field',
            assigned_to: 'Chai',
            status_text: 'In QA'
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title,'Title');
            assert.equal(res.body.issue_text,'text');
            assert.equal(res.body.created_by,'Every field');
            assert.equal(res.body.assigned_to,'Chai');
            assert.equal(res.body.status_text,'In QA');
            exampleID = res.body._id;
            done();
        });
  });

  test('2. Create an issue with required fields', (done) => {
    chai.request(server)
        .post('/api/issues/apitest/')
        .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Text - Required field'
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Title');
            assert.equal(res.body.created_by, 'Functional Text - Required field');
            assert.equal(res.body.assigned_to, '');
            assert.equal(res.body.status_text, '');
            done();
        });
  });

  test('3. Create an issue with missing required fields', (done) => {
    chai.request(server)
        .post('/api/issues/apitest/')
        .send({
            issue_title: 'Title'
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'required field(s) missing');
            done();
        });
  });

  test('4. View issues on a project', (done) => {
    chai.request(server)
        .get('/api/issues/apitest/')
        .query({})
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
        });
  });

  test('5. View issues on a project with one filter', (done) => {
    chai.request(server)
        .get('/api/issues/apitest/')
        .query({issue_title: 'Title'})
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.equal(res.body[0].issue_title, 'Title');
            done();
        });
  });

  test('6. View issues on a project with multiple filters', (done) => {
    chai.request(server)
        .get('/api/issues/apitest/')
        .query({ issue_title: 'Title', created_by: 'Functional Text - Required field' })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'created_by');
            assert.equal(res.body[0].issue_title, 'Title');
            assert.equal(res.body[0].created_by, 'Functional Text - Required field');
            done();
        });
  });

  test('7. Update one field on an issue', (done) => {
    chai.request(server)
        .put('/api/issues/apitest/')
        .send({
            _id: exampleID,
            issue_title: 'New title',
            })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, exampleID);
            done();
        });
  });

  test('8. Update multiple fields on an issue', (done) => {
    chai.request(server)
        .put('/api/issues/apitest/')
        .send({
            _id: exampleID,
            issue_text: 'New text',
            created_by: 'Muplti update test'
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, exampleID);
            done();
        });
  });

  test('9. Update an issue with missing _id', (done) => {
    chai.request(server)
        .put('/api/issues/apitest/')
        .send({
            issue_title: 'New Title'
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing _id');
            done();
        });
  });

  test('10. Update an issue with no fields to update', (done) => {
    chai.request(server)
        .put('/api/issues/apitest/')
        .send({
            _id: exampleID,
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'no update field(s) sent');
            assert.equal(res.body._id, exampleID);
            done();
        });
  });

  test('11. Update an issue with an invalid _id', (done) => {
    chai.request(server)
        .put('/api/issues/apitest/')
        .send({
            _id: 'invalid _id',
            issue_title: 'Invalid _id'
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not update');
            done();
        })
  })

  test('12. Delete an issue', (done) => {
    chai.request(server)
        .delete('/api/issues/apitest/')
        .send({
            _id: exampleID
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully deleted');
            assert.equal(res.body._id, exampleID);
            done();
        });
  });

  test('13. Delete an issue with an invalid _id', (done) => {
    chai.request(server)
        .delete('/api/issues/apitest/')
        .send({
            _id: 'invalid id'
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not delete');
            assert.equal(res.body._id, 'invalid id');
            done();
        });
  });

  test('14. Delete an issue with missing _id', (done) => {
    chai.request(server)
        .delete('/api/issues/apitest/')
        .send({})
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing _id');
            done();
        });
  });
});

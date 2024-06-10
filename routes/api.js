'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_DB);

const issueSchema = new mongoose.Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: "" },
  status_text: { type: String, default: "" },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, default: true },
  project: { type: String, required: true }
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res) {
      let project = req.params.project;
      let filter = { project };
      if (Object.keys(req.query).length) {
        filter = { ...filter, ...req.query };
      }
      try {
        const issues = await Issue.find(filter).exec();
        res.json(issues);
      } catch (err) {
        res.json({ error: 'could not retrieve issues' });
      }
    })
    
    .post(async function (req, res) {
      let project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      let newIssue = new Issue({
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || "",
        status_text: status_text || ""
      });
      try {
        const savedIssue = await newIssue.save();
        res.json(savedIssue);
      } catch (err) {
        res.json({ error: 'could not create issue' });
      }
    })
    
    .put(async function (req, res) {
      let project = req.params.project;
      let { _id, ...updateFields } = req.body;
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      if (!Object.keys(updateFields).length) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }
      updateFields.updated_on = Date.now();
      try {
        const updatedIssue = await Issue.findByIdAndUpdate(_id, updateFields, { new: true }).exec();
        if (!updatedIssue) {
          return res.json({ error: 'could not update', '_id': _id });
        }
        res.json({ result: 'successfully updated', '_id': _id });
      } catch (err) {
        res.json({ error: 'could not update', '_id': _id });
      }
    })
    
    .delete(async function (req, res) {
      let project = req.params.project;
      let { _id } = req.body;
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      try {
        const deletedIssue = await Issue.findByIdAndDelete(_id).exec();
        if (!deletedIssue) {
          return res.json({ error: 'could not delete', '_id': _id });
        }
        res.json({ result: 'successfully deleted', '_id': _id });
      } catch (err) {
        res.json({ error: 'could not delete', '_id': _id });
      }
    });
};


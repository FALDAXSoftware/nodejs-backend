/**
 * JobApplications.js
 *
 * @description :: A model definition.  Represents a database of job_applications.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'job_applications',
  attributes: {
    first_name: {
      type: 'string',
      columnName: 'first_name'
    },
    last_name: {
      type: 'string',
      columnName: 'last_name'
    },
    email: {
      type: 'string',
      columnName: 'email',
      allowNull: true
    },
    phone_number: {
      type: 'string',
      columnName: 'phone_number'
    },
    linkedin_profile: {
      type: 'string',
      columnName: 'linkedin_profile'
    },
    website_url: {
      type: 'string',
      columnName: 'website_url'
    },
    resume: {
      type: 'string',
      columnName: 'resume',
      allowNull: true,
      defaultsTo: ''
    },
    cover_letter: {
      type: 'string',
      columnName: 'cover_letter',
      allowNull: true,
      defaultsTo: ''
    },
    job_id: {
      columnName: 'job_id',
      type: 'number'
    },
    created_at: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'created_at'
    },
    updated_at: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'updated_at'
    },
    deleted_at: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'deleted_at'
    }
  }
};

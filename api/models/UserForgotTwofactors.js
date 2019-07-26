/**
 * UserForgotTwofactors.js
 *
 * @description :: Represents a database table kyc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'users_forgot_twofactors',
  primaryKey: 'id',
  attributes: {
    user_id: {
      columnName: 'user_id',
      model: 'users'
    },
    uploaded_file: {
      type: 'string',
      columnName: 'uploaded_file'
    },
    status: {
      type: 'string',
      columnName: 'status'
    },
    reason: {
      type: 'string',
      columnName: 'reason',
      allowNull: true,
      defaultsTo: ""
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
  },
  beforeCreate: (values, next) => {
    console.log(values)
    values.created_at = new Date();
    next();
  },
  beforeUpdate: (values, next) => {
    values.updated_at = new Date();
    next();
  },
  getOpenRequests: getOpenRequests
};


// Get Open Requests
async function getOpenRequests(){
  var query = `SELECT uft.*, u.full_name FROM users_forgot_twofactors uft
              INNER JOIN users u
              ON uft.user_id=u.id
              WHERE uft.status="open"
              `;
  var get_data = await sails.sendNativeQuery( query );
  return get_data;
}

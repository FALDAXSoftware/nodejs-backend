module.exports = {

  friendlyName: 'Delete Order',

  description: 'Delete buy.',

  inputs: {
    id: {
      type: 'number',
      example: 1,
      description: 'id of activity.',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    let now = new Date();
    await buyBook
      .update({id: inputs.id})
      .set({deleted_at: now});
    return exits.success();
  }

};

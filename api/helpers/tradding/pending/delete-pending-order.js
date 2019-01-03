module.exports = {

  friendlyName: 'Delete pending order',

  description: '',

  inputs: {
    id: {
      type: 'number',
      example: 1,
      description: 'id of pending book.',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs) {
    let now = new Date();
    console.log(inputs.id);
    await PendingBook
      .update({ id: inputs.id })
      .set({ deleted_at: now });
    return exits.success();
  }

};

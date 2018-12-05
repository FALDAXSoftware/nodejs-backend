module.exports = {


  friendlyName: 'Delete order',


  description: '',


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
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
    let now = new Date();
    await sellBook.update({ id: inputs.id }).set({ deleted_at: now });
    return exits.success();
  }


};


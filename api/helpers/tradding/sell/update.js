module.exports = {

  friendlyName: 'Update',

  description: 'Update sell.',

  inputs: {
    id: {
      type: 'number',
      example: 1,
      description: 'id of activity.',
      required: true
    },
    data: {
      type: "json",
      description: 'Order Data To add.',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    let updatedbook = await sellBook
      .update({id: inputs.id})
      .set(inputs.data)
      .fetch();
    console.log(updatedbook);
    return exits.success(updatedbook);
  }

};

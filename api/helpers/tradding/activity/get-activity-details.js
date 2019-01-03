module.exports = {

  friendlyName: 'Get activity details',

  description: '',

  inputs: {
    id: {
      type: 'number',
      example: 1,
      description: 'Id for which details need to be fetched',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Activity details'
    }
  },

  fn: async function (inputs, exits) {

    // Get activity details.
    var activityDetails;
    // TODO

    activityDetails = await ActivityTable.find({
      where: {
        deleted_at: null,
        id: inputs.id
      },
      sort: 'id DESC'
    })

    // Send back the result through the success exit.
    return exits.success(activityDetails);

  }

};

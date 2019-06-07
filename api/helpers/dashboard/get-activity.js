module.exports = {

  friendlyName: 'Get activity',

  description: '',

  inputs: {
    user_id: {
      type: 'number',
      example: 1,
      description: 'id of user',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Activity'
    }
  },

  fn: async function (inputs) {

    // Get activity.
    var activity;
    // TODO
    activity = await ActivityTable.find({
      where: {
        deleted_at: null,
        user_id: inputs.user_id,
        is_market: false
      },
      limit: 10,
      sort: "created_at DESC"
    });
    // Send back the result through the success exit.
    return activity;

  }

};

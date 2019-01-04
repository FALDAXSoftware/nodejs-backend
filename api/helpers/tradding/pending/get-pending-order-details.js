module.exports = {

  friendlyName: 'Get pending order details',

  description: '',

  inputs: {},

  exits: {

    success: {
      outputFriendlyName: 'Pending order details'
    }
  },

  fn: async function (inputs, exits) {

    // Get pending order details.
    var pendingOrderDetails;
    // TODO

    pendingOrderDetails = await PendingBook.find({
      where: {
        deleted_at: null
      },
      sort: "id DESC"
    });

    // Send back the result through the success exit.
    return exits.success(pendingOrderDetails);

  }

};

module.exports = {
  friendlyName: 'Update Admin Wallet address',
  description: 'Update Admin Wallet address.',
  inputs: {
    wallet_data: {
      type: 'json',
      example: '{}',
      description: 'Wallet details to update'
    },
  },

  exits: {
    success: {
      description: 'All done.'
    },
    error: {
      description: 'error.'
    }
  },

  fn: async function (inputs, exits) {
    var coin_id = inputs.wallet_data.id;
    var type = inputs.wallet_data.type;
    var amount = inputs.wallet_data.amount;
    var get_data = await Wallet.findOne({
      where: {
        deleted_at: null,
        coin_id: coin_id,
        is_active: true,
        user_id: 36,
        is_admin: true
      }
    });
    if (get_data != undefined) {
      if( type == "add"){
        console.log("BeforeBalance===>>>",parseFloat(get_data.balance));
        var updatedBalance = parseFloat(get_data.balance) + (parseFloat(amount));
        var updatedPlacedBalance = parseFloat(get_data.placed_balance) + (parseFloat(amount));
      }
      if( type == "subtract"){
        var updatedBalance = parseFloat(get_data.balance) - (parseFloat(amount));
        var updatedPlacedBalance = parseFloat(get_data.placed_balance) - (parseFloat(amount));        
      }  
      console.log("updatedBalance===>>>",updatedBalance);
      console.log("updatedPlacedBalance===>>>",updatedPlacedBalance);
      var updatedData = await Wallet
          .update({
            deleted_at: null,
            coin_id: coin_id,
            is_active: true,
            user_id: 36,
            is_admin: true
          })
          .set({
            balance: updatedBalance,
            placed_balance: updatedPlacedBalance
          })
          .fetch();   
      console.log("updatedData===>>>",updatedData);     
    }
    var data = {status:1}
    return exits.success(data);
  }

};

module.exports = {


  friendlyName: 'Kyc cron',


  description: 'KYC CRON',


  inputs: {

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {
    let pendingKYC = await KYC.find({ deleted_at: null, status: false, steps: 3 });
    console.log('pendingKYC?>>>>>>', pendingKYC)
    for (let index = 0; index < pendingKYC.length; index++) {
      const element = pendingKYC[index];
      await sails.helpers.kycpicUpload(element);
    }
  }


};


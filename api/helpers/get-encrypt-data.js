var aesjs = require('aes-js');
module.exports = {


  friendlyName: 'Get encrypt data',


  description: '',


  inputs: {
    text: {
      type: 'string',
      example: "zjvfvk kasghd",
      description: 'Text which needs to be excrypted',
      required: true
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Encrypt data',
    },

  },


  fn: async function (inputs, exits) {

    // Get encrypt data.
    var encryptData;

    var key = sails.config.local.key;
    var iv = sails.config.local.iv;

    var textBytes = aesjs.utils.utf8.toBytes(inputs.text);
    var aesOfb = new aesjs.ModeOfOperation.ofb(key, iv);
    var encryptedBytes = aesOfb.encrypt(textBytes);

    // To print or store the binary data, you may convert it to hex
    var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    // Send back the result through the success exit.
    return exits.success(encryptedHex);

  }


};

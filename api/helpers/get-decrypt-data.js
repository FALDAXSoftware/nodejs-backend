var aesjs = require('aes-js');

module.exports = {


  friendlyName: 'Get decrypt data',


  description: '',


  inputs: {
    text: {
      type: 'string',
      example: "zjvfvk kasghd",
      description: 'Text which needs to be decrypted',
      required: true
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Decrypt data',
    },

  },


  fn: async function (inputs, exits) {

    // Get decrypt data.
    var decryptData;

    var key = sails.config.local.key;

    var iv = sails.config.local.iv;

    console.log("key", key);
    console.log("iv", iv)

    // When ready to decrypt the hex string, convert it back to bytes
    var encryptedBytes = aesjs.utils.hex.toBytes(inputs.text);

    // The output feedback mode of operation maintains internal state,
    // so to decrypt a new instance must be instantiated.
    var aesOfb = new aesjs.ModeOfOperation.ofb(key, iv);
    var decryptedBytes = aesOfb.decrypt(encryptedBytes);

    // Convert our bytes back into text
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);

    // Send back the result through the success exit.
    return exits.success(decryptedText);

  }


};

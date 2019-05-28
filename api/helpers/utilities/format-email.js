module.exports = {


  friendlyName: 'Format email',


  description: 'format email and replace variables with value',


  inputs: {
    emailContent: {
      type: 'string',
      example: '',
      description: 'content of email template',
      required: true
    },
    data: {
      type: "json",
      required: true
    }
  },


  exits: {
    success: {
      description: 'All done.',
    },
  },


  fn: async function (inputs, exits) {
    let { emailContent, data } = inputs
    let rex = /{{([^}]+)}}/g;
    let key;
    while (key = rex.exec(emailContent)) {
      emailContent = emailContent.replace(key[0], data[key[1]] ? data[key[1]] : '');
    }
    exits.success(emailContent);
  }


};


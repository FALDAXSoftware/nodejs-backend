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
    let {
      emailContent,
      data
    } = inputs
    let rex = /{{([^}]+)}}/g;
    let key;
    if ("object" in data) {
      data = data.object;
    }
    var tempEmailContent = emailContent;
    while (key = rex.exec(emailContent)) {
      // emailContent = emailContent.replace(key[0], data[key[1]] ? data[key[1]] : '');  
      var temp_var = '';
      if (Array.isArray(data[key[1]])) {
        temp_var = ''
        data[key[1]].forEach(function (each, index) {
          temp_var += JSON.stringify(each) + '<br>'
        })
      } else {
        temp_var = data[key[1]];
      }
      // tempEmailContent = tempEmailContent.replace(key[0], data[key[1]] ? data[key[1]] : '');
      tempEmailContent = tempEmailContent.replace(key[0], data[key[1]] ? temp_var : '');
    }
    exits.success(tempEmailContent);
  }


};

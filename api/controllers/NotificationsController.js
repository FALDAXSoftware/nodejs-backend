/**
 * Notifications
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  getNotificationList: async function (req, res) {
    try {
      var user_id = req.user.id;
      console.log(user_id)
      var notificationList = await UserNotification.find({
        deleted_at: null,
        user_id: user_id
      })

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("notification retreive success"),
          "data": notificationList
        });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  updateOrAddUserNotification: async function (req, res) {
    try {

      var {
        data
      } = req.body;

      console.log(req.body)

      var user_id = req.user.id;

      console.log(data);
      console.log(data.length);

      for (var i = 0; i < data.length; i++) {
        var notificationData = await UserNotification.findOne({
          deleted_at: null,
          slug: data[i].slug,
          user_id: user_id
        })

        if (notificationData != undefined || notificationData.length > 0) {
          var updatedData = await UserNotification
            .update({
              deleted_at: null,
              slug: data[i].slug,
              user_id: user_id
            })
            .set({
              text: data[i].text,
              email: data[i].email
            })
        }
      }

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("notification update success")
        })

    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};

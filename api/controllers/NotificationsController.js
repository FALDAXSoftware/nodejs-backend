/**
 * Notifications
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var logger = require("./logger");
module.exports = {

  getNotificationList: async function (req, res) {
    try {
      var user_id = req.user.id;
      // var notificationList = await UserNotification.find({
      //   deleted_at: null,
      //   user_id: user_id
      // })
      //   .sort('id DESC')

      var query = `SELECT user_notifications.id, user_notifications.text, user_notifications.email, user_notifications.created_at, 
        user_notifications.user_id, notifications.title
        FROM public.user_notifications LEFT JOIN notifications
        ON user_notifications.slug = notifications.slug
        WHERE user_notifications.user_id=${user_id}`

      let notificationList = await sails.sendNativeQuery(query, []);
      notificationList = notificationList.rows;

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("notification retreive success"),
          "data": notificationList
        });
    } catch (err) {
      console.log(err);
      await logger.error(err.message)
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

      var data = req.body;

      var user_id = req.user.id;

      for (var i = 0; i < data.length; i++) {
        var notificationData = await UserNotification.findOne({
          deleted_at: null,
          slug: data[i].slug,
          user_id: user_id,
          id: data[i].id
        })

        if (notificationData != undefined) {
          var updatedData = await UserNotification
            .update({
              deleted_at: null,
              slug: data[i].slug,
              user_id: user_id,
              id: data[i].id
            })
            .set({
              text: data[i].text,
              email: data[i].email
            })
        }
      }

      var notificationUpdateData = await UserNotification.find({
        deleted_at: null,
        user_id: user_id
      }).sort('id DESC')

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("notification update success"),
          "data": notificationUpdateData
        })

    } catch (err) {
      console.log(err);
      await logger.error(err.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};

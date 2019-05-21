/**
 * RoleController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // Add New Role
  create: async function (req, res) {
    let params = req.body;
    try {
      let role = await Role
        .create(params)
        .fetch();
      if (!role) {
        return res
          .status(500)
          .json({
            status: 500,
            err: sails.__("Something Wrong")
          });
      }
      return res.json({
        status: 200,
        message: sails.__("Role added success")
      })
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          err: sails.__("Something Wrong")
        })
    }
  },

  get: async function (req, res) {
    try {
      let { sortCol, sortOrder } = req.allParams();
      let query = " from roles";
      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend'
          ? 'DESC'
          : 'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      }
      let roles = await sails.sendNativeQuery("Select users, assets, roles, countries, employee," +
        "pairs, limit_management, transaction_history, trade_history, withdraw_requests," +
        "dashboard,  jobs, kyc, fees, panic_button, news, is_referral, add_user" + query, [])
      let roleName = await sails.sendNativeQuery("Select name, is_active" + query, [])

      roleName = roleName.rows;
      roles = roles.rows;
      return res.json({
        status: 200,
        message: sails.__("Role retrived success"),
        roles,
        roleName
      })
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          err: sails.__("Something Wrong")
        })
    }
  },

  update: async function (req, res) {
    try {
      let role = await Role.findOne({ id: req.body.id });
      if (!role) {
        return res
          .status(500)
          .json({
            status: 500,
            err: sails.__("Invalid Role Id.")
          });
      }
      await Role
        .update({ id: role.id })
        .set(req.body);
      return res.json({
        status: 200,
        message: sails.__("Role Updated success")
      })
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          err: sails.__("Something Wrong")
        })
    }
  },

  delete: async function (req, res) {
    try {
      let role = await Role.findOne({ id: req.body.id });
      if (!role) {
        return res
          .status(500)
          .json({
            status: 500,
            err: sails.__("Invalid Role Id.")
          });
      } else {
        await Role
          .update({ id: role.id })
          .set({ deleted_at: new Date() });
        return res.json({
          status: 200,
          message: sails.__("Role Deleted success")
        })
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          err: sails.__("Something Wrong")
        })
    }
  }
};

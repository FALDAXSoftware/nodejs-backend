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
      let existingRole = await Role.findOne({ name: req.body.name, deleted_at: null });

      if (existingRole) {
        return res
          .status(500)
          .json({
            status: 500,
            err: "Role name exists"
          });
      }

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
      let { sortCol, sortOrder, status } = req.allParams();
      let query = " from roles WHERE deleted_at IS NULL";
      if (status) {
        query += "AND is_active = " + status
      }
      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend'
          ? 'DESC'
          : 'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      } else {
        query += " ORDER BY id DESC";
      }

      let roles = await sails.sendNativeQuery("Select id, name, is_active, users, assets, roles, countries, employee," +
        "pairs, transaction_history, trade_history, withdraw_requests," +
        "dashboard, jobs, kyc, fees, panic_button, news, is_referral, add_user" + query, [])
      //let roleName = await sails.sendNativeQuery("Select id, name, is_active" + query, [])

      // roleName = roleName.rows;
      roles = roles.rows;
      return res.json({
        status: 200,
        message: sails.__("Role retrived success"),
        roles,
        // roleName
      })
    } catch (error) {
      console.log('error', error)
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

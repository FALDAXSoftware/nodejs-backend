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
            let role = await Role.create(params).fetch();
            if (!role) {
                return res.status(500).json({ status: 500, err: sails.__("Something Wrong") });
            }
            return res.json({ status: 200, message: "Role added successfully" })
        } catch (error) {
            return res.status(500).json({ status: 500, err: sails.__("Something Wrong") })
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
            let roles = await sails.sendNativeQuery("Select *" + query, [])

            roles = roles.rows;
            return res.json({ status: 200, message: "Role retrived successfully", roles })
        } catch (error) {
            return res.status(500).json({ status: 500, err: sails.__("Something Wrong") })
        }
    },

    update: async function (req, res) {
        try {
            let role = await Role.findOne({ id: req.body.id });
            if (!role) {
                return res.status(500).json({ status: 500, err: "Invalid Role Id." });
            }
            await Role.update({ id: role.id }).set(req.body);
            return res.json({ status: 200, message: "Role Updated successfully" })
        } catch (error) {
            return res.status(500).json({ status: 500, err: sails.__("Something Wrong") })
        }
    },

    delete: async function (req, res) {
        try {
            let role = await Role.findOne({ id: req.body.id });
            if (!role) {
                return res.status(500).json({ status: 500, err: "Invalid Role Id." });
            } else {
                await Role.update({ id: role.id }).set({ deleted_at: new Date() });
                return res.json({ status: 200, message: "Role Deleted successfully" })
            }
        } catch (error) {
            return res.status(500).json({ status: 500, err: sails.__("Something Wrong") })
        }
    }
};

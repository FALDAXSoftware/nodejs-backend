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
                return res.status(500).json({
                    err: "Something went wrong."
                });
            }
            return res.json({
                status: "200",
                message: "Role added successfully"
            })
        } catch (error) {
            console.log(error);

            return res.status(500).json({
                err: "Something went wrong."
            })
        }
    },

    get: async function (req, res) {
        try {
            let roles = await Role.find({ deleted_at: null }).sort("created_at DESC");
            return res.json({
                status: "200",
                message: "Role retrivedsuccessfully",
                roles: roles
            })
        } catch (error) {
            return res.status(500).json({
                err: "Something went wrong."
            })
        }
    },

    update: async function (req, res) {
        try {
            let role = await Role.findOne({ id: req.body.id });
            if (!role) {
                return res.status(500).json({
                    err: "Invalid Role Id."
                });
            }
            await Role.update({ id: role.id }).set(req.body);
            return res.json({
                status: "200",
                message: "Role Updated successfully"
            })
        } catch (error) {
            return res.status(500).json({
                err: "Something went wrong."
            })
        }
    },

    delete: async function (req, res) {
        try {
            let role = await Role.findOne({ id: req.body.id });
            if (!role) {
                return res.status(500).json({
                    err: "Invalid Role Id."
                });
            } else {
                await Role.update({ id: role.id }).set({ deleted_at: new Date() });
                return res.json({
                    status: "200",
                    message: "Role Deleted successfully"
                })
            }
        } catch (error) {
            return res.status(500).json({
                err: "Something went wrong."
            })
        }
    }


};


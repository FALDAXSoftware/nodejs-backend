/**
 * AnnouncementController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------

    //-------------------------------CMS Api--------------------------
    getAnnouncementTemplate: async function (req, res) {
        let announcementTemplateData = await Announcement.find({
            where: {
                deleted_at: null
            }
        });
        if (announcementTemplateData) {
            return res.json({
                "status": 200,
                "message": "Announcement list",
                "data": announcementTemplateData
            });
        }
    },

    create: async function (req, res) {
        try {
            if (req.body.title && req.body.name && req.body.content) {
                var announcementTemplate = await Announcement.create({
                    name: req.body.name,
                    slug: req.body.name.split(' ').join('_'),
                    content: req.body.content,
                    title: req.body.title,
                }).fetch();
                if (announcementTemplate) {
                    //Send verification email in before create
                    res.json({
                        "status": 200,
                        "message": "Announcement created successfully."
                    });
                    return;
                } else {
                    res.status(400).json({
                        "status": 400,
                        "err": "not listed",
                    });
                    return;
                }
            } else {
                res.status(400).json({
                    "status": 400,
                    "err": "Missing Parameters",
                });
                return;
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
            return;
        }
    },

    update: async function (req, res) {
        try {
            const announcementTemplate = await Announcement.findOne({ id: req.body.id });
            if (!announcementTemplate) {
                return res.status(401).json({ status: 401, "err": 'Invalid Static Id' });
            }
            var updatedAnnouncement = await Announcement.update({ id: req.body.id }).set(req.body).fetch();
            if (!updatedAnnouncement) {
                return res.status(400).json({
                    "status": 400,
                    "message": "Something went wrong! could not able to update announcement details"
                });
            }

            return res.json({
                "status": 200,
                "message": "Announcement details updated successfully"
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
            return;
        }
    },

    delete: async function (req, res) {
        let { id } = req.allParams();
        if (!id) {
            res.status(500).json({
                "status": 500,
                "err": "Announcement id is not sent"
            });
            return;
        }
        let announcementTemplateData = await Announcement.update({ id: id }).set(
            { deleted_at: new Date() }
        ).fetch();
        if (announcementTemplateData) {
            return res.status(200).json({
                "status": 200,
                "message": "Announcement deleted successfully"
            });
        }
    },

    sendemail: async function (req, res) {
        let { id } = req.allParams();
        let announcement = await Announcement.findOne({ id: id });
        let users = await Users.find({ where: { is_active: true, is_verified: true }, select: ['email'] });
        let newUser = [];
        users.map(data => {
            newUser.push(data.email);
        })
        sails.hooks.email.send(
            "general-email",
            {
                homelink: sails.config.urlconf.APP_URL,
                content: announcement.content,
            },
            {
                bcc: newUser.join(","),
                subject: announcement.title
            },
            function (err) {
                if (!err) {
                    return res.json({
                        "status": 200,
                        "message": "Announcement sent to email successfully."
                    });
                }
            }
        )
    }
};

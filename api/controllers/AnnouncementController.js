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
        let { page, limit } = req.allParams();
        let announcementTemplateData = await Announcement.find(
            {
                where: {
                    deleted_at: null
                }
            }
        ).paginate({ page, limit });
        // console.log(announcementTemplateData)
        if (announcementTemplateData) {
            return res.json({
                "status": "200",
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
                    res.json({
                        "status": 400,
                        "message": "not listed",
                        "error": "Something went wrong",
                    });
                    return;
                }
            } else {
                res.json({
                    "status": 400,
                    "message": "not listed",
                    "error": "Missing Parameters",
                });
                return;
            }
        } catch (error) {
            res.status(500).json({
                "status": "500",
                "message": "error",
                "errors": error
            });
            return;
        }
    },


    update: async function (req, res) {
        try {
            const announcementTemplate = await Announcement.findOne({ id: req.body.id });
            if (!announcementTemplate) {
                return res.status(401).json({ err: 'invalid Static Id' });
            }
            var updatedAnnouncement = await Announcement.update({ id: req.body.id }).set(req.body).fetch();
            if (!updatedAnnouncement) {
                return res.json({
                    "status": "200",
                    "message": "Something went wrong! could not able to update announcement details"
                });
            }

            return res.json({
                "status": "200",
                "message": "Announcement details updated successfully"
            });

        } catch (error) {
            res.json({
                "status": "500",
                "message": "error",
                "errors": error
            });
            return;
        }
    },


    delete: async function (req, res) {
        let { id } = req.allParams();
        if (!id) {
            res.json({
                "status": 500,
                "message": "Announcement id is not sent"
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
        let users = await Users.find({ where: { is_active: true }, select: ['email'] });
        let newUser = [];
        users.map(data => {
            newUser.push(data.email);
        })
        sails.hooks.email.send(
            "general-email",
            {
                homelink: "http://192.168.0.85:3000",
                content: announcement.content,
            },
            {
                bcc: newUser.join(","),
                subject: announcement.title
            },
            function (err) {
                if (!err) {
                    return res.json({
                        "status": "200",
                        "message": "Anouncement sent to email successfully"
                    });
                }
            }
        )
    }

};

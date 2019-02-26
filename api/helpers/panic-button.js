module.exports = {
    friendlyName: 'Panic Button',

    description: 'Panic Button',

    inputs: {

    },

    exits: {
        success: {
            description: 'All done.',
        },
    },

    fn: async function (inputs) {
        let allSellBookData = await sellBook.find({ deleted_at: null, is_partially_fulfilled: true, order_type: 'Limit' });
        let allUsers = [];
        for (let index = 0; index < allSellBookData.length; index++) {
            const temp = allSellBookData[index].user_id;
            allUsers.push(temp);
        }
        return allUsers;
    }
};

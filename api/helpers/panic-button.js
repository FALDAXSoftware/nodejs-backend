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
        let allbuyBookData = await buyBook.find({ deleted_at: null, is_partially_fulfilled: true, order_type: 'Limit' });
        let allPendingBookData = await PendingBook.find({ deleted_at: null });

        let finalUserList = [];
        finalUserList = allSellBookData.concat(allbuyBookData);
        finalUserList = allSellBookData.concat(allPendingBookData);

        let allUsers = [];
        for (let index = 0; index < finalUserList.length; index++) {
            const temp = finalUserList[index].user_id;
            if (allUsers.indexOf(temp) === -1) {
                allUsers.push(temp);
            }
        }
        return allUsers;
    }
};

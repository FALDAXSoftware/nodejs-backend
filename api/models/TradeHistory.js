/**
 * TradeHistory.js
 *
 * @description :: Represents a database table trade_history.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'trade_history',
    attributes: {
        maximum_time: {
            type: 'ref',
            columnName: 'maximum_time',
            columnType: 'datetime'
        },
        fill_price: {
            type: 'number',
            columnName: 'fill_price',
        },
        limit_price: {
            type: 'number',
            columnName: 'limit_price',
        },
        stop_price: {
            type: 'number',
            columnName: 'stop_price',
        },
        price: {
            type: 'number',
            columnName: 'price',
        },
        quantity: {
            type: 'number',
            columnName: 'quantity',
        },
        currency: {
            type: 'string',
            columnName: 'currency',
        },
        average_price: {
            type: 'number',
            columnName: 'average_price',
        },
        settle_currency: {
            type: 'string',
            columnName: 'settle_currency',
        },
        side: {
            type: 'string',
            columnName: 'side',
        },
        order_type: {
            type: 'string',
            columnName: 'order_type',
        },
        order_status: {
            type: 'string',
            columnName: 'order_status',
        },
        deleted: {
            type: 'boolean',
            columnName: 'deleted',
            defaultsTo: false
        },
        requested_user_id: {
            type: 'number',
            columnName: 'requested_user_id',
        },
        is_partially_filled: {
            type: 'boolean',
            columnName: 'is_partially_filled',
            defaultsTo: false
        },
        fix_quantity: {
            type: 'boolean',
            columnName: 'fix_quantity',
            defaultsTo: false
        },
        symbol: {
            type: 'string',
            columnName: 'symbol',
        },
        maker_fee: {
            type: 'number',
            columnName: 'maker_fee',
        },
        taker_fee: {
            type: 'number',
            columnName: 'taker_fee',
        },
        user_id: {
            type: 'string',
            columnName: 'user_id',
            required: true,
        },
        user_fee: {
            type: 'number',
            columnName: 'user_fee',
        },
        user_coin: {
            type: 'string',
            columnName: 'user_coin',
        },
        requested_fee: {
            type: 'number',
            columnName: 'requested_fee',
        },
        requested_coin: {
            type: 'string',
            columnName: 'requested_coin',
        },
        created_at: {
            type: 'ref',
            columnType: 'datetime',
            columnName: 'created_at'
        },
        updated_at: {
            type: 'ref',
            columnType: 'datetime',
            columnName: 'updated_at'
        },
        deleted_at: {
            type: 'ref',
            columnType: 'datetime',
            columnName: 'deleted_at'
        }
    },
    beforeCreate: function (values, next) {
        values.created_at = new Date();
        next();
    },

    beforeUpdate: function (values, next) {
        values.updated_at = new Date();
        next();
    }
};

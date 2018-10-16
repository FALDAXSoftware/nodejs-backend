/**
 * Limit.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'limit',
    attributes: {
        user: {
            type: 'string',
            columnName: 'user',
        },
        monthlyDepositCrypto: {
            type: 'number',
            columnName: 'monthlyDepositCrypto',
        },
        monthlyDepositFiat: {
            type: 'number',
            columnName: 'monthlyDepositFiat',
        },
        monthlyWithdrawCrypto: {
            type: 'number',
            columnName: 'monthlyWithdrawCrypto',
        },
        monthlyWithdrawFiat: {
            type: 'number',
            columnName: 'monthlyWithdrawFiat',
        },
        dailyDepositCrypto: {
            type: 'number',
            columnName: 'dailyDepositCrypto',
        },
        dailyDepositFiat: {
            type: 'number',
            columnName: 'dailyDepositFiat',
        },
        dailyWithdrawCrypto: {
            type: 'number',
            columnName: 'dailyWithdrawCrypto',
        },
        dailyWithdrawFiat: {
            type: 'number',
            columnName: 'dailyWithdrawFiat',
        },
        minWithdrawlCrypto: {
            type: 'number',
            columnName: 'minWithdrawlCrypto',
        },
        minWithdrawlFiat: {
            type: 'number',
            columnName: 'minWithdrawlFiat',
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
    }
};

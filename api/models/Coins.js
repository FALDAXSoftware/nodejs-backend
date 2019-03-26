/**
 * Coins.js
 *
 * @description :: Represents a database table coins.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'coins',
  attributes: {
    coin_icon: {
      type: 'string',
      columnName: 'coin_icon',
      allowNull: true
    },
    coin_name: {
      type: 'string',
      columnName: 'coin_name',
      required: true
    },
    coin_code: {
      type: 'string',
      columnName: 'coin_code',
      required: true
    },
    coin: {
      type: 'string',
      columnName: 'coin',
      // required: true
      allowNull: true
    },
    minLimit: {
      type: 'number',
      columnName: 'minLimit',
      allowNull: true,
      defaultsTo: 0
    },
    maxLimit: {
      type: 'number',
      columnName: 'maxLimit',
      allowNull: true,
      defaultsTo: 0
    },
    isERC: {
      type: 'boolean',
      columnName: 'isERC',
      defaultsTo: false
    },
    // description: {   type: 'string',   columnName: 'description',   required:
    // true },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true,
      allowNull: true
    },
    wallet_address: {
      type: 'string',
      columnName: 'wallet_address',
      allowNull: true
    },
    is_fiat: {
      type: 'boolean',
      columnName: 'is_fiat',
      defaultsTo: false
    },
    type: {
      type: 'number',
      columnName: 'type',
      defaultsTo: 1
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
    },
    userWallets: {
      collection: "wallet",
      via: 'coin_id'
    }
  },
  beforeCreate: (values, next) => {
    values.created_at = new Date();
    next();
  },
  beforeUpdate: (values, next) => {
    values.updated_at = new Date();
    next();
  },
  customToJSON: function () {
    if (!this.coin_icon || this.coin_icon == "" || this.coin_icon == null) {
      this.coin_icon = "coin/defualt_coin.png"
    }
    return this;
  }
};

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
    min_thresold: {
      type: 'number',
      columnName: 'min_thresold',
      defaultsTo: 0
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
    min_limit: {
      type: 'number',
      columnName: 'min_limit',
      defaultsTo: 0
    },
    max_limit: {
      type: 'number',
      columnName: 'max_limit',
      defaultsTo: 0
    },
    deposit_method: {
      type: 'string',
      columnName: 'deposit_method',
      required: true
    },
    kraken_coin_name: {
      type: 'string',
      columnName: 'kraken_coin_name',
      required: true
    },
    isERC: {
      type: 'boolean',
      columnName: 'isERC',
      defaultsTo: false
    },
    is_address_created_signup: {
      type: 'boolean',
      columnName: 'is_address_created_signup',
      defaultsTo: false
    },
    hot_send_wallet_address: {
      type: 'string',
      columnName: 'hot_send_wallet_address',
      allowNull: true
    },
    hot_receive_wallet_address: {
      type: 'string',
      columnName: 'hot_receive_wallet_address',
      allowNull: true
    },
    warm_wallet_address: {
      type: 'string',
      columnName: 'warm_wallet_address',
      allowNull: true
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

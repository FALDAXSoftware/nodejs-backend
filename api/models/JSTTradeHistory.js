/**
 * JSTTradeHistory.js
 *
 * @description :: Represents a database table trade_history.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'jst_trade_history',
  attributes: {
    fill_price: {
      type: 'number',
      columnName: 'fill_price'
    },
    price: {
      type: 'number',
      columnName: 'price'
    },
    quantity: {
      type: 'number',
      columnName: 'quantity'
    },
    currency: {
      type: 'string',
      columnName: 'currency'
    },
    settle_currency: {
      type: 'string',
      columnName: 'settle_currency'
    },
    side: {
      type: 'string',
      columnName: 'side'
    },
    order_type: {
      type: 'string',
      columnName: 'order_type'
    },
    order_status: {
      type: 'string',
      columnName: 'order_status'
    },
    is_partially_filled: {
      type: 'boolean',
      columnName: 'is_partially_filled',
      defaultsTo: false
    },
    fix_quantity: {
      type: 'number',
      columnName: 'fix_quantity'
    },
    buy_currency_amount: {
      type: 'number',
      columnName: 'buy_currency_amount'
    },
    sell_currency_amount: {
      type: 'number',
      columnName: 'sell_currency_amount'
    },
    limit_price: {
      type: 'number',
      columnName: 'limit_price'
    },
    difference_faldax_commission:{
      type: 'number',
      columnName: 'difference_faldax_commission'
    },
    symbol: {
      type: 'string',
      columnName: 'symbol'
    },
    user_id: {
      type: 'number',
      columnName: 'user_id',
      required: true
    },
    offer_message: {
      type: 'string',
      columnName: 'offer_message'
    },
    offer_code: {
      type: 'string',
      columnName: 'offer_code'
    },
    offer_applied: {
      type: 'boolean',
      columnName: 'offer_applied'
    },
    campaign_id: {
      type: 'number',
      columnName: 'campaign_id'
    },
    campaign_offer_id: {
      type: 'number',
      columnName: 'campaign_offer_id'
    },
    is_collected: {
      type: 'boolean',
      columnName: 'is_collected'
    },
    filled: {
      type: 'number',
      columnName: 'filled'
    },
    order_id: {
      type: 'string',
      columnName: 'order_id'
    },
    execution_report: {
      type: 'ref',
      columnType: 'json',
      columnName: 'execution_report',
      defaultsTo: {}
    },
    // cl_order_id: {
    //   type: 'number',
    //   columnName: 'cl_order_id'
    // },
    exec_id: {
      type: 'string',
      columnName: 'exec_id'
    },
    transact_time: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'transact_time'
    },
    settl_date: {
      type: 'ref',
      columnType: 'date',
      columnName: 'settl_date'
    },
    trade_date: {
      type: 'ref',
      columnType: 'date',
      columnName: 'trade_date'
    },
    settl_curr_amt: {
      type: 'number',
      columnName: 'settl_curr_amt'
    },
    leaves_qty: {
      type: 'number',
      columnName: 'leaves_qty'
    },
    faldax_fees: {
      type: 'number',
      columnName: 'faldax_fees'
    },
    faldax_fees_actual: {
      type: 'number',
      columnName: 'faldax_fees_actual'
    },    
    network_fees: {
      type: 'number',
      columnName: 'network_fees'
    },
    amount_after_fees_deduction: {
      type: 'number',
      columnName: 'amount_after_fees_deduction'
    },
    asset1_usd_value: {
      type: 'number',
      columnName: 'asset1_usd_value'
    },
    asset2_usd_value: {
      type: 'number',
      columnName: 'asset2_usd_value'
    },
    reason: {
      type: 'string',
      columnName: 'reason'
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
    deleted: {
      type: 'boolean',
      columnName: 'deleted'
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

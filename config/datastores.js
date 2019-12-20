/**
 * Datastores
 * (sails.config.datastores)
 *
 * A set of datastore configurations which tell Sails where to fetch or save
 * data when you execute built-in model methods like `.find()` and `.create()`.
 *
 *  > This file is mainly useful for configuring your development database,
 *  > as well as any additional one-off databases used by individual models.
 *  > Ready to go live?  Head towards `config/env/production.js`.
 *
 * For more information on configuring datastores, check out:
 * https://sailsjs.com/config/datastores
 */

module.exports.datastores = {


  /***************************************************************************
   *                                                                          *
   * Your app's default datastore.                                            *
   *                                                                          *
   * Sails apps read and write to local disk by default, using a built-in     *
   * database adapter called `sails-disk`.  This feature is purely for        *
   * convenience during development; since `sails-disk` is not designed for   *
   * use in a production environment.                                         *
   *                                                                          *
   * To use a different db _in development_, follow the directions below.     *
   * Otherwise, just leave the default datastore as-is, with no `adapter`.    *
   *                                                                          *
   * (For production configuration, see `config/env/production.js`.)          *
   *                                                                          *
   ***************************************************************************/

  default: {

    /***************************************************************************
     *                                                                          *
     * Want to use a different database during development?                     *
     *                                                                          *
     * 1. Choose an adapter:                                                    *
     *    https://sailsjs.com/plugins/databases                                 *
     *                                                                          *
     * 2. Install it as a dependency of your Sails app.                         *
     *    (For example:  npm install sails-mysql --save)                        *
     *                                                                          *
     * 3. Then pass it in, along with a connection URL.                         *
     *    (See https://sailsjs.com/config/datastores for help.)                 *
     *                                                                          *
     ***************************************************************************/
    adapter: 'sails-postgresql',
    //url: 'postgresql://postgres:admin@123@18.191.87.133/faldax', //developer 
    // url: "postgresql://root:vceqxN5hZPyfWz9Z@prod-faldax.cuhktbe1gpfj.us-east-2.rds.amazonaws.com/faldax",
    url: process.env.PRE_PROD_URL,
    // url: "postgresql://root:RXJSwBGZ7KdP9X4e@dev-faldax-2019-10-22-03-12.cuhktbe1gpfj.us-east-2.rds.amazonaws.com/faldax",
    // url: "postgresql://root:RXJSwBGZ7KdP9X4e@dev-faldax.cuhktbe1gpfj.us-east-2.rds.amazonaws.com/database",
    // url: "postgresql://faldaxdev:nBhAJbxd2LcpBjWJ@dev-faldax.cuhktbe1gpfj.us-east-2.rds.amazonaws.com/faldax",
    ssl: false,
    pool: false
  },
};

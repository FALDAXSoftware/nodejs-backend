/**
 * CountriesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {
  getCountries: async function (req, res) {
    try {
      let {
        page,
        limit,
        data,
        legality,
        sortCol,
        sortOrder
      } = req.allParams();
      let query = " from countries";
      if ((data && data != "") || (legality && legality != "")) {
        query += " WHERE"
        let isDataAppended = false;
        if (data && data != "" && data != null) {
          query = query + " LOWER(name) LIKE '%" + data.toLowerCase() + "%'";
          isDataAppended = true;
        }

        if (legality && legality != "" && legality != null) {
          if (isDataAppended) {
            query += " AND"
          }
          query = query + " legality= " + legality
        }
      }
      countQuery = query;
      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend'
          ? 'DESC'
          : 'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      } else {
        query += " ORDER BY id DESC";
      }
      if (limit != null) {
        query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));
      }
      let countryData = await sails.sendNativeQuery("Select *" + query, [])

      countryData = countryData.rows;

      for (let i = 0; i < countryData.length; i++) {
        let stateCount = await State.count({ country_id: countryData[i].id });
        countryData[i].stateCount = stateCount;
      }

      let CountriesCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      CountriesCount = CountriesCount.rows[0].count;

      if (countryData) {
        return res.json({
          "status": 200,
          "message": sails.__("Country list success"),
          "data": countryData,
          CountryCount: CountriesCount
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getStates: async function (req, res) {
    try {
      let { page, limit, data, sortCol, sortOrder } = req.allParams();
      let query = " from states";
      if ((data && data != "")) {
        query += " WHERE"
        if (data && data != "" && data != null) {
          query = query + " LOWER(name) LIKE '%" + data.toLowerCase() + "%'";
        }
      }

      countQuery = query;
      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend'
          ? 'DESC'
          : 'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      } else {
        query += " ORDER BY id DESC";
      }

      if (limit != null) {
        query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));
      }

      let stateData = await sails.sendNativeQuery("Select *" + query, [])

      stateData = stateData.rows;
      for (let i = 0; i < stateData.length; i++) {
        let stateCount = await State.count({ country_id: stateData[i].id });
        stateData[i].stateCount = stateCount;
      }

      let stateCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      stateCount = stateCount.rows[0].count;
      if (stateData) {
        return res.json({
          "status": 200,
          "message": sails.__("State list success"),
          "data": stateData,
          stateCount
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  countryActivate: async function (req, res) {
    try {
      let { id, is_active } = req.body;

      let countriesData = await Countries
        .update({ id: id })
        .set({ is_active: is_active })
        .fetch();

      if (countriesData && typeof countriesData === 'object' && countriesData.length > 0) {
        return res.json({
          "status": 200,
          "message": sails.__("Country Status Updated")
        });
      } else {
        throw "Country(id) not found."
      }
    } catch (e) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  stateActivate: async function (req, res) {
    try {
      let { id, is_active } = req.body;
      let stateData = await State
        .update({ id: id })
        .set({ is_active: is_active })
        .fetch();

      if (stateData && typeof stateData === 'object' && stateData.length > 0) {
        return res.json({
          "status": 200,
          "message": sails.__("State Status Updated")
        });
      } else {
        throw "State(id) not found."
      }
    } catch (e) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  countryUpdate: async function (req, res) {
    try {
      let countriesData = await Countries
        .update({ id: req.body.id })
        .set(req.body)
        .fetch();

      if (countriesData && typeof countriesData === 'object' && countriesData.length > 0) {
        return res.json({
          "status": 200,
          "message": sails.__("Country Updated")
        });
      } else {
        throw "Country(id) not found."
      }
    } catch (e) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  stateUpdate: async function (req, res) {
    try {
      let stateData = await State
        .update({ id: req.body.id })
        .set(req.body)
        .fetch();

      if (stateData && typeof stateData === 'object' && stateData.length > 0) {
        return res.json({
          "status": 200,
          "message": sails.__("State Updated")
        });
      } else {
        throw "State(id) not found."
      }
    } catch (e) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  insertCountries: async function (req, res) {
    let countries = [
      {
        name: 'Afghanistan',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Bangladesh',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'Bhutan',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Brunei',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Burma',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Cambodia',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'China',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'East Timor',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Hong Kong',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'India',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Indonesia',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'Iran',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'Japan',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Laos',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Macau',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Malaysia',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Maldives',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Mongolia',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Nepal',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'Dem. Rep. Korea',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Pakistan',
        legality: 2,
        color: '#62d0c5'
      }, {
        name: 'Philippines',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Singapore',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Korea',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Sri Lanka',
        legality: 3,
        color: '#62d0c5'
      }, {
        name: 'Taiwan',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'Vietnam',
        legality: 4,
        color: '#b6cbfa'
      }, {
        name: 'Somaliland',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Myanmar',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Estonia',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Latvia',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Lithuania',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Armenia',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Azerbaijan',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Belarus',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Kazakhstan',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Kyrgyzstan',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Moldova',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Russia',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Tajikistan',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Turkmenistan',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Ukraine',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Uzbekistan',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Albania',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Bosnia & Herzegovina',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Bulgaria',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Croatia',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Czech Rep.',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Hungary',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Macedonia',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Poland',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Romania',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Serbia',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Slovakia',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Slovenia',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Anguilla',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Antigua & Barbuda',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Argentina',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Aruba',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Bahamas, The',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Barbados',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Belize',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Bolivia',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'Brazil',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'British Virgin Is.',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Cayman Islands',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Chile',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Colombia',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'Costa Rica',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Cuba',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Dominica',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Dominican Rep.',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Ecuador',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'El Salvador',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'French Guiana',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Grenada',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Guadeloupe',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Guatemala',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Guyana',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Haiti',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Honduras',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Jamaica',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Martinique',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Mexico',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Montserrat',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Netherlands Antilles',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Nicaragua',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Panama',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Paraguay',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Peru',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Puerto Rico',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Saint Kitts & Nevis',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Saint Lucia',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Saint Vincent and the Grenadines',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Suriname',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Trinidad & Tobago',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Turks & Caicos Is',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Uruguay',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Venezuela',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Virgin Islands',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Bahrain',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Cyprus',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Gaza Strip',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Iraq',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Israel',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Jordan',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Kuwait',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Lebanon',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Oman',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Qatar',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Saudi Arabia',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'Syria',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Turkey',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'United Arab Emirates',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'West Bank',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Yemen',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Algeria',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'Egypt',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'Libya',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Morocco',
        legality: 2,
        color: '#f6776e'
      }, {
        name: 'Tunisia',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'W. Sahara',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Bermuda',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Canada',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Greenland',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'St Pierre & Miquelon',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'United States',
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'American Samoa',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Australia',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Cook Islands',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Fiji',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'French Polynesia',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Guam',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Kiribati',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Marshall Islands',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Micronesia, Fed. St.',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'N. Mariana Islands',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Nauru',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'New Caledonia',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'New Zealand',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Palau',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Papua New Guinea',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Samoa',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Solomon Islands',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Tonga',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Tuvalu',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Vanuatu',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Wallis and Futuna',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Angola',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Benin',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Botswana',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Burkina Faso',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Burundi',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Cameroon',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Cape Verde',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Central African Rep.',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Chad',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Comoros',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Dem. Rep. Congo',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Congo',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: "Côte d'Ivoire",
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Djibouti',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Eq. Guinea',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Eritrea',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Ethiopia',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Gabon',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Gambia, The',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Ghana',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Guinea',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Guinea-Bissau',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Kenya',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Lesotho',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Liberia',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Madagascar',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Malawi',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Mali',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Mauritania',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Mauritius',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Mayotte',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Mozambique',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Namibia',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Niger',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Nigeria',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Reunion',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Rwanda',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Saint Helena',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Sao Tome & Principe',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Senegal',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Seychelles',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Sierra Leone',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Somalia',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'South Africa',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'S. Sudan',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Sudan',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Swaziland',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Tanzania',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Togo',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Uganda',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Zambia',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Zimbabwe',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Andorra',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Austria',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Belgium',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Denmark',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Faroe Islands',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Finland',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'France',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Germany',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Gibraltar',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Greece',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Guernsey',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Iceland',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Isle of Man',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Italy',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Jersey',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Liechtenstein',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Luxembourg',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Malta',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Monaco',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Netherlands',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Norway',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Portugal',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'San Marino',
        legality: 3,
        color: '#b6cbfa'
      }, {
        name: 'Spain',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Sweden',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'Switzerland',
        legality: 1,
        color: '#62d0c5'
      }, {
        name: 'United Kingdom',
        legality: 1,
        color: '#62d0c5'
      }
    ];
    let c = await Countries
      .createEach(countries)
      .fetch();

  },

  insertState: async function (req, res) {
    let states = [
      {
        name: 'Colorado',
        country: 378,
        legality: 1,
        color: '#63d3c7'
      }, {
        name: 'Texas',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Arizona',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'New Mexico',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Oklahoma',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Kansas',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Utah',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Wyoming',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Nebraska',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Missouri',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'California',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Nevada',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Oregon',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Idaho',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Washington',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Montana',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'North Dakota',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'South Dakota',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Minnesota',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Wisconsin',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Michigan',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Indiana',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Illinois',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Ohio',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Iowa',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Pennsylvania',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'New York',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Vermont',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'New Hampshire',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Massachusetts',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Connecticut',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'West virginia',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Virginia',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'New Jersey',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Arkansas',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Tennessee',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'North Carolina',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'South Carolina',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Georgia',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Arkansas',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Louisiana',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Florida',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Alaska',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Hawaii',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Mississippi',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Alabama',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Kentucky',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Mary Land',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }, {
        name: 'Maine',
        country: 378,
        legality: 1,
        color: '#fcd26e'
      }
    ];

    let s = await State
      .createEach(states)
      .fetch();
    res.json({ status: 200 });
  }

};

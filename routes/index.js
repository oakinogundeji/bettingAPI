'use strict';
//=============================================================================
if(process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

// dependencies
const
  express = require('express'),
  Promise = require('bluebird'),
  axios = require('axios'),
  router = express.Router();

// variables
const {
  JRPC_BETTING_URL,
  JRPC_ACCOUNTS_URL,
  APP_KEY,
  PERSISTENCE_TYPE
} = process.env,

SESSION_TOKEN = process.argv[2];

// helpers

async function placeOrder(data) {
  try {
    const {MKT_ID, SELECTION_ID, SIDE, SIZE, PRICE} = data;
    const
      MTHD = `${BETTING_MTHD}/placeOrders`,
      request = await axios.post(JRPC_BETTING_URL, {
        "jsonrpc": "2.0",
        "method": MTHD,
        "params": {
          "marketId": MKT_ID,
          "instructions": [
            {
              "selectionId": SELECTION_ID,
              "handicap": "0",
              "side": SIDE,
              "orderType": "LIMIT",
              "limitOrder": {
                "size": SIZE,
                "price": PRICE,
                "persistenceType": PERSISTENCE_TYPE
              }
            }
          ]
        }
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'X-Application': APP_KEY,
          'X-Authentication': SESSION_TOKEN
        }
      });
      if(!!request && request[0]["result"]["status"] == "SUCCESS") {
        const {betId, placedDate, averagePriceMatched, sizeMatched} = request[0]["result"]["instructionReports"][0];
        return Promise.resolve({betId, placedDate, averagePriceMatched, sizeMatched});
      }
  }
  catch(err) {
    const errMsg = `failed to place bet with params MKT_ID: ${MKT_ID}, SELECTION_ID: ${SELECTION_ID}, SIDE: ${SIDE}, SIZE: ${SIZE}, PRICE: ${PRICE}`;
    return Promise.reject({msg: errMsg, err: err});
  }
}

async function listInPlayOrders() {
  try {
    const
      MTHD = `${BETTING_MTHD}/listCurrentOrders`,
      request = await axios.post(JRPC_BETTING_URL, {
        "jsonrpc": "2.0",
        "method": MTHD,
        "params": {}
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'X-Application': APP_KEY,
          'X-Authentication': SESSION_TOKEN
        }
      });
      if(!!request && request[0]["result"]["status"] == "SUCCESS") {
        return Promise.resolve(request);
      }
  }
  catch(err) {
    const errMsg = 'failed to retrieve list of in-lay orders';
    return Promise.reject({msg: errMsg, err: err});
  }
}

async function getAccountStatement() {
  try {
    const
      MTHD = `${ACCOUNT_MTHD}/getAccountStatement`,
      request = await axios.post(JRPC_ACCOUNTS_URL, {
        "jsonrpc": "2.0",
        "method": MTHD,
        "params": {}
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'X-Application': APP_KEY,
          'X-Authentication': SESSION_TOKEN
        }
      });
      if(!!request && request[0]["result"]["status"] == "SUCCESS") {
        return Promise.resolve(request);
      }
  }
  catch(err) {
    const errMsg = 'failed to retrieve account statement';
    return Promise.reject({msg: errMsg, err: err});
  }
}

// routes
router.post('/placeOrder', (req, res) => {
  const data = req.body.data;
  return placeOrder(data)
    .then(output => res.status(200).json({data: output}))
    .catch(err => res.status(500).json({
      msg: err.msg,
      err: err.err}));
});

router.post('/listInPlayOrders', (req, res) => {
  return listInPlayOrders()
    .then(output => res.status(200).json({data: output}))
    .catch(err => res.status(500).json({
      msg: err.msg,
      err: err.err}));
});

router.post('/getAccountStatement', (req, res) => {
  return getAccountStatement()
    .then(output => res.status(200).json({data: output}))
    .catch(err => res.status(500).json({
      msg: err.msg,
      err: err.err}));
});

// export module

module.exports = router;

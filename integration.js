'use strict';

const request = require('request');
const async = require('async');

const BASE_URI = 'http://httpbin.org/get';

let Logger;

/**
 * The startup method is called once when the integration is first loaded by the server.  It can be used
 * to do any initializations required (e.g., setting up persistent database connections)
 *
 * @param logger logger object
 */
function startup(logger) {
  // cache a reference to the logger
  Logger = logger;
}

/**
 * @param entities array of entity objects
 * @param options user options object
 * @param cb callback function
 */
function doLookup(entities, options, cb) {
  let lookupResults = [];

  async.each(
    entities,
    function(entityObj, next) {
      _lookupEntity(entityObj, options, function(err, result) {
        if (err) {
          next(err);
        } else {
          lookupResults.push(result);
          next(null);
        }
      });
    },
    function(err) {
      cb(err, lookupResults);
    }
  );
}

function _lookupEntity(entityObj, options, cb) {
  request(
    {
      uri: BASE_URI,
      method: 'GET',
      // include our apikey as a query parameter on the request taken from the user options
      qs: {
        apiKey: options.apiKey
      },
      json: true
    },
    function(err, response, body) {
      // check for a request error
      if (err) {
        return cb({
          detail: 'Error Making HTTP Request',
          err: err
        });
      }

      // If we get a 404 then cache a miss
      if (response.statusCode === 404) {
        return cb(null, {
          entity: entityObj,
          data: null // setting data to null indicates to the server that this entity lookup was a "miss"
        });
      }

      if (response.statusCode !== 200) {
        cb({
          detail: `Unexpected HTTP Status Code Received ${response.statusCode}`,
          debug: body
        });
        return;
      }

      // The lookup results returned is an array of lookup objects with the following format
      cb(null, {
        // Required: This is the entity object passed into the integration doLookup method
        entity: entityObj,
        // Required: An object containing everything you want passed to the template
        data: {
          // Required: These are the tags that are displayed in your template
          summary: [body.origin],
          // Data that you want to pass back to the notification window details block
          details: body
        }
      });
    }
  );
}

function onDetails(lookupObject, options, cb) {
  // We're adding an artificial 3 second delay before we respond back to the onDetails request
  setTimeout(function() {
    // Add some new information to our details
    lookupObject.data.details.newOnDetailsData = {
      key: 'This is some onDetails data'
    };

    // Add a new tag
    lookupObject.data.summary.push('onDetails Tag');

    // Send back just the `data` property on the lookupObject
    cb(null, lookupObject.data);
  }, 3000);
}

let messageCounter = 0;
function onMessage(payload, options, cb) {
  switch (payload.type) {
    case 'COUNT_CLICKS':
      cb(null, {
        message: `I've been clicked ${++messageCounter} times`
      });
      break;
    default:
      cb({
        detail: `Unexpected onMessage type received: ${payload.type}`
      });
  }
}

module.exports = {
  doLookup: doLookup,
  startup: startup,
  onDetails: onDetails,
  onMessage: onMessage
};

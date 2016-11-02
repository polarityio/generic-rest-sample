'use strict';

var request = require('request');
var _ = require('lodash');
var async = require('async');
const BASE_URI = 'http://httpbin.org/get';
/**
 * The startup method is called once when the integration is first loaded by the server.  It can be used
 * to do any initializations required (e.g., setting up persistent database connections)
 */
function startup() {

}


/**
 The doLookup method is called each time 1 or more entity objects needs to be looked up by the integration.  It is
 called on a per user basis. The method is passed an array of entity objects which have the following structure:

 ```json
 {
     isIP: true,
     isIPv4: true,
     isIPv6: false,
     isPrivateIP: false,
     IPType: 'IPv4',
     isHex: false,
     isHash: false,
     isMD5: false,
     isSHA1: false,
     isSHA256: false,
     isSHA512: false,
     hashType: '',
     isGeo: false,
     isEmail: false,
     isURL: false,
     isHTMLTag: false,
     latitude: 0,
     longitude: 0,
     value: '56.2.3.1',
     IPLong: 939655937
     }
 ```

 You can use information provided about the entity to decide whether or not to perform a lookup.

 In addition to passing you the entities, the method will pass you the options set by the user.  The options
 are contained in an object keyed on the option name.  For example for this integration the option object will look
 like

 ```json
 {
    sampleOption: 'default value'
 }
 ```

 @param entities Array of entity objects
 @param options Options for the user
 @param cb callback function
 */
function doLookup(entities, options, cb) {
    let entitiesWithNoData = [];
    let lookupResults = [];

    async.each(entities, function (entityObj, next) {
        if (entityObj.isIPv4) {
            _lookupEntity(entityObj, options, function (err, result) {
                if (err) {
                    next(err);
                } else {
                    lookupResults.push(result);
                    next(null);
                }
            });
        } else {
            next(null);
        }
    }, function (err) {
        /**
         * The callback should return 3 parameters
         *
         * @parameter as JSON api formatted error message or a string error message, null if there is no error
         *      Any error message returned here is displayed in the notification window for the user that experienced
         *      the error.  This is a good place to return errors related to API authentication or other issues.     *
         * @parameter entitiesWithNoData an Array of entity objects that had no data for them.  This is used by the caching
         * system.
         * @parameter lookupResults An array of lookup result objects
         */
        cb(err, entitiesWithNoData, lookupResults);
    });
}

function _lookupEntity(entityObj, options, cb) {
    let uri = BASE_URI;

    if (options.apiKey.length > 0) {
        uri += '?apiKey=' + options.apiKey;
    }

    request({
        uri: uri,
        method: 'GET',
        json: true
    }, function (err, response, body) {
        // check for an error
        if (err) {
            cb(err);
            return;
        }

        if (response.statusCode !== 200) {
            cb(body);
            return;
        }

        // The lookup results returned is an array of lookup objects with the following format
        cb(null, {
            // Required: This is the entity object passed into the integration doLookup method
            entity: entityObj,
            // Required: An object containing everything you want passed to the template
            data: {
                // Required: this is the string value that is displayed in the template
                entity_name: entityObj.value,
                // Required: These are the tags that are displayed in your template
                tags: [body.origin],
                // Data that you want to pass back to the notification window details block
                details: body
            }
        });
    });
}

module.exports = {
    doLookup: doLookup,
    startup: startup
};
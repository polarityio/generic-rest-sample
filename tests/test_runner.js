'use strict';

/**
 * Simple test hardness to test input and output of the integration
 *
 * From `/app/polarity-server/integrations` run as
 *
 *  node tests/test-runner
 *
 */

let integration = require('../integration');

let options = {
    apiKey: ''
};

integration.doLookup([{
    isIPv4: true,
    value: '192.168.2.1'
}], options, function(err, length, result){
   if(err){
       console.info(JSON.stringify(err, null, 4));
   }else{
       console.info(JSON.stringify(result, null, 4));
   }
});

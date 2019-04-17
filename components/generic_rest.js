'use strict';

polarity.export = PolarityComponent.extend({
    message: '',
    actions: {
        // this action is triggered by the button in our template which calls the `incrementCounter` action
        incrementCounter: function() {
            // The payload should be a javascript object literal but can contain any properties
            let payload = {
                type: 'COUNT_CLICKS',
                data: {
                    title: 'You can pass '
                }
            };

            this.sendIntegrationMessage(payload)
                .then((response) => {
                    // set our `message` property to the value of the response.message property sent from the server
                    this.set('message', response.message);
                })
                .catch((err) => {
                    // Catch any errors and print out the error after converting it to a string
                    this.set('message', `Error: ${JSON.stringify(err)}`);
                });
        }
    }
});

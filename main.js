'use strict';

const AWS = require('aws-sdk');

const credentials = new AWS.SharedIniFileCredentials({profile: process.env.AWS_PROFILE ?? 'default'});
AWS.config.credentials = credentials;
AWS.config.region = process.env.AWS_REGION ?? 'us-east-1';

const lambda = new AWS.Lambda();

lambda.listFunctions({MaxItems: 50}, (err, data) => {
    if (err) console.error(err, err.stack);
    data.Functions.forEach((fn) => {
        lambda.deleteFunction({FunctionName: fn.FunctionName}, (err, _) => {
            if (err) console.error(err, err.stack);
            console.log(`Successfully deleted ${fn.FunctionName}}!`)
        })
    });
});

const eventBridge = new AWS.CloudWatchEvents();

eventBridge.listRules(({Limit: 100}), (err, data) => {
    if (err) console.error(err, err.stack);
    data.Rules.forEach((rule) => {
        eventBridge.listTargetsByRule({Rule: rule.Name, Limit: 100}, (err, data) => {
            if (err) console.error(err, err.stack);
            if (data.Targets.length) {
                eventBridge.removeTargets({Rule: rule.Name, Ids: data.Targets.map(tar => tar.Id)}, (err, _) => {
                    if (err) console.error(err, err.stack);
                    console.log(`Successfully deleted targets for ${rule.Name}}!`);
                });
            }
        })
        eventBridge.deleteRule({Name: rule.Name}, (err, _) => {
            if (err) console.error(err, err.stack);
            console.log(`Successfully deleted rules named ${rule.Name}}!`);
        });
    });
});
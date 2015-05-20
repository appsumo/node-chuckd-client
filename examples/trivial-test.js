var cdc = require('../lib/chuckd-client'),
    CDC = new cdc({host: '127.0.0.1', tcp: true, debug: true});

var siteId = 'siteId';
var pathHash = 'pathHash';
var campaignId = 'campaignId';

CDC.put('a25489e9-848c-4356-97ff-161b0852c509', siteId, pathHash + ':' + campaignId, 'Percent 50', 5);
CDC.increment('a25489e9-848c-4356-97ff-161b0852c509', siteId, pathHash + ':' + campaignId, 'Percent 50', 1);
CDC.decrement('a25489e9-848c-4356-97ff-161b0852c509', siteId, pathHash + ':' + campaignId, 'Percent 50', 2);

CDC.increment('a25489e9-848c-4356-97ff-161b0852c509', siteId, pathHash + ':' + campaignId, 'Percent 40', 1);

CDC.decrement('a25489e9-848c-4356-97ff-161b0852c509', siteId, pathHash + ':' + campaignId, 'Percent 60', 2);

var rp = require('request-promise');
var Promise = require('bluebird');
var config = require('./config.js');
var todayInUnixTime = (Math.floor(new Date() / 1000));
var secondsInAMonth = 2592000;
var thirtyDaysAgo = todayInUnixTime - secondsInAMonth;

var fileListOptions = {
  method: 'POST',
  uri: 'https://slack.com/api/files.list?token=' + config.token
};

rp(fileListOptions)
.then(function (response) {
  var parsedResponse = JSON.parse(response);
  var filesOlderThanThirtyDays = [];
  for (var i = 0; i < parsedResponse.files.length; i++) {
    if(parsedResponse.files[i].timestamp < thirtyDaysAgo) {
      filesOlderThanThirtyDays.push(parsedResponse.files[i].id);
    }
  }
  return filesOlderThanThirtyDays;
})
.then(function (filesOlderThanThirtyDays) {
  Promise.map(filesOlderThanThirtyDays, function (file) {
    var deleteOptions = {
      method: 'POST',
      uri: 'https://slack.com/api/files.delete?token=' + config.token + '&file=' + file
    };

    rp(deleteOptions)
    .then(function (response) {
      console.log(JSON.parse(response));
    })
  })
})
.catch(function (error) {
  console.log(error);
});

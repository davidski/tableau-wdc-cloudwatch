(function() {
  var myConnector = tableau.makeConnector();
  
  myConnector.init = function(){
    tableau.incrementalExtractColumn = "Timestamp";
    tableau.initCallback();
  };

  function queryCloudWatch(username, secret, region, starttime, endtime, 
                           metricname, namespace, dimensionname, 
                           dimensionvalue, unit, period, statistics) {
    /* the main CloudWatch worker function */
    AWS.config.update({accessKeyId: username, secretAccessKey: secret});
    AWS.config.region = region;
    var cloudwatch = new AWS.CloudWatch();

    var params = {
      StartTime: starttime,
      EndTime: endtime,
      Namespace: namespace,
      MetricName: metricname,
      Period: period,
      Statistics: statistics,
      Dimensions: [{
        Name: dimensionname,
        Value: dimensionvalue
      }
    ],
      Unit: unit
    };
    var request = cloudwatch.getMetricStatistics(params)

    /* Invoke the call and take action based on the type of response */
    try {
      request.
      on('success', function(data){
        /* iterate over all the returned data points */
        var lastRecordToken = 0;
        tableau.dataCallback(data['data']['Datapoints'], lastRecordToken.toString(), true);
      }).
      on('error', function(err, data) {
        tableau.abortWithError("Connection error " + err + "\nStack is: " + err.stack); // an error occurred
      }).
      on('complete', function(data) {
        /* no more data, so return that fact to the WDC */
        var lastRecordToken = 0;
        tableau.dataCallback([], lastRecordToken.toString(), false);
      }).
      send();
    }
    catch(err) {
      tableau.abortWithError("Connection error " + err + "\nStack is: " + err.stack);
    }
  }

  myConnector.getColumnHeaders = function() {
    // support for querying multiple stats at once is not well-tested
    config = JSON.parse(tableau.connectionData);
    var fieldNames = ['Timestamp'];
    var fieldTypes = ['datetime'];
    for (var i = 0; i < config['statistics'].length; ++i){
      fieldNames.push(config['statistics'][i]);
      fieldTypes.push('float');
    };
    fieldNames.push('Unit');
    fieldTypes.push('string');
    
    tableau.headersCallback(fieldNames, fieldTypes);
  }

  myConnector.getTableData = function(lastRecordToken) {
    /* pull our config variables out of JSON and from Tableau WDC */
    config = JSON.parse(tableau.connectionData)
    myResponse = queryCloudWatch(
      tableau.username, 
      tableau.password, 
      config['region'],
      config['starttime'], 
      config['endtime'], 
      config['metricname'], 
      config['namespace'], 
      config['dimensionname'], 
      config['dimensionvalue'],
      config['unit'],
      config['period'],
      config['statistics']);
  }

  tableau.registerConnector(myConnector);
})();

  $(document).ready(function() {
    $("#submitButton").click(function() {
      /* on submit, build our config settings from the form */
      var akid  = $('#akid').val().trim();
      var secret = $('#secret').val().trim();
      var region = $('#region option:selected').val()
      var metricname = $('#metricname').val().trim();
      var namespace = $('#namespace').val().trim();
      var dimensionname = $('#dimensionname').val().trim();
      var dimensionvalue = $('#dimensionvalue').val().trim();
      var starttime = new Date($('#starttime').val().trim());
      var endtime = new Date($('#endtime').val().trim());
      var unit = $('#unit').val().trim();
      var period = parseInt($('#period').val().trim()) * 60;
      var statistics = [];
      $("#statistics:checked").each(function(){
        statistics.push($(this).val());
      });
      if (metricname) {
        /* so long as one metricname was submitted, try to query AWS */
        tableau.username = akid;
        tableau.password = secret;
        tableau.connectionName = "AWS Data for " + metricname;
        tableau.connectionData = JSON.stringify({
          'region': region,
          'metricname': metricname,
          'namespace': namespace,
          'dimensionname': dimensionname,
          'dimensionvalue': dimensionvalue,
          'starttime': starttime,
          'endtime': endtime,
          'period': period,
          'unit': unit,
          'statistics': statistics
        });
        tableau.submit();
      }
  });
});

function printValue(sliderID, textbox) {
  /* helper function to display value of slider */
  var x = document.getElementById(textbox);
  var y = document.getElementById(sliderID);
  x.value = y.value;
}

window.onload = function() { printValue('period', 'periodValue');  }
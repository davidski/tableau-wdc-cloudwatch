function cwWdcInitialize() {
  var myConnector = tableau.makeConnector();

  myConnector.init = function(){
    tableau.incrementalExtractColumn = "Timestamp";
    tableau.initCallback();
  };

  myConnector.getColumnHeaders = function() {
    config = JSON.parse(tableau.connectionData);
    var fieldNames = ['Timestamp'];
    var fieldTypes = ['datetime'];
    for (var i = 0; i < config['statistics'].length; ++i){
      fieldNames.push(config['statistics'][i]);
      fieldTypes.push('float');
    }

    tableau.headersCallback(fieldNames, fieldTypes);
  };

  myConnector.getTableData = function(lastRecordToken) {
    // pull our config variables out of JSON and from Tableau WDC
    config = JSON.parse(tableau.connectionData);
    myResponse = queryCloudWatch(
      lastRecordToken,
      tableau.username, 
      tableau.password, 
      config['region'],
      config['starttime'], 
      config['endtime'], 
      config['metricname'], 
      config['namespace'], 
      config['dimensions'], 
      config['period'],
      config['statistics']);
  };

  tableau.registerConnector(myConnector);
  console.log("Connector now registered.");

}

function queryCloudWatch(lastRecordToken, username, secret, region, 
                         starttime, endtime, metricname, namespace, 
                         dimensions, period, statistics) {
  /* the main CloudWatch worker function */
  AWS.config.update({accessKeyId: username, secretAccessKey: secret});
  AWS.config.region = region;
  var cloudwatch = new AWS.CloudWatch();
  var hasMoreData = false;

  var params = {
    StartTime: starttime,
    EndTime: endtime,
    Namespace: namespace,
    MetricName: metricname,
    Period: period,
    Statistics: statistics
  };

  //only add dimensions to the parameter if they've been requested
  if (dimensions) { params['Dimensions'] = dimensions; }

  var request = cloudwatch.getMetricStatistics(params);

  /* Invoke the call and take action based on the type of response */
  request.
  on('success', function(data){
    // dataCallback must be part of the success callback, since
    // this operation is async
    tableau.dataCallback(data['data']['Datapoints'], 
                         lastRecordToken.toString(), hasMoreData);
  }).
  on('error', function(err, data) {
    tableau.abortWithError("Connection error " + err + "\nStack is: " + 
                           err.stack); // an error occurred
  }).
  send();
}

function printValue(sliderID, textbox) {
  /* helper function to display value of slider */
  var x = document.getElementById(textbox);
  var y = document.getElementById(sliderID);
  x.value = y.value;
}

// pure JS version of jQuery documentready function
function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function(){
  //prepare the Tableau WDC functions
  cwWdcInitialize();
  
  //assign the submit event function
  var element = document.getElementById("submitButton");
  element.addEventListener("click", function(){
    console.log("Button 'click' event detected.");
    /* on submit, build our config settings from the form */
    var akid  = document.querySelector("#akid").value.trim();
    var secret = document.querySelector('#secret').value.trim();
    var e = document.querySelector("#region");
    var region = e[e.selectedIndex].value;
    var metricname = document.querySelector('#metricname').value.trim();
    var namespace = document.querySelector('#namespace').value.trim();

    // build dimensions
    var dimensionname = document.querySelector('#dimensionname').value.trim();
    var dimensionvalue = document.querySelector('#dimensionvalue').value.trim();
    var dimensions = [{}]
    if (dimensionname && dimensionvalue) {
      dimensions = [{
        Name: dimensionname,
        Value: dimensionvalue
      }];
    } else {
      dimensions = null
    };

    var starttime = new Date(document.querySelector('#starttime').value.trim());
    var endtime = new Date(document.querySelector('#endtime').value.trim());
    var period = parseInt(document.querySelector('#period').value.trim(), 10) * 60;
    var statistics = [];
    var checkboxes = document.querySelectorAll("#statistics");
    Array.prototype.forEach.call(checkboxes, function(el, i){
      if (el.checked === true) {
        statistics.push(el.value);
      }
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
        'dimensions': dimensions,
        'starttime': starttime,
        'endtime': endtime,
        'period': period,
        'statistics': statistics
      });
      console.log("About to tableau.submit()");
      //tableau.initCallback();
      tableau.submit();
    }
    console.log("Submit complete.");
  });
  
});

window.onload = function() { printValue('period', 'periodValue'); };
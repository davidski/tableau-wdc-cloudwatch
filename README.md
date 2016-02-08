# Tableau Web Data Connector for AWS CloudWatch

A quick proof of concept to allow [Tableau 9.1+](http://www.tableau.com/) to 
connect to [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) and
retrieve statistics for visualization within Tableau.

## Use

- Clone repository to a web server directory ([devd](https://github.com/cortesi/devd) 
may be used for local testing)
- From Tableau 9.1+, select Web Data Connector
- For the URL to the Web Data Connector, enter the url to your web server plus 
  `/cloudwatch.html` (e.g. `http://localhost:8000/cloudwatch.html`)
- Enter in the AWS credentials and region to use
- Enter in the details of the metric to retrieve
- Select `Get the Data`

## Note on AWS API Key Security 

The use of AWS API credentials is required. While care is taken to use Tableau standard 
functions for protecting username and passwords, it is possible to use these same 
functions to store your credentials in the Tableau data connection. This may not 
be what you want!

A dedicated IAM account that only has access to get CloudWatch metrics (IAM 
permission `Cloudwatch:GetMetricStatistics` is highly recommended. 
Certainly *never* use an account with administrative credentials for this 
connector.

## Limitations

- Multiple dimensions are not supported
- Querying multiple statistics within a single connection should work, but is 
not extensively tested (order of arrays need to be validated)
- Form styling is functional, but very minimal
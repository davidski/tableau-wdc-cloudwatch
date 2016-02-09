# Tableau Web Data Connector for AWS CloudWatch

A quick proof of concept to allow [Tableau 9.1+](http://www.tableau.com/) to 
connect to [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) and
retrieve statistics for visualization within Tableau.

## Use

- Clone repository to a web server directory ([devd](https://github.com/cortesi/devd) 
may be used for local testing)
- From Tableau 9.1+, select Web Data Connector as a data source
- Enter the url to your web server plus `/cloudwatch.html` 
  (e.g. `http://localhost:8000/cloudwatch.html`)
- Enter the AWS credentials and select your region
- Enter the details of the desired metric
- Select `Get the Data`

## Note on AWS API Key Security 

The use of AWS API credentials is required. While care is taken to use Tableau 
standard functions for protecting username and passwords, it is possible to use 
these same functions to store your credentials in the Tableau data 
connection. This may not be what you want!

Using an IAM account with access restricted to just retrieving CloudWatch 
metrics (IAM permission `Cloudwatch:GetMetricStatistics` is highly 
recommended. Certainly *never* use an account with administrative credentials 
for this connector.

## Limitations

- Multiple dimensions are not supported
- Metrics without dimensions are not supported
- Form styling is functional, but very minimal
- Error handling is minimal

## Credits

- Thanks to @hrbrmstr for pointers to:
  - the nifty [youmightnotneedjquery.com](http://youmightnotneedjquery.com/) 
    site.
  - the super useful [devd](https://github.com/cortesi/devd) cross-platform 
    development web server
- Style elements lifted from the Google Sheets connector by Tableau.
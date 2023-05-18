# Examples of IaC Options for AWS Lambda Solutions

This repo contains examples of how to deploy AWS Lambda based solutions, using different tooling options. For simplicity every example can be deployed by running `npm run deploy` in the respective sample's directory. Upon completion of the deployment process, it will output the URLs to the add and list endpoints. Those endpoints can then be used with the cors_test.html file or any other tool to verify the endpoints are working.

## Clean up

To remove the resources that have been created, run `npm run destroy` in the directory of the example you would like to remove.

# amazon-nova-robotic
Robotic with AWS IoT, AWS Bedrock, and Amazon Nova


## Update CDK and all packages for CodeSpaces
Upgrade node.js to version 22
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
```
Close the terminal.
```
nvm use 22
nvm alias default 22
```


```
pip install --upgrade awscli
npm uninstall -g cdk
npm install -g cdk
npm i -g npm-check-updates && ncu -u && npm i
```
Configure AWS CLI
```
aws configure
```
Default region name [None]: us-east-1
Default output format [None]: json


Get AWS IoT Certifications
```
aws s3 sync s3://<CdkStack.RobotDataBucketName> certificates/
```

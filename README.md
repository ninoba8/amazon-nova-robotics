# amazon-nova-robotic

Robotic with AWS IoT, AWS Bedrock, and Amazon Nova.

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
cd cdk
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
aws s3 sync s3://<CdkStack.RobotDataBucketName> robot_client/certificates/
```

# Server side Deployment

## Use CDK bootstrap

```
cd cdk
cdk bootstrap
```

## Deploy Stacks

```
cdk deploy --require-approval never
```

## Destory Stacks

```
cdk destroy --require-approval never
```

# Robot Deployment

1. Generate the deployment package:

   ```bash
   ./create_deploy_package.sh
   ```

2. Transfer the `deploy_package.zip` file to the robot.

3. Extract the contents of the package:

   ```bash
   unzip deploy_package.zip
   ```

4. Update the `settings.yaml` file to specify the `robot_name`. By default, up to 5 robots can be configured.

5. Set up a virtual environment:

   ```bash
   ./create_virtual_env.sh
   ```

6. Activate the virtual environment and start the `pubsub.py` script:

   ```bash
   source venv/bin/activate
   python pubsub.py
   ```

# TODO

1. Fine grant the AWS IOT device permission.

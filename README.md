# My Music Sheet Repo

This github repository contains Back-End part of my "My Music Sheet Repo" project - my biggest project so far!

On this site you can:
-register, login,
-create/read/update/delete entries (CRUD with additional listing option)
-add your music sheet file as an attachment (of any format for now)
-download your music sheet from your account

Here's the link to the Front-End part:
https://github.com/kudelek/serverless-stack-mymusicsheetrepo-client

This Back-End consists of:
-Serverless Stack
-AWS: 
  -S3 for secure storage,
  -DynamoDB for secure, reliant, persistent database,
  -Route 53 for registering domain,
  -Cognito for user authentication and authorisation,
  -API Gateway for maintaining API endpoints
-Seed for CI/CD pipeline (dev/prod)


demo:
https://mymusicsheetrepo.com

Enjoy!

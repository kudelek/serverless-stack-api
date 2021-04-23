var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};
var __publicField = (obj, key, value) => {
  if (typeof key !== "symbol")
    key += "";
  if (key in obj)
    return __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value});
  return obj[key] = value;
};

// lib/index.js
__markAsModule(exports);
__export(exports, {
  default: () => main
});

// lib/S3Stack.js
var cdk = __toModule(require("@aws-cdk/core"));
var s3 = __toModule(require("@aws-cdk/aws-s3"));
var sst = __toModule(require("@serverless-stack/resources"));
var S3Stack = class extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    __publicField(this, "bucket");
    this.bucket = new s3.Bucket(this, "Uploads", {
      cors: [
        {
          maxAge: 3e3,
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"]
        }
      ]
    });
    new cdk.CfnOutput(this, "AttachmentsBucketName", {
      value: this.bucket.bucketName
    });
  }
};
var S3Stack_default = S3Stack;

// lib/DynamoDBStack.js
var import_core = __toModule(require("@aws-cdk/core"));
var dynamodb = __toModule(require("@aws-cdk/aws-dynamodb"));
var sst2 = __toModule(require("@serverless-stack/resources"));
var DynamoDBStack = class extends sst2.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const app = this.node.root;
    const table = new dynamodb.Table(this, "Table", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      sortKey: {name: "musicsheetId", type: dynamodb.AttributeType.STRING},
      partitionKey: {name: "userId", type: dynamodb.AttributeType.STRING}
    });
    new import_core.CfnOutput(this, "TableName", {
      value: table.tableName,
      exportName: app.logicalPrefixedName("TableName")
    });
    new import_core.CfnOutput(this, "TableArn", {
      value: table.tableArn,
      exportName: app.logicalPrefixedName("TableArn")
    });
  }
};
var DynamoDBStack_default = DynamoDBStack;

// lib/CognitoStack.js
var import_core2 = __toModule(require("@aws-cdk/core"));
var iam2 = __toModule(require("@aws-cdk/aws-iam"));
var cognito2 = __toModule(require("@aws-cdk/aws-cognito"));
var sst3 = __toModule(require("@serverless-stack/resources"));

// lib/CognitoAuthRole.js
var cdk2 = __toModule(require("@aws-cdk/core"));
var iam = __toModule(require("@aws-cdk/aws-iam"));
var cognito = __toModule(require("@aws-cdk/aws-cognito"));
var CognitoAuthRole = class extends cdk2.Construct {
  constructor(scope, id, props) {
    super(scope, id);
    __publicField(this, "role");
    const {identityPool} = props;
    this.role = new iam.Role(this, "CognitoDefaultAuthenticatedRole", {
      assumedBy: new iam.FederatedPrincipal("cognito-identity.amazonaws.com", {
        StringEquals: {
          "cognito-identity.amazonaws.com:aud": identityPool.ref
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }, "sts:AssumeRoleWithWebIdentity")
    });
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "mobileanalytics:PutEvents",
        "cognito-sync:*",
        "cognito-identity:*"
      ],
      resources: ["*"]
    }));
    new cognito.CfnIdentityPoolRoleAttachment(this, "IdentityPoolRoleAttachment", {
      identityPoolId: identityPool.ref,
      roles: {authenticated: this.role.roleArn}
    });
  }
};
var CognitoAuthRole_default = CognitoAuthRole;

// lib/CognitoStack.js
var CognitoStack = class extends sst3.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const {bucketArn} = props;
    const app = this.node.root;
    const userPool = new cognito2.UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      autoVerify: {email: true},
      signInAliases: {email: true}
    });
    const userPoolClient = new cognito2.UserPoolClient(this, "UserPoolClient", {
      userPool,
      generateSecret: false
    });
    const identityPool = new cognito2.CfnIdentityPool(this, "IdentityPool", {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName
        }
      ]
    });
    const authenticatedRole = new CognitoAuthRole_default(this, "CognitoAuthRole", {
      identityPool
    });
    authenticatedRole.role.addToPolicy(new iam2.PolicyStatement({
      actions: ["s3:*"],
      effect: iam2.Effect.ALLOW,
      resources: [
        bucketArn + "/private/${cognito-identity.amazonaws.com:sub}/*"
      ]
    }));
    new import_core2.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId
    });
    new import_core2.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId
    });
    new import_core2.CfnOutput(this, "IdentityPoolId", {
      value: identityPool.ref
    });
    new import_core2.CfnOutput(this, "AuthenticatedRoleName", {
      value: authenticatedRole.role.roleName,
      exportName: app.logicalPrefixedName("CognitoAuthRole")
    });
  }
};
var CognitoStack_default = CognitoStack;

// lib/index.js
function main(app) {
  new DynamoDBStack_default(app, "dynamodb");
  const s32 = new S3Stack_default(app, "s3");
  new CognitoStack_default(app, "cognito", {bucketArn: s32.bucket.bucketArn});
}
//# sourceMappingURL=index.js.map

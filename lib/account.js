'use strict';
const AWS = require('aws-sdk');
const Joi = require('joi');

const _docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: 'us-east-1',
  endpoint: 'https://dynamodb.us-east-1.amazonaws.com'
});

const _headers = {
  'Access-Control-Allow-Origin': '*',
  'Connection': 'keep-alive',
  'Content-Type': 'application/json',
};

const _schema = Joi.object({
  id: Joi.number(),
  name: Joi.string(),
  status: Joi.string()
});

const getAccounts = async () => {
  try {
    const results = await _docClient.scan({
      TableName: `accounts-${process.env['STAGE']}`,
      ProjectionExpression: '#id, #name, #status',
      ExpressionAttributeNames: {
        '#id': 'id',
        '#name': 'name',
        '#status': 'status'
      }
    }).promise();

    return {
      headers: _headers,
      statusCode: 200,
      body: JSON.stringify(results)
    };
  } catch (err) {
    return {
      headers: _headers,
      statusCode: 403,
      body: err.message
    };
  }
};

const getAccountById = async (id) => {
  try {
    const results = await _docClient.get({
      TableName: `accounts-${process.env['STAGE']}`,
      Key: {
        id: parseInt(id, 10)
      }
    }).promise();

    return {
      headers: _headers,
      statusCode: 200,
      body: JSON.stringify(results)
    };
  } catch (err) {
    return {
      headers: _headers,
      statusCode: 403,
      body: err.message
    };
  }
};

const createAccount = async (event) => {
  if (event.body) {
    const body = JSON.parse(event.body);
    const { error, value } = _schema.validate(body);
    if (error) {
      return {
        headers: _headers,
        statusCode: 403,
        body: error.message
      };
    } else {
      try {
        await _docClient.put({
          TableName: `accounts-${process.env['STAGE']}`,
          Item: value,
          ConditionExpression: 'attribute_not_exists(id)'
        }).promise();
        return {
          headers: _headers,
          statusCode: 201,
          body: JSON.stringify(value)
        };
      } catch(err) {
        return {
          headers: _headers,
          statusCode: 403,
          body: err.message
        };
      }
    }
  }

  return {
    headers: _headers,
    statusCode: 501,
    body: 'NOT IMPLEMENTED'
  };
};

exports.handler = async (event, context) => {

  if (event.resource === '/v1/accounts') {
    if (event.httpMethod == 'GET') {
      return await getAccounts();
    } else if (event.httpMethod == 'POST') {
      return await createAccount(event);
    }
  } else if (event.resource === '/v1/accounts/{id}') {
    return await getAccountById(event.pathParameters.id);
  }

  return {
    headers: _headers,
    statusCode: 403,
    body: 'Not able to process request'
  };
};

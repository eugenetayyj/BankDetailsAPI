import AWS from "aws-sdk";
import { postPutDto } from "./dto/postPutDto.mjs";
import { deleteDto } from "./dto/deleteDto.mjs";
import Joi from "joi";

const ddb = new AWS.DynamoDB();
const param = {
  TableName: "bank_code",
};

const statusPath = "/status";
const bankPath = "/bank";
const banksPath = "/banks";

// Handler
export const handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path = event.resource;
    let response;
    switch (path) {
      case statusPath:
        if (method === "GET") {
          response = responseBuilder(200, { status: "Running" });
        }
        break;
      case bankPath:
        if (method === "GET") {
          const instNum = event.queryStringParameters.instNum;
          response = await getBankName(instNum);
        } else if (method === "POST" || method === "PUT") {
          const requestBody = JSON.parse(event.body);
          const res = validator(postPutDto, requestBody);
          if (res) {
            return responseBuilder(400, res);
          }
          response = await addAndUpdateBank(requestBody, method);
        } else if (method === "DELETE") {
          const requestBody = JSON.parse(event.body);
          const res = validator(deleteDto, requestBody);
          if (res) {
            return responseBuilder(400, res);
          }
          response = await deleteBank(requestBody);
        } else {
          return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
          };
        }
        break;
      case banksPath:
        if (method === "POST") {
          const requestBody = JSON.parse(event.body);
          if (!requestBody) {
            return responseBuilder(400, "DTO missing in request body");
          }
          const res = validator(postPutDto, requestBody);
          if (res) {
            return responseBuilder(400, res);
          }
          response = await batchAddBank(requestBody);
        } else if (method === "DELETE") {
          const requestBody = JSON.parse(event.body);
          if (!requestBody) {
            return responseBuilder(400, "DTO missing in request body");
          }
          const res = validator(deleteDto, requestBody);
          if (res) {
            return responseBuilder(400, res);
          }
          response = await batchDeleteBank(requestBody);
        } else {
          return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
          };
        }
        break;
    }
    return response;
  } catch (e) {
    console.error(e); // Log the error for debugging
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

const batchDeleteBank = async (requests) => {
  const formattedBankCodes = requests.map((request) => ({
    DeleteRequest: {
      Key: {
        instNum: { S: request.instNum },
      },
    },
  }));
  const params = {
    RequestItems: {
      bank_code: formattedBankCodes,
    },
  };
  try {
    await ddb.batchWriteItem(params).promise();
    const body = {
      Operation: "BATCH DELETE",
      Message: "Success",
    };
    return responseBuilder(200, body);
  } catch (e) {
    return responseBuilder(400, e.message);
  }
};

const batchAddBank = async (requests) => {
  const formattedBanks = requests.map((request) => ({
    PutRequest: {
      Item: {
        instNum: { S: request.instNum },
        instName: { S: request.instName },
      },
    },
  }));
  const params = {
    RequestItems: {
      bank_code: formattedBanks,
    },
  };
  try {
    await ddb.batchWriteItem(params).promise();
    const body = {
      Operation: "BATCH POST",
      Message: "Success",
      Item: requests,
    };
    return responseBuilder(200, body);
  } catch (e) {
    return responseBuilder(400, e.message);
  }
};

const getBankName = async (instNum) => {
  console.log(instNum, "instNUm");
  if (!instNum) {
    return responseBuilder(400, "instNum must not be empty");
  }
  const params = {
    ...param,
    Key: {
      instNum: { S: instNum },
    },
  };
  try {
    const data = await ddb.getItem(params).promise();
    const item = {};
    for (const key in data.Item) {
      item[key] = data.Item[key].S;
    }
    const body = {
      Operation: "GET",
      Message: "Success",
      Item: item,
    };
    return responseBuilder(200, body);
  } catch (e) {
    return responseBuilder(400, e.message);
  }
};

const addAndUpdateBank = async (request, method) => {
  const params = {
    ...param,
    Item: {
      instNum: { S: request.instNum },
      instName: { S: request.instName },
    },
  };
  try {
    await ddb.putItem(params).promise();
    const body = {
      Operation: method,
      Message: "Success",
      Item: request,
    };
    return responseBuilder(200, body);
  } catch (e) {
    return responseBuilder(400, e.message);
  }
};

const deleteBank = async (request) => {
  const params = {
    ...param,
    Key: {
      instNum: { S: request.instNum },
    },
  };
  try {
    await ddb.deleteItem(params).promise();
    const body = {
      Operation: "DELETE",
      Message: "Success",
    };
    return responseBuilder(200, body);
  } catch (e) {
    return responseBuilder(400, e.message);
  }
};

const responseBuilder = (statusCode, body) => {
  return {
    statusCode,
    body: JSON.stringify(body),
  };
};

const validator = (dto, body) => {
  const schema = Array.isArray(body) ? Joi.array().items(dto) : dto;
  const { error } = schema.validate(body, { abortEarly: false });
  if (error) {
    const formattedError = error.details.map((err) => err.message);
    return formattedError;
  }
};

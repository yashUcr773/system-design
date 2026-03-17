import { DynamoDBClient, GetItemCommand, UpdateItemCommand, } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { config } from 'dotenv';
config();

const client = new DynamoDBClient({
    credentials: {
        accessKeyId: process.env.AWS_DDB_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_DDB_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_DDB_REGION
});

const docClient = DynamoDBDocumentClient.from(client);

export const get = async (tableName, data) => {
    try {
        const command = new GetCommand({
            TableName: tableName,
            Key: {
                user_id: data.user_id,
                timestamp: data.timestamp
            },
        });
        const response = await client.send(command);
        console.log(JSON.stringify(response));
        return response;
    } catch (e) {
        console.log(e)
    }
}

export const getItem = async (tableName, data) => {
    try {
        const command = new GetItemCommand({
            TableName: tableName,
            Key: marshall({
                user_id: data.user_id,
                timestamp: data.timestamp
            }),
        });
        const response = await docClient.send(command);
        console.log(JSON.stringify(response));
        return response;
    } catch (e) {
        console.log(e)
    }
}

export const query1 = async (tableName, data) => {
    try {
        const command = new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "#user_id = :user_id",
            ExpressionAttributeNames: {
                "#user_id": "user_id"
            },
            ExpressionAttributeValues: {
                ":user_id": data.user_id
            },
            ReturnConsumedCapacity: "TOTAL"
        })

        const response = await client.send(command)
        console.log(JSON.stringify(response, null, 2))
        return response
    } catch (e) {
        console.log(e)
    }
}

export const query2 = async (tableName, data) => {
    try {
        const command = new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "#user_id = :user_id AND #timestamp > :timestamp",
            ExpressionAttributeNames: {
                "#user_id": "user_id",
                "#timestamp": "timestamp"
            },
            ExpressionAttributeValues: {
                ":user_id": data.user_id,
                ":timestamp": data.timestamp
            }
        })

        const response = await client.send(command)
        console.log(JSON.stringify(response, null, 2))
        return response
    } catch (e) {
        console.log(e)
    }
}

export const scan = async (tableName, data) => {
    try {
        const command = new ScanCommand({
            TableName: tableName,
        })

        const response = await client.send(command)
        console.log(JSON.stringify(response, null, 2))
        return response
    } catch (e) {
        console.log(e)
    }
}

export const scan2 = async (tableName, data) => {
    try {
        const command = new ScanCommand({
            TableName: tableName,
            FilterExpression: "#cat=:cat",
            ExpressionAttributeNames: {
                '#cat': 'cat'
            },
            ExpressionAttributeValues: {
                ':cat': data.cat
            }
        })

        const response = await client.send(command)
        console.log(JSON.stringify(response, null, 2))
        return response
    } catch (e) {
        console.log(e)
    }
}

query1('test_notes', { user_id: '5c8128f7-fec2-45b1-bb03-40d0eabf4b92' })
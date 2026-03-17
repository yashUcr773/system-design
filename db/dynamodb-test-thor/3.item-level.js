import { DeleteItemCommand, DynamoDBClient, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DeleteCommand, DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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

export const put = async (tableName, data) => {
    try {
        const command = new PutCommand({
            TableName: tableName,
            Item: data
        })
        const response = await docClient.send(command);
        console.log(JSON.stringify(response, null, 2));
        return response;
    } catch (e) {
        console.log(e)
    }
}

export const putItem = async (tableName, data) => {
    try {
        const command = new PutItemCommand({
            TableName: tableName,
            Item: marshall(data)
        })
        const response = await client.send(command);
        console.log(JSON.stringify(response, null, 2));
        return response;
    } catch (e) {
        console.log(e)
    }
}

export const updateItem = async (tableName, updateObj) => {

    try {

        const command = new UpdateItemCommand({
            TableName: tableName,
            Key: marshall({
                user_id: updateObj.user_id,
                timestamp: updateObj.timestamp
            }),
            UpdateExpression: "set #title = :title, #content = :content",
            ExpressionAttributeNames: {
                '#title': 'title',
                '#content': 'content'
            },
            ExpressionAttributeValues: marshall({
                ':title': updateObj.title,
                ':content': updateObj.content
            })
        })

        const response = await docClient.send(command);
        console.log(JSON.stringify(response, null, 2));
        return response;
    } catch (e) {
        console.log(e)
    }
}

export const update = async (tableName, updateObj) => {

    try {

        const command = new UpdateCommand({
            TableName: tableName,
            Key: {
                user_id: updateObj.user_id,
                timestamp: updateObj.timestamp
            },
            UpdateExpression: "set #title = :title, #content = :content",
            ExpressionAttributeNames: {
                '#title': 'title',
                '#content': 'content'
            },
            ExpressionAttributeValues: {
                ':title': updateObj.title,
                ':content': updateObj.content
            }
        })

        const response = await client.send(command);
        console.log(JSON.stringify(response, null, 2));
        return response;
    } catch (e) {
        console.log(e)
    }
}

export const deleteItem = async (tableName, key) => {
    try {
        const command = new DeleteItemCommand({
            TableName: tableName,
            Key: marshall(key)
        })
        const response = await docClient.send(command)
        console.log(response)
        return response
    } catch (e) {
        console.log(e)
    }
}

export const deleteC = async (tableName, key) => {
    try {
        const command = new DeleteCommand({
            TableName: tableName,
            Key: key
        })
        const response = await client.send(command)
        console.log(response)
        return response
    } catch (e) {
        console.log(e)
    }
}

export const batchWrite = async () => {
    try {
        const command = new BatchWriteCommand({
            RequestItems: {
                'test_notes': [
                    {
                        DeleteRequest: {
                            Key: {
                                user_id: 'ea2f86d3-1a44-437f-9465-97f1248f6b3c',
                                timestamp: 1760236027
                            }
                        },
                    },
                    {
                        PutRequest: {
                            Item: {
                                "user_id": "cb9e0a82-5108-43db-bbd8-7b3b452d2142",
                                "timestamp": 1760247022,
                                "cat": "personal",
                                "content": "Budget plan and monthly expense tracking.",
                                "note_id": "f7c62a12-4b7f-4c9e-ae4b-bc5289b52b69",
                                "title": "Budget Planner",
                                "user name": "Ethan"
                            }
                        }
                    },
                    {
                        PutRequest: {
                            Item: {
                                "user_id": "04a9e9c4-01b5-49fa-a283-0dcf3a64b918",
                                "timestamp": 1760250110,
                                "cat": "study",
                                "content": "JavaScript closure concepts and examples.",
                                "note_id": "cba1e67a-28b1-49a8-b1b1-2ac5fa0e8eb2",
                                "title": "JS Closures",
                                "user name": "Ava"
                            }
                        }
                    },
                    {
                        PutRequest: {
                            Item: {
                                "user_id": "b5c8a61a-f7d2-49f3-a9c9-45c33df9b73f",
                                "timestamp": 1760225029,
                                "cat": "general",
                                "content": "Batch Update",
                                "note_id": "7a64c7cc-13e4-4db3-9371-3b917d9dbf2a",
                                "title": "Project Brainstorm",
                                "user name": "Clara"
                            }
                        }
                    }

                ]
            }
        })

        const response = await client.send(command)
        console.log(response)
        return response
    } catch (e) {
        console.log(e)
    }
}

// deleteItem('test_notes', {
//     user_id: 'bc714ae3-769b-4993-b648-35fb7d97d5d6',
//     timestamp: 1760208972,
// })

// updateItem('test_notes', {
//     user_id: '5c8128f7-fec2-45b1-bb03-40d0eabf4b92',
//     timestamp: 1760243957,
//     title: "title-updated-4",
//     content: "content-updated-4"
// })

// putItem('test_notes', {
//     "user_id": "5c8128f7-fec2-45b1-bb03-40d0eabf4b92",
//     "timestamp": 1760243960,
//     "cat": "work-updated",
//     "content": "Notes from the quarterly team strategy meeting.",
//     "note_id": "6cb5a26b-3a5f-4c12-85ab-fd0f97a7a82e",
//     "title": "Q4 Strategy Meeting",
//     "user name": "Isabella"
// })

// batchWrite()

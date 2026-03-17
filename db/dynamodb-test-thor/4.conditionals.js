import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
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
            Item: data,
            ConditionExpression: "#user_id <> :user_id",
            ExpressionAttributeNames: {
                "#user_id": 'user_id'
            },
            ExpressionAttributeValues: {
                ":user_id": "c9b91a77-25dc-48cd-a52a-2bba5b8ed2f2"
            }
        })
        const response = await docClient.send(command);
        console.log(JSON.stringify(response, null, 2));
        return response;
    } catch (e) {
        console.log(e)
    }
}

put('test_notes', {
    "user_id": "c9b91a77-25dc-48cd-a52a-2bba5b8ed2f1",
    "timestamp": 1760253208,
    "cat": "general",
    "content": "Daily journal entry reflecting on progress.",
    "note_id": "bb3f5b11-b891-4e76-801c-032f66d53a81",
    "title": "Journal Entry",
    "user name": "Oliver"
})
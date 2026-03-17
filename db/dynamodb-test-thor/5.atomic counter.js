import { DynamoDBClient, UpdateItemCommand, } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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

export const updateItem = async (tableName, updateObj) => {
    try {
        const command = new UpdateItemCommand({
            TableName: tableName,
            Key: marshall({
                user_id: updateObj.user_id,
                timestamp: updateObj.timestamp
            }),
            UpdateExpression: "set #views = if_not_exists(#views, :start) + :increment",
            ExpressionAttributeNames: {
                '#views': 'views',
            },
            ExpressionAttributeValues: marshall({
                ':increment': updateObj.increment,
                ':start': 0
            }),
            ReturnConsumedCapacity:"TOTAL"
        })

        const response = await docClient.send(command);
        console.log(JSON.stringify(response, null, 2));
        return response;
    } catch (e) {
        console.log(e)
    }
}

updateItem('test_notes', {
    user_id: '3',
    timestamp: 3,
    increment: 1,
})

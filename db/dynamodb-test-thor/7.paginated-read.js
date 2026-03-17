import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { config } from 'dotenv';
config();

const client = new DynamoDBClient({
    credentials: {
        accessKeyId: process.env.AWS_DDB_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_DDB_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_DDB_REGION
});

export const paginatedGet = async (tableName, limit, LastEvaluatedKey) => {
    try {
        const command = new ScanCommand({
            TableName: tableName,
            Limit: limit,
            ExclusiveStartKey: LastEvaluatedKey
        })
        const response = await client.send(command)
        if (response.LastEvaluatedKey) {
            const nextResponse = await paginatedGet(tableName, limit, response.LastEvaluatedKey);
            response.Items = response.Items.concat(...nextResponse.Items)
        }
        return response
    } catch (e) {
        console.log(e)
    }
}

console.log((await paginatedGet('test_notes', 4)).Items)
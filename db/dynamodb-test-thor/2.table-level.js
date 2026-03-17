import { ListTablesCommand, DynamoDBClient, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { config } from 'dotenv';
config();

const client = new DynamoDBClient({
    credentials: {
        accessKeyId: process.env.AWS_DDB_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_DDB_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_DDB_REGION
});

export const listTables = async () => {
    try {

        const command = new ListTablesCommand({
            // ExclusiveStartTableName: "tri",
            // Limit: 2
        });

        const response = await client.send(command);
        console.log(response);
        return response;
    } catch (e) {
        console.log(e)
    }
};

export const describeTable = async (tableName) => {
    try {

        const command = new DescribeTableCommand({
            TableName: tableName
        })

        const response = await client.send(command);
        console.log(JSON.stringify(response, null, 2));
        return response;
    } catch (e) {
        console.log(e)
    }
}

// listTables();
// describeTable('test_notes')
// createTable()
// updateTable()
// deleteTable()
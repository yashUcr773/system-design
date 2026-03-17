import { ListTablesCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
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
    const command = new ListTablesCommand({});

    const response = await client.send(command);
    console.log(response);
    return response;
};

listTables()
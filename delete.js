import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const params = {
    TableName: process.env.tableName,
    // 'Key' defines the partition key and sort key of the item to be removed
    Key: {
      userId: "123", // The id of the author
      musicsheetId: event.pathParameters.id, // The id of the note from the path
    },
  };

  await dynamoDb.delete(params);

  return { status: true };
});
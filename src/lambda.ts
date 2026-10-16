import serverless from 'serverless-http';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import app from './app';
import { connectDB } from './config/db';

const serverlessApp = serverless(app);


export const handler= async(event: APIGatewayProxyEventV2, context: Context) => {
    try {

        await connectDB()
        
    } catch (error) {
    console.error('Database connection failed:', error);

    // Reply with a clean error instead of crashing
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Database connection failed' }),
    };
    }

    // Hand the request to Express, exactly like a normal server would
  return serverlessApp(event, context);
}


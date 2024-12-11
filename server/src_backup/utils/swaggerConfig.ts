import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Google-Ai-Pro',
      version: '1.0.0',
      description: 'API documentation for Google-Ai-Pro',
    },
    servers: [
      {
        url: 'https://google-ai-pro-api.onrender.com',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
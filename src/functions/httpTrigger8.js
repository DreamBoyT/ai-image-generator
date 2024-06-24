const { app } = require('@azure/functions');
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');

const endpoint = "https://chat-gpt-a1.openai.azure.com/";
const azureApiKey = "c09f91126e51468d88f57cb83a63ee36";

const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
const deploymentName = "Dalle3";

app.http('httpTrigger8', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        
        try {
            const { prompt, size, style, quality } = await request.json();
            const modifiedPrompt = `${prompt}, style: ${style}, quality: ${quality}`;
            const results = await client.getImages(deploymentName, modifiedPrompt, { n: 1, size });
            const imageUrls = results.data.map(image => image.url);

            // Set CORS headers
            context.res = {
                headers: {
                    'Access-Control-Allow-Origin': '*', // Replace with your allowed origin(s)
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                body: { imageUrls }
            };
        } catch (err) {
            context.log("Error generating image:", err);
            context.res = {
                status: 500,
                body: { error: "Failed to generate image" }
            };
        }
    }
});

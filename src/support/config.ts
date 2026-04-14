import dotenv from "dotenv";

// Load environment variables
const result = dotenv.config();

export const config = {
    baseUrl: process.env.BASE_URL!,
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    scope: process.env.SCOPE!,
    url: {
        token: process.env.TOKEN_ENDPOINT!,
        customer: {
            create: process.env.CUSTOMER_CREATE_API!,
        },
    },
    tenantId: process.env.TENANT_ID,
    services: {
        oip_service: {
            baseURL: process.env.OIP_SERVICE_BASE_URL!,
            tokenUrl: process.env.OIP_SERVICE_TOKEN_URL!,
        },
        oip_markasresolved_service: {
            baseURL: process.env.OIP_SERVICE_BASE_URL!,
            tokenUrl: process.env.OIP_SERVICE_TOKEN_URL!,
        },
    },
} as const;
export type ServiceName = keyof typeof config.services;

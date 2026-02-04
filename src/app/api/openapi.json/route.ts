/**
 * OpenAPI 3.0 Specification for Datalyst Agent API
 * 
 * This endpoint serves the OpenAPI spec for AI agents to discover and use the API.
 */

import { NextResponse } from 'next/server';

const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Datalyst Agent API',
        description: `
# Datalyst Agent API

Run scientifically rigorous N=1 experiments for your users. This API allows AI agents to:

1. **Discover Protocols** - Browse standardized experiment templates
2. **Start Trials** - Initiate experiments based on protocols
3. **Log Data** - Record daily measurements with strict validation
4. **Get Results** - Retrieve statistical analysis with blockchain verification

## Authentication

All endpoints require an API key in the \`X-API-Key\` header:

\`\`\`
X-API-Key: sk_your_api_key_here
\`\`\`

## Blockchain Verification

Results are attested on Base L2 using EAS (Ethereum Attestation Service), providing tamper-proof verification without requiring user wallets.
    `,
        version: '1.0.0',
        contact: {
            email: 'support@datalyst.app',
        },
    },
    servers: [
        {
            url: 'https://datalyst.app',
            description: 'Production',
        },
        {
            url: 'http://localhost:3005',
            description: 'Development',
        },
    ],
    security: [
        {
            ApiKeyAuth: [],
        },
    ],
    paths: {
        '/api/v1/protocols': {
            get: {
                operationId: 'listProtocols',
                summary: 'List available experiment protocols',
                description: 'Returns all public protocols that can be used to start trials. Each protocol defines a standardized experiment template.',
                tags: ['Protocols'],
                responses: {
                    '200': {
                        description: 'List of protocols',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        protocols: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Protocol' },
                                        },
                                        count: { type: 'integer', example: 3 },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/v1/agent/trial': {
            post: {
                operationId: 'startTrial',
                summary: 'Start a new trial from a protocol',
                description: 'Creates a new experiment instance based on a protocol template. Returns the trial ID and schema for logging data.',
                tags: ['Trials'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['protocolId'],
                                properties: {
                                    protocolId: {
                                        type: 'string',
                                        description: 'The protocol ID or slug to use',
                                        example: 'magnesium-sleep-v1',
                                    },
                                    duration: {
                                        type: 'integer',
                                        description: 'Duration in days (default: protocol recommended)',
                                        example: 14,
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Trial created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        trial: { $ref: '#/components/schemas/Trial' },
                                    },
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid request',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                },
            },
        },
        '/api/v1/agent/log': {
            post: {
                operationId: 'logData',
                summary: 'Log data for an active trial',
                description: 'Records data entries for a specific date. Validates against the protocol schema.',
                tags: ['Trials'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['trialId', 'date', 'entries'],
                                properties: {
                                    trialId: {
                                        type: 'string',
                                        description: 'The trial ID',
                                    },
                                    date: {
                                        type: 'string',
                                        format: 'date',
                                        description: 'Date in YYYY-MM-DD format',
                                        example: '2025-01-15',
                                    },
                                    entries: {
                                        type: 'array',
                                        description: 'Data entries to log',
                                        items: {
                                            type: 'object',
                                            required: ['subvariableId', 'value'],
                                            properties: {
                                                subvariableId: {
                                                    type: 'string',
                                                    description: 'The subvariable ID from the trial schema',
                                                },
                                                value: {
                                                    oneOf: [
                                                        { type: 'number' },
                                                        { type: 'boolean' },
                                                        { type: 'string' },
                                                    ],
                                                    description: 'The value to log',
                                                },
                                            },
                                        },
                                    },
                                    note: {
                                        type: 'string',
                                        description: 'Optional note for this entry',
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Data logged successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        logged: {
                                            type: 'object',
                                            properties: {
                                                trialId: { type: 'string' },
                                                date: { type: 'string' },
                                                entriesCount: { type: 'integer' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/v1/agent/results/{trialId}': {
            get: {
                operationId: 'getResults',
                summary: 'Get trial results',
                description: 'Returns statistical analysis, rigor score, and blockchain verification for a trial.',
                tags: ['Results'],
                parameters: [
                    {
                        name: 'trialId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'The trial ID',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Trial results',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TrialResults' },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        securitySchemes: {
            ApiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'X-API-Key',
                description: 'API key for authentication. Contact support@datalyst.app to obtain one.',
            },
        },
        schemas: {
            Protocol: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    slug: { type: 'string', example: 'magnesium-sleep-v1' },
                    name: { type: 'string', example: 'Magnesium for Sleep Quality' },
                    description: { type: 'string' },
                    version: { type: 'string', example: '1.0' },
                    recommendedDuration: { type: 'integer', example: 14 },
                    recommendedWashout: { type: 'integer', example: 2 },
                    independentTemplate: {
                        type: 'object',
                        description: 'Template for the intervention variable',
                    },
                    dependentTemplate: {
                        type: 'object',
                        description: 'Template for the outcome variable',
                    },
                },
            },
            Trial: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    protocolId: { type: 'string' },
                    protocolName: { type: 'string' },
                    startDate: { type: 'string', format: 'date' },
                    endDate: { type: 'string', format: 'date' },
                    status: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'] },
                    loggingSchema: {
                        type: 'object',
                        description: 'Schema describing what data to log each day',
                    },
                    endpoints: {
                        type: 'object',
                        properties: {
                            log: { type: 'string', description: 'Endpoint to log data' },
                            results: { type: 'string', description: 'Endpoint to get results' },
                        },
                    },
                },
            },
            TrialResults: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    trial: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            status: { type: 'string' },
                        },
                    },
                    statistics: {
                        type: 'object',
                        properties: {
                            effectSize: { type: 'number', example: 0.45 },
                            pValue: { type: 'number', example: 0.023 },
                            conditionAMean: { type: 'number' },
                            conditionBMean: { type: 'number' },
                            nA: { type: 'integer' },
                            nB: { type: 'integer' },
                            interpretation: { type: 'string' },
                        },
                    },
                    rigorScore: {
                        type: 'object',
                        properties: {
                            score: { type: 'integer', minimum: 0, maximum: 100 },
                            grade: { type: 'string', example: 'A' },
                            tips: { type: 'array', items: { type: 'string' } },
                        },
                    },
                    verification: {
                        type: 'object',
                        properties: {
                            isVerified: { type: 'boolean' },
                            attestationUid: { type: 'string' },
                            explorerUrl: { type: 'string', format: 'uri' },
                            chain: { type: 'string', example: 'Base' },
                        },
                    },
                },
            },
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string' },
                    details: { type: 'object' },
                },
            },
        },
    },
};

export async function GET() {
    return NextResponse.json(openApiSpec, {
        headers: {
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
        },
    });
}

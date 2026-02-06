/**
 * Agent API Authentication Middleware
 * 
 * Validates API keys for external agents (Moltbot, OpenClaw, etc.)
 */

import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export interface AuthenticatedAgent {
    apiKeyId: string;
    userId: string;
    agentName: string;
    agentId?: string;
    rateLimitPerMinute: number;
}

/**
 * Authenticate an API request using the X-API-Key header
 * Returns the authenticated agent info or null if invalid
 */
export async function authenticateAgent(
    request: NextRequest
): Promise<AuthenticatedAgent | null> {
    const apiKey = request.headers.get('X-API-Key');

    if (!apiKey) {
        return null;
    }

    try {
        const keyRecord = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            select: {
                id: true,
                name: true,
                agentId: true,
                userId: true,
                isActive: true,
                rateLimitPerMinute: true,
            },
        });

        if (!keyRecord || !keyRecord.isActive) {
            return null;
        }

        // Update last used timestamp (fire and forget)
        prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { lastUsedAt: new Date() },
        }).catch(() => { });

        return {
            apiKeyId: keyRecord.id,
            userId: keyRecord.userId,
            agentName: keyRecord.name,
            agentId: keyRecord.agentId ?? undefined,
            rateLimitPerMinute: keyRecord.rateLimitPerMinute,
        };
    } catch (error) {
        console.error('[Agent Auth] Failed to authenticate:', error);
        return null;
    }
}

/**
 * Create a standard unauthorized response
 */
export function unauthorizedResponse(message = 'Invalid or missing API key') {
    return new Response(
        JSON.stringify({ success: false, error: message }),
        {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        }
    );
}

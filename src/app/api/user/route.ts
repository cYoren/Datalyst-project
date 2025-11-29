import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        console.log('[/api/user] Auth check start');

        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        console.log('[/api/user] Auth check result:', {
            hasUser: !!user,
            userId: user?.id,
            userEmail: user?.email,
            error: error?.message,
            errorCode: error?.code
        });

        if (error || !user) {
            console.log('[/api/user] Unauthorized - no user found or error occurred');
            return NextResponse.json({ error: 'Unauthorized', details: error?.message }, { status: 401 });
        }

        // Get user profile from database
        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                name: true,
                onboardingCompleted: true,
                timezone: true,
                locale: true,
                theme: true,
                createdAt: true,
            }
        });

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: profile?.name || user.user_metadata?.name || null,
            profile: profile || null,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { onboardingCompleted, timezone, locale, theme } = body;

        // Update user profile in database
        const updatedProfile = await prisma.user.update({
            where: { id: user.id },
            data: {
                ...(typeof onboardingCompleted === 'boolean' && { onboardingCompleted }),
                ...(timezone && { timezone }),
                ...(locale && { locale }),
                ...(theme && { theme }),
            },
            select: {
                id: true,
                email: true,
                onboardingCompleted: true,
                timezone: true,
                locale: true,
                theme: true,
                createdAt: true,
            }
        });

        return NextResponse.json(updatedProfile);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


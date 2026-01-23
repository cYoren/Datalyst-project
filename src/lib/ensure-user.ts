import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * Ensure user exists in database
 * Creates user record if it doesn't exist (for users created directly in Supabase)
 */
export async function ensureUserExists(userId: string, email: string) {
    try {
        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { id: userId }
        });

        // If user doesn't exist, create it
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: email,
                    onboardingCompleted: false,
                }
            });
        }

        return user;
    } catch (error) {
        console.error('Error ensuring user exists:', error);
        throw error;
    }
}

/**
 * Get authenticated user and ensure they exist in database
 */
export async function getAuthenticatedUser() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
        return null;
    }

    // Ensure user exists in database
    await ensureUserExists(user.id, user.email);

    return user;
}

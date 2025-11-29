import { NextResponse } from 'next/server';
import { StatsService } from '@/services/stats.service';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Calculate correlations (in production, cache this or run in background)
        const correlations = await StatsService.calculateGlobalCorrelations(user.id);

        return NextResponse.json({
            correlations: correlations.slice(0, 10), // Top 10
            generatedAt: new Date()
        });
    } catch (error) {
        console.error('Error generating insights:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

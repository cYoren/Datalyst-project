import { NextResponse } from 'next/server';
import { StatsService } from '@/services/stats.service';

const USER_ID = 'default-user-id';

export async function GET() {
    try {
        // In a real app, we might cache this response or run it in a background job
        const correlations = await StatsService.calculateGlobalCorrelations(USER_ID);

        // We can add more global insights here

        return NextResponse.json({
            correlations: correlations.slice(0, 10), // Top 10
            generatedAt: new Date()
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

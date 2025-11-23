import { NextResponse } from 'next/server';
import { EntryService } from '@/services/entry.service';
import { createEntrySchema } from '@/lib/validations';
import { z } from 'zod';

const USER_ID = 'default-user-id';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
        return NextResponse.json({ error: 'Missing date range' }, { status: 400 });
    }

    try {
        const entries = await EntryService.getEntries(
            USER_ID,
            new Date(startDate),
            new Date(endDate)
        );
        return NextResponse.json(entries);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const body = createEntrySchema.parse(json);

        const entry = await EntryService.createEntry(USER_ID, body);
        return NextResponse.json(entry, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

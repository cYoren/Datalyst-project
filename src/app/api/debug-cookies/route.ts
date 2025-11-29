import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    return NextResponse.json({
        cookies: allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 10) + '...' })),
        count: allCookies.length
    });
}

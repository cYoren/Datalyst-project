import { NextResponse } from 'next/server';
import { TemplateService } from '@/services/template.service';
import { z } from 'zod';

// Mock user ID for MVP
const USER_ID = 'default-user-id';

const createTemplateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    defaultSchedule: z.any().optional(),
    subvariableTemplate: z.array(z.any()).optional(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        let templates;
        if (query) {
            // Search templates
            templates = await TemplateService.searchTemplates(USER_ID, query);
        } else {
            // Get all templates
            templates = await TemplateService.getUserTemplates(USER_ID);
        }

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const body = createTemplateSchema.parse(json);

        const template = await TemplateService.createTemplate(USER_ID, body);
        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Error creating template:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

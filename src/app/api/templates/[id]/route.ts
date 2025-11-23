import { NextResponse } from 'next/server';
import { TemplateService } from '@/services/template.service';
import { z } from 'zod';

const USER_ID = 'default-user-id';

const updateTemplateSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    defaultSchedule: z.any().optional(),
    subvariableTemplate: z.array(z.any()).optional(),
});

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const template = await TemplateService.getTemplateById(USER_ID, id);
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        return NextResponse.json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const json = await request.json();
        const body = updateTemplateSchema.parse(json);

        const template = await TemplateService.updateTemplate(USER_ID, id, body);
        return NextResponse.json(template);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Error updating template:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await TemplateService.deleteTemplate(USER_ID, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

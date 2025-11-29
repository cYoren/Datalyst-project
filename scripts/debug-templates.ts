
import { PrismaClient } from '@prisma/client';
import { TemplateService } from '../src/services/template.service';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        // Find a user to test with
        const user = await prisma.user.findFirst();

        if (!user) {
            console.log('No user found in database to test with.');
            return;
        }

        console.log(`Testing with user: ${user.email} (${user.id})`);

        console.log('Calling TemplateService.getUserTemplates...');
        const templates = await TemplateService.getUserTemplates(user.id);

        console.log('Success! Templates fetched:');
        console.log(JSON.stringify(templates, null, 2));

    } catch (error) {
        console.error('Caught error during execution:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

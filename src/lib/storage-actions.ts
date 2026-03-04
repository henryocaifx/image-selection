'use server';

import fs from 'fs/promises';
import path from 'path';

/**
 * Saves a list of data URI images to a local folder.
 * @param imageDataUris Array of base64 data URIs
 * @returns Object with success status and count
 */
export async function saveImagesToLocalFolder(imageDataUris: string[]) {
    try {
        const saveDir = path.join(process.cwd(), 'saved_portraits');

        // Ensure directory exists
        await fs.mkdir(saveDir, { recursive: true });

        const savedFiles: string[] = [];

        for (let i = 0; i < imageDataUris.length; i++) {
            const dataUri = imageDataUris[i];

            // Extract base64 content
            const match = dataUri.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!match) continue;

            const ext = match[1];
            const base64Data = match[2];
            const buffer = Buffer.from(base64Data, 'base64');

            const fileName = `portrait_${Date.now()}_${i}.${ext}`;
            const filePath = path.join(saveDir, fileName);

            await fs.writeFile(filePath, buffer);
            savedFiles.push(fileName);
        }

        console.log(`Saved ${savedFiles.length} images to ${saveDir}`);

        return {
            success: true,
            count: savedFiles.length,
            path: saveDir
        };
    } catch (error) {
        console.error('Failed to save images locally:', error);
        return { success: false, error: String(error) };
    }
}

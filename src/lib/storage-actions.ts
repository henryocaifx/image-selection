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
        // 1. Create a formatted timestamp (e.g., 20231027_1430)
        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/[-T]/g, '')    // Remove dashes and the 'T' separator
            .slice(0, 8) + '_' +     // Take YYYYMMDD and add underscore
            now.toTimeString()
                .split(' ')[0]
                .replace(/:/g, '')
                .slice(0, 4);            // Take HHMM

        // 2. Update the saveDir to include this new subfolder
        const saveDir = path.join(process.cwd(), 'saved_portraits', timestamp);

        // Ensure directory (and the new subfolder) exists
        await fs.mkdir(saveDir, { recursive: true });

        const savedFiles: string[] = [];

        for (let i = 0; i < imageDataUris.length; i++) {
            const dataUri = imageDataUris[i];

            const match = dataUri.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!match) continue;

            const ext = match[1];
            const base64Data = match[2];
            const buffer = Buffer.from(base64Data, 'base64');

            // Simplified filename since the folder already handles the timing
            const fileName = `img_${i}.${ext}`;
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

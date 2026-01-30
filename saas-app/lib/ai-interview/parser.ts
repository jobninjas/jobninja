import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function parseResumeFile(buffer: Buffer, mimetype: string): Promise<string> {
    try {
        if (mimetype === 'application/pdf') {
            const data = await pdf(buffer);
            return data.text;
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimetype === 'application/msword'
        ) {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else if (mimetype === 'text/plain') {
            return buffer.toString('utf-8');
        }
        throw new Error('Unsupported file type: ' + mimetype);
    } catch (error) {
        console.error('Resume parsing error:', error);
        throw new Error('Failed to parse resume: ' + (error as Error).message);
    }
}

export function cleanExtractedText(text: string): string {
    // Remove excessive whitespace, non-printable characters, etc.
    return text
        .replace(/\s+/g, ' ')
        .replace(/[^\x20-\x7E\n]/g, '')
        .trim();
}

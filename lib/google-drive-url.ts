// Matches the file ID out of the handful of URL shapes Google Drive's own
// "Share" dialog produces (file/d/<id>/view, open?id=<id>, uc?id=<id>) so a
// stored driveUrl can be turned into a thumbnail without calling any API —
// see app/videos/[id]/storyboard/storyboard-gallery.tsx.
const DRIVE_FILE_ID_PATTERNS = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/];

export function extractDriveFileId(url: string): string | null {
  for (const pattern of DRIVE_FILE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

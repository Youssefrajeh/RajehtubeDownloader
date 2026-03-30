import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const appDir = process.cwd();
    // Search order:
    // 1. tools/ relative to exe (Deployment/Output)
    // 2. ../YouTubeDownloader/tools/ (Local fallback)
    // 3. system path (Docker/VPS)

    const ytDlpBinary = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
    const ytDlpPath = path.join(appDir, 'tools', ytDlpBinary);
    const fallbackPath = path.join(appDir, '..', 'YouTubeDownloader', 'tools', ytDlpBinary);

    let actualPath = 'yt-dlp'; // Default to system-wide
    if (fs.existsSync(ytDlpPath)) {
      actualPath = ytDlpPath;
    } else if (fs.existsSync(fallbackPath)) {
      actualPath = fallbackPath;
    }

    // Support for cookies.txt in the tools folder
    const cookiesPath = path.join(appDir, 'tools', 'cookies.txt');
    const cookieArgs = fs.existsSync(cookiesPath) ? ['--cookies', cookiesPath] : [];

    const args = ['--dump-json', '--flat-playlist', '--js-runtimes', 'node', '--extractor-args', 'youtube:player_client=ios,tv', ...cookieArgs, url];
    
    return new Promise<NextResponse>((resolve) => {
      const process = spawn(actualPath, args);
      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          try {
            // yt-dlp outputs one JSON per line for playlists
            const lines = output.split('\n').filter(l => l.trim() !== '');
            const videos = lines.map(line => {
              const root = JSON.parse(line);
              return {
                id: root.id,
                title: root.title,
                url: root.webpage_url || root.url || `https://www.youtube.com/watch?v=${root.id}`,
                duration: formatDuration(root.duration || 0),
                thumbnail: root.thumbnails?.[0]?.url || root.thumbnail || '',
                formats: root.formats?.map((f: any) => ({
                  id: f.format_id,
                  ext: f.ext,
                  resolution: f.resolution,
                  filesize: f.filesize,
                })).filter((f: any) => f.resolution !== 'audio only') || []
              };
            });
            resolve(NextResponse.json({ videos }));
          } catch (e) {
            resolve(NextResponse.json({ error: 'Failed to parse yt-dlp output' }, { status: 500 }));
          }
        } else {
          resolve(NextResponse.json({ error: error || `yt-dlp exited with code ${code}` }, { status: 500 }));
        }
      });
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s]
    .map(v => v < 10 ? '0' + v : v)
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
}

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    const formatId = req.nextUrl.searchParams.get('formatId') || 'best';
    const title = req.nextUrl.searchParams.get('title') || 'video';
    const isAudio = req.nextUrl.searchParams.get('audio') === 'true';

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

    // FFmpeg location
    const ffmpegLocalPath = path.join(appDir, 'tools');
    const ffmpegFallbackPath = path.join(appDir, '..', 'YouTubeDownloader', 'tools');
    
    let ffmpegArgs: string[] = [];
    if (fs.existsSync(path.join(ffmpegLocalPath, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'))) {
      ffmpegArgs = ['--ffmpeg-location', ffmpegLocalPath];
    } else if (fs.existsSync(path.join(ffmpegFallbackPath, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'))) {
      ffmpegArgs = ['--ffmpeg-location', ffmpegFallbackPath];
    }
    // If none found, yt-dlp will try system-wide ffmpeg by default

    // Support for cookies.txt in the tools folder
    const cookiesPath = path.join(appDir, 'tools', 'cookies.txt');
    const cookieArgs = fs.existsSync(cookiesPath) ? ['--cookies', cookiesPath] : [];

    let args: string[] = [];
    if (isAudio) {
      args = ['-x', '--audio-format', 'mp3', '--audio-quality', '0', '--js-runtimes', 'node', ...cookieArgs, '-o', '-', ...ffmpegArgs, url];
    } else {
      args = ['-f', `${formatId}+bestaudio/best`, '--merge-output-format', 'mp4', '--js-runtimes', 'node', ...cookieArgs, '-o', '-', ...ffmpegArgs, url];
    }

    const ytDlp = spawn(actualPath, args);

    const stream = new ReadableStream({
      start(controller) {
        ytDlp.stdout.on('data', (chunk) => controller.enqueue(chunk));
        ytDlp.stdout.on('end', () => controller.close());
        ytDlp.stderr.on('data', (data) => console.error(`yt-dlp: ${data}`));
        ytDlp.on('error', (err) => controller.error(err));
      },
      cancel() {
        ytDlp.kill();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.${isAudio ? 'mp3' : 'mp4'}"`,
        'Content-Type': isAudio ? 'audio/mpeg' : 'video/mp4',
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

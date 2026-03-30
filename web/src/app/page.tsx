"use client";

import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const fetchMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError(null);
    setVideos([]);
    
    try {
      const res = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideos(data.videos || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (video: any, formatId: string, isAudio: boolean) => {
    const downloadUrl = `/api/download?url=${encodeURIComponent(video.url)}&formatId=${formatId}&title=${encodeURIComponent(video.title)}&audio=${isAudio}`;
    // We use a direct link to trigger browser download
    window.location.href = downloadUrl;
  };

  return (
    <main style={{ padding: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }} className="animate-fade-in">
        <h1 style={{ fontSize: '4rem', fontWeight: '800', letterSpacing: '-0.05em', marginBottom: '1rem' }}>
          RajehTube <span className="gradient-text">Downloader</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto', marginBottom: '1.5rem' }}>
          Experience the fast, secure, and modern way to download your favorite YouTube videos and playlists in high quality.
        </p>
        <a 
          href="https://drive.google.com/file/d/19vUIwMNqMveJZliojYZhcT02TqvMOhha/view?usp=drive_link" 
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Desktop App (.exe)
        </a>
      </div>

      {/* Input Section */}
      <div className="glass animate-fade-in" style={{ padding: '0.5rem', width: '100%', maxWidth: '800px', marginBottom: '3rem' }}>
        <form onSubmit={fetchMetadata} style={{ display: 'flex', width: '100%', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Paste your YouTube link here..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ 
              flex: '1 1 300px', 
              background: 'transparent', 
              border: 'none', 
              color: 'white', 
              fontSize: '1.1rem', 
              padding: '1rem',
              outline: 'none',
              minWidth: '0'
            }}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              background: 'linear-gradient(90deg, #ff0000, #ff007f)', 
              color: 'white', 
              border: 'none', 
              padding: '1rem 2rem', 
              borderRadius: '12px', 
              fontSize: '1rem', 
              fontWeight: '600', 
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1,
              flex: '1 1 100%'
            }}
          >
            {loading ? 'Processing...' : 'Download'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ color: '#ff4444', background: 'rgba(255,0,0,0.1)', padding: '1rem 2rem', borderRadius: '12px', marginBottom: '2rem' }}>
          Error: {error}
        </div>
      )}

      {/* Results Section */}
      <div style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {videos.map((video, idx) => (
          <div key={idx} className="glass animate-fade-in" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              style={{ width: '100%', borderRadius: '12px', aspectRatio: '16/9', objectFit: 'cover', marginBottom: '1rem' }} 
            />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.8rem' }}>
              {video.title}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Duration: {video.duration}
            </p>
            
            <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button 
                onClick={() => handleDownload(video, 'bestvideo[height<=1080]', false)}
                style={{ 
                  padding: '8px', 
                  borderRadius: '8px', 
                  border: '1px solid #444', 
                  background: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                1080p MP4
              </button>
              <button 
                onClick={() => handleDownload(video, 'bestvideo[height<=720]', false)}
                style={{ 
                  padding: '8px', 
                  borderRadius: '8px', 
                  border: '1px solid #444', 
                  background: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                720p MP4
              </button>
              <button 
                onClick={() => handleDownload(video, 'mp3', true)}
                style={{ 
                  gridColumn: 'span 2',
                  padding: '8px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: 'rgba(255,255,255,0.9)', 
                  color: 'black', 
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem'
                }}
              >
                DOWNLOAD MP3
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '4rem 0 2rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
        &copy; {new Date().getFullYear()} RajehTube Downloader. Professional Video & Playlist Tool.
      </footer>
    </main>
  );
}

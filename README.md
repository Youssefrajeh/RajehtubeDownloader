# Rajehtube Downloader - WPF YouTube Video & Playlist Downloader

**Rajehtube Downloader** is a complete Windows desktop application built with C# and WPF (.NET 8). It's designed to be a professional-quality tool that wraps `yt-dlp` and `ffmpeg` to provide a seamless downloading experience for YouTube videos and full playlists.

![Preview Placeholder](https://via.placeholder.com/1000x500?text=Rajehtube+Downloader+Modern+UI)

## 📺 Features

- **URL Metadata Parsing**: Instant fetching of video/playlist details (title, duration, thumbnails).
- **Playlist Management**: View all videos in a playlist and selectively choose which ones to download.
- **Quality Selection**: Supports 1080p, 720p, 360p, and "Audio Only" (MP3) downloads.
- **Real-time Progress**: Detailed per-item progress (percentage, speed, ETA) and a global progress bar.
- **Modern Premium UI**: Sleek dark-themed interface with custom XAML styling.
- **Automatic Conversion**: Automatically merges video/audio or converts to MP3 using FFmpeg.

## 🚀 Getting Started

### Prerequisites

- **.NET 8.0 SDK**: [Download here](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- **Visual Studio 2022**: With the "Desktop development with .NET" workload.

### Setup & Tools

> [!IMPORTANT]
> The application requires `yt-dlp.exe` and `ffmpeg.exe` to function.

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/RajehtubeDownloader.git
    cd RajehtubeDownloader
    ```
2.  **Download External Tools**:
    - Download [yt-dlp.exe](https://github.com/yt-dlp/yt-dlp/releases) and place it in the `YouTubeDownloader/tools/` folder.
    - Download [FFmpeg Essentials](https://www.gyan.dev/ffmpeg/builds/) (zip), extract `ffmpeg.exe` and `ffprobe.exe` from the `bin` folder, and place them in the same `YouTubeDownloader/tools/` folder.

Your `tools/` directory should look like this:
```text
YouTubeDownloader/tools/
├── ffmpeg.exe
├── ffprobe.exe
└── yt-dlp.exe
```

3.  **Build and Run**:
    Open `RajehtubeDownloader.sln` in Visual Studio and press **F5**.

## 🛠️ Built With

- **WPF** - Windows Presentation Foundation for the UI.
- **MVVM** - Clean separation of concerns (Views, ViewModels, Models, Services).
- **yt-dlp** - The powerhouse engine for video downloading.
- **FFmpeg** - For all media conversion and merging tasks.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for professional video downloading.*

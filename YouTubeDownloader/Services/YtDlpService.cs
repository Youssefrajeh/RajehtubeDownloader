using System.IO;
using System.Text.Json;
using System.Text.RegularExpressions;
using YouTubeDownloader.Models;

namespace YouTubeDownloader.Services
{
    public interface IYtDlpService
    {
        Task<List<VideoItem>> FetchMetadataAsync(string url, CancellationToken ct = default);
        Task DownloadAsync(VideoItem item, DownloadFormat format, string outputFolder, CancellationToken ct = default);
    }

    public class YtDlpService : IYtDlpService
    {
        private readonly IProcessService _processService;
        private readonly string _ytDlpPath;
        private readonly string _ffmpegPath;

        public YtDlpService(IProcessService processService)
        {
            _processService = processService;
            var appDir = AppDomain.CurrentDomain.BaseDirectory;
            
            // Search order:
            // 1. tools/ relative to exe (Deployment/Output)
            // 2. ../../../tools/ relative to exe (Development/VS)
            
            _ytDlpPath = Path.Combine(appDir, "tools", "yt-dlp.exe");
            _ffmpegPath = Path.Combine(appDir, "tools");

            if (!File.Exists(_ytDlpPath))
            {
                var devPath = Path.Combine(appDir, "..", "..", "..", "tools", "yt-dlp.exe");
                if (File.Exists(devPath))
                {
                    _ytDlpPath = devPath;
                    _ffmpegPath = Path.Combine(appDir, "..", "..", "..", "tools");
                }
            }
        }

        public async Task<List<VideoItem>> FetchMetadataAsync(string url, CancellationToken ct = default)
        {
            if (!File.Exists(_ytDlpPath))
                throw new FileNotFoundException("yt-dlp.exe not found in tools folder.");

            // Use --flat-playlist to get basic info quickly
            var args = $"--dump-json --flat-playlist \"{url}\"";
            var result = await _processService.RunAsync(_ytDlpPath, args, null, ct);

            var videos = new List<VideoItem>();
            if (result.ExitCode == 0)
            {
                var lines = result.Output.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines)
                {
                    try
                    {
                        using var doc = JsonDocument.Parse(line);
                        var root = doc.RootElement;
                        
                        var video = new VideoItem
                        {
                            Id = root.GetProperty("id").GetString() ?? "",
                            Title = root.GetProperty("title").GetString() ?? "Unknown Title",
                            Url = root.TryGetProperty("url", out var urlProp) ? urlProp.GetString() ?? "" : $"https://www.youtube.com/watch?v={root.GetProperty("id").GetString()}",
                            Duration = FormatDuration(root.TryGetProperty("duration", out var durProp) ? durProp.GetDouble() : 0),
                            ThumbnailUrl = root.TryGetProperty("thumbnails", out var thumbProp) ? thumbProp[0].GetProperty("url").GetString() ?? "" : ""
                        };
                        videos.Add(video);
                    }
                    catch (JsonException) { /* Skip invalid lines */ }
                }
            }
            else if (!string.IsNullOrEmpty(result.Error))
            {
                throw new Exception($"yt-dlp error: {result.Error}");
            }

            return videos;
        }

        public async Task DownloadAsync(VideoItem item, DownloadFormat format, string outputFolder, CancellationToken ct = default)
        {
            if (!File.Exists(_ytDlpPath))
                throw new FileNotFoundException("yt-dlp.exe not found in tools folder.");

            item.Status = "Initializing...";
            item.Progress = 0;

            string formatStr;
            if (format.IsAudioOnly)
            {
                formatStr = "-x --audio-format mp3 --audio-quality 0";
            }
            else
            {
                formatStr = $"-f \"{format.VideoFormat}+{format.AudioFormat}/best\" --merge-output-format mp4";
            }

            // Using custom progress template
            var progressTemplate = "%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s";
            var outputTemplate = Path.Combine(outputFolder, "%(title)s.%(ext)s");
            
            var args = $"{formatStr} --ffmpeg-location \"{_ffmpegPath}\" --progress --newline --progress-template \"{progressTemplate}\" -o \"{outputTemplate}\" \"{item.Url}\"";

            item.Status = "Downloading...";

            await _processService.RunAsync(_ytDlpPath, args, (output) =>
            {
                // Parse the progress output
                // Template: " 23.5%| 1.00MiB/s|00:07"
                var parts = output.Split('|');
                if (parts.Length >= 3)
                {
                    var percentStr = parts[0].Trim().Replace("%", "");
                    if (double.TryParse(percentStr, out var percent))
                    {
                        item.Progress = percent;
                    }
                    item.Speed = parts[1].Trim();
                    item.Eta = parts[2].Trim();
                    item.Status = $"Downloading ({item.Progress}%)";
                }
            }, ct);

            if (ct.IsCancellationRequested)
            {
                item.Status = "Canceled";
            }
            else
            {
                item.Status = "Completed";
                item.Progress = 100;
                item.Speed = "";
                item.Eta = "";
            }
        }

        private string FormatDuration(double seconds)
        {
            var span = TimeSpan.FromSeconds(seconds);
            return span.TotalHours >= 1 
                ? span.ToString(@"hh\:mm\:ss") 
                : span.ToString(@"mm\:ss");
        }
    }
}

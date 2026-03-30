namespace YouTubeDownloader.Models
{
    public class DownloadFormat
    {
        public string Label { get; set; } = string.Empty;
        public string VideoFormat { get; set; } = string.Empty; // e.g. "bestvideo[height<=1080]"
        public string AudioFormat { get; set; } = string.Empty; // e.g. "bestaudio/best"
        public bool IsAudioOnly { get; set; }

        public static List<DownloadFormat> GetDefaultFormats()
        {
            return new List<DownloadFormat>
            {
                new DownloadFormat { Label = "1080p (Best High Definition)", VideoFormat = "bestvideo[height<=1080]", AudioFormat = "bestaudio/best" },
                new DownloadFormat { Label = "720p (High Definition)", VideoFormat = "bestvideo[height<=720]", AudioFormat = "bestaudio/best" },
                new DownloadFormat { Label = "360p (Standard Definition)", VideoFormat = "bestvideo[height<=360]", AudioFormat = "bestaudio/best" },
                new DownloadFormat { Label = "Audio Only (MP3)", IsAudioOnly = true }
            };
        }
    }
}

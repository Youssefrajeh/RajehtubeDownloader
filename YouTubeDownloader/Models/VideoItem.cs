using YouTubeDownloader.Helpers;

namespace YouTubeDownloader.Models
{
    public class VideoItem : ObservableObject
    {
        private string _status = "Pending";
        private double _progress;
        private string _speed = string.Empty;
        private string _eta = string.Empty;
        private bool _isSelected = true;

        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string FileSize { get; set; } = string.Empty;

        public string Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }

        public double Progress
        {
            get => _progress;
            set => SetProperty(ref _progress, value);
        }

        public string Speed
        {
            get => _speed;
            set => SetProperty(ref _speed, value);
        }

        public string Eta
        {
            get => _eta;
            set => SetProperty(ref _eta, value);
        }

        public bool IsSelected
        {
            get => _isSelected;
            set => SetProperty(ref _isSelected, value);
        }
    }
}

using System.Collections.ObjectModel;
using System.Windows.Input;
using Microsoft.Win32;
using YouTubeDownloader.Helpers;
using YouTubeDownloader.Models;
using YouTubeDownloader.Services;

namespace YouTubeDownloader.ViewModels
{
    public class MainViewModel : ObservableObject
    {
        private string _url = string.Empty;
        private string _status = "Ready";
        private string _downloadFolder;
        private DownloadFormat _selectedFormat;
        private double _overallProgress;
        private bool _isBusy;
        private CancellationTokenSource? _cts;

        public MainViewModel()
        {
            var processService = new ProcessService();
            YtDlpService = new YtDlpService(processService);
            SettingsService = new SettingsService();
            _downloadFolder = SettingsService.GetDownloadFolder();
            Formats = new ObservableCollection<DownloadFormat>(DownloadFormat.GetDefaultFormats());
            _selectedFormat = Formats[0];

            FetchCommand = new RelayCommand(async () => await FetchMetadata(), () => !string.IsNullOrWhiteSpace(Url) && !IsBusy);
            DownloadCommand = new RelayCommand(async () => await DownloadSelected(), () => Videos.Count > 0 && !IsBusy);
            CancelCommand = new RelayCommand(CancelDownload, () => IsBusy);
            BrowseFolderCommand = new RelayCommand(BrowseFolder);
        }

        public IYtDlpService YtDlpService { get; }
        public ISettingsService SettingsService { get; }

        public string Url
        {
            get => _url;
            set => SetProperty(ref _url, value);
        }

        public string Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }

        public string DownloadFolder
        {
            get => _downloadFolder;
            set => SetProperty(ref _downloadFolder, value);
        }

        public double OverallProgress
        {
            get => _overallProgress;
            set => SetProperty(ref _overallProgress, value);
        }

        public bool IsBusy
        {
            get => _isBusy;
            set => SetProperty(ref _isBusy, value);
        }

        public ObservableCollection<VideoItem> Videos { get; } = new();
        public ObservableCollection<DownloadFormat> Formats { get; }

        public DownloadFormat SelectedFormat
        {
            get => _selectedFormat;
            set => SetProperty(ref _selectedFormat, value);
        }

        public ICommand FetchCommand { get; }
        public ICommand DownloadCommand { get; }
        public ICommand CancelCommand { get; }
        public ICommand BrowseFolderCommand { get; }

        private async Task FetchMetadata()
        {
            if (IsBusy) return;
            
            IsBusy = true;
            Status = "Fetching metadata...";
            Videos.Clear();
            OverallProgress = 0;

            try
            {
                var videos = await YtDlpService.FetchMetadataAsync(Url);
                foreach (var video in videos)
                {
                    Videos.Add(video);
                }
                Status = $"Found {Videos.Count} video(s).";
            }
            catch (Exception ex)
            {
                Status = $"Error: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }

        private async Task DownloadSelected()
        {
            var selected = Videos.Where(v => v.IsSelected).ToList();
            if (selected.Count == 0)
            {
                Status = "No videos selected.";
                return;
            }

            IsBusy = true;
            _cts = new CancellationTokenSource();
            Status = "Starting downloads...";
            OverallProgress = 0;

            try
            {
                int completed = 0;
                foreach (var video in selected)
                {
                    if (_cts.IsCancellationRequested) break;
                    
                    await YtDlpService.DownloadAsync(video, SelectedFormat, DownloadFolder, _cts.Token);
                    
                    completed++;
                    OverallProgress = (double)completed / selected.Count * 100;
                }
                Status = _cts.IsCancellationRequested ? "Downloads canceled." : "All downloads complete.";
            }
            catch (Exception ex)
            {
                Status = $"Error during download: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
                _cts = null;
            }
        }

        private void CancelDownload()
        {
            _cts?.Cancel();
            Status = "Canceling...";
        }

        private void BrowseFolder()
        {
            var dialog = new OpenFolderDialog();
            if (dialog.ShowDialog() == true)
            {
                DownloadFolder = dialog.FolderName;
                SettingsService.SetDownloadFolder(DownloadFolder);
            }
        }
    }
}

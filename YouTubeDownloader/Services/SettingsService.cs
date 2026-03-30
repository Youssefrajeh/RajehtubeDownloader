using Microsoft.Win32;
using System.IO;

namespace YouTubeDownloader.Services
{
    public interface ISettingsService
    {
        string GetDownloadFolder();
        void SetDownloadFolder(string path);
        bool IsDarkMode();
    }

    public class SettingsService : ISettingsService
    {
        private string _downloadFolder;

        public SettingsService()
        {
            _downloadFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads");
        }

        public string GetDownloadFolder() => _downloadFolder;

        public void SetDownloadFolder(string path) => _downloadFolder = path;

        public bool IsDarkMode()
        {
            try
            {
                using var key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize");
                var value = key?.GetValue("AppsUseLightTheme");
                return value is int i && i == 0;
            }
            catch
            {
                return true; // Default to dark mode if we can't detect
            }
        }
    }
}

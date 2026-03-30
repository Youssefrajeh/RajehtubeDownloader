using System.Diagnostics;
using System.Text;

namespace YouTubeDownloader.Services
{
    public class ProcessResult
    {
        public int ExitCode { get; set; }
        public string Output { get; set; } = string.Empty;
        public string Error { get; set; } = string.Empty;
    }

    public interface IProcessService
    {
        Task<ProcessResult> RunAsync(string fileName, string arguments, Action<string>? onOutput = null, CancellationToken ct = default);
    }

    public class ProcessService : IProcessService
    {
        public async Task<ProcessResult> RunAsync(string fileName, string arguments, Action<string>? onOutput = null, CancellationToken ct = default)
        {
            var result = new ProcessResult();
            var outputBuilder = new StringBuilder();
            var errorBuilder = new StringBuilder();

            var startInfo = new ProcessStartInfo
            {
                FileName = fileName,
                Arguments = arguments,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true,
                StandardOutputEncoding = Encoding.UTF8,
                StandardErrorEncoding = Encoding.UTF8
            };

            using var process = new Process { StartInfo = startInfo };

            process.OutputDataReceived += (s, e) =>
            {
                if (e.Data != null)
                {
                    outputBuilder.AppendLine(e.Data);
                    onOutput?.Invoke(e.Data);
                }
            };

            process.ErrorDataReceived += (s, e) =>
            {
                if (e.Data != null)
                {
                    errorBuilder.AppendLine(e.Data);
                }
            };

            try
            {
                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                await process.WaitForExitAsync(ct);

                result.ExitCode = process.ExitCode;
                result.Output = outputBuilder.ToString();
                result.Error = errorBuilder.ToString();
            }
            catch (OperationCanceledException)
            {
                if (!process.HasExited)
                {
                    process.Kill(true);
                }
                throw;
            }
            catch (Exception ex)
            {
                result.Error = ex.Message;
                result.ExitCode = -1;
            }

            return result;
        }
    }
}

# 🍪 How to Fix "Bot Detection" & "Too Many Requests"

If you are seeing errors like **"Sign in to confirm you're not a bot"** or **"429: Too Many Requests"** on your deployed site, it's because YouTube is blocking the server's IP address. 

To fix this, you need to provide a `cookies.txt` file from your own browser.

## 🛠️ Step-by-Step Guide

### 1. Install the Extension
Install **Cookie-Editor** (Highly recommended & available):
- **Chrome/Edge**: [Cookie-Editor (Chrome Web Store)](https://chromewebstore.google.com/detail/cookie-editor/hlkennddfgjgacgmbmncjafodkllabdc)
- **Firefox**: [Cookie-Editor (Add-ons)](https://addons.mozilla.org/en-US/firefox/addon/cookie-editor/)

### 2. Export your Cookies
1.  Go to [YouTube.com](https://www.youtube.com).
2.  Click the **Cookie-Editor** icon in your browser toolbar.
3.  Click the **"Export"** button at the bottom.
4.  Select **"Netscape"** (This is critical for yt-dlp).
5.  Pasted the copied content into a new file named **`cookies.txt`**.

### 3. Add to your Project
1.  Move the `cookies.txt` file into the `web/tools/` folder of your project.
2.  Your folder structure should look like this:
    ```text
    web/
    └── tools/
        ├── cookies.txt
        ├── yt-dlp.exe (local only)
        └── ffmpeg.exe (local only)
    ```

### 4. Deploy
1.  Commit and push the `cookies.txt` file to your GitHub repository:
    ```bash
    git add web/tools/cookies.txt
    git commit -m "Add YouTube cookies to bypass bot detection"
    git push origin master
    ```
2.  **Wait for Render to redeploy.** The app will now automatically use your cookies to authenticate requests, making them look like they are coming from a real user!

---
> [!CAUTION]
> **Security Note**: Your `cookies.txt` contains sensitive login information. If your repository is **Public**, anyone can see your cookies. 
> 
> **Recommendation**: If you make your repo public, consider adding `cookies.txt` as a **Render Secret File** instead of committing it to Git. 

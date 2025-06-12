@echo off
echo 🚀 Uploading Vizag News to GitHub...
echo.

echo 📝 Please replace 'yourusername' with your actual GitHub username in the commands below:
echo.

echo git remote add origin https://github.com/yourusername/vizag-news.git
echo git branch -M main
echo git push -u origin main
echo.

echo 💡 After creating the repository on GitHub, run these commands:
echo.

pause

REM Uncomment and modify these lines after creating the GitHub repository:
REM git remote add origin https://github.com/yourusername/vizag-news.git
REM git branch -M main  
REM git push -u origin main

echo.
echo ✅ Repository ready for upload!
echo 📋 Next steps:
echo 1. Create repository on GitHub.com
echo 2. Copy the repository URL
echo 3. Run: git remote add origin [YOUR_REPO_URL]
echo 4. Run: git branch -M main
echo 5. Run: git push -u origin main
echo.
pause

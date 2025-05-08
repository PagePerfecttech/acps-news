@echo off
echo Pushing FlipNews to GitHub...

echo Checking git status...
git status

echo Adding all files...
git add .

echo Committing changes...
git commit -m "Fixed user management and improved RSS feed processing for Telugu feeds"

echo Pushing to GitHub...
git push origin master

echo Done!
pause

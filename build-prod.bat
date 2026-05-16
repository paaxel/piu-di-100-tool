@echo off
echo Building for production with AOT...
call ng build --configuration production --aot
if %ERRORLEVEL% neq 0 (
    echo Build failed with error code %ERRORLEVEL%.
    exit /b %ERRORLEVEL%
)
echo Build completed successfully.
pause
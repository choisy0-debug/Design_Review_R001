@echo off
setlocal

echo [Design Review R001] Building Native Launcher...

:: Find csc.exe in .NET Framework directory
set "CSC_PATH=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"

if not exist "%CSC_PATH%" (
    echo [Error] .NET Framework compiler not found at %CSC_PATH%
    pause
    exit /b 1
)

echo Compiling Launcher.cs to DesignReviewR001.exe...
"%CSC_PATH%" /target:winexe /out:DesignReviewR001.exe Launcher.cs /r:System.Windows.Forms.dll /r:System.dll /r:System.Drawing.dll

if %ERRORLEVEL% equ 0 (
    echo [Success] Build completed successfully.
    echo Created: DesignReviewR001.exe
) else (
    echo [Error] Build failed. Please check the error messages above.
)

pause
endlocal

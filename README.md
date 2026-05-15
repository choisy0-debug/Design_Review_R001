# Design Review R001

Ollama-powered interactive design review system.

## Features
- Cyberpunk Dark UI
- Ollama API Integration
- Model Selection (DeepSeek, etc.)
- Real-time AI Chat & Verification
- **Native EXE Launcher** for Windows

## Setup & Running
1. Ensure Ollama is running on `http://localhost:11434`.
2. Run `DesignReviewR001.exe` to start the application in a dedicated window.
   - Alternatively, open `index.html` in any modern browser.

## Build (Manual)
If you need to recompile the launcher:
`csc.exe /target:winexe /out:DesignReviewR001.exe Launcher.cs /r:System.Windows.Forms.dll /r:System.dll /r:System.Drawing.dll`

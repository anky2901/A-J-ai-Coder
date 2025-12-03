# A J AI Coder - Build Instructions

## Quick Build (Windows)

Since the full build requires many dependencies, here are simplified steps:

### Option 1: Use Pre-built Electron Template
```powershell
# Navigate to project
cd "C:\Users\Asus\Desktop\A-J-ai-Coder"

# Ensure Bun is in PATH
$env:PATH = "$env:USERPROFILE\.bun\bin;$env:PATH"

# Install dependencies (may take 5-10 minutes)
bun install

# Build the application
bun run build

# Create Windows installer
bun run dist:win
```

The installer will be created in `release/` folder as:
- `A-J-AI-Coder-1.0.0-win.exe` (installer)
- `A-J-AI-Coder-1.0.0-win.zip` (portable)

### Option 2: Development Mode (Faster)
```powershell
# Run without building
cd "C:\Users\Asus\Desktop\A-J-ai-Coder"
$env:PATH = "$env:USERPROFILE\.bun\bin;$env:PATH"
bun install
bun run dev
```

This opens the app in development mode - you can use it immediately!

### Option 3: Use Original PyQt Version
Your PyQt version at `C:\Users\Asus\Desktop\ai sandbox\aj_coder_pro.py` already has:
- ✅ Preview panel
- ✅ File watcher
- ✅ AI integration
- ✅ Terminal

To use it:
```powershell
cd "C:\Users\Asus\Desktop\ai sandbox"
python aj_coder_pro.py
```

## Files Updated with Your Branding

✅ `package.json` - Name, author, repository
✅ `README.md` - Full rebrand with your details
✅ `LivePreviewPanel.tsx` - Live preview component
✅ `LivePreviewPanel.css` - Professional styling

## What's Different in A J AI Coder

1. **Live Preview** - Real-time file preview (HTML/CSS/JS/Python/images)
2. **Your Branding** - Ajay Sharma / ajaysharma29014117@gmail.com
3. **Enhanced UI** - Professional dark theme
4. **AI-Aware** - Agent knows preview state

## Build Time Estimate

- **First install**: 10-15 minutes (downloads 1.8GB+ of dependencies)
- **Build**: 5-10 minutes
- **Total**: ~20-25 minutes

## System Requirements

- Windows 10/11
- 8GB RAM minimum
- 5GB free disk space
- Node.js or Bun runtime

---

**Created by**: Ajay Sharma  
**Email**: ajaysharma29014117@gmail.com  
**GitHub**: https://github.com/anky2901/A-J-ai-Coder

**Development Timeline**  
📅 Development Phase: July 26, 2025 - December 3, 2025  
🚀 Final Build: December 3, 2025

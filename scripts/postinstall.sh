#!/usr/bin/env bash
# Postinstall script to handle native module prebuilds
# Bun blocks postinstall scripts by default, so we need to manually trigger them
set -euo pipefail

# Find node-compatible runtime (prefer node, fallback to bun)
if command -v node &> /dev/null; then
  NODE_BIN="node"
elif command -v bun &> /dev/null; then
  NODE_BIN="bun"
elif [ -f "/usr/local/bin/bun" ]; then
  NODE_BIN="/usr/local/bin/bun"
elif [ -f "$HOME/.bun/bin/bun" ]; then
  NODE_BIN="$HOME/.bun/bin/bun"
else
  echo "Error: Neither node nor bun found in PATH"
  exit 1
fi

# Color output for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Running postinstall tasks..."

# Install node-pty prebuilds
# The package has an install script that downloads prebuilt binaries from GitHub
if [ -d "node_modules/@homebridge/node-pty-prebuilt-multiarch" ]; then
  echo -e "${GREEN}Installing node-pty prebuilds...${NC}"
  cd node_modules/@homebridge/node-pty-prebuilt-multiarch
  
  # Run the install script using prebuild-install (downloads prebuilts from GitHub)
  # Check if already installed first
  if [ -f "build/Release/pty.node" ]; then
    echo -e "${GREEN}✓ node-pty prebuild already exists (build/Release/pty.node)${NC}"
  else
    echo -e "${YELLOW}Downloading node-pty prebuilds...${NC}"
    # Run prebuild-install (may crash with bun, but still downloads the binary)
    $NODE_BIN ../../prebuild-install/bin.js --verbose > /tmp/node-pty-install.log 2>&1 || true
    
    # Check if the binary was actually installed
    if [ -f "build/Release/pty.node" ]; then
      echo -e "${GREEN}✓ node-pty prebuilds downloaded successfully${NC}"
    else
      echo -e "${YELLOW}⚠ Failed to install node-pty prebuilds${NC}"
      echo -e "${YELLOW}Terminals may not work in packaged Electron app${NC}"
      echo -e "${YELLOW}To fix manually, run:${NC}"
      echo -e "${YELLOW}  cd node_modules/@homebridge/node-pty-prebuilt-multiarch${NC}"
      echo -e "${YELLOW}  node ../../prebuild-install/bin.js --verbose${NC}"
      # Don't exit 1 - let the build continue, terminals will just be degraded
    fi
  fi
  
  cd ../..
else
  echo -e "${YELLOW}Warning: @homebridge/node-pty-prebuilt-multiarch not found in node_modules${NC}"
  echo -e "${YELLOW}Run 'bun install' first${NC}"
  exit 1
fi

echo -e "${GREEN}Postinstall completed successfully${NC}"

#!/bin/bash

# Icon generation script for Easyvate Car Selling app
# Run this after placing your high-res logo as assets/logo-source.png

set -e

SOURCE_LOGO="assets/logo-source.png"
STORE_DIR="assets/store"

# Check if source logo exists
if [ ! -f "$SOURCE_LOGO" ]; then
    echo "Error: $SOURCE_LOGO not found. Please place your logo there first."
    exit 1
fi

echo "Generating app icons from $SOURCE_LOGO..."

# Create directories
mkdir -p "$STORE_DIR/android"
mkdir -p "$STORE_DIR/ios"
mkdir -p "$STORE_DIR/playstore"

# Android icons (mipmap densities)
# Launcher icons
convert "$SOURCE_LOGO" -resize 48x48 "$STORE_DIR/android/ic_launcher_mdpi.png"
convert "$SOURCE_LOGO" -resize 72x72 "$STORE_DIR/android/ic_launcher_hdpi.png"
convert "$SOURCE_LOGO" -resize 96x96 "$STORE_DIR/android/ic_launcher_xhdpi.png"
convert "$SOURCE_LOGO" -resize 144x144 "$STORE_DIR/android/ic_launcher_xxhdpi.png"
convert "$SOURCE_LOGO" -resize 192x192 "$STORE_DIR/android/ic_launcher_xxxhdpi.png"

# Adaptive icon foreground (remove background if needed)
convert "$SOURCE_LOGO" -resize 432x432 -background transparent "$STORE_DIR/android/ic_launcher_foreground.png"
# Background can be solid color or gradient
convert -size 432x432 xc:"#FFFFFF" "$STORE_DIR/android/ic_launcher_background.png"

# iOS icons
convert "$SOURCE_LOGO" -resize 20x20^ -gravity center -background transparent -extent 20x20 "$STORE_DIR/ios/Icon-App-20x20@1x.png"
convert "$SOURCE_LOGO" -resize 40x40^ -gravity center -background transparent -extent 40x40 "$STORE_DIR/ios/Icon-App-20x20@2x.png"
convert "$SOURCE_LOGO" -resize 60x60^ -gravity center -background transparent -extent 60x60 "$STORE_DIR/ios/Icon-App-20x20@3x.png"
convert "$SOURCE_LOGO" -resize 29x29^ -gravity center -background transparent -extent 29x29 "$STORE_DIR/ios/Icon-App-29x29@1x.png"
convert "$SOURCE_LOGO" -resize 58x58^ -gravity center -background transparent -extent 58x58 "$STORE_DIR/ios/Icon-App-29x29@2x.png"
convert "$SOURCE_LOGO" -resize 87x87^ -gravity center -background transparent -extent 87x87 "$STORE_DIR/ios/Icon-App-29x29@3x.png"
convert "$SOURCE_LOGO" -resize 40x40^ -gravity center -background transparent -extent 40x40 "$STORE_DIR/ios/Icon-App-40x40@1x.png"
convert "$SOURCE_LOGO" -resize 80x80^ -gravity center -background transparent -extent 80x80 "$STORE_DIR/ios/Icon-App-40x40@2x.png"
convert "$SOURCE_LOGO" -resize 120x120^ -gravity center -background transparent -extent 120x120 "$STORE_DIR/ios/Icon-App-40x40@3x.png"
convert "$SOURCE_LOGO" -resize 120x120^ -gravity center -background transparent -extent 120x120 "$STORE_DIR/ios/Icon-App-60x60@2x.png"
convert "$SOURCE_LOGO" -resize 180x180^ -gravity center -background transparent -extent 180x180 "$STORE_DIR/ios/Icon-App-60x60@3x.png"
convert "$SOURCE_LOGO" -resize 76x76^ -gravity center -background transparent -extent 76x76 "$STORE_DIR/ios/Icon-App-76x76@1x.png"
convert "$SOURCE_LOGO" -resize 152x152^ -gravity center -background transparent -extent 152x152 "$STORE_DIR/ios/Icon-App-76x76@2x.png"
convert "$SOURCE_LOGO" -resize 167x167^ -gravity center -background transparent -extent 167x167 "$STORE_DIR/ios/Icon-App-83.5x83.5@2x.png"
convert "$SOURCE_LOGO" -resize 1024x1024^ -gravity center -background transparent -extent 1024x1024 "$STORE_DIR/ios/Icon-App-1024x1024@1x.png"

# Play Store icon (512x512)
convert "$SOURCE_LOGO" -resize 512x512 "$STORE_DIR/playstore/icon.png"

# Feature graphic (1024x500)
convert "$SOURCE_LOGO" -resize 1024x500 -background "#FFFFFF" -gravity center -extent 1024x500 "$STORE_DIR/playstore/feature-graphic.png"

echo "Icons generated successfully in $STORE_DIR/"
echo "Next steps:"
echo "1. Copy Android icons to android/app/src/main/res/mipmap-*/"
echo "2. Copy iOS icons to ios/Easyvate_Car_Selling/Images.xcassets/AppIcon.appiconset/"
echo "3. Use playstore/icon.png for Play Store listing"
echo "4. For screenshots, run: npx react-native run-android and take screenshots manually"
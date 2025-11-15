#!/bin/bash

# Get the directory from command line argument
directory="$1"

# Check if directory argument was provided
if [[ -z "$directory" ]]; then
    echo "No directory provided. Please provide a directory."
    exit 1
fi

# Check if provided directory exists
if [[ ! -d "$directory" ]]; then
    echo "The provided directory does not exist."
    exit 1
fi

find "$directory" -type f \( -name "*.png" -o -name "*.jpeg" -o -name "*.bmp" -o -name "*.gif" -o -name "*.tiff" -o -name "*.webp" \) -print0 | while IFS= read -r -d '' file; do
    convert "$file" -resize 1200x -quality 100 "${file%.*}.jpg" && rm "$file"
done

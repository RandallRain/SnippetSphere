#!/bin/bash
#-------------------------------------------------------------------
# @file split_archieve.sh
# @brief Split and archive large files into smaller chunks.
# Note: It will make the original large files intact, so make sure
# you have enough disk space.
# @date 2025/07/23
# @author LHT
#-------------------------------------------------------------------

#-------------------------------------------------------------------
# Configuration.
#-------------------------------------------------------------------
# The source directory.
src_dir="/home/lht/UbuntuRepo/mirror/mirrors.aliyun.com/ubuntu/archive_test/dists"
# The destination directory.
dest_dir="/home/lht/UbuntuRepo/mirror/mirrors.aliyun.com/ubuntu/archive_test/split"
# The chunk basename.
chunk_basename="dists_archive"
# The chunk size.
chunk_size="600MB"

#-------------------------------------------------------------------
# Do the work.
#-------------------------------------------------------------------
echo "Starting to split and archive files."
echo "-- Source directory: $src_dir"
echo "-- Destination directory: $dest_dir"
echo "-- Chunk basename: $chunk_basename"
echo "-- Chunk size: $chunk_size"

# Create the destination directory.
mkdir -p "$dest_dir"
# Enter the directory containing the source directory, 
# so tar stores a clean relative path.
cd "$(dirname "$src_dir")"
# tar the source to stdout, then split it into chunks.
# tar keeps permissions, timestamps, symlinks and so on.
# -f -: Write to the standard output.
# -b <size>: Split the input streams into multiple files, each of size up to <size>.
# -d: Use numeric suffixes.
# -(after -d): Tell split to read from standard input.
tar -cf - "$(basename "$src_dir")" \
    | split -b "$chunk_size" -d - "$dest_dir/$chunk_basename.tar.part-"

# Print the result.
echo "Finished creating split archives for $src_dir."
echo "Split archives created in $dest_dir with basename $chunk_basename.tar.part-"
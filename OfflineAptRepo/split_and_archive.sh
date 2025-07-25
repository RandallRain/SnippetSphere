#!/bin/bash
#-------------------------------------------------------------------
# @file split_archieve.sh
# @brief Split and archive large files into smaller chunks.
# Note: It will make the original large files intact, so make sure
# you have enough disk space. To
# @date 2025/07/23
# @author LHT
# @note It will make the original large files intact, so make sure
# you have enough disk space. To extract and join these parts, run
# cat <chunk_basename>.tar.part-* | sudo tar -xvf - -C <dest_dir>.
#-------------------------------------------------------------------

#-------------------------------------------------------------------
# Configuration.
#-------------------------------------------------------------------
# The source directory.
src_dir="/home/lht/UbuntuRepo/mirror/mirrors.aliyun.com/ubuntu"
# The destination directory.
dest_dir="/media/lht/YFB-TGYY-group1/local-ubuntu"
# The chunk basename.
chunk_basename="jammy-ubuntu"
# The chunk size.
chunk_size="50GB"

#-------------------------------------------------------------------
# Do the work.
#-------------------------------------------------------------------
echo "Starting to split and archive files."
echo "-- Source directory: $src_dir"
echo "-- Destination directory: $dest_dir"
# Total size of the source directory.
total_size=$(du -sb "$src_dir" | awk '{print $1}')
echo "-- Total size: $total_size bytes"
echo "-- Chunk basename: $chunk_basename"
echo "-- Chunk size: $chunk_size"
echo ""

# Create the destination directory.
mkdir -p "$dest_dir"
# Enter the directory containing the source directory, 
# so tar stores a clean relative path.
cd "$(dirname "$src_dir")"
# tar the source to stdout, then split it into chunks.
# tar keeps permissions, timestamps, symlinks and so on.
# -f -: Write to the standard output.
# pv: Pipe Viewer, to show progress.
# -b: Show the progress bar.
# -a: Show the average speed.
# -r: Show the current rate of transfer.
# -t: Show the estimated time of completion.
# -p: Show the progress bar.
# -e: Show the elapsed time.
# -s <size>: Set the total size of the input stream, so pv can calculate.
# split: split the input stream into multiple files.
# -b <size>: Split the input streams into multiple files, each of size up to <size>.
# -d: Use numeric suffixes.
# -(after -d): Tell split to read from standard input.
tar -cf - "$(basename "$src_dir")" \
    | pv -bartpe -s "$total_size" \
    | split -b "$chunk_size" -d - "$dest_dir/$chunk_basename.tar.part-"

# Print the result.
echo ""
echo "Finished creating split archives for $src_dir."
echo "Split archives created in $dest_dir with basename $chunk_basename.tar.part-"
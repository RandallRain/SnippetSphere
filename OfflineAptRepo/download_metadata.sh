#!/bin/bash
#-------------------------------------------------------------------
# @file download_metadata.sh
# @brief Download the Ubuntu apt metadata, corresponding to 'dist'
# folder in the mirror.
# @date 2024-07-01
# @author LHT
# @TODO: Multi-threaded download ?
#-------------------------------------------------------------------

#-------------------------------------------------------------------
# Configuration variables.
#-------------------------------------------------------------------
# The mirror URL for wget.
# Official site: https://archive.ubuntu.com/ubuntu
# Aliyun site: https://mirrors.aliyun.com/ubuntu
wget_mirror_url="https://mirrors.aliyun.com/ubuntu"

# The mirror URL for rsync.
# Official site: rsync://archive.ubuntu.com/ubuntu.
# USTC site: rsync://rsync.mirrors.ustc.edu.cn/ubuntu
rsync_mirror_url="rsync://rsync.mirrors.ustc.edu.cn/ubuntu"

# The Ubuntu version codename, jammy for Ubuntu 22.04.
ubuntu_name="jammy"

# Ubuntu suites, excluding pre-release sources name-proposed.
#ubuntu_suites="$ubuntu_name"
ubuntu_suites="${ubuntu_name} ${ubuntu_name}-updates ${ubuntu_name}-backports \
    ${ubuntu_name}-security"

# Ubuntu components.
# ubuntu_components="main"
ubuntu_components="main restricted universe multiverse"

# Platform architecture.
arch="amd64"

# the base Local path to store metadata.
local_path="./UbuntuMetaData"

# Default to use rsync to download metadata, or use wget.
use_rsync=true

#-------------------------------------------------------------------
# Function definitions.
#-------------------------------------------------------------------
# the global array for storing failed downloads.
declare -a failed_downloads

#-------------------------------------------------------------------
# Check if a remote file or folder exists using rsync.
# Usage: rsync_remote_exists <source>
#   <source>: The source URL of the file or folder to check.
#-------------------------------------------------------------------
rsync_remote_exists() {
    local source="$1"
    rsync --dry-run "$source" &> /dev/null
    return $?
}

#-------------------------------------------------------------------
# Use Wget to download a file from a URL.
# Usage: wget_file <url> <dest>
#   <url>: The URL of the file to download.
#   <dest>: The destination path to save the file.
#-------------------------------------------------------------------
wget_file() {
    local url="$1"
    local dest="$2"
    local wget_exit_code

    mkdir -p "$dest"
    echo "Downloading file: from $url to $dest."
    
    # Download the file using Wget.
    # -q: quiet mode.
    # --show-progress: display the progress bar.
    # -P: specify the destination directory.
    wget -q --show-progress -P "$dest" "$url"
    wget_exit_code=$?

    if [ $wget_exit_code -ne 0 ]; then
        # Error occured.
        echo "Error: Failed to download $url to $dest."
        echo "Wget exit code: $wget_exit_code."
        failed_downloads+=("Failed to download $url to $dest, Wget exit code: $wget_exit_code.")
    else
        echo "Downloaded file: $url to $dest"
    fi
}

#-------------------------------------------------------------------
# Use Wget to download a folder from a URL.
# Usage: wget_folder <url> <dest>
#   <url>: The URL of the folder to download. MUST end with a slash,
#          Or it will downloal the parent folder contents, even with
#          a -np option.   
#   <dest>: The destination path to save the folder.
#   <cut_dirs>: The number of directories to cut from the URL.
#-------------------------------------------------------------------
wget_folder() {
    local url="$1"
    local dest="$2"
    local cut_dirs="$3"
    local wget_exit_code

    mkdir -p "$dest"
    echo "Downloading folder: from $url to $dest."

    # Download the folder using Wget.
    # -r: recursive mode.
    # -np: Do not ascend to the parent directory when retrieving recursively.
    # -nH: Disable generation of host-prefixed directories.
    # --cut-dirs: Ignore N directory components from the URL.
    # -R: reject files matching the "index.html*" pattern.
    # -e robots=off: Ignore robots.txt file, allowing the download even if the site has
    # restrictions for crawlers.
    # -P: specify the destination directory.
    wget -r -np -nH --cut-dirs=$cut_dirs -R index.html* -e robots=off -P "$dest" "$url"
    wget_exit_code=$?

    if [ $wget_exit_code -ne 0 ]; then
        # Error occured.
        echo "Error: Failed to download $url to $dest."
        echo "Wget exit code: $wget_exit_code."
        failed_downloads+=("Failed to download $url to $dest, Wget exit code: $wget_exit_code.")
    else
        echo "Downloaded folder: $url to $dest"
    fi
}


#-------------------------------------------------------------------
# Use rsync to download a file or folder from a URL.
# Usage: rsync_download <source> <dest>
#   <source>: The source URL of the file or folder to download.
#             When downloading a folder, <source> with a trailing slash
#             means to download the folder contents, not the folder itself.
#             <source> without a trailing slash means to download the folder
#             and its contents.
#   <dest>: The destination path to save the file or folder.
#-------------------------------------------------------------------
rsync_download() {
    local source="$1"
    local dest="$2"
    local rsync_exit_code

    # Only download the file or folder when it exists.
    if rsync_remote_exists "$source"; then
        mkdir -p "$dest"
        echo "Downloading a file or folder: from $source to $dest."

        # Download the file or folder using rsync.
        # -a: archive mode, synchronize directories recursively and preserves symbolic links, 
        # file permissions, user and group ownerships, and timestamps.
        # -v: verbose mode.
        # -z: compress file data during the transfer.
        # --delete: delete extraneous files from the destination directory.
        # --progress: show progress during transfer.
        rsync -avz --delete --progress "$source" "$dest"
        rsync_exit_code=$?

        if [ $rsync_exit_code -ne 0 ]; then
            # Error occured.
            echo "Error: Failed to download $source to $dest."
            echo "Rsync exit code: $rsync_exit_code."
            failed_downloads+=("Failed to download $source to $dest, Rsync exit code: $rsync_exit_code.")
        else
            echo "Downloaded file or folder: $source to $dest"
        fi
    fi
}

#-------------------------------------------------------------------
# Main script body.
#-------------------------------------------------------------------
# Redirect both standard output(stdout) and standard error(stderr) to the console and a log file.
log_file="download_metadata.log"
exec &> >(tee -a "$log_file")

echo "Starting metadata download for Ubuntu $ubuntu_name (${arch})."

# Loop ubuntu suites.
for suite in $ubuntu_suites; do
    echo "Processing suite: $suite"

    # Download suite-level metadata.
    if [ "$use_rsync" = true ]; then
        # Download metadata using rsync.
        echo "Downloading ${suite} metadata using rsync."
        rsync_download "${rsync_mirror_url}/dists/${suite}/InRelease" \
            "${local_path}/dists/${suite}"
        rsync_download "${rsync_mirror_url}/dists/${suite}/Release" \
            "${local_path}/dists/${suite}"
        rsync_download "${rsync_mirror_url}/dists/${suite}/Release.gpg" \
            "${local_path}/dists/${suite}"
        rsync_download "${rsync_mirror_url}/dists/${suite}/Contents-${arch}.gz" \
            "${local_path}/dists/${suite}"
    else
        # Download metadata using wget.
        echo "Downloading ${suite} metadata using wget."
        wget_file "${wget_mirror_url}/dists/${suite}/InRelease" \
            "${local_path}/dists/${suite}"
        wget_file "${wget_mirror_url}/dists/${suite}/Release" \
            "${local_path}/dists/${suite}"
        wget_file "${wget_mirror_url}/dists/${suite}/Release.gpg" \
            "${local_path}/dists/${suite}"
        wget_file "${wget_mirror_url}/dists/${suite}/Contents-${arch}.gz" \
            "${local_path}/dists/${suite}"
    fi

    # Download component-level metadata.
    for component in $ubuntu_components; do
        echo "  Processing component: $component"

        if [ "$use_rsync" = true ]; then
            # Download metadata using rsync.
            echo "  Downloading ${suite}/${component} metadata using rsync."
            rsync_download "${rsync_mirror_url}/dists/${suite}/${component}/binary-${arch}" \
                "${local_path}/dists/${suite}/${component}"
            rsync_download "${rsync_mirror_url}/dists/${suite}/${component}/cnf" \
                "${local_path}/dists/${suite}/${component}"
            rsync_download "${rsync_mirror_url}/dists/${suite}/${component}/dep11" \
                "${local_path}/dists/${suite}/${component}"
            rsync_download "${rsync_mirror_url}/dists/${suite}/${component}/i18n" \
                "${local_path}/dists/${suite}/${component}"
        else
            # Download metadata using wget.
            echo "Downloading ${suite}/${component} metadata using wget."
            wget_folder "${wget_mirror_url}/dists/${suite}/${component}/binary-${arch}/" \
                "${local_path}/dists/${suite}/${component}" 4
            wget_folder "${wget_mirror_url}/dists/${suite}/${component}/cnf/" \
                "${local_path}/dists/${suite}/${component}" 4
            wget_folder "${wget_mirror_url}/dists/${suite}/${component}/dep11/" \
                "${local_path}/dists/${suite}/${component}" 4
            wget_folder "${wget_mirror_url}/dists/${suite}/${component}/i18n/" \
                "${local_path}/dists/${suite}/${component}" 4
        fi
    done
done

# Summrize the download results.
echo ""
echo "---------------------------Download summary---------------------------"
if [ ${#failed_downloads[@]} -eq 0 ]; then
    echo "All metadata downloads completed successfully."
    echo "Ubuntu OS: $ubuntu_name, $arch"
    echo "Ubuntu suites: $ubuntu_suites"
    echo "Ubuntu components: $ubuntu_components"
    echo "All metadata are stored in: $local_path"
else
    echo "Some metadata downloads failed."
    echo "Ubuntu OS: $ubuntu_name, $arch"
    echo "Ubuntu suites: $ubuntu_suites"
    echo "Ubuntu components: $ubuntu_components"
    echo "All metadata are stored in: $local_path"
    echo "Failed downloads:"
    for failed_download in "${failed_downloads[@]}"; do
        echo "  $failed_download"
    done
fi
echo "---------------------------------------------------------------------"
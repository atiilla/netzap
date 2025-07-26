#!/bin/bash

# Find the zmap binary dynamically
ZMAP_PATH=$(command -v zmap)

# Check if zmap is installed
if [[ -z "$ZMAP_PATH" ]]; then
    echo "Error: zmap is not installed or not in PATH."
    exit 1
fi

echo "Found zmap at: $ZMAP_PATH"

# In Docker with NET_RAW capability already granted to container
# we don't need to setcap, but we'll still check
if [[ -z "$DOCKER_ENV" ]]; then
    # Grant CAP_NET_RAW permission to zmap (for non-Docker environments)
    echo "Granting CAP_NET_RAW capability..."
    sudo setcap cap_net_raw+ep "$ZMAP_PATH"

    # Verify if the capability was set
    if getcap "$ZMAP_PATH" | grep -q "cap_net_raw"; then
        echo "Success: You can now run zmap without sudo!"
    else
        echo "Failed to set capability. Trying sudoers method..."
        
        # Add user to sudoers for zmap execution
        SUDOERS_LINE="$USER ALL=(ALL) NOPASSWD: $ZMAP_PATH"
        if ! sudo grep -q "$SUDOERS_LINE" /etc/sudoers; then
            echo "$SUDOERS_LINE" | sudo tee -a /etc/sudoers > /dev/null
            echo "Added zmap to sudoers. Try running: sudo zmap <args>"
        else
            echo "zmap is already in sudoers."
        fi
    fi
else
    echo "Running in Docker environment with NET_RAW capability. No additional setup needed."
fi

# Export environment variable to indicate zmap is ready
export ZMAP_READY=true
echo "zmap setup completed successfully."

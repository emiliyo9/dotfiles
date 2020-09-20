#!/bin/bash

# Extras:
	# add new rules to udev: KERNEL=="card1", SUBSYSTEM=="drm", ACTION=="change", ENV{DISPLAY}=":0", ENV{XAUTHORITY}="/home/emile/.Xauthority", RUN+="/home/emile/.config/i3/scripts/disp-auto.sh"
	# sudo udevadm control --reload-rules

# Check if optimus manager is in nvidia mode
# stop program if not in nvidia mode
optimus_status=$(optimus-manager --status | grep "Current" | grep -o "[^\ ]*$")
notify-send "running screen correction"
if [ "$optimus_status" = "nvidia" ]; then

    # Find out the device path to our graphics card:
    cardPath=/sys/$(udevadm info -q path -n /dev/dri/card0)
    
    # Detect if the monitor is connected and, if so, the monitor's ID:
    conHdmi=$(xrandr | sed -n '/HDMI-0 connected/p')
    shaHdmi=$(sha1sum $cardPath/card0-HDMI-A-1/edid | cut -f1 -d " ")
    shaHdmiUltrawide="da39a3ee5e6b4b0d3255bfef95601890afd80709"
    
    # The useful part: check what the connection status is, and run some other commands
    if [ -n "$conHdmi" ]; then
	if [ "$shaHdmi" = "$shaHdmiUltrawide" ]; then    # ultrawide monitor
    	xrandr --output eDP-1-1 --auto --output HDMI-0 --auto --left-of eDP-1-1
	/home/emile/.config/i3/scripts/screentear.sh
	# Normally different then projector part. Audio settings should change to
    	#pactl set-card-profile 0 output:hdmi-stereo+input:analog-stereo
    
        else                                            # Probably a projector
    	xrandr --output eDP-1-1 --auto --output HDMI-0 --auto --same-as eDP-1-1
        fi
    else
        xrandr --output eDP-1-1 --auto --output HDMI-0 --off
        pactl set-card-profile 0 output:analog-stereo+input:analog-stereo
    fi
fi

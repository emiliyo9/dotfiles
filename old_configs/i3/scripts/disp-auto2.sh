#!/bin/bash

# Find out the device path to our graphics card:
cardPath=/sys/$(udevadm info -q path -n /dev/dri/card0)

# Detect if the monitor is connected and, if so, the monitor's ID:
conHdmi=$(xrandr | sed -n '/HDMI1 connected/p')
shaHdmi=$(sha1sum $cardPath/card0-HDMI-A-1/edid | cut -f1 -d " ")

# The useful part: check what the connection status is, and run some other commands
if [ -n "$conHdmi" ]; then
    if [ "$shaHdmi" = "cbc92b892979d1dbdeeaff53ceda7cffbd6c8d96" ]; then    # Office PC
	xrandr --output LVDS1 --auto --output HDMI1 --auto --right-of LVDS1
	pactl set-card-profile 0 output:hdmi-stereo+input:analog-stereo

    else                                            # Probably a projector
	xrandr --output LDVS1 --auto --output HDMI1 --auto --same-as LVDS1
    fi
else
    xrandr --output LDVS1 --auto --output HDMI1 --off
    pactl set-card-profile 0 output:analog-stereo+input:analog-stereo
fi

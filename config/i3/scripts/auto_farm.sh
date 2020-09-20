#!/bin/bash

file=/tmp/autoclick.txt

if [ ! -r $file ]; then
	$(echo 'false' > $file)
fi

if [[ $(cat $file) = 'false' ]]; then
	xdotool mousedown --window  $(xwininfo -name "Minecraft* 1.15.2 - Multiplayer (3rd-party)" | grep "Window id: " | sed "s/.*Window id: \(0x[a-z0-9]*\) .*/\1/g") 3
	$(echo 'true' > $file)
else
	xdotool mouseup --window  $(xwininfo -name "Minecraft* 1.15.2 - Multiplayer (3rd-party)" | grep "Window id: " | sed "s/.*Window id: \(0x[a-z0-9]*\) .*/\1/g") 3
	$(echo 'false' > $file)
fi

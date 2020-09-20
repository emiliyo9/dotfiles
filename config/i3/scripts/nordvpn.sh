#!/bin/bash

status=$(nordvpn status | grep "Status" | grep -o "[^\ ]*$")

while getopts "sa" opt; do
	case ${opt} in
	s )
		echo $status
		;;
	a )
		if [ $status = "Connected" ]
		then
			nordvpn d
		else
			nordvpn c P2P
		fi
		;;
	esac
done




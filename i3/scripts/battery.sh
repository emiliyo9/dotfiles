#!/bin/bash
instance=0

perc=$( upower -i /org/freedesktop/UPower/devices/battery_BAT1 |
 grep 'percentage' | grep -o '[0-9]*' )
state=$( upower -i /org/freedesktop/UPower/devices/battery_BAT1 | 
 grep '^\s*state:' | grep -oE '(dis)?charging' )

if [ $perc -le 20 ]
then
    if [ $state == 'charging' ]
    then
        echo "${perc}%"
    else
        echo "<span color='red'>${perc}%</span>"
    fi
else
    echo "${perc}%"
fi


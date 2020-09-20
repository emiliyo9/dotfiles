#!/bin/bash
instance=0

if [ $BLOCK_BUTTON -eq 1 ]
then
    $(arandr &)
fi

perc=$( acpi | grep "Battery 0" | grep -o "[0-9]*%" | grep -o "[0-9]*")
state=$( acpi | grep "Battery 0" | grep -oE '(dis)?charging' )

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


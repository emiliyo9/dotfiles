#!/bin/bash

id=$(xinput --list | grep "ALPS" | grep -o "=[0-9]*" | grep -o "[0-9]*")

$(xinput --set-prop $id "Synaptics Two-Finger Scrolling" 1 1)
$(xinput --set-prop $id "Synaptics Scrolling Distance" -26 -26)

#!/bin/bash

percentage=$(amixer get Master | egrep -o "\[[0-9]*\%\]" | egrep -o "[0-9]*\%")

echo $percentage

#!/bin/bash
instance=0

if [ "$BLOCK_BUTTON" = "1" ]
then
	$(python /home/emile/.config/i3/scripts/average.py -p)
fi

python /home/emile/.config/i3/scripts/average.py -a


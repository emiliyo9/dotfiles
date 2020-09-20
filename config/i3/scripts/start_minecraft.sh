#!/bin/bash

nvidia='false'

while getopts 'in' flag; do
  case "${flag}" in
    i) nvidia='false' ;;
    n) nvidia='true' ;;
  esac
done

$(echo $nvidia)

if [[ $nvidia = 'false' ]]; then
	$(minecraft-launcher)
else
	$(__NV_PRIME_RENDER_OFFLOAD=1 __GLX_VENDOR_LIBRARY_NAME=nvidia minecraft-launcher)
fi

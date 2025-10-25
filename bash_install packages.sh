#!/usr/bin/bash
filename="$1"
while read -r line; do
    #name="$line"
	eval "$line"
done < "$filename"

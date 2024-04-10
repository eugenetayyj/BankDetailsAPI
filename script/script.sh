#!/bin/bash

url=$1
csvFile=$2

while IFS=, read -r bankCode bankName
do
  # Removes new line characters, carriage return characters, quotes and Byte Order Mark (BOM)
  bankCode=$(echo $bankCode | sed 's/^\xEF\xBB\xBF//')
  bankName=$(echo $bankName | sed 's/^\xEF\xBB\xBF//')

jsonData='{
    "instNum": "'"$bankCode"'",
    "instName": "'"$bankName"'"
  }'
  curl -X POST -H "Content-Type: application/json" -d "$jsonData" $url

done < $csvFile
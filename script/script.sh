#!/bin/bash

url=$1
csvFile=$2
dos2unix $csvFile
# Read the headers from the first line of the CSV
IFS=, read -r firstHeader secondHeader < $csvFile

# Determine which column is the bankCode and which is the bankName
if [[ $firstHeader == "bankCode" ]]; then
  bankCodeIndex=1
  bankNameIndex=2
elif [[ $firstHeader == "bankName" ]]; then
  bankCodeIndex=2
  bankNameIndex=1
else
  echo "Invalid CSV format"
  exit 1
fi

# Read the rest of the CSV file line by line
while IFS=, read -r field1 field2
do
  # Assign the fields to the correct variables based on the headers
  if [[ $bankCodeIndex -eq 1 ]]; then
    bankCode=$(echo $field1 | sed 's/^\xEF\xBB\xBF//')
    bankName=$(echo $field2 | sed 's/^\xEF\xBB\xBF//')
  else
    bankCode=$(echo $field2 | sed 's/^\xEF\xBB\xBF//')
    bankName=$(echo $field1 | sed 's/^\xEF\xBB\xBF//')
  fi

  jsonData='{
    "instNum": "'"$bankCode"'",
    "instName": "'"$bankName"'"
  }'
  curl -X POST -H "Content-Type: application/json" -d "$jsonData" $url
  sleep 0.5

done < <(tail -n +2 $csvFile)
# Bash Script for Database Population

This Bash script is used to populate a database by making POST requests to a specified URL. It provides an alternative to using the batchPost endpoint.

## Usage

The script requires two arguments when being called from the command line:

1. The URL to which the POST requests should be made.
2. The path to a .csv file that contains the data to be posted.

The .csv file should be in the same directory as the script and should have a specific format. It should contain two columns: `bankName` and `bankCode`.

### Example

```bash
./script.sh http://example.com/post-endpoint data.csv
```
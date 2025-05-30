#!/bin/bash
# Load CdkStack dict from output.json into environment variables

json_file="/workspaces/amazon-nova-robotics/cdk/output.json"

if ! command -v jq &> /dev/null; then
  echo "Error: jq is not installed. Please install jq to use this script."
  exit 1
fi

export_cmds=$(jq -r '.CdkStack | to_entries[] | "export " + .key + "=\"" + (.value|tostring) + "\"" ' "$json_file")

eval "$export_cmds"
echo "CdkStack environment variables loaded."

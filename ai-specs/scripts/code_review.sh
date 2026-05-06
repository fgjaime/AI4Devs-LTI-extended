#!/bin/bash
# code_review.sh - Basic code review script

echo "Starting code review..."

agent -p --force --output-format text \
  "Review the recent code changes and provide feedback on:
  - Code quality and readability
  - Possible bugs or issues
  - Security considerations
  - Best-practices compliance

  Provide specific improvement suggestions and write them to review.txt"

if [ $? -eq 0 ]; then
  echo "Code review completed successfully"
else
  echo "Code review failed"
  exit 1
fi

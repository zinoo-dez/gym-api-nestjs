#!/bin/bash

# Script to analyze ESLint output and verify error vs warning distribution
echo "🔍 Running ESLint analysis..."
echo "========================================"

# Run lint and capture full output
OUTPUT=$(npm run lint 2>&1)
EXITCODE=$?

echo "$OUTPUT"
echo ""
echo "========================================"

# Extract summary line
SUMMARY=$(echo "$OUTPUT" | grep -E "✖ [0-9]+ problems" | tail -1)

if [ -n "$SUMMARY" ]; then
    echo "📊 FINAL SUMMARY: $SUMMARY"

    # Extract error and warning counts
    ERRORS=$(echo "$SUMMARY" | sed -n 's/.*(\([0-9]\+\) errors.*/\1/p')
    WARNINGS=$(echo "$SUMMARY" | sed -n 's/.*, \([0-9]\+\) warnings.*/\1/p')

    if [ -n "$ERRORS" ]; then
        echo "❌ Errors: $ERRORS"
    else
        echo "✅ Errors: 0"
    fi

    if [ -n "$WARNINGS" ]; then
        echo "⚠️  Warnings: $WARNINGS"
    else
        echo "⚠️  Warnings: 0"
    fi
else
    echo "❓ No ESLint summary found in output"
fi

echo ""
if [ $EXITCODE -eq 0 ]; then
    echo "🎉 ESLint passed! No errors found."
    exit 0
else
    echo "💥 ESLint failed with exit code $EXITCODE"
    exit $EXITCODE
fi

#!/bin/bash
# Demonstration of piping features in Penguin OS Terminal

echo "=== Piping Demonstration ==="
echo ""

# Create some test data
echo "Creating test data..."
echo "apple
banana
cherry
date
elderberry
fig
grape
honeydew
kiwi
lemon" > fruits.txt

echo "orange
red
blue
green
yellow
purple
pink
brown
black
white" > colors.txt

echo "Test data created!"
echo ""

echo "1. Basic piping - List and count files:"
echo "Command: ls | wc -l"
ls | wc -l
echo ""

echo "2. Grep with piping - Find fruits starting with 'a':"
echo "Command: cat fruits.txt | grep '^a'"
cat fruits.txt | grep '^a'
echo ""

echo "3. Sort and unique - Sort colors:"
echo "Command: cat colors.txt | sort"
cat colors.txt | sort
echo ""

echo "4. Head and tail - First 5 fruits:"
echo "Command: cat fruits.txt | head 5"
cat fruits.txt | head 5
echo ""

echo "5. Complex piping - Sort fruits and get first 3:"
echo "Command: cat fruits.txt | sort | head 3"
cat fruits.txt | sort | head 3
echo ""

echo "6. Word count - Count words in fruits.txt:"
echo "Command: cat fruits.txt | wc -w"
cat fruits.txt | wc -w
echo ""

echo "Demonstration complete!"
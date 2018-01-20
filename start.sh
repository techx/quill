function pause(){
   read -p "Press [Enter] key to continue..."
}


function find_screen {
    if screen -ls "$1" | grep -o "^\s*[0-9]*\.$1[ "$'\t'"](" --color=NEVER -m 1 | grep -oh "[0-9]*\.$1" --color=NEVER -m 1 -q >/dev/null; then
        screen -ls "$1" | grep -o "^\s*[0-9]*\.$1[ "$'\t'"](" --color=NEVER -m 1 | grep -oh "[0-9]*\.$1" --color=NEVER -m 1 2>/dev/null
        return 0
    else
        echo "$1"
        return 1
    fi
}

RED='\033[41m'
NC='\033[0m' # No Color

echo "Dale's script is starting... (it was fun to code :D)"
echo
echo "	After you press [Enter], mongod will start."
echo "	IMPORTANT: Once successfully running, detach the screen"
echo "           by holding down these keys in the following order:"
echo
echo "		[Ctrl] [A] [D]"
echo
echo "	Otherwise the script will not continue!"
echo "	Do not proceed unless you understand what you are doing!"
echo "	If you need to abort this script, hold: [Ctrl] [C]"
echo
cowsay "Don't mess it up!" | sed 's/^/  /' |  sed 's/^/  /' |  sed 's/^/  /'
echo
echo
pause

echo
echo "############################################################################"
echo

echo
if find_screen "mongod" >/dev/null; then
    printf "	${RED}Error${NC}: mongod is currently running!\n"
    echo 
    echo "		After exiting this script, you can reattach it by typing:"
    echo
    echo "			screen -r mongod"
    echo
    echo "		If you need to kill it, reattach and then [Ctrl] [C]"
else
    echo "	Starting mongod:"
    screen -mS mongod mongod --dbpath db --bind_ip 127.0.0.1 --nohttpinterface
fi
echo
echo
echo "	Next, we must start gulp"
echo "	Just as before, after successfully starting it, hold down:"
echo
echo "		[Ctrl] [A] [D]"
echo
echo
pause

echo
echo
echo "############################################################################"
echo

echo
if find_screen "gulp" >/dev/null; then
    printf "	${RED}Error${NC}: gulp is currently running!\n"
    echo
    echo "		After exiting this script, you can reattach it by typing:"
    echo
    echo "			 screen -r gulp"
    echo
    echo "		If you need to kill it, reattach and then [Ctrl] [C]"
else
    echo
    echo "	Starting gulp:"
    screen -mS gulp gulp server
fi
echo
echo

echo "	Script finished."
echo
echo "	To reattach to either program, run the following command:"
echo
echo "		screen -r name"
echo
echo "	In this case, name is either mongod or gulp"
echo
echo "	Now, returning you to your shell..."
cowsay "... hope you didn't mess it up."  | sed 's/^/  /' |  sed 's/^/  /' |  sed 's/^/  /'
echo

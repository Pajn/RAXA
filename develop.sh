#!/bin/bash

byobu-tmux -L raxa has-session -t raxa
if [ $? != 0 ]; then
  byobu-tmux -L raxa new-session -d -s raxa
  byobu-tmux -L raxa new-window -t raxa -c packages/raxa -n "server "
  byobu-tmux -L raxa send-keys -t raxa "yarn start" C-m
  # byobu-tmux -L raxa new-window -t raxa -c ui -n "ui "
  # byobu-tmux -L raxa send-keys -t raxa "npm run start" C-m
  byobu-tmux -L raxa new-window -t raxa -c packages/common -n "common "
  byobu-tmux -L raxa send-keys -t raxa "yarn watch" C-m
  byobu-tmux -L raxa new-window -t raxa -c packages/plugin-mysensors -n "plugin-mysensors "
  byobu-tmux -L raxa send-keys -t raxa "yarn watch" C-m
fi
byobu-tmux -L raxa attach -t raxa

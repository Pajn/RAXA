#!/bin/bash

byobu-tmux -L raxa has-session -t raxa
if [ $? != 0 ]; then
  byobu-tmux -L raxa new-session -d -s raxa
  byobu-tmux -L raxa new-window -t raxa -c packages/raxa -n "server "
  byobu-tmux -L raxa send-keys -t raxa "yarn start" C-m
  byobu-tmux -L raxa new-window -t raxa -c packages/web -n "web "
  byobu-tmux -L raxa send-keys -t raxa "yarn start" C-m
  byobu-tmux -L raxa new-window -t raxa -c packages/common -n "common "
  byobu-tmux -L raxa send-keys -t raxa "yarn watch" C-m
  byobu-tmux -L raxa new-window -t raxa -c packages/plugin-mysensors -n "plugin-mysensors "
  byobu-tmux -L raxa send-keys -t raxa "yarn watch" C-m
  byobu-tmux -L raxa new-window -t raxa -c packages/plugin-scenery -n "plugin-scenery "
  byobu-tmux -L raxa send-keys -t raxa "yarn watch" C-m
  byobu-tmux -L raxa new-window -t raxa -c packages/plugin-ledstrip -n "plugin-ledstrip "
  byobu-tmux -L raxa send-keys -t raxa "yarn watch" C-m
  byobu-tmux -L raxa new-window -t raxa -c packages/plugin-raxa-tellsticknet -n "plugin-raxa-tellsticknet "
  byobu-tmux -L raxa send-keys -t raxa "yarn watch" C-m
  byobu-tmux -L raxa new-window -t raxa -c packages/plugin-nexa -n "plugin-nexa "
  byobu-tmux -L raxa send-keys -t raxa "yarn watch" C-m
  byobu-tmux -L raxa new-window -t raxa -c packages/plugin-timer -n "plugin-timer "
  byobu-tmux -L raxa send-keys -t raxa "yarn watch" C-m
  byobu-tmux -L raxa new-window -t raxa -c packages/plugin-trigger -n "plugin-trigger "
  byobu-tmux -L raxa send-keys -t raxa "yarn watch" C-m
  byobu-tmux -L raxa new-window -t raxa -c packages/plugin-sony-receiver -n "plugin-sony-receiver "
  byobu-tmux -L raxa send-keys -t raxa "yarn watch" C-m
fi
byobu-tmux $@ -L raxa attach -t raxa

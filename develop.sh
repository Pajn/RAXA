#!/bin/bash

tmux -L raxa has-session -t raxa
if [ $? != 0 ]; then
  tmux -L raxa new-session -d -s raxa
  tmux -L raxa new-window -t raxa -c packages/raxa -n "server "
  tmux -L raxa send-keys -t raxa "yarn start" C-m
  tmux -L raxa new-window -t raxa -c packages/web -n "web "
  tmux -L raxa send-keys -t raxa "yarn start" C-m
  tmux -L raxa new-window -t raxa -c packages/common -n "common "
  tmux -L raxa send-keys -t raxa "yarn watch" C-m
  tmux -L raxa new-window -t raxa -c packages/plugin-mysensors -n "plugin-mysensors "
  tmux -L raxa send-keys -t raxa "yarn watch" C-m
  tmux -L raxa new-window -t raxa -c packages/plugin-scenery -n "plugin-scenery "
  tmux -L raxa send-keys -t raxa "yarn watch" C-m
  tmux -L raxa new-window -t raxa -c packages/plugin-ledstrip -n "plugin-ledstrip "
  tmux -L raxa send-keys -t raxa "yarn watch" C-m
  tmux -L raxa new-window -t raxa -c packages/plugin-raxa-tellsticknet -n "plugin-raxa-tellsticknet "
  tmux -L raxa send-keys -t raxa "yarn watch" C-m
  tmux -L raxa new-window -t raxa -c packages/plugin-nexa -n "plugin-nexa "
  tmux -L raxa send-keys -t raxa "yarn watch" C-m
  tmux -L raxa new-window -t raxa -c packages/plugin-timer -n "plugin-timer "
  tmux -L raxa send-keys -t raxa "yarn watch" C-m
  tmux -L raxa new-window -t raxa -c packages/plugin-trigger -n "plugin-trigger "
  tmux -L raxa send-keys -t raxa "yarn watch" C-m
fi
tmux $@ -L raxa attach -t raxa

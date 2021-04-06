#!/bin/bash

# Set "echo -e" as default
shopt -s xpg_echo

RED="\033[0;91m"
GREEN="\033[0;92m"
YELLOW="\033[0;93m"
BLUE="\033[0;94m"
CYAN="\033[0;96m"
WHITE="\033[0;97m"
LRED="\033[1;31m"
LGREEN="\033[1;32m"
LYELLOW="\033[1;33m"
LBLUE="\033[1;34m"
LCYAN="\033[1;36m"
LWHITE="\033[1;37m"
LG="\033[0;37m"
NC="\033[0m"

show_error() {
  echo " "
  echo "${RED}[ERROR]${NC} ${LRED}$1${NC}"
}

show_info() {
  echo " "
  echo "${BLUE}[INFO]${NC} ${GREEN}$1${NC}"
}

show_note() {
  echo " "
  echo "${BLUE}[NOTE]${NC} $1"
}

show_important_note() {
  echo " "
  echo "${LRED}[NOTE]${NC} $1"
}

usage() {
  echo "${GREEN}Backend.AI Windows Web UI App builder${NC}"
  echo ""
  echo "${LWHITE}USAGE${NC}"
  echo "  $0 ${LWHITE}[OPTIONS]${NC}"
  echo ""
  echo "${LWHITE}OPTIONS${NC}"
  echo "  ${LWHITE}-h, --help${NC}           Show this help message and exit"
  echo ""
  echo "  ${LWHITE}--branch branch${NC}"
  echo "                       Set the branch name to build"
  echo "                       (default: main)"
}

if [ -z "$1" ]
then
    show_error "No argument supplied."
    usage; exit 1;
fi

BRANCH="main"

while [ $# -gt 0 ]; do
  case $1 in
    -h | --help)        usage; exit 1 ;;
    --branch | -b)   BRANCH=$2; shift ;;
    --branch=* | -b=*) BRANCH="${1#*=}" ;;
    *)
      echo "Unknown option: $1"
      echo "Run '$0 --help' for usage."
      exit 1
  esac
  shift
done

if [[ "$(docker images -q enterprise.docker.backend.ai/dist/backendai-webui-builder:latest 2> /dev/null)" == "" ]]; then
  show_error "Cannot find web UI builder image. Make sure you have pulled the web UI builder image."
  show_info "Image name: enterprise.docker.backend.ai/dist/backendai-webui-builder:latest"
  exit 1
fi

show_info "Building Windows app..."
docker run --rm --name backendai-webui-builder -v ${PWD}:/root/backend.ai-webui/app -it enterprise.docker.backend.ai/dist/backendai-webui-builder:latest /root/update-and-build.sh ${BRANCH}

@echo off

IF "%1" == "" GOTO :Usage

if not exist config.ts (
  echo Configuration file config.ts not found.
  exit /b 1
)

REM Items that require persistence
REM   config.ts

REM Argument order matters!

docker run ^
  -p 3000:3000 ^
  -t ^
  -i ^
  -e "TERM=xterm-256color" ^
  -v .\config.ts:/app/constants/config.ts ^
  jchristn/litegraph-ui:%1

GOTO :Done

:Usage
ECHO Provide one argument indicating the tag. 
ECHO Example: dockerrun.bat v1.0.0
:Done
@echo on

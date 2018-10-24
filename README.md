# Autologger (Working Title)

The Autologger is an open source project aimed at providing holiday skippers a way to document their trips without the need for expensive hardware and software. Such documentation is advised by a number of states (such as Austria) and mandatory in others (Germany). Besides, such documentation is good to have in a court case following damage to the ship or worse, damage to persons.

The master plan is to accompany the autologger software with hardware, which, with a single-board-computer such as a RaspberryPi, can be temporarily connected to the ships network. The Autologger software (run on the single-board-computer) offers a web interface, suitable for Smartphones, Tablets and conventional Laptops alike, to control the logging details.

Currently, we are at the very beginning of the project, having only @freimair and https://www.segeln.st on board. If you have interest in joining our project, please let us know.

## Prerequisits

pip3 install sanic asyncio geographiclib gpxpy

## run

python3 main.py

## notes

usb gps token is hardcoded to /dev/ttyUSB0

# Autologger (Working Title)

The Autologger is an open source project aimed at providing holiday skippers a way to document their trips without the need for expensive hardware and software. Such documentation is advised by a number of states (such as Austria) and mandatory in others (Germany). Besides, such documentation is good to have in a court case following damage to the ship or worse, damage to persons.

The master plan is to accompany the autologger software with hardware, which, with a single-board-computer such as a RaspberryPi, can be temporarily connected to the ships network. The Autologger software (run on the single-board-computer) offers a web interface, suitable for Smartphones, Tablets and conventional Laptops alike, to control the logging details.

Currently, we are at the very beginning of the project, having only @freimair and [segeln.st](https://www.segeln.st) on board. Thus, every piece of code strongly follows [IID](https://en.wikipedia.org/wiki/Iterative_and_incremental_development), [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it), [MVP](https://en.wikipedia.org/wiki/Minimum_viable_product), [KISS](https://en.wikipedia.org/wiki/KISS_principle) and, of course, [Cowboy Coding](https://en.wikipedia.org/wiki/Cowboy_coding). If you have interest in joining our project, please let us know.

## Prerequisits

install pyenv and do a
```
pip install -r requirements.txt
```

## run

run
```
python main.py
```

and surf to `youriphere:8000` for your user interface.

## notes

usb gps token is currently hardcoded to /dev/ttyUSB0

# General System configuration

## User configuration

- username/password: armbian/armbian
- configure spi and can overlays in `/boot/armbianEnv.txt`

  ```
	overlays=usbhost2 usbhost3 spi-spidev spi-add-cs1
	param_spidev_spi_bus=1
	user_overlays=spi-double-spidev spi1-mcp2515

  ```

## RS232 Terminal

- `picocom -b 115200 /dev/ttyUSB0`
- press [C-a][C-x] to close

## IP Configuration

- Wifi is on, configured to our Wifi at Pflegergasse
- uses nmtui (network manager text ui) - only works if `/etc/network/interfaces` does not configure eth0 or wlan0
- fix ip address via wlan0 - 192.168.93.40

## Logs
reduce writes to SD because that kills SDs fast
- adapt logrotate (https://forum.armbian.com/topic/6626-var-easily-get-full-with-log2ram/?do=findComment&comment=51215)
  - rotate on size. size on armbian 22.08 is set to 47MB of tmpfs storage for /var/log. rotate on 45MB

# CAN

- uses first prototype breakout board for CAN shield and Plug connection
- overlay for MSP2515 on SPI1.1
- see can0 configuration:
  - `ip -details -statistics link show can0`

## runtime config

enable can0:
- `sudo ip link set can0 down` or `sudo /sbin/ifconfig can0 down`
- `sudo ip link set can0 type can bitrate 250000 triple-sampling on listen-only off`
- `sudo ip link set can0 up` or `sudo /sbin/ifconfig can0 up`
  
## start config

- configured in `/etc/network/interfaces`

## Notes

- use `listen-only off` for active mode - so the chip actually acks messages (we do not want that on the boat, though! or do we?)
- use bitrate 50000 so Picoscope can keep up
- **TODO** NMEA2k uses 250000?

## Troubleshoot
- why doesn't it stop after a single send command? maybe because nobody is listening and thus, nobody ACKs the message, and thus, the chip tries again and again https://www.microchip.com/forums/m842500.aspx
- both can send, neither does receive. why?
  - first, swap the lines around - hand-soldered has been routed inverse to edged PCB
  - checked serial communication with MCP2515:
    - communication happens on `cansend ...`
    - nothing happens when `candump ...`
  - look into overlays
    - https://docs.armbian.com/User-Guide_Allwinner_overlays/
    - i changed the pinout and thus, the MCP2515 overlay had the wrong IRQ pin configured - testing with spi did not work because the IRQ-pin has not been set to pull-up mode. this has to be done with a device tree overload. https://forum.armbian.com/topic/10462-nanopi-neo-2-set-input-pull-up-via-device-tree/ both posts are important. changed the IRQ pin in the MCP2515 overlay. not it works again.
  
## see if it works

- see if it started up: `dmesg | grep mcp`
- check if interrupt is hooked: `cat /proc/interrupts | grep mcp25`
- `candump can0`
- `cansend can0 123#DEADBEEF`
- **TODO** `cansend can0 5A1#11.2233.44556677.88`
  
# Python
- first steps: `python cansendtest.py`
- reciever test: `python3 cantest2.py`	

## Use Python via SPI directly

- maybe build python spi-dev
  - `cd py-spidev-master`, `sudo make install`
  - `sudo pip3 install --upgrade OPi.GPIO`
- setup system
  - remove MCP2515 overlay
  - **TODO** find a way to activate pull-up resistor for IRQ-pin
- run
  - `sudo python3 cantest.py`

## install RF24
(https://nrf24.github.io/RF24/md_docs_python_wrapper.html)

- `git clone https://github.com/tmrh20/RF24.git`
- `./configure --driver=SPIDEV`
- `make`
- `sudo make install`

- `sudo apt-get install libboost-python-dev` will add around 200MB of libs and stuff
- make sure to have a good amount of memory available (500MB)! armbian default with 240MB physical ram will not suffice!
  - `sudo fallocate -l 512M /swap`
  - `sudo chmod 600 /swap`
  - `sudo mkswap /swap`
  - `sudo swapon /swap`
- `python3 setup.py build`
- `cd /usr/lib/$(ls /usr/lib/gcc | tail -1)`
  - `sudo ln -s libboost_python3.so	libboost_python310.so` or whatever libboost_python3*.so is correct
- `sudo python3 setup.py install`

### Troubleshoot
- in case there is some remnant of double-spi overlay, remove it: spi1.0 is up by default, with `spi_add_cs1` and some overlay that uses the cs1 (eg. `spi1-mcp2515`), spi1.1 gets booted up but disappears in our can0

# Ad-Hoc Wifi
- check if connection is already there: `nmcli c`
- if not, create a new connection
```
nmcli c add type wifi con-name autologger autoconnect yes ssid autologger
nmcli connection modify autologger 802-11-wireless.mode ap ipv4.method shared
nmcli connection modify autologger wifi-sec.key-mgmt wpa-psk
nmcli connection modify autologger wifi-sec.psk "autologger"
```
- active the connection: `nmcli connection up autologger`

could be done in `nmtui` as well

### other variants and past troubleshooting

- see if AP is posible at all `iw list | less`
see if AP is among suppported interface modes
- find your device name `nmcli d`
- `nmcli dev wifi hotspot`, `nmcli dev wifi show-password`
- with more configuration
`nmcli dev wifi hotspot con-name autologger ssid autologger`
- networkmanager ui can be used as well `nmtui`

works after system update to armbian 23.11 - did not with armbian 22.11 (most probably because xradio was faulty and has been fixed in the meanwhile)

# TODO receiver
- reactivate weather-station
- solder new weather-station

